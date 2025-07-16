# Desktop Application Authentication Integration Guide

## Overview

This guide provides comprehensive instructions for integrating JobSwipe's authentication system into Electron desktop applications with secure token storage, device registration, and seamless user experience.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Electron 28+ application
- TypeScript 5.0+
- Modern build tools (Webpack, Vite, etc.)

## Installation

### 1. Install Required Dependencies

```bash
# Core dependencies
npm install electron@latest @electron/remote
npm install keytar safeStorage electron-store

# Authentication dependencies
npm install axios uuid zod
npm install @types/uuid @types/node

# UI dependencies (for renderer process)
npm install react@18 react-dom@18 @types/react @types/react-dom
npm install tailwindcss @tailwindcss/forms
npm install lucide-react clsx

# Development dependencies
npm install -D electron-builder concurrently wait-on
npm install -D @types/electron typescript
```

### 2. Project Structure

```
desktop-app/
├── src/
│   ├── main/              # Main process
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── services/
│   │       ├── AuthService.ts
│   │       ├── TokenStorageService.ts
│   │       └── DeviceRegistrationService.ts
│   ├── renderer/          # Renderer process
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── pages/
│   └── shared/            # Shared types/utils
│       └── types.ts
├── assets/
├── build/
├── dist/
├── package.json
├── tsconfig.json
└── electron-builder.json
```

## Core Implementation

### 1. Main Process Setup

Create `src/main/main.ts`:

```typescript
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import { join } from 'path';
import { AuthService } from './services/AuthService';
import { isDevelopment } from '../shared/constants';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupApplicationMenu();
      this.authService.initialize();
    });

    // Handle window closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app activate
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    // Handle deep links
    app.setAsDefaultProtocolClient('jobswipe');
    
    // Handle second instance (for deep links)
    app.on('second-instance', (_, commandLine) => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.focus();
      }
      
      // Handle deep link
      const url = commandLine.find(arg => arg.startsWith('jobswipe://'));
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle deep link on macOS
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.handleDeepLink(url);
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, 'preload.js'),
        sandbox: false
      },
      titleBarStyle: 'hiddenInset',
      icon: join(__dirname, '../assets/icon.png')
    });

    // Load app
    if (isDevelopment) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private setupApplicationMenu(): void {
    const template = [
      {
        label: 'JobSwipe',
        submenu: [
          {
            label: 'About JobSwipe',
            role: 'about'
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow?.webContents.send('show-preferences');
            }
          },
          { type: 'separator' },
          {
            label: 'Sign Out',
            click: async () => {
              await this.authService.logout();
            }
          },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
  }

  private handleDeepLink(url: string): void {
    console.log('Deep link received:', url);
    this.authService.handleDeepLink(url);
  }
}

// Initialize application
new Application();
```

### 2. Preload Script

