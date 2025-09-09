# Admin Panel for NestJS Application

A modern admin panel built with Nuxt 3 and Shadcn/ui components.

## 🚀 Features

- **Authentication**: Connects to NestJS backend with JWT authentication
- **Modern UI**: Built with Shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices
- **User Management**: View and manage application users
- **Dashboard**: Overview of system statistics and health
- **Docker Ready**: Containerized for development and production

## 🛠️ Tech Stack

- **Framework**: Nuxt 3 (Vue 3 + TypeScript)
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue
- **Authentication**: JWT with composables
- **State Management**: Pinia (via @pinia/nuxt)

## 🏗️ Project Structure

```
admin/
├── components/
│   └── ui/                 # Shadcn/ui components
├── composables/
│   └── useAuth.ts         # Authentication logic
├── layouts/
│   └── default.vue        # Main layout
├── middleware/
│   └── auth.ts            # Authentication middleware
├── pages/
│   ├── index.vue          # Dashboard
│   ├── login.vue          # Login page
│   └── users.vue          # User management
├── assets/css/
│   └── globals.css        # Global styles & Shadcn variables
├── lib/
│   └── utils.ts           # Utility functions
├── nuxt.config.ts         # Nuxt configuration
├── tailwind.config.js     # Tailwind configuration
└── Dockerfile             # Docker configuration
```

## 🌐 Development URLs

When running with the full development environment:

- **Admin Panel**: https://admin.interestingapp.local
- **API Backend**: https://api.interestingapp.local
- **API Docs**: https://api.interestingapp.local/api/docs
- **MailHog**: https://mail.interestingapp.local
- **Database Admin**: https://pgadmin.interestingapp.local
- **Traefik Dashboard**: https://traefik.interestingapp.local

## 🚀 Quick Start

### With Docker (Recommended)

From the `infrastructure/` directory:

```bash
# Start the complete development environment
just dev-up

# Or manually:
docker-compose -f docker/docker-compose.dev.yml up -d
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔐 Authentication

The admin panel authenticates users through the NestJS API:

1. **Login Page**: Users enter email and password
2. **JWT Authentication**: Connects to `/auth/login` endpoint
3. **Token Storage**: JWT stored in localStorage
4. **Auto-refresh**: Token validation on page load
5. **Protected Routes**: Middleware redirects unauthenticated users

### Default Test Credentials

Use the same credentials you created for the NestJS API:

- **Email**: Any registered user email
- **Password**: User's password

## 🎨 UI Components

Built with Shadcn/ui components:

- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Card**: Layout containers with headers and content
- **Input**: Form inputs with proper styling
- **Layout**: Responsive navigation and sidebar

### Adding New Components

```bash
# Create new component in components/ui/
# Follow Shadcn/ui patterns for consistency
```

## 🔧 Configuration

### Environment Variables

```bash
# Runtime configuration in nuxt.config.ts
API_URL=https://api.interestingapp.local  # NestJS backend URL
```

### API Integration

The admin panel connects to these NestJS endpoints:

- `POST /auth/login` - User authentication
- `GET /auth/profile` - Get user profile
- `GET /users` - List users (to be implemented)
- `GET /health` - Health check

## 🐳 Docker Configuration

Multi-stage Docker build:

- **Development**: Hot reload with volume mounting
- **Production**: Optimized build with minimal footprint
- **Security**: Non-root user execution
- **Health Checks**: Built-in health monitoring

## 🚦 Development Workflow

1. **Start Environment**: `just dev-up`
2. **Access Admin Panel**: https://admin.interestingapp.local
3. **Login**: Use existing NestJS user credentials
4. **Develop**: Files auto-reload in development
5. **Test**: Browse dashboard and user management

## 🔍 Troubleshooting

### Common Issues

**Login fails:**
- Verify NestJS API is running
- Check API_URL in configuration
- Confirm user exists in database

**Styles not loading:**
- Ensure Tailwind is properly configured
- Check for CSS build errors
- Verify @tailwind directives in globals.css

**Authentication loops:**
- Clear localStorage
- Check JWT token expiration
- Verify API endpoints are accessible

### Debugging

```bash
# View logs
docker logs admin-panel-dev

# Check API connectivity
curl -k https://api.interestingapp.local/health

# Verify environment
docker exec admin-panel-dev printenv
```

## 🔮 Future Enhancements

Planned features:

- **User CRUD Operations**: Create, edit, delete users
- **Role Management**: User permissions and roles
- **System Monitoring**: Real-time metrics and alerts
- **Email Templates**: Manage email templates
- **Settings Panel**: Application configuration
- **Audit Logs**: Track administrative actions

## 📚 Related Documentation

- **Main Project**: [CONVERSATION_CONTEXT.md](../CONVERSATION_CONTEXT.md)
- **Infrastructure**: [infrastructure/README.md](../infrastructure/README.md)
- **API Documentation**: [tutorials/](../tutorials/)
- **Nuxt 3 Docs**: https://nuxt.com/docs
- **Shadcn/ui**: https://ui.shadcn.com/
