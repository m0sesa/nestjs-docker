# NestJS Docker Backend Tutorial Series

A comprehensive, step-by-step tutorial for building a production-ready NestJS application with Docker, Traefik, and professional development workflow.

## 🎯 What You'll Build

A complete monorepo with:
- **NestJS API** with JWT authentication
- **PostgreSQL** database with TypeORM  
- **Email service** with MailHog testing
- **Swagger** API documentation
- **Traefik** reverse proxy with SSL/TLS
- **Professional development workflow** with Just runner
- **Clean monorepo structure** separating app and infrastructure

## 📚 Tutorial Structure

### **Prerequisites**
→ [00-prerequisites.md](./00-prerequisites.md) - Tools and setup requirements

### **Phase 1: Foundation**
→ [01-nestjs-setup.md](./01-nestjs-setup.md) - Initialize NestJS project  
→ [02-authentication.md](./02-authentication.md) - JWT authentication with bcrypt  
→ [03-database.md](./03-database.md) - PostgreSQL with TypeORM and UUIDs

### **Phase 2: Services & Documentation**  
→ [04-email-service.md](./04-email-service.md) - Mail service with MailHog  
→ [05-api-documentation.md](./05-api-documentation.md) - Swagger integration

### **Phase 3: Infrastructure**
→ [06-docker-basics.md](./06-docker-basics.md) - Docker containerization  
→ [07-traefik-setup.md](./07-traefik-setup.md) - Reverse proxy with SSL  
→ [08-development-environment.md](./08-development-environment.md) - Local HTTPS workflow

### **Phase 4: Professional Setup**
→ [09-monorepo-structure.md](./09-monorepo-structure.md) - Clean separation of concerns  
→ [10-automation-tools.md](./10-automation-tools.md) - Just runner and scripts  
→ [11-production-deployment.md](./11-production-deployment.md) - Production configuration

### **Phase 5: Advanced Topics**
→ [12-environment-management.md](./12-environment-management.md) - Environment configuration  
→ [13-security-best-practices.md](./13-security-best-practices.md) - Security considerations  
→ [14-troubleshooting.md](./14-troubleshooting.md) - Common issues and solutions

## 🚀 Quick Start

If you want to jump straight to the final result:

```bash
git clone <your-repo>
cd infrastructure
just dev-up
```

Access your services:
- API: https://api.interestingapp.local
- Mail: https://mail.interestingapp.local  
- DB Admin: https://pgadmin.interestingapp.local
- Traefik: https://traefik.interestingapp.local

## 📖 How to Use This Tutorial

1. **Follow sequentially** - Each tutorial builds on the previous
2. **Check git commits** - Each major step has a corresponding commit
3. **Experiment** - Try variations and understand the concepts
4. **Reference files** - All code examples link to actual project files

## 🎓 Learning Objectives

By completing this tutorial series, you'll understand:

- **NestJS architecture** and best practices
- **Docker containerization** for development and production
- **Reverse proxy concepts** with Traefik
- **Professional development workflows**
- **Monorepo organization** and separation of concerns
- **Infrastructure as Code** principles
- **Security considerations** for web applications

## 💡 Generated with Claude Code

This tutorial and the entire project were created in collaboration with [Claude Code](https://claude.ai/code), demonstrating modern AI-assisted development workflows.