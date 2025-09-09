# Phase 5: API Documentation with Swagger

Add comprehensive API documentation using Swagger/OpenAPI with DRY principles and interactive documentation.

## 🎯 Goals

- Install Swagger/OpenAPI packages for NestJS
- Configure automatic API documentation generation
- Create response DTOs following DRY principles  
- Add comprehensive API decorators and examples
- Set up interactive documentation interface

## 📦 Packages Installed

```bash
# Swagger/OpenAPI packages
npm install @nestjs/swagger swagger-ui-express
```

**Package Purposes:**
- `@nestjs/swagger` - NestJS integration for OpenAPI/Swagger
- `swagger-ui-express` - Interactive Swagger UI interface

## 🛠️ Step-by-Step Implementation

### **1. Configure Swagger in Main Application**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS API Documentation')
    .setDescription('Complete API documentation for NestJS application with JWT authentication')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger documentation: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
```

**📁 File:** [`app/src/main.ts`](../app/src/main.ts)

### **2. Create Response DTOs (DRY Principle)**

```typescript
// src/common/dto/response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ 
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({ 
    description: 'Unique username',
    example: 'johndoe',
    minLength: 3
  })
  username: string;

  @ApiProperty({ 
    description: 'User email address',
    example: 'john@example.com',
    format: 'email'
  })
  email: string;

  @ApiProperty({ 
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Last account update timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for authenticated requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto
  })
  user: UserResponseDto;
}
```

**📁 File:** [`app/src/common/dto/response.dto.ts`](../app/src/common/dto/response.dto.ts)

### **3. Update DTOs with Swagger Decorators**

```typescript
// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Unique username for the account',
    example: 'johndoe',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Secure password for the account',
    example: 'mySecurePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
```

**📁 File:** [`app/src/auth/dto/register.dto.ts`](../app/src/auth/dto/register.dto.ts)

```typescript
// src/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account password',
    example: 'mySecurePassword123',
  })
  @IsString()
  password: string;
}
```

**📁 File:** [`app/src/auth/dto/login.dto.ts`](../app/src/auth/dto/login.dto.ts)

### **4. Update Auth Controller with Comprehensive Documentation**

```typescript
// src/auth/auth.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthResponseDto, UserResponseDto } from '../common/dto/response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Create a new user account with email, username and password. Returns JWT token and user info.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT token for subsequent requests.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieve current authenticated user profile information. Requires valid JWT token.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  getProfile(@Request() req) {
    return req.user;
  }
}
```

**📁 File:** [`app/src/auth/auth.controller.ts`](../app/src/auth/auth.controller.ts)

### **5. Add Health Check Controller with Documentation**

```bash
# Generate health check controller
nest generate controller health
```

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Simple health check endpoint to verify service is running'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 12345
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

**📁 File:** [`app/src/health/health.controller.ts`](../app/src/health/health.controller.ts)

### **6. Create Common Directory Structure**

```bash
# Create common directory for shared DTOs
mkdir -p src/common/dto
mkdir -p src/health
```

## 🔄 Git Commit

This step corresponds to commit: `d8c9f1b`

```bash
git add .
git commit -m "Add comprehensive Swagger API documentation

- Configured Swagger with JWT Bearer authentication  
- Created reusable response DTOs following DRY principles
- Added comprehensive API decorators with examples
- Documented all authentication endpoints with responses
- Added health check endpoint with documentation  
- Set up interactive Swagger UI at /api/docs"
```

## 📚 Swagger Features Implemented

### **Interactive Documentation:**
- **Swagger UI** at `/api/docs`
- **Try it out** functionality for all endpoints
- **JWT authentication** integration with "Authorize" button
- **Persistent authorization** across browser sessions

### **Comprehensive API Information:**
- **Operation summaries** and detailed descriptions
- **Request/response examples** with realistic data
- **HTTP status codes** with specific error examples
- **Parameter validation** documentation
- **Schema definitions** with data types and constraints

### **DRY Principles Applied:**
- **Reusable response DTOs** instead of inline schemas
- **Common error response** patterns
- **Shared API decorators** approach
- **Consistent naming** conventions

## 🧪 Testing API Documentation

### **Access Documentation:**
```bash
# Start the application
npm run start:dev

# Open Swagger UI
open http://localhost:3000/api/docs
```

### **Test Authentication Flow:**
1. **Register** a new user via Swagger UI
2. **Copy JWT token** from response
3. **Click "Authorize"** button in Swagger UI  
4. **Paste token** in Bearer authentication
5. **Test protected endpoints** like `/auth/profile`

### **Export OpenAPI Specification:**
```bash
# The OpenAPI JSON specification is available at:
curl http://localhost:3000/api/docs-json > api-spec.json
```

## 📝 Documentation Best Practices

### **API Operation Documentation:**
- **Clear summaries** - One line describing the operation
- **Detailed descriptions** - What the endpoint does and when to use it
- **Realistic examples** - Use meaningful sample data
- **All possible responses** - Success and error cases

### **Error Response Standards:**
```typescript
// Consistent error response format
@ApiResponse({
  status: 400,
  description: 'Validation error',
  schema: {
    example: {
      statusCode: 400,
      message: ['field-specific validation errors'],
      error: 'Bad Request'
    }
  }
})
```

### **Security Documentation:**
- **Bearer token** authentication clearly marked
- **Required permissions** documented
- **Token format** specified (JWT)
- **Authorization examples** provided

## 🎯 What's Next

In the next tutorial, we'll:
1. Create multi-stage Docker builds for the NestJS application
2. Set up development and production Docker configurations
3. Configure Docker Compose with PostgreSQL and MailHog
4. Optimize Docker images for size and security
5. Set up Docker networking and volume management

→ **Continue to:** [06-docker-basics.md](./06-docker-basics.md)