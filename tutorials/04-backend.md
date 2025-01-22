# Building the Rust Backend for Tauri

This tutorial covers building a robust Rust backend for your Tauri application. We'll explore command handling, state management, file system operations, and system integration.

## Backend Structure

### Project Organization

```
src-tauri/src/
├── main.rs         # Application entry point
├── lib.rs          # Library code
├── commands/       # Command handlers
│   ├── mod.rs
│   ├── file.rs
│   └── system.rs
├── models/         # Data structures
│   ├── mod.rs
│   └── app_state.rs
└── utils/          # Helper functions
    ├── mod.rs
    └── fs.rs
```

## Setting Up the Backend

### 1. Command Module Structure

Create `src-tauri/src/commands/mod.rs`:
```rust
pub mod file;
pub mod system;

pub use file::*;
pub use system::*;
```

### 2. File Operations

Create `src-tauri/src/commands/file.rs`:
```rust
use std::fs;
use std::path::Path;
use serde::{Serialize, Deserialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    name: String,
    size: u64,
    is_dir: bool,
    modified: String,
}

#[command]
pub async fn read_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Err("Path does not exist".into());
    }

    let mut entries = Vec::new();
    
    match fs::read_dir(path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                if let Ok(entry) = entry {
                    if let Ok(metadata) = entry.metadata() {
                        let modified = metadata
                            .modified()
                            .ok()
                            .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
                            .map(|duration| duration.as_secs().to_string())
                            .unwrap_or_else(|| "Unknown".into());

                        entries.push(FileInfo {
                            name: entry.file_name().to_string_lossy().into(),
                            size: metadata.len(),
                            is_dir: metadata.is_dir(),
                            modified,
                        });
                    }
                }
            }
            Ok(entries)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e))
    }
}

#[command]
pub async fn save_file(path: String, contents: String) -> Result<(), String> {
    fs::write(path, contents)
        .map_err(|e| format!("Failed to save file: {}", e))
}

#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))
}
```

### 3. System Operations

Create `src-tauri/src/commands/system.rs`:
```rust
use serde::Serialize;
use tauri::command;
use std::process::Command;

#[derive(Debug, Serialize)]
pub struct SystemInfo {
    os: String,
    cpu_cores: usize,
    memory_total: u64,
}

#[command]
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        cpu_cores: num_cpus::get(),
        memory_total: sys_info::mem_info()
            .map(|info| info.total)
            .unwrap_or(0),
    }
}

#[command]
pub async fn execute_system_command(
    command: String,
    args: Vec<String>
) -> Result<String, String> {
    let output = Command::new(command)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid output: {}", e))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into())
    }
}
```

### 4. Application State

Create `src-tauri/src/models/app_state.rs`:
```rust
use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct AppConfig {
    theme: String,
    language: String,
    auto_save: bool,
}

pub struct AppState {
    config: Mutex<AppConfig>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(AppConfig::default()),
        }
    }

    pub fn get_config(&self) -> AppConfig {
        self.config.lock().unwrap().clone()
    }

    pub fn update_config(&self, new_config: AppConfig) {
        *self.config.lock().unwrap() = new_config;
    }
}

#[command]
pub fn get_app_config(state: State<AppState>) -> AppConfig {
    state.get_config()
}

#[command]
pub fn update_app_config(
    state: State<AppState>,
    config: AppConfig,
) -> Result<(), String> {
    state.update_config(config);
    Ok(())
}
```

### 5. Utility Functions

Create `src-tauri/src/utils/fs.rs`:
```rust
use std::path::Path;
use walkdir::WalkDir;

pub fn get_directory_size(path: &Path) -> Result<u64, std::io::Error> {
    let mut total_size = 0;

    for entry in WalkDir::new(path).min_depth(1) {
        let entry = entry?;
        if entry.path().is_file() {
            total_size += entry.metadata()?.len();
        }
    }

    Ok(total_size)
}

pub fn ensure_directory(path: &Path) -> std::io::Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    Ok(())
}
```

## Main Application Setup

Update `src-tauri/src/main.rs`:
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod utils;

use commands::*;
use models::app_state::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            // File commands
            read_directory,
            save_file,
            read_file,
            // System commands
            get_system_info,
            execute_system_command,
            // State management
            get_app_config,
            update_app_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Error Handling

Create `src-tauri/src/utils/error.rs`:
```rust
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub enum AppError {
    FileSystem(String),
    System(String),
    Configuration(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::FileSystem(msg) => write!(f, "File system error: {}", msg),
            AppError::System(msg) => write!(f, "System error: {}", msg),
            AppError::Configuration(msg) => write!(f, "Configuration error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

pub type AppResult<T> = Result<T, AppError>;
```

## Testing

Create `src-tauri/src/commands/tests.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_read_directory() {
        let dir = tempdir().unwrap();
        let path = dir.path().to_str().unwrap();
        
        // Create test files
        std::fs::write(
            dir.path().join("test.txt"),
            "test content"
        ).unwrap();
        
        let result = read_directory(path.to_string());
        assert!(result.is_ok());
        
        let entries = result.unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "test.txt");
    }

    #[test]
    fn test_system_info() {
        let info = get_system_info();
        assert!(!info.os.is_empty());
        assert!(info.cpu_cores > 0);
    }
}
```

## Cargo Dependencies

Update `src-tauri/Cargo.toml`:
```toml
[package]
name = "app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
edition = "2021"

[dependencies]
tauri = { version = "1.5.0", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
walkdir = "2.3"
sys-info = "0.9"
num_cpus = "1.13"
thiserror = "1.0"

[build-dependencies]
tauri-build = { version = "1.5.0", features = [] }

[dev-dependencies]
tempfile = "3.2"
```

## Best Practices

1. **Error Handling**
   - Use custom error types
   - Provide meaningful error messages
   - Handle all potential failure cases

2. **State Management**
   - Use thread-safe state containers
   - Implement proper synchronization
   - Consider using atomic operations

3. **Security**
   - Validate all inputs
   - Sanitize file paths
   - Limit system command execution

4. **Performance**
   - Use async operations for I/O
   - Implement proper caching
   - Optimize resource usage

## Next Steps

Now that we have implemented both the frontend and backend, we'll explore how to handle IPC communication between them in the next tutorial.

Continue to [05-IPC](./05-ipc.md) →