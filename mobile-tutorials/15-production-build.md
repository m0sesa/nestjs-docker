# Phase 15: Production Build & Deployment

Configure EAS Build for production deployments to iOS App Store and Google Play Store, including app signing, optimization, and distribution.

## 🎯 Goals

- Set up EAS (Expo Application Services) for production builds
- Configure app signing and certificates for iOS and Android
- Optimize app bundle size and performance
- Prepare app store metadata and screenshots
- Deploy to TestFlight and Google Play Console for testing

## 🏗️ EAS Build Setup

### **Step 1: Install EAS CLI**

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Verify installation
eas --version
```

### **Step 2: Initialize EAS Configuration**

```bash
# Initialize EAS in your project
cd mobile
eas build:configure
```

This creates `eas.json` configuration file:

### **📁 [`eas.json`](../mobile/eas.json) - Build Configuration**

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium",
        "simulator": true
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "autoIncrement": true
      },
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

## 🔐 App Signing & Certificates

### **iOS App Signing**

```bash
# Generate iOS credentials automatically
eas credentials

# Or configure manually in eas.json
{
  "build": {
    "production": {
      "ios": {
        "credentialsSource": "local",
        "distributionCertificate": "./dist-cert.p12",
        "provisioningProfile": "./provisioning-profile.mobileprovision"
      }
    }
  }
}
```

### **Android App Signing**

```bash
# Generate Android keystore
eas credentials

# Or provide existing keystore
{
  "build": {
    "production": {
      "android": {
        "credentialsSource": "local",
        "keystore": "./android-keystore.jks"
      }
    }
  }
}
```

## 📱 Production App Configuration

### **Update [`app.json`](../mobile/app.json) for Production**

```json
{
  "expo": {
    "name": "NestJS Docker Mobile",
    "slug": "nestjs-docker-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#3b82f6"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.nestjsdocker.mobile",
      "buildNumber": "1",
      "infoPlist": {
        "CFBundleDisplayName": "NestJS Mobile",
        "NSCameraUsageDescription": "This app uses the camera to capture and upload photos.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photo library to select images for upload.",
        "NSMicrophoneUsageDescription": "This app uses the microphone to record videos with audio."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3b82f6"
      },
      "package": "com.nestjsdocker.mobile",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
    },
    "extra": {
      "apiUrl": "https://api.yourdomain.com",
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow NestJS Mobile to access your camera to capture photos.",
          "microphonePermission": "Allow NestJS Mobile to access your microphone to record videos.",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3b82f6"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them.",
          "cameraPermission": "The app accesses your camera to let you take photos."
        }
      ]
    ]
  }
}
```

## 🎨 App Store Assets

### **Required Assets Checklist**

Create the following assets in the `assets/` directory:

- [ ] **App Icon** (`icon.png`) - 1024x1024px
- [ ] **Adaptive Icon** (`adaptive-icon.png`) - 1024x1024px (Android)
- [ ] **Splash Screen** (`splash-icon.png`) - 1284x2778px
- [ ] **Notification Icon** (`notification-icon.png`) - 96x96px
- [ ] **Favicon** (`favicon.png`) - 48x48px

### **App Icon Guidelines**

```typescript
// Icon specifications
iOS: {
  sizes: ['20x20', '29x29', '40x40', '60x60', '76x76', '83.5x83.5', '1024x1024'],
  format: 'PNG',
  background: 'Should not be transparent'
}

Android: {
  sizes: ['48x48', '72x72', '96x96', '144x144', '192x192', '512x512'],
  format: 'PNG',
  adaptive: 'Foreground and background layers'
}
```

## 🚀 Build Commands

### **Development Build**

```bash
# Build for development/testing
eas build --profile development --platform ios
eas build --profile development --platform android
eas build --profile development --platform all
```

### **Preview Build**

```bash
# Build for internal testing
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### **Production Build**

```bash
# Build for app store release
eas build --profile production --platform ios
eas build --profile production --platform android
eas build --profile production --platform all
```

### **Monitor Build Progress**

```bash
# Check build status
eas build:list

# View specific build
eas build:view <build-id>
```

## 📊 Bundle Size Optimization

### **Analyze Bundle Size**

```bash
# Generate bundle analysis
npx expo export --dump-assetmap

# Install bundle analyzer
npm install --save-dev @expo/webpack-config
npx expo customize:web

# Analyze with webpack-bundle-analyzer
npx webpack-bundle-analyzer .expo/web/static/js/*.js
```

### **Optimization Strategies**

```typescript
// 1. Enable Hermes for Android (app.json)
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    }
  }
}

// 2. Tree shaking - use named imports
import { Ionicons } from '@expo/vector-icons';
// Instead of: import * as Icons from '@expo/vector-icons';

// 3. Lazy load screens
const LazyScreen = React.lazy(() => import('./screens/ExpensiveScreen'));

// 4. Optimize images
// Use expo-optimize for image compression
npx expo install expo-optimize
npx expo-optimize
```

