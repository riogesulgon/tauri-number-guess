# Building and Packaging Your Tauri Application

This tutorial covers the process of building, packaging, and distributing your Tauri application. We'll explore build configurations, optimization techniques, and platform-specific considerations.

## Build Configuration

### 1. Tauri Configuration

Update `src-tauri/tauri.conf.json`:
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist",
    "withGlobalTauri": true
  },
  "package": {
    "productName": "YourApp",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeDir": true,
        "removeFile": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      }
    },
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.yourcompany.yourapp",
      "longDescription": "",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: https://asset.localhost; style-src 'self' 'unsafe-inline'"
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 600,
        "resizable": true,
        "title": "Your App",
        "width": 800,
        "transparent": false
      }
    ]
  }
}
```

### 2. Frontend Build Configuration

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['@tauri-apps/api']
        }
      }
    }
  },
  server: {
    port: 1420,
    strictPort: true
  }
});
```

## Build Process

### 1. Development Build

```bash
# Run in development mode
npm run tauri dev

# Build in debug mode
npm run tauri build --debug
```

### 2. Production Build

```bash
# Clean previous builds
npm run clean

# Build frontend
npm run build

# Build Tauri application
npm run tauri build
```

## Platform-Specific Builds

### Windows

1. **Prerequisites**
   - Visual Studio Build Tools
   - Windows SDK
   - WebView2

```powershell
# Build for Windows
npm run tauri build -- --target x86_64-pc-windows-msvc
```

### macOS

1. **Prerequisites**
   - Xcode
   - Apple Developer account (for signing)

```bash
# Build for macOS
npm run tauri build -- --target x86_64-apple-darwin
```

### Linux

1. **Prerequisites**
   - Build essentials
   - WebKit2GTK

```bash
# Build for Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## Optimization Techniques

### 1. Frontend Optimization

```typescript
// src/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import Loading from './components/Loading';

// Lazy load components
const App = React.lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
```

### 2. Backend Optimization

Update `src-tauri/Cargo.toml`:
```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

## Application Signing

### 1. Windows Code Signing

```powershell
# Sign using Windows SDK
signtool sign /f certificate.pfx /p password /fd sha256 /tr http://timestamp.digicert.com /td sha256 "path/to/app.exe"
```

### 2. macOS Code Signing

```bash
# Sign the application
codesign --force --sign "Developer ID Application: Your Name" --options runtime "path/to/app.app"

# Notarize the application
xcrun notarytool submit "path/to/app.zip" --apple-id "your@email.com" --password "app-specific-password" --team-id "YOUR_TEAM_ID"
```

## Auto-Updates

### 1. Update Configuration

Update `src-tauri/tauri.conf.json`:
```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.myapp.com/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### 2. Update Server Implementation

```typescript
// update-server/index.ts
import express from 'express';
import { compareVersions } from 'compare-versions';

const app = express();

app.get('/{{target}}/{{current_version}}', (req, res) => {
  const currentVersion = req.params.current_version;
  const latestVersion = '1.0.1'; // Get from your release system
  
  if (compareVersions(latestVersion, currentVersion) > 0) {
    res.json({
      version: latestVersion,
      notes: 'New features and bug fixes',
      pub_date: new Date().toISOString(),
      url: `https://releases.myapp.com/download/${latestVersion}`
    });
  } else {
    res.status(204).send();
  }
});
```

## Distribution

### 1. Creating Installers

#### Windows (using NSIS)

```nsis
!include "MUI2.nsh"

Name "Your App"
OutFile "YourApp-Setup.exe"
InstallDir "$PROGRAMFILES\YourApp"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\*.*"
  CreateShortCut "$DESKTOP\YourApp.lnk" "$INSTDIR\YourApp.exe"
SectionEnd
```

#### macOS (using DMG)

```bash
# Create DMG
create-dmg \
  --volname "Your App" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "YourApp.app" 200 190 \
  --hide-extension "YourApp.app" \
  --app-drop-link 600 185 \
  "YourApp.dmg" \
  "path/to/YourApp.app"
```

### 2. Publishing

#### GitHub Releases
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run tauri build
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/release/bundle/dmg/*.dmg
            src-tauri/target/release/bundle/msi/*.msi
            src-tauri/target/release/bundle/deb/*.deb
```

## Best Practices

1. **Build Process**
   - Use consistent versioning
   - Implement proper error handling
   - Test builds on all target platforms

2. **Security**
   - Sign all releases
   - Implement proper CSP
   - Use secure update channels

3. **Performance**
   - Optimize bundle sizes
   - Implement lazy loading
   - Use proper build flags

4. **Distribution**
   - Provide clear installation instructions
   - Include release notes
   - Maintain changelog

## Troubleshooting Common Issues

### 1. Build Failures
```bash
# Clean build artifacts
npm run clean
rm -rf src-tauri/target

# Rebuild with verbose output
npm run tauri build -- -v
```

### 2. Signing Issues
```bash
# Verify certificate
codesign -dvv "path/to/app.app"

# Check notarization status
xcrun notarytool log "submission-id"
```

### 3. Update Issues
```bash
# Test update endpoint
curl -H "Accept: application/json" \
     "https://releases.myapp.com/windows-x86_64/1.0.0"
```

## Next Steps

Congratulations! You've completed the Tauri application development tutorial series. Here are some suggested next steps:

1. Implement automated testing
2. Set up continuous integration/deployment
3. Add analytics and error tracking
4. Enhance the update system
5. Implement platform-specific features

Remember to check the [Tauri documentation](https://tauri.app/docs) for updates and new features as they become available.