Create `src/main/preload.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose secure API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  auth: {
    getState: () => ipcRenderer.invoke('auth-get-state'),
    startAuthentication: () => ipcRenderer.invoke('auth-start-authentication'),
    logout: () => ipcRenderer.invoke('auth-logout'),
    getAccessToken: () => ipcRenderer.invoke('auth-get-access-token'),
    refreshToken: () => ipcRenderer.invoke('auth-refresh-token'),
    handleTokenExchange: (token: string) => ipcRenderer.invoke('auth-token-exchange', token),
    
    // Event listeners
    onStateChanged: (callback: (state: any) => void) => {
      ipcRenderer.on('auth-state-changed', (_, state) => callback(state));
    },
    onAuthenticated: (callback: (session: any) => void) => {
      ipcRenderer.on('auth-authenticated', (_, session) => callback(session));
    },
    onLogout: (callback: () => void) => {
      ipcRenderer.on('auth-logout', () => callback());
    }
  },

  // System
  system: {
    getVersion: () => ipcRenderer.invoke('system-get-version'),
    getPlatform: () => ipcRenderer.invoke('system-get-platform'),
    openExternal: (url: string) => ipcRenderer.invoke('system-open-external', url),
    showNotification: (title: string, body: string) => 
      ipcRenderer.invoke('system-show-notification', title, body)
  },

  // Storage
  storage: {
    get: (key: string) => ipcRenderer.invoke('storage-get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('storage-set', key, value),
    remove: (key: string) => ipcRenderer.invoke('storage-remove', key),
    clear: () => ipcRenderer.invoke('storage-clear')
  }
});

// Type definitions for renderer
declare global {
  interface Window {
    electronAPI: {
      auth: {
        getState: () => Promise<any>;
        startAuthentication: () => Promise<void>;
        logout: () => Promise<void>;
        getAccessToken: () => Promise<string | null>;
        refreshToken: () => Promise<boolean>;
        handleTokenExchange: (token: string) => Promise<void>;
        onStateChanged: (callback: (state: any) => void) => void;
        onAuthenticated: (callback: (session: any) => void) => void;
        onLogout: (callback: () => void) => void;
      };
      system: {
        getVersion: () => Promise<string>;
        getPlatform: () => Promise<string>;
        openExternal: (url: string) => Promise<void>;
        showNotification: (title: string, body: string) => Promise<void>;
      };
      storage: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        remove: (key: string) => Promise<void>;
        clear: () => Promise<void>;
      };
    };
  }
}
```

### 3. Authentication Service

The main authentication service is already implemented in the codebase. Here's how to use it:

```typescript
// src/main/services/AuthService.ts (usage example)
import { AuthService } from './AuthService';

// Initialize service
const authService = AuthService.getInstance();

// Start authentication flow
await authService.startAuthentication();

// Handle token exchange
await authService.handleTokenExchange(exchangeToken);

// Get current state
const state = authService.getState();

// Listen for events
authService.on('authenticated', (session) => {
  console.log('User authenticated:', session.user);
});

authService.on('logout', () => {
  console.log('User logged out');
});
```

### 4. Renderer Process Integration

Create `src/renderer/contexts/ElectronAuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  profile: Record<string, any>;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

interface ElectronAuthContextType {
  authState: AuthState;
  startAuthentication: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<boolean>;
}

const ElectronAuthContext = createContext<ElectronAuthContextType | undefined>(undefined);

export const useElectronAuth = () => {
  const context = useContext(ElectronAuthContext);
  if (context === undefined) {
    throw new Error('useElectronAuth must be used within an ElectronAuthProvider');
  }
  return context;
};

interface ElectronAuthProviderProps {
  children: ReactNode;
}

export const ElectronAuthProvider: React.FC<ElectronAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  useEffect(() => {
    initializeAuth();
    setupEventListeners();
  }, []);

  const initializeAuth = async () => {
    try {
      const state = await window.electronAPI.auth.getState();
      setAuthState(state);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize authentication'
      }));
    }
  };

  const setupEventListeners = () => {
    // Listen for auth state changes
    window.electronAPI.auth.onStateChanged((state: AuthState) => {
      setAuthState(state);
    });

    // Listen for authentication success
    window.electronAPI.auth.onAuthenticated((session: any) => {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: session.user,
        error: null
      });
    });

    // Listen for logout
    window.electronAPI.auth.onLogout(() => {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    });
  };

  const startAuthentication = async () => {
    try {
      await window.electronAPI.auth.startAuthentication();
    } catch (error) {
      console.error('Authentication failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Authentication failed'
      }));
    }
  };

  const logout = async () => {
    try {
      await window.electronAPI.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getAccessToken = async () => {
    try {
      return await window.electronAPI.auth.getAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  };

  const refreshToken = async () => {
    try {
      return await window.electronAPI.auth.refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  const value: ElectronAuthContextType = {
    authState,
    startAuthentication,
    logout,
    getAccessToken,
    refreshToken
  };

  return (
    <ElectronAuthContext.Provider value={value}>
      {children}
    </ElectronAuthContext.Provider>
  );
};
```

