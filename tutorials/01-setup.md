# Setting Up Your Tauri Development Environment

This tutorial guides you through setting up a complete development environment for Tauri application development. We'll cover system-specific requirements and ensure all necessary tools are properly installed.

## System Requirements

### Common Requirements (All Platforms)

1. **Node.js and npm**
   ```bash
   # Check if installed
   node --version  # Should be v16 or later
   npm --version
   ```
   If not installed, download from [nodejs.org](https://nodejs.org/)

2. **Rust and Cargo**
   ```bash
   # Check if installed
   rustc --version
   cargo --version
   ```
   If not installed, use [rustup](https://rustup.rs/):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

3. **Git**
   ```bash
   # Check if installed
   git --version
   ```

## Platform-Specific Setup

### Linux Requirements

1. **Essential Build Tools**
   ```bash
   sudo apt update
   sudo apt install -y \
     libwebkit2gtk-4.0-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

2. **Additional Dependencies**
   - For RPM-based distributions (Fedora, RHEL):
     ```bash
     sudo dnf install webkit2gtk3-devel \
         openssl-devel \
         curl \
         wget \
         file \
         gtk3-devel \
         libappindicator-gtk3-devel \
         librsvg2-devel
     ```

### macOS Requirements

1. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Homebrew (Recommended)**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

### Windows Requirements

1. **Microsoft Visual Studio C++ Build Tools**
   - Download and install from [Visual Studio Downloads](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Select "Desktop development with C++"

2. **WebView2**
   - Usually pre-installed on Windows 10/11
   - If needed, download from [Microsoft WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

3. **Windows SDK**
   - Install through Visual Studio Installer
   - Select "Windows 10/11 SDK" during installation

## IDE Setup

### VS Code (Recommended)

1. **Install VS Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

2. **Essential Extensions**
   - rust-analyzer (Rust language support)
   - Tauri (Tauri development tools)
   - ESLint (JavaScript/TypeScript linting)
   - Prettier (Code formatting)

3. **Configuration**
   ```jsonc
   // settings.json
   {
     "rust-analyzer.checkOnSave.command": "clippy",
     "editor.formatOnSave": true,
     "[rust]": {
       "editor.defaultFormatter": "rust-lang.rust-analyzer"
     },
     "[typescript][javascript][typescriptreact][javascriptreact]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

## Verifying Installation

Create a test script `check-tauri-deps.js`:

```javascript
const { execSync } = require('child_process');

function checkCommand(command, name) {
    try {
        execSync(command + ' --version', { stdio: 'pipe' });
        console.log(`✅ ${name} is installed`);
        return true;
    } catch {
        console.log(`❌ ${name} is not installed`);
        return false;
    }
}

// Check common requirements
checkCommand('node', 'Node.js');
checkCommand('npm', 'npm');
checkCommand('rustc', 'Rust');
checkCommand('cargo', 'Cargo');
checkCommand('git', 'Git');

// Check platform-specific requirements
if (process.platform === 'win32') {
    console.log('\nWindows-specific checks:');
    // WebView2 check would require registry query
    console.log('⚠️ Please verify WebView2 is installed manually');
} else if (process.platform === 'darwin') {
    console.log('\nmacOS-specific checks:');
    checkCommand('xcode-select -p', 'Xcode Command Line Tools');
} else if (process.platform === 'linux') {
    console.log('\nLinux-specific checks:');
    // Check for required libraries
    const libraries = [
        'libwebkit2gtk-4.0-dev',
        'libgtk-3-dev',
        'libayatana-appindicator3-dev'
    ];
    libraries.forEach(lib => {
        try {
            execSync(`dpkg -s ${lib}`, { stdio: 'pipe' });
            console.log(`✅ ${lib} is installed`);
        } catch {
            console.log(`❌ ${lib} is not installed`);
        }
    });
}
```

Run the check:
```bash
node check-tauri-deps.js
```

## Troubleshooting Common Issues

### Rust Installation Issues

1. **Path Issues**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export PATH="$HOME/.cargo/bin:$PATH"
   ```

2. **Build Failures**
   - Update Rust:
     ```bash
     rustup update
     ```
   - Clean build:
     ```bash
     cargo clean
     ```

### Node.js Issues

1. **Version Conflicts**
   - Use nvm for version management:
     ```bash
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
     ```

2. **Permission Issues**
   ```bash
   npm config set prefix '~/.local/'
   ```

### Platform-Specific Issues

#### Linux
- Missing libraries:
  ```bash
  sudo apt install pkg-config
  ```

#### macOS
- Xcode issues:
  ```bash
  sudo xcode-select --reset
  ```

#### Windows
- Build tools:
  ```bash
  npm install --global windows-build-tools
  ```

## Next Steps

Now that your development environment is set up, you're ready to create your first Tauri application. In the next tutorial, we'll explore the Tauri project structure and understand how different components work together.

Continue to [02-Project-Structure](./02-project-structure.md) →