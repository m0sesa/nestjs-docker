# Phase 1: Expo Project Setup

Initialize a new Expo React Native project with TypeScript and essential dependencies for mobile app development.

## 🎯 Goals

- Set up Expo development environment
- Initialize project with TypeScript template
- Configure essential dependencies for navigation, API integration, and native features
- Understand Expo project structure and configuration

## 📦 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device
- Code editor (VS Code recommended)

## 🚀 Project Initialization

### **Step 1: Create Expo Project**

```bash
# Navigate to your project root (alongside the NestJS backend)
cd /path/to/your/nestjs-docker-project

# Create the mobile app directory
mkdir mobile
cd mobile

# Initialize Expo project with TypeScript
npx create-expo-app@latest . --template blank-typescript
```

This creates a clean Expo project with TypeScript support.

### **Step 2: Essential Dependencies**

Install the core packages needed for a full-featured mobile app:

```bash
# Navigation dependencies
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# Expo navigation support
npx expo install react-native-screens react-native-safe-area-context

# Expo Router (file-based routing)
npx expo install expo-router

# API and state management
npm install axios @tanstack/react-query

# Authentication and storage
npx expo install expo-secure-store

# Native device features
npx expo install expo-camera expo-image-picker expo-notifications

# UI and utilities
npm install @expo/vector-icons
npx expo install expo-constants expo-linking expo-web-browser

# Forms and validation
npm install react-hook-form

# Development tools
npm install --save-dev @types/react @types/react-native
```

## 📁 Project Structure

After setup, your mobile app structure should look like:

```
mobile/
├── app/                    # 🗂️ App screens and routing
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout with providers
├── components/            # 🧩 Reusable UI components
├── contexts/              # 🔄 React context providers
├── services/              # 🌐 API services and utilities
├── assets/                # 🎨 Images, fonts, and static files
├── app.json               # 📱 Expo app configuration
├── package.json           # 📦 Dependencies and scripts
└── tsconfig.json          # ⚙️ TypeScript configuration
```

## ⚙️ Configuration Files

### **📱 [`app.json`](../mobile/app.json) - Expo App Configuration**

```json
{
  "expo": {
    "name": "NestJS Docker Mobile",
    "slug": "nestjs-docker-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.nestjsdocker.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.nestjsdocker.mobile"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      "expo-notifications",
      "expo-image-picker"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### **📦 Key Package Purposes**

| Package | Purpose |
|---------|---------|
| `@react-navigation/native` | Core navigation library for React Native |
| `@react-navigation/native-stack` | Stack navigator for screen transitions |
| `@react-navigation/bottom-tabs` | Bottom tab navigation component |
| `expo-router` | File-based routing system (alternative to React Navigation) |
| `react-native-screens` | Native screen components for better performance |
| `react-native-safe-area-context` | Safe area handling for different devices |
| `axios` | HTTP client for API requests |
| `@tanstack/react-query` | Data fetching, caching, and synchronization |
| `expo-secure-store` | Secure storage for sensitive data (tokens) |
| `expo-camera` | Camera access and photo capture |
| `expo-image-picker` | Image selection from gallery |
| `expo-notifications` | Push notification handling |
| `@expo/vector-icons` | Icon library with multiple icon sets |
| `react-hook-form` | Form handling with validation |

## 🧪 Testing the Setup

### **Step 1: Start Development Server**

```bash
# Start the Expo development server
npm start

# Alternative specific platforms
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator
npm run web      # Web browser
```

### **Step 2: Connect Physical Device**

1. Install **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. The app should load with the default "Open up App.tsx to start working" screen

### **Step 3: Verify Installation**

Check that all dependencies are properly installed:

```bash
# Check for any peer dependency issues
npm ls

# Verify Expo CLI is working
npx expo --version
```

## 📱 Development Workflow

### **Hot Reload Development:**
- Make changes to any file in the `app/` directory
- Save the file
- The app automatically reloads on your device
- Shake device or press `r` in terminal to manually reload

### **Debugging:**
- Press `j` in terminal to open debugger
- Use React Native debugger for advanced debugging
- Check Metro bundler logs for build errors

## 🔧 VS Code Setup (Optional)

Install these VS Code extensions for better development experience:

```bash
# Recommended extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Expo Tools
- React Native Tools
- Auto Rename Tag
```

## 🚨 Common Issues & Solutions

### **Metro bundler issues:**
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache
```

### **Dependency conflicts:**
```bash
# Check for peer dependency warnings
npm ls

# Fix peer dependencies
npx expo install --fix
```

### **TypeScript errors:**
```bash
# Verify TypeScript configuration
npx tsc --noEmit

# Check for type definition issues
npm run type-check
```

## ✅ Verification Checklist

Before proceeding to the next phase, ensure:

- [ ] Expo project starts without errors
- [ ] App loads successfully on physical device or simulator
- [ ] All dependencies installed without warnings
- [ ] TypeScript compilation works without errors
- [ ] Project structure matches the recommended layout
- [ ] Hot reload works when making changes

## 🎯 What's Next

In the next tutorial, we'll set up:
1. **React Navigation** with tab and stack navigators
2. **Route protection** for authenticated screens
3. **Navigation structure** for the entire app
4. **TypeScript types** for navigation parameters

→ **Continue to:** [02-navigation-setup.md](./02-navigation-setup.md)

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript React Native](https://reactnative.dev/docs/typescript)
- [Metro Bundler](https://facebook.github.io/metro/)

---

**Phase 1 Complete** ✅  
*Next: Navigation Setup and Route Protection*