# Inter-Process Communication (IPC) in Tauri

This tutorial covers how to implement effective communication between your React frontend and Rust backend using Tauri's IPC mechanisms. We'll explore commands, events, and state synchronization.

## IPC Overview

Tauri provides several methods for frontend-backend communication:
1. Commands (Frontend → Backend)
2. Events (Backend → Frontend)
3. State (Shared State)

## Command Implementation

### 1. Backend Command Handlers

Create `src-tauri/src/commands/mod.rs`:
```rust
use serde::{Serialize, Deserialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserData {
    name: String,
    email: String,
    preferences: UserPreferences,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPreferences {
    theme: String,
    notifications: bool,
}

#[command]
pub async fn save_user_data(user: UserData) -> Result<(), String> {
    // Simulate database operation
    println!("Saving user data: {:?}", user);
    Ok(())
}

#[command]
pub async fn get_user_data() -> Result<UserData, String> {
    // Simulate database fetch
    Ok(UserData {
        name: "John Doe".into(),
        email: "john@example.com".into(),
        preferences: UserPreferences {
            theme: "dark".into(),
            notifications: true,
        },
    })
}

#[command]
pub async fn process_data(input: String) -> Result<String, String> {
    // Simulate processing
    Ok(format!("Processed: {}", input.to_uppercase()))
}
```

### 2. Frontend Command Invocation

Create `src/utils/commands.ts`:
```typescript
import { invoke } from '@tauri-apps/api/tauri';

interface UserData {
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

export const commands = {
  async saveUserData(userData: UserData): Promise<void> {
    try {
      await invoke('save_user_data', { user: userData });
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  },

  async getUserData(): Promise<UserData> {
    try {
      return await invoke('get_user_data');
    } catch (error) {
      console.error('Failed to get user data:', error);
      throw error;
    }
  },

  async processData(input: string): Promise<string> {
    try {
      return await invoke('process_data', { input });
    } catch (error) {
      console.error('Failed to process data:', error);
      throw error;
    }
  },
};
```

## Event System

### 1. Backend Event Emission

Update `src-tauri/src/main.rs`:
```rust
use tauri::Manager;
use std::time::Duration;
use tokio::time::sleep;

// Background task that emits events
async fn start_background_task(app_handle: tauri::AppHandle) {
    let mut interval = tokio::time::interval(Duration::from_secs(5));
    
    loop {
        interval.tick().await;
        
        // Emit system status event
        let _ = app_handle.emit_all("system_status", {
            let memory = sys_info::mem_info().unwrap_or_default();
            serde_json::json!({
                "memory_used": memory.total - memory.avail,
                "memory_total": memory.total,
                "timestamp": chrono::Utc::now().to_rfc3339(),
            })
        });
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            
            // Spawn background task
            tauri::async_runtime::spawn(async move {
                start_background_task(app_handle).await;
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::save_user_data,
            commands::get_user_data,
            commands::process_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. Frontend Event Listening

Create `src/hooks/useSystemEvents.ts`:
```typescript
import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

interface SystemStatus {
  memory_used: number;
  memory_total: number;
  timestamp: string;
}

export function useSystemEvents() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    const unlisten = listen<SystemStatus>('system_status', (event) => {
      setStatus(event.payload);
    });

    return () => {
      unlisten.then(fn => fn()); // Cleanup listener
    };
  }, []);

  return status;
}
```

## State Synchronization

### 1. Backend State Management

Create `src-tauri/src/state/mod.rs`:
```rust
use parking_lot::RwLock;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    settings: HashMap<String, String>,
    user_session: Option<UserSession>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserSession {
    id: String,
    expires_at: chrono::DateTime<chrono::Utc>,
}

pub struct StateManager {
    state: Arc<RwLock<AppState>>,
}

impl StateManager {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(AppState {
                settings: HashMap::new(),
                user_session: None,
            })),
        }
    }

    pub fn get_state(&self) -> AppState {
        self.state.read().clone()
    }

    pub fn update_settings(&self, key: String, value: String) {
        let mut state = self.state.write();
        state.settings.insert(key, value);
    }

    pub fn set_user_session(&self, session: UserSession) {
        let mut state = self.state.write();
        state.user_session = Some(session);
    }
}
```

### 2. Frontend State Management

Create `src/store/appState.ts`:
```typescript
import create from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';

interface AppState {
  settings: Record<string, string>;
  userSession: {
    id: string;
    expiresAt: string;
  } | null;
  updateSetting: (key: string, value: string) => Promise<void>;
  setUserSession: (session: AppState['userSession']) => Promise<void>;
}

export const useAppState = create<AppState>((set) => ({
  settings: {},
  userSession: null,
  updateSetting: async (key, value) => {
    await invoke('update_setting', { key, value });
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
  setUserSession: async (session) => {
    await invoke('set_user_session', { session });
    set({ userSession: session });
  },
}));
```

## Error Handling

### 1. Backend Error Types

Create `src-tauri/src/error.rs`:
```rust
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
pub enum AppError {
    #[error("IPC error: {0}")]
    IPCError(String),
    
    #[error("State error: {0}")]
    StateError(String),
    
    #[error("Validation error: {0}")]
    ValidationError(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
```

### 2. Frontend Error Handling

Create `src/utils/error.ts`:
```typescript
export class IPCError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'IPCError';
  }
}

export async function handleIPC<T>(
  promise: Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error(`${errorContext}:`, error);
    throw new IPCError(
      `Failed to ${errorContext}: ${error.message}`,
      error.code || 'UNKNOWN'
    );
  }
}
```

## Example Usage

### Component Implementation

```typescript
import { useEffect, useState } from 'react';
import { commands } from '../utils/commands';
import { useSystemEvents } from '../hooks/useSystemEvents';
import { useAppState } from '../store/appState';
import { handleIPC } from '../utils/error';

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const systemStatus = useSystemEvents();
  const { updateSetting } = useAppState();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await handleIPC(
          commands.getUserData(),
          'fetch user data'
        );
        setUserData(data);
      } catch (error) {
        // Handle error appropriately
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleThemeChange = async (theme: string) => {
    try {
      await updateSetting('theme', theme);
      // Theme updated successfully
    } catch (error) {
      // Handle error appropriately
      console.error('Failed to update theme:', error);
    }
  };

  return (
    <div>
      {userData && (
        <div>
          <h2>{userData.name}</h2>
          <p>{userData.email}</p>
          <button onClick={() => handleThemeChange('dark')}>
            Switch to Dark Theme
          </button>
        </div>
      )}
      
      {systemStatus && (
        <div>
          <h3>System Status</h3>
          <p>Memory Usage: {systemStatus.memory_used / 1024 / 1024}MB</p>
          <p>Last Updated: {new Date(systemStatus.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Type Safety**
   - Use TypeScript interfaces for command payloads
   - Define Rust types for all IPC data
   - Validate data on both ends

2. **Error Handling**
   - Implement proper error types
   - Handle all error cases
   - Provide meaningful error messages

3. **Performance**
   - Use async/await properly
   - Avoid unnecessary state updates
   - Batch related operations

4. **Security**
   - Validate all input data
   - Sanitize sensitive information
   - Implement proper access controls

## Next Steps

Now that we have implemented IPC communication, we'll explore building and packaging your Tauri application for distribution in the next tutorial.

Continue to [06-Building](./06-building.md) →