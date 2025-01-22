# Building the Frontend with React and Tauri

This tutorial focuses on building a modern, responsive frontend for your Tauri application using React and TypeScript. We'll cover component structure, state management, and integration with Tauri's API.

## Setting Up the Frontend

### Project Initialization

First, ensure you're in your project directory and have the necessary dependencies:

```bash
npm install @tauri-apps/api @emotion/react @emotion/styled
```

### Directory Structure

Organize your frontend code like this:
```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── styles/        # Global styles and themes
├── utils/         # Helper functions
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## Building Components

### 1. Application Shell

Create `src/components/Layout.tsx`:
```typescript
import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.header`
  background: #1a1a1a;
  color: white;
  padding: 1rem;
  -webkit-app-region: drag; // Makes the header draggable
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Container>
      <Header>
        <h1>Tauri Application</h1>
      </Header>
      <Main>{children}</Main>
    </Container>
  );
}
```

### 2. Custom Window Controls

Create `src/components/WindowControls.tsx`:
```typescript
import { appWindow } from '@tauri-apps/api/window';
import styled from '@emotion/styled';

const ControlsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px;
  -webkit-app-region: no-drag;
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export function WindowControls() {
  return (
    <ControlsContainer>
      <ControlButton onClick={() => appWindow.minimize()}>
        －
      </ControlButton>
      <ControlButton onClick={() => appWindow.toggleMaximize()}>
        □
      </ControlButton>
      <ControlButton onClick={() => appWindow.close()}>
        ✕
      </ControlButton>
    </ControlsContainer>
  );
}
```

### 3. File System Integration

Create `src/components/FileExplorer.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import styled from '@emotion/styled';

const FileContainer = styled.div`
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
`;

const FileContent = styled.pre`
  margin: 1rem 0;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  overflow-x: auto;
`;

export function FileExplorer() {
  const [content, setContent] = useState<string>('');

  const handleFileOpen = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Text', extensions: ['txt', 'md'] }]
      });
      
      if (selected && !Array.isArray(selected)) {
        const content = await readTextFile(selected);
        setContent(content);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  return (
    <FileContainer>
      <button onClick={handleFileOpen}>Open File</button>
      {content && (
        <FileContent>{content}</FileContent>
      )}
    </FileContainer>
  );
}
```

## State Management

### 1. Custom Hooks

Create `src/hooks/useAppState.ts`:
```typescript
import { create } from 'zustand';

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useAppState = create<AppState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
```

### 2. Theme Implementation

Create `src/styles/theme.ts`:
```typescript
export const lightTheme = {
  colors: {
    background: '#ffffff',
    text: '#000000',
    primary: '#2f95dc',
    secondary: '#6c757d',
  },
};

export const darkTheme = {
  colors: {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#3fa9f5',
    secondary: '#909090',
  },
};
```

## Tauri API Integration

### 1. Window Management

Create `src/utils/window.ts`:
```typescript
import { appWindow } from '@tauri-apps/api/window';

export const windowUtils = {
  async maximize() {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  },

  async minimize() {
    await appWindow.minimize();
  },

  async close() {
    await appWindow.close();
  },
};
```

### 2. System Integration

Create `src/utils/system.ts`:
```typescript
import { invoke } from '@tauri-apps/api/tauri';
import { notify } from '@tauri-apps/api/notification';

export const systemUtils = {
  async showNotification(message: string) {
    await notify({
      title: 'Tauri App',
      body: message,
    });
  },

  async invokeRust(command: string, args?: Record<string, unknown>) {
    try {
      return await invoke(command, args);
    } catch (error) {
      console.error(`Error invoking ${command}:`, error);
      throw error;
    }
  },
};
```

## Putting It All Together

Update `src/App.tsx`:
```typescript
import { ThemeProvider } from '@emotion/react';
import { Layout } from './components/Layout';
import { WindowControls } from './components/WindowControls';
import { FileExplorer } from './components/FileExplorer';
import { useAppState } from './hooks/useAppState';
import { lightTheme, darkTheme } from './styles/theme';

function App() {
  const { isDarkMode, toggleDarkMode } = useAppState();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <WindowControls />
        <button onClick={toggleDarkMode}>
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
        <FileExplorer />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
```

## Best Practices

1. **Component Organization**
   - Keep components small and focused
   - Use TypeScript interfaces for props
   - Implement proper error boundaries

2. **State Management**
   - Use hooks for local state
   - Implement global state only when necessary
   - Keep state updates predictable

3. **Performance**
   - Implement proper memoization
   - Use lazy loading for large components
   - Optimize re-renders

4. **Error Handling**
   - Implement proper error boundaries
   - Handle async operations safely
   - Provide user feedback for errors

## Testing

Create `src/components/__tests__/Layout.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { Layout } from '../Layout';

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
});
```

## Next Steps

Now that we have a solid frontend implementation, we'll explore building the Rust backend and implementing IPC communication in the next tutorial.

Continue to [04-Backend](./04-backend.md) →