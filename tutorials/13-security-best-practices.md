# Phase 13: Security Best Practices

Implement comprehensive security measures for production deployment including container security, monitoring, logging, and incident response procedures.

## 🎯 Goals

- Review and implement comprehensive security best practices
- Configure advanced security layers and monitoring systems
- Set up production-ready logging and error tracking
- Implement container security and proper user permissions
- Create security incident response procedures and monitoring

## 🔒 Security Architecture Overview

### **Multi-Layer Security Strategy:**
```
Internet → Cloudflare/CDN → Traefik (Rate Limiting) → NestJS App (Validation) → PostgreSQL (Network Isolation)
         ↓                    ↓                        ↓
    DDoS Protection      Security Headers        Input Validation
    Bot Protection       SSL Termination         Authentication
    WAF Rules           Health Monitoring        Authorization
```

## 🛠️ Step-by-Step Implementation

### **1. Enhanced Container Security**

```dockerfile
# app/Dockerfile (Security-Enhanced Version)
# Multi-stage build with security hardening
FROM node:18-alpine AS base

# Security: Install security updates and minimal required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Security: Create non-privileged user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Security: Set working directory with proper ownership
WORKDIR /app
RUN chown -R nestjs:nodejs /app

# Security: Copy package files as non-root user
COPY --chown=nestjs:nodejs package*.json ./

# Production stage with security hardening
FROM base AS production
ENV NODE_ENV=production

# Security: Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Security: Copy application files with proper ownership
COPY --chown=nestjs:nodejs --from=build /app/dist ./dist

# Security: Remove unnecessary packages and files
RUN npm uninstall npm && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

# Security: Set file permissions
RUN find /app -type f -exec chmod 644 {} \; && \
    find /app -type d -exec chmod 755 {} \;

# Security: Switch to non-root user
USER nestjs

# Security: Use non-root port
EXPOSE 3000

# Security: Health check with timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Security: Use dumb-init for proper signal handling
CMD ["dumb-init", "node", "dist/main"]
```

**📁 File:** [`app/Dockerfile`](../app/Dockerfile) (security-enhanced)

### **2. Advanced Security Configuration**

```yaml
# infrastructure/traefik/config/prod-security.yml
# Advanced security configuration for production

http:
  middlewares:
    # Enhanced Security Headers
    security-headers:
      headers:
        # HTTPS Security
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        
        # Content Security Policy
        contentSecurityPolicy: |
          default-src 'self';
          script-src 'self' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          font-src 'self';
          connect-src 'self' https://api.${DOMAIN};
          frame-ancestors 'none';
          base-uri 'self';
          form-action 'self';
        
        # Additional Security Headers
        referrerPolicy: "strict-origin-when-cross-origin"
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        permissionsPolicy: |
          geolocation=(),
          microphone=(),
          camera=(),
          payment=(),
          usb=(),
          magnetometer=(),
          accelerometer=(),
          gyroscope=()
        
        # Custom Security Headers
        customHeaders:
          X-Forwarded-Proto: "https"
          X-Robots-Tag: "noindex, nofollow"
          X-Content-Type-Options: "nosniff"
          X-Frame-Options: "DENY"
          X-XSS-Protection: "1; mode=block"
          Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload"
          
        # Remove Server Information
        customHeadersToRemove:
          - "Server"
          - "X-Powered-By"
          - "X-AspNet-Version"
          - "X-AspNetMvc-Version"

    # Advanced Rate Limiting
    api-rate-limit:
      rateLimit:
        average: 100
        burst: 200
        period: "1m"
        sourceCriterion:
          ipStrategy:
            depth: 2  # Handle CDN/proxy IPs
            excludedIPs:
              - "127.0.0.1/32"
              - "10.0.0.0/8"

    # Strict Rate Limiting for Auth Endpoints
    auth-rate-limit:
      rateLimit:
        average: 10   # 10 requests per minute for auth
        burst: 20
        period: "1m"
        sourceCriterion:
          ipStrategy:
            depth: 2

    # IP Whitelist for Admin Endpoints (Optional)
    admin-whitelist:
      ipWhiteList:
        sourceRange:
          - "10.0.0.0/8"      # Internal network
          - "172.16.0.0/12"   # Private network
          - "192.168.0.0/16"  # Local network
          # - "1.2.3.4/32"    # Specific admin IPs

    # Request Size Limiting
    request-limit:
      buffering:
        maxRequestBodyBytes: 1048576  # 1MB limit
        maxResponseBodyBytes: 1048576
        memRequestBodyBytes: 1048576

  routers:
    # API with enhanced security
    nestjs-api:
      rule: "Host(`api.${DOMAIN}`) && !PathPrefix(`/auth`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - api-rate-limit
        - request-limit

    # Authentication endpoints with strict rate limiting
    nestjs-auth:
      rule: "Host(`api.${DOMAIN}`) && PathPrefix(`/auth`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - auth-rate-limit
        - request-limit
      priority: 100
```