### 5. Authentication Components

Create `src/renderer/components/AuthenticationScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { useElectronAuth } from '../contexts/ElectronAuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Smartphone, QrCode } from 'lucide-react';

export const AuthenticationScreen: React.FC = () => {
  const { authState, startAuthentication } = useElectronAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleStartAuth = async () => {
    setIsAuthenticating(true);
    try {
      await startAuthentication();
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to JobSwipe</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authState.error && (
            <Alert variant="destructive">
              <AlertDescription>{authState.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <QrCode className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Secure Authentication</h3>
                  <p className="text-sm text-blue-700">
                    We'll open your browser to complete the sign-in process
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">Multi-Device Support</h3>
                  <p className="text-sm text-green-700">
                    Access your account across all your devices
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartAuth}
            disabled={isAuthenticating}
            className="w-full"
            size="lg"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 6. Main Application Component

Create `src/renderer/components/App.tsx`:

```typescript
import React from 'react';
import { ElectronAuthProvider, useElectronAuth } from '../contexts/ElectronAuthContext';
import { AuthenticationScreen } from './AuthenticationScreen';
import { Dashboard } from './Dashboard';
import { LoadingScreen } from './LoadingScreen';

const AppContent: React.FC = () => {
  const { authState } = useElectronAuth();

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (!authState.isAuthenticated) {
    return <AuthenticationScreen />;
  }

  return <Dashboard />;
};

