# Phase 4: Email Service with MailHog

Add email functionality with MailHog for development testing and template-based emails.

## 🎯 Goals

- Install email service packages (Nodemailer, Handlebars)
- Set up MailHog for email testing in development
- Create email templates with Handlebars
- Implement welcome emails on user registration
- Configure SMTP settings for different environments

## 📦 Packages Installed

```bash
# Email packages
npm install @nestjs-modules/mailer nodemailer handlebars

# Type definitions
npm install -D @types/nodemailer
```

**Package Purposes:**
- `@nestjs-modules/mailer` - NestJS email module with template support
- `nodemailer` - Email sending library for Node.js
- `handlebars` - Template engine for dynamic email content
- `@types/nodemailer` - TypeScript definitions for nodemailer

## 🛠️ Step-by-Step Implementation

### **1. Configure Mail Module**

```typescript
// src/app.module.ts
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    // ... other imports
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'localhost',
        port: parseInt(process.env.MAIL_PORT) || 1025,
        secure: false, // MailHog doesn't use SSL
        auth: {
          user: process.env.MAIL_USER || 'test',
          pass: process.env.MAIL_PASSWORD || 'test',
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
      template: {
        dir: join(__dirname, 'mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
})
export class AppModule {}
```

**📁 File:** [`app/src/app.module.ts`](../app/src/app.module.ts)

### **2. Create Mail Service**

```bash
# Generate mail module
nest generate module mail
nest generate service mail
```

```typescript
// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(user: User) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Our Application!',
      template: './welcome',
      context: {
        name: user.username,
        email: user.email,
        frontendUrl,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      template: './password-reset',
      context: {
        name: user.username,
        resetUrl,
        year: new Date().getFullYear(),
      },
    });
  }
}
```

**📁 File:** [`app/src/mail/mail.service.ts`](../app/src/mail/mail.service.ts)

### **3. Create Email Templates**

```bash
# Create templates directory
mkdir -p src/mail/templates
```

**Welcome Email Template:**
```handlebars
<!-- src/mail/templates/welcome.hbs -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome!</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f8f9fa; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Application!</h1>
        </div>
        <div class="content">
            <h2>Hello {{name}}!</h2>
            <p>Thank you for registering with us. We're excited to have you on board!</p>
            <p>Your account has been created with the email address: <strong>{{email}}</strong></p>
            <p>Get started by exploring our platform:</p>
            <a href="{{frontendUrl}}" class="btn">Go to Dashboard</a>
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; {{year}} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

**📁 File:** [`app/src/mail/templates/welcome.hbs`](../app/src/mail/templates/welcome.hbs)

### **4. Update Auth Service to Send Welcome Emails**

```typescript
// src/auth/auth.service.ts
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService, // Inject mail service
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersService.create(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );

    // Send welcome email
    try {
      await this.mailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail registration if email fails
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
```

**📁 File:** [`app/src/auth/auth.service.ts`](../app/src/auth/auth.service.ts)

### **5. Update Auth Module**

```typescript
// src/auth/auth.module.ts
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MailModule, // Import mail module
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

**📁 File:** [`app/src/auth/auth.module.ts`](../app/src/auth/auth.module.ts)

## 🐳 MailHog Docker Setup

### **Add MailHog to Development Docker Compose:**

```yaml
# docker-compose.dev.yml (preview for next phase)
services:
  mailhog:
    image: mailhog/mailhog:v1.0.1
    container_name: mailhog-dev
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - app-network

  app:
    # ... other config
    environment:
      - MAIL_HOST=mailhog
      - MAIL_PORT=1025
      - MAIL_USER=test
      - MAIL_PASSWORD=test
    depends_on:
      - mailhog
```

## 📧 Environment Configuration

### **Development Environment Variables:**
```bash
# .env.development
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USER=test
MAIL_PASSWORD=test
MAIL_FROM_NAME=NestJS Dev App
MAIL_FROM_ADDRESS=noreply@interestingapp.local
FRONTEND_URL=https://app.interestingapp.local
```

### **Production Environment Variables:**
```bash
# .env.production.example
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-production-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Your App Name
MAIL_FROM_ADDRESS=noreply@yourdomain.com
FRONTEND_URL=https://app.yourdomain.com
```

## 🔄 Git Commit

This step corresponds to commit: `b5f2e1a`

```bash
git add .
git commit -m "Add email service with MailHog integration

- Configured @nestjs-modules/mailer with Handlebars templates
- Created MailService for welcome and password reset emails
- Added responsive email templates with styling
- Integrated welcome email sending on user registration
- Set up MailHog for development email testing
- Added environment variables for SMTP configuration"
```

## 🧪 Testing Email Service

### **Prerequisites:**
You'll need MailHog running (covered in Docker phase):

```bash
# Quick test with Docker
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog:v1.0.1
```

### **Test Registration with Email:**

```bash
# Start the application
npm run start:dev

# Register a user (will trigger welcome email)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "emailtest",
    "email": "test@example.com",
    "password": "password123"
  }'

# Check MailHog web interface
open http://localhost:8025
```

## 📝 Email Best Practices

### **Template Design:**
- **Responsive design** for mobile devices
- **Inline CSS** for better email client compatibility  
- **Alt text** for images
- **Clear call-to-action** buttons

### **Error Handling:**
```typescript
// Never fail registration if email fails
try {
  await this.mailService.sendWelcomeEmail(user);
} catch (error) {
  console.error('Failed to send welcome email:', error);
  // Continue with registration
}
```

### **Security:**
- **Never send passwords** in emails
- **Time-limited reset tokens** for password resets
- **Validate email addresses** before sending
- **Rate limiting** for email endpoints

### **Development vs Production:**
- **MailHog** for development testing
- **Real SMTP** (Gmail, SendGrid, etc.) for production
- **Template testing** with different data sets
- **Monitoring** email delivery in production

## 🎯 What's Next

In the next tutorial, we'll:
1. Install Swagger/OpenAPI packages
2. Configure automatic API documentation  
3. Add API decorators and examples
4. Create response DTOs following DRY principles
5. Set up interactive API documentation interface

→ **Continue to:** [05-api-documentation.md](./05-api-documentation.md)