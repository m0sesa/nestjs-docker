# Phase 2: JWT Authentication

Implement secure user authentication with JWT tokens and bcrypt password hashing.

## 🎯 Goals

- Set up JWT authentication with Passport
- Create User and Auth modules
- Implement secure password hashing
- Build registration and login endpoints
- Add protected routes with guards

## 📦 Packages Installed

```bash
# Authentication packages
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs class-validator class-transformer

# Type definitions
npm install -D @types/passport-jwt @types/bcryptjs
```

**Package Purposes:**
- `@nestjs/jwt` - JWT token generation and verification
- `@nestjs/passport` - NestJS integration for Passport.js
- `passport-jwt` - JWT strategy for Passport
- `bcryptjs` - Password hashing library
- `class-validator` - Request validation decorators
- `class-transformer` - Object transformation utilities

## 🛠️ Step-by-Step Implementation

### **1. Generate Authentication Modules**

```bash
# Generate modules and services
nest generate module auth
nest generate service auth  
nest generate controller auth
nest generate module users
nest generate service users
```

**📁 Files Created:**
- [`app/src/auth/`](../app/src/auth/) - Authentication module
- [`app/src/users/`](../app/src/users/) - User management module

### **2. Create User Entity**

```typescript
// src/users/entities/user.entity.ts
export class User {
  id: number;
  username: string;
  email: string;
  password: string;  // Will be hashed
  createdAt: Date;
  updatedAt: Date;
}
```

**📁 File:** [`app/src/users/entities/user.entity.ts`](../app/src/users/entities/user.entity.ts)

### **3. Create DTOs for Validation**

```typescript
// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**📁 Files:**
- [`app/src/auth/dto/register.dto.ts`](../app/src/auth/dto/register.dto.ts)
- [`app/src/auth/dto/login.dto.ts`](../app/src/auth/dto/login.dto.ts)

### **4. Implement Users Service with Password Hashing**

```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async create(username: string, email: string, password: string): Promise<User> {
    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user: User = {
      id: this.users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.push(user);
    return user;
  }

  async validatePassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
```

**📁 File:** [`app/src/users/users.service.ts`](../app/src/users/users.service.ts)

### **5. Create JWT Strategy**

```typescript
// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email };
  }
}
```

**📁 File:** [`app/src/auth/strategies/jwt.strategy.ts`](../app/src/auth/strategies/jwt.strategy.ts)

### **6. Implement Auth Service**

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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

### **7. Create Auth Controller**

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

**📁 File:** [`app/src/auth/auth.controller.ts`](../app/src/auth/auth.controller.ts)

### **8. Configure Auth Module**

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
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

### **9. Add Global Validation Pipe**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**📁 File:** [`app/src/main.ts`](../app/src/main.ts)

## 🔄 Git Commit

This step corresponds to commit: `70108bc`

```bash
git add .
git commit -m "Add JWT authentication system

- Created auth module with JWT strategy and guards
- Added user registration and login endpoints
- Implemented password hashing with bcrypt
- Added validation pipes and DTOs
- Created users service for user management
- Added protected profile endpoint"
```

## 🧪 Testing Authentication

```bash
# Start the server
npm run start:dev

# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Use the token to access protected route
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📝 Key Security Features

### **Password Security:**
- **bcrypt hashing** with 10 salt rounds
- **Never store plain text** passwords
- **Salt** automatically generated per password

### **JWT Security:**
- **Stateless authentication** - no server-side sessions
- **Configurable expiration** (24 hours default)
- **Bearer token** in Authorization header
- **Secret key** for token signing/verification

### **Input Validation:**
- **class-validator decorators** for automatic validation
- **Whitelist unknown properties** rejected
- **Type transformation** with class-transformer

## 🎯 What's Next

In the next tutorial, we'll:
1. Install PostgreSQL and TypeORM packages
2. Create database entities with proper relationships
3. Configure database connection and migrations
4. Switch from in-memory storage to PostgreSQL
5. Set up UUID primary keys

→ **Continue to:** [03-database.md](./03-database.md)