# Understanding Tauri Project Structure

This tutorial explores the structure of a Tauri application, explaining how different components work together and the purpose of each configuration file.

## Project Overview

A typical Tauri project has this structure:
```
my-tauri-app/
├── src/                 # Frontend source code
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/          # Rust backend code
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/             # Static assets
├── index.html          # Entry HTML file
├── package.json        # Node.js dependencies
└── vite.config.ts      # Vite configuration
```

Let's examine each component in detail.

## Frontend Structure

### 1. Root Configuration Files

#### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tauri + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
This is the entry point for your web application. Tauri loads this file in its WebView component.

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
});
```
Configures the Vite development server and build process. The settings are optimized for Tauri development.

### 2. Source Directory (src/)

#### main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
The React application entry point that renders your app into the DOM.

#### App.tsx
```typescript
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  async function greet() {
    // Invoke a Rust command
    const response = await invoke('greet', { name: 'World' });
    setMessage(response as string);
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>
      <button onClick={greet}>Greet</button>
      <p>{message}</p>
    </div>
  );
}

export default App;
```
The main application component showcasing Tauri's IPC capabilities.

## Backend Structure (src-tauri/)

### 1. Rust Source Files

#### main.rs
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Command handlers
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```
The main entry point for the Rust backend, setting up command handlers and initializing the application.

#### lib.rs
```rust
// Optional library code for larger applications
pub mod models;
pub mod handlers;
pub mod utils;
```
Optional module organization for larger applications.

### 2. Configuration Files

#### Cargo.toml
```toml
[package]
name = "app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5.0", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
tauri = { version = "1.5.0", features = [] }

[features]
custom-protocol = ["tauri/custom-protocol"]
```
Rust package configuration and dependencies.

#### tauri.conf.json
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "app",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false
    },
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "",
      "deb": {
        "depends": []
      },
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.example.app",
      "longDescription": "",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "shortDescription": "",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 600,
        "resizable": true,
        "title": "app",
        "width": 800
      }
    ]
  }
}
```
Core configuration file for Tauri application settings.

## Key Concepts

### 1. Frontend-Backend Communication

The frontend and backend communicate through:
- Commands (frontend → backend)
- Events (backend → frontend)
- State (shared between both)

Example of invoking a command from frontend:
```typescript
import { invoke } from '@tauri-apps/api/tauri';

// Call Rust function
const response = await invoke('command_name', { arg1: 'value' });
```

Corresponding Rust handler:
```rust
#[tauri::command]
fn command_name(arg1: String) -> Result<String, String> {
    Ok(format!("Processed: {}", arg1))
}
```

### 2. Security Features

Tauri's security is configured through:
- CSP in index.html
- Allowlist in tauri.conf.json
- Rust-level permissions

### 3. Asset Handling

Assets can be accessed through:
- Public directory (static assets)
- Asset protocol (bundled resources)
- Custom protocols (dynamic content)

## Best Practices

1. **Project Organization**
   - Keep frontend and backend code clearly separated
   - Use modules in Rust for better organization
   - Follow React best practices in frontend code

2. **Configuration Management**
   - Use environment variables for sensitive data
   - Configure different builds through tauri.conf.json
   - Maintain separate dev/prod configurations

3. **Security**
   - Minimize allowlist permissions
   - Validate all IPC inputs
   - Use CSP headers

4. **Performance**
   - Optimize asset sizes
   - Use async operations appropriately
   - Implement proper error handling

## Next Steps

Now that you understand the project structure, we'll dive into building the frontend of our application in the next tutorial.

Continue to [03-Frontend](./03-frontend.md) →