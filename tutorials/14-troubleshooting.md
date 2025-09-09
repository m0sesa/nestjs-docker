# Phase 14: Troubleshooting & Maintenance

Comprehensive troubleshooting guides, monitoring setup, performance optimization, and maintenance procedures for production environments.

## 🎯 Goals

- Create systematic troubleshooting guides for common issues
- Document monitoring and alerting setup procedures
- Provide performance tuning and optimization strategies
- Establish maintenance schedules and update procedures
- Create incident response and disaster recovery plans

## 🔧 Common Issues & Solutions

### **1. Container and Docker Issues**

#### **Problem: Container won't start**
```bash
# Check container status
docker ps -a
docker-compose -f docker/docker-compose.dev.yml ps

# View container logs
docker logs nestjs-app-dev
docker-compose -f docker/docker-compose.dev.yml logs app

# Common solutions:
# 1. Check environment variables
docker exec nestjs-app-dev printenv

# 2. Verify build context
docker-compose -f docker/docker-compose.dev.yml build --no-cache app

# 3. Check port conflicts
netstat -tulpn | grep :3000
lsof -i :3000
```

#### **Problem: Database connection fails**
```bash
# Check database container
docker logs postgres-dev

# Test database connection
docker exec postgres-dev pg_isready -U postgres

# Connect to database manually
docker exec -it postgres-dev psql -U postgres -d nestjs_dev

# Check network connectivity
docker exec nestjs-app-dev ping postgres-dev

# Verify environment variables
docker exec nestjs-app-dev printenv | grep DB_
```

#### **Problem: Volume mount issues**
```bash
# Check volume mounts
docker inspect nestjs-app-dev | grep -A 10 "Mounts"

# Fix permission issues (development)
docker exec -it nestjs-app-dev ls -la /app
docker exec -it --user root nestjs-app-dev chown -R nestjs:nodejs /app

# Recreate volumes
docker-compose -f docker/docker-compose.dev.yml down -v
docker volume prune
docker-compose -f docker/docker-compose.dev.yml up -d
```

### **2. SSL/TLS and Traefik Issues**

#### **Problem: SSL certificates not working**
```bash
# Check Traefik dashboard
open https://traefik.interestingapp.local

# View Traefik logs
docker logs traefik-dev

# Regenerate local certificates
cd infrastructure/traefik/certs
rm interestingapp.local+1*
mkcert "interestingapp.local" "*.interestingapp.local"
docker-compose -f docker/traefik.dev.yml restart

# Check certificate validity
openssl x509 -in traefik/certs/interestingapp.local+1.pem -text -noout

# Test SSL connection
openssl s_client -connect api.interestingapp.local:443 -servername api.interestingapp.local
```

#### **Problem: Traefik routing not working**
```bash
# Check Traefik configuration
docker exec traefik-dev cat /etc/traefik/traefik.yml

# View active routes
curl http://localhost:8090/api/http/routers

# Check service discovery
curl http://localhost:8090/api/http/services

# Validate route configuration
docker-compose -f docker/traefik.dev.yml config

# Check container labels
docker inspect nestjs-app-dev | grep -A 20 "Labels"
```

### **3. Application Issues**

#### **Problem: Application not responding**
```bash
# Check application health
curl -k https://api.interestingapp.local/health

# View application logs
docker logs nestjs-app-dev --tail 100 -f

# Check application process
docker exec nestjs-app-dev ps aux

# Verify environment variables
docker exec nestjs-app-dev printenv | grep -E "(NODE_ENV|DB_|JWT_)"

# Test database connectivity from app
docker exec nestjs-app-dev npm run typeorm -- query "SELECT 1"
```

#### **Problem: Authentication issues**
```bash
# Test JWT secret configuration
curl -X POST https://api.interestingapp.local/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Check JWT token validity
# Use https://jwt.io to decode tokens

# Verify user creation
curl -X POST https://api.interestingapp.local/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "debug", "email": "debug@example.com", "password": "password123"}'
```

### **4. Performance Issues**

#### **Problem: Slow API responses**
```bash
# Monitor response times
curl -w "@curl-format.txt" -s -o /dev/null https://api.interestingapp.local/health

# Create curl-format.txt:
cat > curl-format.txt << EOF
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
EOF

# Monitor container resources
docker stats nestjs-app-dev postgres-dev

# Check database performance
docker exec postgres-dev psql -U postgres -d nestjs_dev -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;"
```

## 🛠️ Diagnostic Scripts

### **1. System Health Check Script**

