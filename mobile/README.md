# NestJS Docker Mobile App

A modern React Native mobile application built with Expo, designed to integrate seamlessly with the NestJS Docker Backend. Features JWT authentication, camera integration, push notifications, and a professional UI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device
- NestJS Docker Backend running

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Or start for specific platform
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator  
npm run web      # Web browser
```

### Backend Integration

Ensure the NestJS backend is running first:
```bash
cd ../infrastructure
just dev-up
```

The mobile app connects to: `https://api.interestingapp.local`

## 📱 Features

- **🔐 JWT Authentication** - Login, register, secure token management
- **📷 Camera Integration** - Photo capture and gallery selection
- **🔔 Push Notifications** - Real-time notifications with permissions
- **👤 User Profile** - Profile editing and account management
- **📊 Dashboard** - User statistics and quick actions
- **🎨 Modern UI** - Consistent design with Ionicons
- **⚡ Native Performance** - Expo SDK with native optimizations

## 🏗️ Architecture

```
mobile/
├── app/                    # 🗂️ Expo Router screens
│   ├── (tabs)/            # Tab navigation (Dashboard, Camera, Settings)
│   ├── auth/              # Authentication screens (Login, Register)
│   ├── profile.tsx        # User profile screen
│   └── _layout.tsx        # Root layout with providers
├── contexts/              # 🔄 React contexts
│   └── AuthContext.tsx    # Authentication state management
├── services/              # 🌐 API integration
│   └── api.ts             # Axios client with interceptors
├── assets/                # 🎨 Images and static files
├── app.json               # 📱 Expo app configuration
└── eas.json               # 🏗️ EAS Build configuration
```

## 🔧 Configuration

### Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Configure your API endpoint:
```env
API_URL=https://api.interestingapp.local
EXPO_PUBLIC_API_URL=https://api.interestingapp.local
```

### App Configuration

Key configuration in [`app.json`](./app.json):
- App name and bundle identifiers
- Permissions for camera, notifications, storage  
- Native plugins and SDK configuration
- Platform-specific settings

## 📚 Development Guide

### Authentication Flow

```typescript
// Login example
import { useAuth } from '../contexts/AuthContext';

const { login, user, logout } = useAuth();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    // User is logged in, JWT token stored securely
  }
};
```

### API Integration

```typescript
// API service example
import { UserAPI } from '../services/api';

const updateProfile = async (userData) => {
  try {
    const result = await UserAPI.updateProfile(userData);
    // Profile updated successfully
  } catch (error) {
    // Handle API errors
  }
};
```

### Navigation

Using Expo Router with file-based routing:
- `app/(tabs)/index.tsx` - Dashboard screen
- `app/(tabs)/camera.tsx` - Camera screen
- `app/auth/login.tsx` - Login screen
- `app/profile.tsx` - Profile screen

## 🧪 Testing

### Development Testing
```bash
# Start with Expo Go app
npm start
# Scan QR code with your device

# Test specific features
- Authentication (login/register/logout)
- Camera capture and gallery selection
- Profile updates
- Push notifications
- API integration
```

### Device Testing
- **iOS**: Use Expo Go app or iOS Simulator
- **Android**: Use Expo Go app or Android Emulator
- **Web**: Browser testing for debugging

## 🏭 Production Build

### EAS Build Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure builds
eas build:configure

# Build for production
eas build --profile production --platform all
```

### App Store Deployment

```bash
# Submit to stores
eas submit --profile production --platform all
```

For detailed production setup, see [mobile-tutorials/15-production-build.md](../mobile-tutorials/15-production-build.md)

## 📖 Tutorial Documentation

Complete step-by-step tutorials available in [`mobile-tutorials/`](../mobile-tutorials/):

1. **[Prerequisites](../mobile-tutorials/00-prerequisites.md)** - Setup requirements
2. **[Expo Setup](../mobile-tutorials/01-expo-setup.md)** - Project initialization  
3. **[Navigation](../mobile-tutorials/02-navigation-setup.md)** - App navigation structure
4. **[Authentication](../mobile-tutorials/03-authentication-ui.md)** - Login/register screens
5. **[API Integration](../mobile-tutorials/04-api-integration.md)** - Backend connectivity
6. **[Secure Storage](../mobile-tutorials/05-secure-storage.md)** - Token management
7. **[Dashboard](../mobile-tutorials/07-dashboard.md)** - Main app screen
8. **[Camera](../mobile-tutorials/09-camera-integration.md)** - Photo features
9. **[Notifications](../mobile-tutorials/10-push-notifications.md)** - Push notifications
10. **[Production](../mobile-tutorials/15-production-build.md)** - App store deployment

## 🔒 Security

- **JWT Tokens** stored securely with Expo SecureStore
- **API Requests** automatically include authentication headers
- **Token Refresh** handled automatically on expiration
- **Biometric Auth** support for enhanced security
- **Permissions** requested appropriately for device features

## 🛠️ Dependencies

### Core Dependencies
- **expo** - Expo SDK and tools
- **react-native** - React Native framework
- **@react-navigation** - Navigation library
- **axios** - HTTP client for API requests
- **@tanstack/react-query** - Data fetching and caching

### Native Features
- **expo-camera** - Camera access and photo capture
- **expo-image-picker** - Gallery image selection
- **expo-notifications** - Push notification handling
- **expo-secure-store** - Secure token storage
- **@expo/vector-icons** - Icon library

### Development Tools
- **typescript** - Type safety and development experience
- **@expo/cli** - Expo command line tools
- **eas-cli** - Build and deployment tools

## 🤝 Integration with NestJS Backend

This mobile app is designed to work with the NestJS Docker Backend:

### Shared Features
- **Authentication** - JWT tokens from NestJS `/auth` endpoints
- **User Management** - Profile CRUD via `/users` endpoints  
- **File Upload** - Image upload to NestJS storage
- **Notifications** - Server-sent push notifications

### API Endpoints Used
```typescript
// Authentication
POST /auth/login
POST /auth/register  
POST /auth/logout
POST /auth/refresh
GET  /auth/profile

// User Management
GET    /users
GET    /users/:id
PATCH  /users/profile
PATCH  /users/change-password

// Notifications
POST /notifications/test
GET  /notifications
PATCH /notifications/:id/read
```

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**Module resolution problems:**
```bash
rm -rf node_modules
npm install
npx expo start --reset-cache
```

**API connection issues:**
```bash
# Verify backend is running
curl https://api.interestingapp.local/health

# Check network permissions in app.json
```

**Build failures:**
```bash
# Clear EAS build cache
eas build --clear-cache

# Check eas.json configuration
```

## 📊 Performance

### Optimization Features
- **Hermes JavaScript Engine** for faster startup
- **Image Optimization** with expo-optimize
- **Bundle Splitting** for reduced initial load
- **Lazy Loading** for non-critical screens
- **Memory Management** for camera features

### Bundle Size
- Production bundle: ~15-20MB
- Development bundle: ~25-30MB
- Optimizations available in production builds

## 🎯 Future Enhancements

Potential features to add:
- **Offline Support** with Redux Persist
- **Real-time Chat** with WebSocket integration  
- **QR Code Scanner** for additional camera features
- **Biometric Authentication** for enhanced security
- **Maps Integration** for location features
- **Social Features** like sharing and comments

## 📜 License

This project is part of the NestJS Docker tutorial series.

---

**Built with Expo SDK 51+ and React Native 0.74+**  
**Full backend integration with NestJS Docker Backend**  
**Production-ready with comprehensive tutorials**