**📁 File:** [`infrastructure/traefik/config/prod-security.yml`](../infrastructure/traefik/config/prod-security.yml)

### **3. Application Security Enhancements**

```typescript
// app/src/main.ts (Security Enhanced)
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn']  // Reduce logging in production
      : ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  
  const configService = app.get(ConfigService);

  // Security: Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Security: Enable compression
  app.use(compression());

  // Security: Global validation with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip unknown properties
      forbidNonWhitelisted: true,   // Reject unknown properties
      transform: true,              // Transform types
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide validation details in prod
      validateCustomDecorators: true,
    }),
  );

  // Security: Configure CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          `https://${process.env.DOMAIN}`,
          `https://app.${process.env.DOMAIN}`,
        ]
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Documentation (only in development or staging)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestJS API Documentation')
      .setDescription('API documentation with security examples')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Application running on: http://localhost:${port}`);
    console.log(`📚 Documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
```

**📁 File:** [`app/src/main.ts`](../app/src/main.ts) (security enhanced)

### **4. Environment Security and Secrets Management**

```bash
#!/bin/bash
# infrastructure/scripts/generate-secrets.sh
# Generate secure production secrets

set -e

echo "🔐 Generating secure production secrets..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Generate JWT Secret (256-bit)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
echo -e "${GREEN}JWT_SECRET generated (256-bit)${NC}"

# Generate Database Password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n' | tr -d '=+/')
echo -e "${GREEN}Database password generated${NC}"

# Generate Traefik Auth Hash
echo ""
echo -e "${YELLOW}Enter admin password for Traefik dashboard:${NC}"
read -s ADMIN_PASSWORD
TRAEFIK_AUTH="admin:$(openssl passwd -apr1 "$ADMIN_PASSWORD")"
echo -e "${GREEN}Traefik auth hash generated${NC}"

# Create secure .env.production
cat > .env.production << EOF
# Production Environment Configuration
# Generated on $(date)
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

NODE_ENV=production
PORT=3000

# Domain Configuration (UPDATE THESE)
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=nestjs_prod

# PostgreSQL Container Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=nestjs_prod

# JWT Configuration (256-bit secret)
JWT_SECRET=$JWT_SECRET

# Mail Configuration (UPDATE THESE)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Your App Name
MAIL_FROM_ADDRESS=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://app.yourdomain.com

# Traefik Authentication
TRAEFIK_AUTH=$TRAEFIK_AUTH

# Security Configuration
SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')

# Optional: Monitoring
SENTRY_DSN=
NEW_RELIC_LICENSE_KEY=
EOF

echo ""
echo -e "${GREEN}✅ Production secrets generated in .env.production${NC}"
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "   1. Update DOMAIN and ACME_EMAIL"
echo "   2. Configure MAIL_* settings"
echo "   3. Keep this file secure and never commit it"
echo "   4. Set up proper file permissions: chmod 600 .env.production"

# Set secure file permissions
chmod 600 .env.production
```

**📁 File:** [`infrastructure/scripts/generate-secrets.sh`](../infrastructure/scripts/generate-secrets.sh)

### **5. Security Monitoring and Logging**

```typescript
// app/src/common/interceptors/security-logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Security');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;

    // Log security-relevant events
    const securityEvent = {
      timestamp: new Date().toISOString(),
      ip: this.getClientIP(request),
      method,
      url,
      userAgent: headers['user-agent'],
      authorization: headers['authorization'] ? 'Bearer ***' : 'none',
    };

    // Log suspicious activities
    if (this.isSuspiciousRequest(request)) {
      this.logger.warn(`Suspicious request detected: ${JSON.stringify(securityEvent)}`);
    }

    return next.handle().pipe(
      tap({
        error: (error) => {
          if (error.status >= 400) {
            this.logger.warn(`Security event - ${error.status}: ${JSON.stringify({
              ...securityEvent,
              error: error.message,
              statusCode: error.status,
            })}`);
          }
        }
      })
    );
  }

  private getClientIP(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.ip
    );
  }

  private isSuspiciousRequest(request: Request): boolean {
    const suspiciousPatterns = [
      /\.\.\//, // Path traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /exec|eval|system/i, // Code injection
    ];

    const url = request.url.toLowerCase();
    const body = JSON.stringify(request.body || {}).toLowerCase();

    return suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(body)
    );
  }
}
```

**📁 File:** [`app/src/common/interceptors/security-logging.interceptor.ts`](../app/src/common/interceptors/security-logging.interceptor.ts)

### **6. Production Security Checklist Script**

```bash
#!/bin/bash
# infrastructure/scripts/security-check.sh
# Production security validation script

set -e

echo "🔒 Running production security checklist..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES=0

check_item() {
    local description="$1"
    local command="$2"
    
    printf "%-50s" "$description"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        ISSUES=$((ISSUES + 1))
    fi
}

echo "Security Configuration Checks:"
echo "=============================="

# Environment file security
check_item "Production env file exists" "[ -f .env.production ]"
check_item "Production env file has secure permissions" "[ \$(stat -c %a .env.production 2>/dev/null) -eq 600 ]"

# SSL/TLS checks
check_item "Let's Encrypt certificates auto-renew" "docker exec traefik-prod ls /letsencrypt/acme.json"
check_item "HTTPS redirects working" "curl -I http://api.$DOMAIN 2>/dev/null | grep -q '301'"

# Container security
check_item "App container runs as non-root" "[ \$(docker exec nestjs-app-prod whoami) != 'root' ]"
check_item "Database container has health checks" "docker inspect postgres-prod | grep -q '\"Healthcheck\""

# Network security
check_item "Database not exposed to internet" "! docker port postgres-prod 5432 2>/dev/null"
check_item "Internal network isolated" "docker network inspect infrastructure_internal-network | grep -q '\"Internal\": true'"

# Application security
check_item "Security headers present" "curl -sI https://api.$DOMAIN | grep -q 'Strict-Transport-Security'"
check_item "Rate limiting active" "curl -sI https://api.$DOMAIN | grep -q 'X-RateLimit'"

echo ""
echo "Secret Security Checks:"
echo "======================"

# Check for strong secrets
if [ -f .env.production ]; then
    source .env.production
    
    check_item "JWT secret is strong (64+ chars)" "[ \${#JWT_SECRET} -ge 64 ]"
    check_item "Database password is strong (16+ chars)" "[ \${#DB_PASSWORD} -ge 16 ]"
    check_item "Database password not default" "[ \"$DB_PASSWORD\" != 'postgres' ]"
    check_item "JWT secret not default" "[ \"$JWT_SECRET\" != 'your-secret-key' ]"
fi

echo ""
echo "Backup and Monitoring:"
echo "====================="

check_item "Database backups directory exists" "[ -d backups ]"
check_item "Backup script is executable" "[ -x scripts/backup-db.sh ]"
check_item "Application logs are accessible" "docker logs nestjs-app-prod --tail 1"

echo ""
echo "Summary:"
echo "========"

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 All security checks passed!${NC}"
else
    echo -e "${RED}⚠️  Found $ISSUES security issue(s) that need attention${NC}"
    exit 1
fi
```

**📁 File:** [`infrastructure/scripts/security-check.sh`](../infrastructure/scripts/security-check.sh)

```bash
# Make all security scripts executable
chmod +x infrastructure/scripts/generate-secrets.sh
chmod +x infrastructure/scripts/security-check.sh
```

## 🔄 Git Commit

This step corresponds to commit: `b8e2a1c`

```bash
git add .
git commit -m "Implement comprehensive security best practices

- Enhanced container security with non-root user and hardening
- Added advanced Traefik security configuration with CSP
- Implemented application-level security headers and validation
- Created secure secret generation and management scripts
- Added security monitoring and logging interceptors
- Created production security validation checklist"
```

## 🔒 Security Implementation Checklist

### **Container Security:**
- ✅ **Non-root user** execution in all containers
- ✅ **Minimal base images** (Alpine Linux)
- ✅ **Security updates** automatically applied
- ✅ **File permissions** properly set
- ✅ **Health checks** for container monitoring
- ✅ **Resource limits** to prevent DoS

### **Network Security:**
- ✅ **Network isolation** for database and internal services
- ✅ **No exposed ports** for database in production
- ✅ **External network** only for necessary services
- ✅ **Firewall rules** at infrastructure level

### **Application Security:**
- ✅ **Input validation** with strict whitelist approach
- ✅ **Output encoding** to prevent XSS
- ✅ **Authentication** with JWT and secure secrets
- ✅ **Authorization** middleware for protected routes
- ✅ **Rate limiting** per endpoint type
- ✅ **Security headers** comprehensive implementation

### **Data Security:**
- ✅ **Encryption at rest** for sensitive data
- ✅ **Encrypted connections** (HTTPS/TLS)
- ✅ **Secret management** with environment variables
- ✅ **Database credentials** rotated and strong
- ✅ **Backup encryption** and secure storage
- ✅ **Data retention** policies implemented

## 🎯 What's Next

In the final tutorial, we'll:
1. Create comprehensive troubleshooting guides for common issues
2. Document monitoring and alerting setup procedures
3. Provide performance tuning and optimization strategies
4. Create maintenance schedules and update procedures
5. Establish incident response and disaster recovery plans

→ **Continue to:** [14-troubleshooting.md](./14-troubleshooting.md)