```bash
#!/bin/bash
# infrastructure/scripts/system-health.sh
# Comprehensive system health check

set -e

echo "🏥 System Health Check"
echo "====================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Health check function
check_health() {
    local service="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    printf "%-30s" "$service:"
    
    response_code=$(curl -k -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
    
    if [ "$response_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ Healthy ($response_code)${NC}"
    else
        echo -e "${RED}❌ Unhealthy ($response_code)${NC}"
    fi
}

# System resources
echo -e "${YELLOW}System Resources:${NC}"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

# Docker resources
echo -e "${YELLOW}Docker Status:${NC}"
echo "Docker version: $(docker --version)"
echo "Running containers: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | wc -l) containers"
echo "Docker disk usage:"
docker system df
echo ""

# Service health checks
echo -e "${YELLOW}Service Health:${NC}"
check_health "API Health Endpoint" "https://api.interestingapp.local/health"
check_health "API Documentation" "https://api.interestingapp.local/api/docs"
check_health "Traefik Dashboard" "https://traefik.interestingapp.local"
check_health "MailHog Interface" "https://mail.interestingapp.local"
check_health "Database Interface" "https://db.interestingapp.local"

echo ""

# Container health
echo -e "${YELLOW}Container Health:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# Network health
echo -e "${YELLOW}Network Health:${NC}"
docker network ls
echo ""

# Certificate health
echo -e "${YELLOW}SSL Certificate Status:${NC}"
cert_info=$(echo | openssl s_client -connect api.interestingapp.local:443 -servername api.interestingapp.local 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Unable to retrieve certificate")
echo "$cert_info"

echo ""
echo -e "${GREEN}Health check completed!${NC}"
```

**📁 File:** [`infrastructure/scripts/system-health.sh`](../infrastructure/scripts/system-health.sh)

### **2. Performance Monitoring Script**

```bash
#!/bin/bash
# infrastructure/scripts/performance-monitor.sh
# Monitor application performance metrics

set -e

echo "📊 Performance Monitor"
echo "====================="

# Colors
YELLOW='\033[1;33m'
NC='\033[0m'

DURATION=${1:-60}  # Monitor for 60 seconds by default
API_URL="https://api.interestingapp.local"

echo "Monitoring for $DURATION seconds..."
echo ""

# Function to test API performance
test_api_performance() {
    local endpoint="$1"
    local name="$2"
    
    response_time=$(curl -w "%{time_total}" -s -o /dev/null -k "$API_URL$endpoint" || echo "0")
    response_code=$(curl -w "%{http_code}" -s -o /dev/null -k "$API_URL$endpoint" || echo "000")
    
    printf "%-20s %6s %4s\n" "$name" "${response_time}s" "$response_code"
}

# Performance test loop
end_time=$(($(date +%s) + DURATION))
test_count=0

echo -e "${YELLOW}Endpoint Performance:${NC}"
printf "%-20s %6s %4s\n" "Endpoint" "Time" "Code"
echo "----------------------------------------"

while [ $(date +%s) -lt $end_time ]; do
    test_api_performance "/health" "Health"
    test_api_performance "/api/docs" "Docs"
    
    # System resources
    if [ $((test_count % 10)) -eq 0 ]; then
        echo ""
        echo -e "${YELLOW}System Resources ($(date)):${NC}"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
        echo "Memory: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
        
        # Docker container stats
        echo ""
        echo -e "${YELLOW}Container Resources:${NC}"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5
        echo ""
        printf "%-20s %6s %4s\n" "Endpoint" "Time" "Code"
        echo "----------------------------------------"
    fi
    
    test_count=$((test_count + 1))
    sleep 5
done

echo ""
echo "Performance monitoring completed after $test_count tests"
```

**📁 File:** [`infrastructure/scripts/performance-monitor.sh`](../infrastructure/scripts/performance-monitor.sh)

### **3. Database Maintenance Script**

```bash
#!/bin/bash
# infrastructure/scripts/db-maintenance.sh
# Database maintenance and optimization

set -e

echo "🗄️ Database Maintenance"
echo "======================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_CONTAINER="postgres-dev"
DB_NAME="${POSTGRES_DB:-nestjs_dev}"
DB_USER="${POSTGRES_USER:-postgres}"

# Function to execute SQL
exec_sql() {
    local sql="$1"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "$sql"
}

echo -e "${YELLOW}Database Statistics:${NC}"
echo "===================="

# Database size
echo "Database size:"
exec_sql "SELECT pg_size_pretty(pg_database_size('$DB_NAME')) as database_size;"

# Table sizes
echo ""
echo "Table sizes:"
exec_sql "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Connection statistics
echo ""
echo "Connection statistics:"
exec_sql "
SELECT 
    datname as database,
    numbackends as connections,
    xact_commit as transactions_committed,
    xact_rollback as transactions_rolled_back,
    tup_returned as tuples_returned,
    tup_fetched as tuples_fetched
FROM pg_stat_database 
WHERE datname = '$DB_NAME';
"

echo ""
echo -e "${YELLOW}Maintenance Operations:${NC}"
echo "====================="

# Analyze tables for better query planning
echo "Analyzing tables for query optimization..."
exec_sql "ANALYZE;"
echo -e "${GREEN}✅ Tables analyzed${NC}"

# Vacuum to reclaim space
echo "Vacuuming database to reclaim space..."
exec_sql "VACUUM;"
echo -e "${GREEN}✅ Database vacuumed${NC}"

# Update table statistics
echo "Updating table statistics..."
exec_sql "
DO \$\$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE ' || rec.tablename;
    END LOOP;
END \$\$;
"
echo -e "${GREEN}✅ Statistics updated${NC}"

echo ""
echo "Database maintenance completed!"
```