export const App: React.FC = () => {
  return (
    <ElectronAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppContent />
      </div>
    </ElectronAuthProvider>
  );
};
```

### 7. Dashboard Component

Create `src/renderer/components/Dashboard.tsx`:

```typescript
import React from 'react';
import { useElectronAuth } from '../contexts/ElectronAuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogOut, Settings, User, Shield } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { authState, logout } = useElectronAuth();

  const handleLogout = async () => {
    await logout();
  };

  const openSettings = () => {
    // Navigate to settings page or open settings window
    console.log('Opening settings...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">JobSwipe</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={openSettings}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>
                    {authState.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{authState.user?.name}</p>
                  <p className="text-xs text-gray-500">{authState.user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  <span className="text-xs text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Device Trust</span>
                  <span className="text-xs text-green-600">Trusted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Start Job Search
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                View Applications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Update Resume
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent job application activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Applied to Software Engineer at TechCorp</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Interview scheduled with StartupXYZ</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Resume updated</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
```

## Advanced Features

### 1. Automatic Updates

```typescript
// src/main/services/UpdateService.ts
import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

export class UpdateService {
  private mainWindow: BrowserWindow | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.initializeUpdater();
  }

  private initializeUpdater(): void {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
      this.mainWindow?.webContents.send('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
      this.mainWindow?.webContents.send('update-downloaded');
    });
  }

  async installUpdate(): Promise<void> {
    autoUpdater.quitAndInstall();
  }
}
```

### 2. Offline Support

```typescript
// src/renderer/hooks/useOfflineStatus.ts
import { useState, useEffect } from 'react';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

### 3. System Tray Integration

```typescript
// src/main/services/TrayService.ts
import { Tray, Menu, app, BrowserWindow } from 'electron';
import { join } from 'path';

export class TrayService {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.createTray();
  }

  private createTray(): void {
    const iconPath = join(__dirname, '../assets/tray-icon.png');
    this.tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          this.mainWindow?.show();
        }
      },
      {
        label: 'Job Search',
        click: () => {
          this.mainWindow?.webContents.send('start-job-search');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setToolTip('JobSwipe');
    this.tray.setContextMenu(contextMenu);

    this.tray.on('click', () => {
      this.mainWindow?.show();
    });
  }

  updateTray(text: string): void {
    this.tray?.setToolTip(text);
  }
}
```

## Build Configuration

### 1. Package.json Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "tsc && electron dist/main.js",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc",
    "dist": "npm run build && electron-builder",
    "pack": "electron-builder --dir",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "main": "dist/main.js"
}
```

### 2. Electron Builder Configuration

```json
{
  "build": {
    "appId": "com.jobswipe.desktop",
    "productName": "JobSwipe",
    "copyright": "Copyright © 2023 JobSwipe",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "assets/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.business",
      "target": {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      "icon": "assets/icon.icns"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

## Security Considerations

### 1. Content Security Policy

```typescript
// src/main/security.ts
export const setupCSP = (win: BrowserWindow) => {
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' https://api.jobswipe.io; " +
          "script-src 'self' 'unsafe-inline'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "connect-src 'self' https://api.jobswipe.io wss://api.jobswipe.io;"
        ]
      }
    });
  });
};
```

### 2. Secure Storage Validation

```typescript
// src/main/services/SecurityService.ts
import { createHash } from 'crypto';

export class SecurityService {
  static validateStoredData(data: any): boolean {
    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        return false;
      }

      // Check for required fields
      const requiredFields = ['user', 'tokens', 'sessionId'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return false;
        }
      }

      // Validate token format
      if (!data.tokens.accessToken || !data.tokens.refreshToken) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Data validation failed:', error);
      return false;
    }
  }

  static hashData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
}
```

## Testing

### 1. Main Process Tests

```typescript
// src/__tests__/main/auth.test.ts
import { AuthService } from '../../main/services/AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
  });

  it('should initialize correctly', async () => {
    await authService.initialize();
    const state = authService.getState();
    expect(state).toBeDefined();
  });

  it('should handle token exchange', async () => {
    const mockToken = 'test-exchange-token';
    // Mock the API call
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'access', refreshToken: 'refresh' }
      })
    } as any);

    await authService.handleTokenExchange(mockToken);
    expect(authService.isAuthenticated()).toBe(true);
  });
});
```

### 2. Renderer Process Tests

```typescript
// src/__tests__/renderer/auth.test.tsx
import { render, screen } from '@testing-library/react';
import { AuthenticationScreen } from '../../renderer/components/AuthenticationScreen';

// Mock electron API
const mockElectronAPI = {
  auth: {
    getState: jest.fn(),
    startAuthentication: jest.fn(),
    onStateChanged: jest.fn(),
    onAuthenticated: jest.fn(),
    onLogout: jest.fn()
  }
};

(global as any).window = {
  electronAPI: mockElectronAPI
};

describe('AuthenticationScreen', () => {
  it('renders sign in button', () => {
    render(<AuthenticationScreen />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockElectronAPI.auth.getState.mockReturnValue({
      isLoading: true
    });
    
    render(<AuthenticationScreen />);
    expect(screen.getByText('Initializing authentication...')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Deep Link Not Working**: Ensure proper protocol registration
2. **Token Storage Fails**: Check keytar installation and permissions
3. **Authentication Window Doesn't Open**: Verify URL and network connectivity
4. **App Crashes on Startup**: Check main process error logs

### Debug Configuration

```typescript
// src/shared/debug.ts
export const DEBUG = process.env.NODE_ENV === 'development';

export const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[JobSwipe Desktop] ${message}`, data);
  }
};
```

## Deployment

### 1. Code Signing

```bash
# macOS
export CSC_IDENTITY_AUTO_DISCOVERY=false
export CSC_IDENTITY="Developer ID Application: Your Name"

# Windows
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
```

### 2. Distribution

```bash
# Build for all platforms
npm run dist

# Build for specific platform
npm run dist -- --mac
npm run dist -- --win
npm run dist -- --linux
```

---

This comprehensive guide provides everything needed to integrate JobSwipe's authentication system into an Electron desktop application. For additional support, refer to the [API documentation](../api/authentication.md) or contact the development team.