# Phase 3: PostgreSQL Database with TypeORM

Replace in-memory user storage with PostgreSQL database using TypeORM and UUID primary keys.

## 🎯 Goals

- Install and configure PostgreSQL with TypeORM
- Convert User entity to use database decorators
- Implement UUID primary keys for better scalability
- Set up repository pattern for data access
- Configure database connection with environment variables

## 📦 Packages Installed

```bash
# Database packages
npm install @nestjs/typeorm typeorm pg

# Type definitions  
npm install -D @types/pg
```

**Package Purposes:**
- `@nestjs/typeorm` - NestJS integration for TypeORM
- `typeorm` - Object-Relational Mapping (ORM) library
- `pg` - PostgreSQL client for Node.js
- `@types/pg` - TypeScript definitions for pg

## 🛠️ Step-by-Step Implementation

### **1. Update User Entity with TypeORM Decorators**

```typescript
// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;  // Changed from number to string (UUID)

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;  // Still hashed, but now in database

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**📁 File:** [`app/src/users/entities/user.entity.ts`](../app/src/users/entities/user.entity.ts)

**Key Changes:**
- `@Entity()` - Marks class as database table
- `@PrimaryGeneratedColumn('uuid')` - Auto-generated UUID primary key
- `@Column({ unique: true })` - Database-level unique constraints
- `@CreateDateColumn()` / `@UpdateDateColumn()` - Automatic timestamps

### **2. Update Users Service to Use Repository Pattern**

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {  // Changed to string for UUID
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Use repository.create() and repository.save()
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(user);
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
```

**📁 File:** [`app/src/users/users.service.ts`](../app/src/users/users.service.ts)

**Key Changes:**
- `@InjectRepository(User)` - Inject TypeORM repository
- `Repository<User>` - Generic repository for User entity
- `.findOne({ where: {...} })` - TypeORM query syntax
- `.create()` and `.save()` - Repository methods for database operations

### **3. Configure Users Module with TypeORM**

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Register User entity
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**📁 File:** [`app/src/users/users.module.ts`](../app/src/users/users.module.ts)

### **4. Configure Database Connection in App Module**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'nestjs_app',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],  // Auto-load entities
      synchronize: process.env.NODE_ENV !== 'production',  // Auto-sync in development
      logging: process.env.NODE_ENV === 'development',     // SQL logging in dev
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**📁 File:** [`app/src/app.module.ts`](../app/src/app.module.ts)

**Configuration Options:**
- `synchronize: true` - Automatically creates/updates database tables (DEV ONLY)
- `entities: [...]` - Auto-discover entity files
- `logging: true` - Log SQL queries for debugging
- Environment variables for database connection

### **5. Update JWT Strategy for UUID**

```typescript
// src/auth/strategies/jwt.strategy.ts  
// Update validate method to handle string IDs
async validate(payload: any) {
  const user = await this.usersService.findById(payload.sub);  // payload.sub is now UUID string
  if (!user) {
    throw new UnauthorizedException();
  }
  return { userId: payload.sub, email: payload.email };
}
```

**📁 File:** [`app/src/auth/strategies/jwt.strategy.ts`](../app/src/auth/strategies/jwt.strategy.ts)

### **6. Create Database Initialization Script**

```sql
-- init-db.sql  
-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create additional databases if needed
-- This file runs on container initialization
```

**📁 File:** [`infrastructure/init-db.sql`](../infrastructure/init-db.sql)

## 🗄️ Database Schema

After running the application, TypeORM will create this table:

```sql
-- users table (auto-generated by TypeORM)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,  
    password VARCHAR NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🔄 Git Commit

This step corresponds to commit: `a78d39f`

```bash
git add .
git commit -m "Configure PostgreSQL database with TypeORM

- Updated User entity to use UUID as primary key
- Configured TypeORM with PostgreSQL connection  
- Updated UsersService to use TypeORM repository
- Added database configuration with environment variables
- Enabled synchronization for development mode"
```

## 🧪 Testing Database Integration

### **Prerequisites:**
You need a running PostgreSQL database. For now, you can use a local instance:

```bash
# Install PostgreSQL locally (macOS)
brew install postgresql
brew services start postgresql
createdb nestjs_app

# Or use Docker
docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nestjs_app -p 5432:5432 -d postgres:15
```

### **Set Environment Variables:**
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres  
export DB_PASSWORD=postgres
export DB_DATABASE=nestjs_app
```

### **Test the Application:**
```bash
npm run start:dev

# Register a user (will be saved to database)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dbuser",
    "email": "dbuser@example.com",
    "password": "password123"
  }'

# Check the database
psql nestjs_app -c "SELECT id, username, email FROM users;"
```

## 📝 Key Database Concepts

### **UUID Benefits:**
- **Globally unique** across distributed systems
- **No sequential enumeration** attacks
- **Better for replication** and scaling
- **URL-safe** identifiers

### **TypeORM Features:**
- **Entity decorators** define database schema
- **Repository pattern** for data access
- **Automatic migrations** with synchronize (dev only)
- **Query builder** for complex queries
- **Relationship mapping** (one-to-many, many-to-many)

### **Security Considerations:**
- **Never use synchronize in production** 
- **Use migrations** for production schema changes
- **Environment-based configuration** 
- **Connection pooling** handled automatically

## 🎯 What's Next

In the next tutorial, we'll:
1. Install email service packages (Nodemailer, Handlebars)
2. Set up MailHog for email testing
3. Create email templates with Handlebars
4. Implement welcome emails on user registration
5. Configure SMTP settings for different environments

→ **Continue to:** [04-email-service.md](./04-email-service.md)