**📁 File:** [`infrastructure/scripts/db-maintenance.sh`](../infrastructure/scripts/db-maintenance.sh)

## 📋 Maintenance Schedules

### **Daily Maintenance**
```bash
#!/bin/bash
# infrastructure/scripts/daily-maintenance.sh

echo "📅 Daily Maintenance - $(date)"

# Health checks
./scripts/system-health.sh

# Check disk space
echo "Disk usage check:"
df -h | grep -E "(/$|/var)"

# Clean up Docker resources
echo "Cleaning up unused Docker resources..."
docker system prune -f

# Rotate logs if needed
echo "Log rotation check..."
find /var/log -name "*.log" -size +100M -exec ls -lh {} \;

echo "Daily maintenance completed"
```

### **Weekly Maintenance**
```bash
#!/bin/bash
# infrastructure/scripts/weekly-maintenance.sh

echo "📅 Weekly Maintenance - $(date)"

# Database maintenance
./scripts/db-maintenance.sh

# Performance monitoring
./scripts/performance-monitor.sh 300  # 5 minute test

# Backup verification
echo "Backup verification:"
ls -la backups/ | tail -10

# Security check
./scripts/security-check.sh

# Update system packages (if applicable)
echo "Checking for system updates..."
if command -v apt &> /dev/null; then
    apt list --upgradable
fi

echo "Weekly maintenance completed"
```

## 🚨 Incident Response Procedures

### **1. Service Down Response**

```bash
#!/bin/bash
# infrastructure/scripts/incident-response.sh
# Incident response for service outages

SEVERITY=${1:-"medium"}  # low, medium, high, critical
DESCRIPTION=${2:-"Service issue detected"}

echo "🚨 INCIDENT RESPONSE ACTIVATED"
echo "Severity: $SEVERITY"
echo "Description: $DESCRIPTION"
echo "Time: $(date)"
echo "================================"

# 1. Immediate assessment
echo "Step 1: Immediate Assessment"
./scripts/system-health.sh > incident-report-$(date +%Y%m%d_%H%M%S).log

# 2. Critical service checks
echo "Step 2: Critical Service Status"
docker ps | grep -E "(nestjs|postgres|traefik)" || echo "❌ Critical services down"

# 3. Quick restart attempt for medium/low severity
if [ "$SEVERITY" != "critical" ] && [ "$SEVERITY" != "high" ]; then
    echo "Step 3: Attempting service restart"
    docker-compose -f docker/docker-compose.prod.yml restart
    sleep 30
    
    # Verify services after restart
    if curl -s -k https://api.interestingapp.local/health > /dev/null; then
        echo "✅ Services restored after restart"
        exit 0
    fi
fi

# 4. Escalation procedures
echo "Step 4: Escalation Required"
echo "Manual intervention needed"
echo "Review logs: docker-compose -f docker/docker-compose.prod.yml logs"
echo "Check system resources: docker stats"
echo "Database status: docker exec postgres-prod pg_isready"

# 5. Create detailed incident report
echo "Step 5: Generating Incident Report"
{
    echo "INCIDENT REPORT - $(date)"
    echo "================================"
    echo "Severity: $SEVERITY"
    echo "Description: $DESCRIPTION"
    echo ""
    echo "System Status:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo "Recent Logs:"
    docker-compose -f docker/docker-compose.prod.yml logs --tail 50
    echo ""
    echo "System Resources:"
    docker stats --no-stream
} > "incident-$(date +%Y%m%d_%H%M%S).log"

echo "Incident report saved to incident-$(date +%Y%m%d_%H%M%S).log"
```

### **2. Disaster Recovery**