## 📱 App Store Preparation

### **iOS App Store Connect**

1. **Create App Record**
   ```bash
   # App Store Connect Console
   - Create new app
   - Set bundle ID: com.nestjsdocker.mobile
   - Configure app information
   - Add screenshots and metadata
   ```

2. **App Information Required**
   - App name: "NestJS Docker Mobile"
   - Subtitle: "Backend Integration Demo"
   - Description: Detailed app description
   - Keywords: "nestjs, mobile, react native"
   - Category: Developer Tools or Utilities
   - Age rating: 4+ (or appropriate rating)

### **Google Play Console**

1. **Create App**
   ```bash
   # Play Console
   - Create new app
   - Set package name: com.nestjsdocker.mobile
   - Upload app bundle (.aab file)
   - Configure store listing
   ```

2. **Store Listing Requirements**
   - Short description (80 characters)
   - Full description (4000 characters)
   - Screenshots (2-8 images)
   - Feature graphic (1024x500px)
   - App icon (512x512px)

## 🚦 Automated Deployment

### **GitHub Actions Workflow**

```yaml
# .github/workflows/eas-build.yml
name: EAS Build and Deploy

on:
  push:
    branches: [main]
    paths: ['mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: cd mobile && npm ci
        
      - name: Build for production
        run: cd mobile && eas build --profile production --platform all --non-interactive
        
      - name: Submit to stores (optional)
        run: cd mobile && eas submit --profile production --platform all --non-interactive
```

## 📋 Pre-Release Testing

### **Internal Testing**

```bash
# Build for internal testing
eas build --profile preview

# Share with team via Expo
eas build:list
# Share the build URL with testers
```

### **TestFlight (iOS)**

```bash
# Submit to TestFlight
eas submit --profile production --platform ios
```

### **Google Play Internal Testing**

```bash
# Submit to Play Console internal track
eas submit --profile production --platform android
```

## 🔍 Quality Assurance

### **Pre-Release Checklist**

- [ ] **Authentication** - Login, register, logout work correctly
- [ ] **API Integration** - All endpoints respond properly
- [ ] **Navigation** - All screens accessible and functional
- [ ] **Camera** - Photo capture and upload work
- [ ] **Notifications** - Push notifications are received
- [ ] **Permissions** - All required permissions are requested
- [ ] **Error Handling** - Network errors handled gracefully
- [ ] **Performance** - App loads quickly and runs smoothly
- [ ] **UI/UX** - Design is consistent and responsive
- [ ] **Offline** - App handles network disconnection
- [ ] **Security** - Sensitive data is protected

### **Device Testing Matrix**

Test on multiple devices and OS versions:

```typescript
// iOS Testing
- iPhone 14 Pro (iOS 17)
- iPhone 12 (iOS 16) 
- iPad Air (iOS 17)
- iPhone SE (iOS 16)

// Android Testing  
- Samsung Galaxy S23 (Android 13)
- Pixel 7 (Android 13)
- OnePlus 9 (Android 12)
- Budget device (Android 11)
```

## 📈 Post-Launch Monitoring

### **Analytics Setup**

```bash
# Install analytics
npx expo install expo-application expo-device

# Example analytics integration
import * as Application from 'expo-application';
import * as Device from 'expo-device';

const trackEvent = (eventName: string, properties?: object) => {
  // Integrate with your analytics service
  console.log('Analytics:', eventName, properties);
};

// Track app launches
trackEvent('app_launched', {
  version: Application.nativeApplicationVersion,
  device: Device.modelName,
  platform: Device.osName,
});
```

### **Crash Reporting**

```bash
# Install Sentry for crash reporting
npm install @sentry/react-native

# Configure in App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

## ✅ Production Deployment Checklist

Before releasing to app stores:

- [ ] EAS Build configured with production profile
- [ ] App signing certificates generated and configured
- [ ] Production API endpoint configured
- [ ] All required app store assets created
- [ ] App store listings completed
- [ ] Internal testing completed successfully
- [ ] Privacy policy and terms of service linked
- [ ] Age rating and content descriptions accurate
- [ ] App icon and metadata finalized
- [ ] Analytics and crash reporting configured

## 🎯 What's Next

After successful app store deployment:

1. **Monitor Performance** - Track app usage and crashes
2. **User Feedback** - Collect and respond to user reviews
3. **Updates** - Plan regular feature updates and bug fixes
4. **Marketing** - Promote the app to increase downloads
5. **Scaling** - Add more features and improve performance

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)

---

**Phase 15 Complete** ✅  
*Mobile app ready for production deployment to iOS App Store and Google Play Store!*

**🎉 Tutorial Series Complete! 🎉**

You've successfully built a complete Expo React Native mobile application with:
- Full NestJS backend integration
- Professional UI/UX with native features  
- Production-ready build and deployment setup
- Comprehensive documentation and best practices