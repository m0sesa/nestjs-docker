# Phase 1: NestJS Project Setup

Initialize a clean NestJS project and establish the foundation for our application.

## 🎯 Goals

- Create a new NestJS project
- Configure TypeScript, ESLint, and Prettier
- Set up Git repository with proper `.gitignore`
- Understand the basic NestJS project structure

## 📦 Packages Installed

```bash
# Automatically installed by NestJS CLI
@nestjs/core           # Core framework
@nestjs/common         # Common utilities and decorators
@nestjs/platform-express  # Express adapter
reflect-metadata       # Required for decorators
typescript             # TypeScript compiler
@nestjs/testing        # Testing utilities
```

## 🛠️ Step-by-Step Implementation

### **1. Initialize NestJS Project**

```bash
# Create new NestJS project
nest new . --package-manager npm

# This creates the basic structure:
# ├── src/
# │   ├── app.controller.ts
# │   ├── app.module.ts
# │   ├── app.service.ts
# │   └── main.ts
# ├── package.json
# ├── tsconfig.json
# └── nest-cli.json
```

**📁 Key Files Created:**
- [`app/src/main.ts`](../app/src/main.ts) - Application entry point
- [`app/src/app.module.ts`](../app/src/app.module.ts) - Root module
- [`app/package.json`](../app/package.json) - Dependencies and scripts

### **2. Set Up Git Repository**

```bash
# Initialize git
git init

# Add comprehensive .gitignore
```

**📁 Files:**
- [`.gitignore`](../.gitignore) - Excludes node_modules, build files, env files

### **3. Project Structure Overview**

```typescript
// src/main.ts - Bootstrap the application
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

```typescript
// src/app.module.ts - Root module
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 🔄 Git Commit

This step corresponds to commit: `ca2845e`

```bash
git add .
git commit -m "Initial NestJS project setup

Created basic NestJS application structure with:
- App module, controller, and service
- TypeScript configuration
- Jest testing setup  
- ESLint and Prettier configuration"
```

## 🧪 Testing the Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Test the API
curl http://localhost:3000
# Response: Hello World!
```

## 📝 Key Concepts Learned

### **NestJS Architecture:**
- **Modules** - Organize application features
- **Controllers** - Handle HTTP requests  
- **Services** - Business logic and data access
- **Decorators** - Metadata for dependency injection

### **File Structure:**
```
src/
├── main.ts           # Entry point, starts HTTP server
├── app.module.ts     # Root module, imports other modules  
├── app.controller.ts # Handles HTTP routes
└── app.service.ts    # Business logic
```

## ⚡ Development Commands

```bash
# Development server (hot reload)
npm run start:dev

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 🎯 What's Next

In the next tutorial, we'll:
1. Install authentication packages (JWT, Passport, bcrypt)
2. Create authentication and user modules
3. Implement user registration and login
4. Set up password hashing and JWT tokens

→ **Continue to:** [02-authentication.md](./02-authentication.md)