```bash
#!/bin/bash
# infrastructure/scripts/disaster-recovery.sh
# Disaster recovery procedures

echo "💥 DISASTER RECOVERY ACTIVATED"
echo "Time: $(date)"
echo "==============================="

# 1. Stop all services
echo "Step 1: Stopping all services..."
docker-compose -f docker/docker-compose.prod.yml down
docker-compose -f docker/traefik.prod.yml down

# 2. Backup current state
echo "Step 2: Creating emergency backup..."
mkdir -p recovery/$(date +%Y%m%d_%H%M%S)
cp -r . recovery/$(date +%Y%m%d_%H%M%S)/

# 3. Restore from backup
echo "Step 3: Database recovery options:"
echo "Available backups:"
ls -la backups/postgres_backup_*.sql.gz | tail -10

read -p "Enter backup file to restore (or 'skip' to skip): " BACKUP_FILE

if [ "$BACKUP_FILE" != "skip" ] && [ -f "$BACKUP_FILE" ]; then
    echo "Restoring database from $BACKUP_FILE..."
    
    # Start only database
    docker-compose -f docker/docker-compose.prod.yml up -d postgres
    sleep 30
    
    # Restore backup
    zcat "$BACKUP_FILE" | docker exec -i postgres-prod psql -U postgres -d nestjs_prod
    
    echo "✅ Database restored"
fi

# 4. Restart services
echo "Step 4: Restarting all services..."
docker-compose -f docker/traefik.prod.yml up -d
sleep 10
docker-compose -f docker/docker-compose.prod.yml up -d

# 5. Verification
echo "Step 5: Service verification..."
sleep 60
./scripts/system-health.sh

echo "Disaster recovery procedure completed"
echo "Manual verification recommended"
```

## 🔧 Make Scripts Executable

```bash
# Make all troubleshooting scripts executable
chmod +x infrastructure/scripts/system-health.sh
chmod +x infrastructure/scripts/performance-monitor.sh
chmod +x infrastructure/scripts/db-maintenance.sh
chmod +x infrastructure/scripts/daily-maintenance.sh
chmod +x infrastructure/scripts/weekly-maintenance.sh
chmod +x infrastructure/scripts/incident-response.sh
chmod +x infrastructure/scripts/disaster-recovery.sh
```

## 🔄 Git Commit

```bash
git add .
git commit -m "Add comprehensive troubleshooting and maintenance tools

- Created systematic troubleshooting guides for common issues
- Added system health monitoring and performance scripts
- Implemented database maintenance and optimization procedures
- Created incident response and disaster recovery protocols
- Added daily and weekly maintenance automation scripts
- Documented complete operational procedures"
```

## 📖 Quick Reference Commands

### **Emergency Commands:**
```bash
# Quick system status
just status
just health-check

# Emergency restart
just dev-restart  # Development
just prod-restart  # Production

# View logs
just dev-logs
just prod-logs

# Emergency backup
just backup-db
just prod-backup
```

### **Diagnostic Commands:**
```bash
# Health monitoring
./scripts/system-health.sh

# Performance testing
./scripts/performance-monitor.sh 300

# Database maintenance
./scripts/db-maintenance.sh

# Security validation
./scripts/security-check.sh
```

### **Common Fixes:**
```bash
# Certificate issues
just ssl-renew

# Clean system
just clean
docker system prune -f

# Reset development environment
just dev-down
docker volume prune -f
just dev-up

# Production deployment
just prod-deploy
```

## 🎉 Tutorial Series Complete!

Congratulations! You've completed the comprehensive NestJS Docker Backend tutorial series. You now have:

- ✅ **Complete NestJS application** with JWT authentication
- ✅ **PostgreSQL database** with TypeORM and UUIDs
- ✅ **Email service** with MailHog testing
- ✅ **Swagger documentation** with DRY principles
- ✅ **Docker containerization** with multi-stage builds
- ✅ **Traefik reverse proxy** with SSL/TLS
- ✅ **Local HTTPS development** environment
- ✅ **Monorepo structure** with domain separation
- ✅ **Automation tools** with Just command runner
- ✅ **Production deployment** with security hardening
- ✅ **Environment management** best practices
- ✅ **Security implementation** comprehensive coverage
- ✅ **Troubleshooting tools** and maintenance procedures

### **Next Steps:**
1. **Deploy to your production environment**
2. **Customize for your specific use case**
3. **Add monitoring and alerting systems**
4. **Implement CI/CD pipelines**
5. **Scale horizontally as needed**

### **Resources:**
- **Project Repository**: All code and configuration files
- **Tutorial Documentation**: Complete step-by-step guides  
- **Automation Scripts**: Production-ready operational tools
- **Security Checklists**: Comprehensive security validation
- **Troubleshooting Guides**: Solutions for common issues

Happy coding! 🚀