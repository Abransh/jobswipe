/**
 * JobSwipe Desktop Main Process
 * Electron main process with enterprise automation integration
 */

import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { initializeAutomationServices, cleanupAutomationServices } from './main/ipcHandlers-automation';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    icon: path.join(__dirname, '../assets/icon.png'), // Add app icon
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload/preload.js'), // Updated preload path
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  // Load the renderer
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: load from dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Focus window on creation
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external websites
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
    }
  });
}

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'JobSwipe',
      submenu: [
        {
          label: 'About JobSwipe',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Open preferences window
            console.log('Open preferences');
          }
        },
        { type: 'separator' },
        {
          label: 'Hide JobSwipe',
          accelerator: 'CmdOrCtrl+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Shift+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Jobs',
      submenu: [
        {
          label: 'Refresh Jobs',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.send('jobs:refresh');
          }
        },
        {
          label: 'View Applications',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow?.webContents.send('applications:view');
          }
        },
        { type: 'separator' },
        {
          label: 'Swipe Left (Pass)',
          accelerator: 'Left',
          click: () => {
            mainWindow?.webContents.send('job:swipe-left');
          }
        },
        {
          label: 'Swipe Right (Apply)',
          accelerator: 'Right',
          click: () => {
            mainWindow?.webContents.send('job:swipe-right');
          }
        },
        {
          label: 'Expand Details',
          accelerator: 'Up',
          click: () => {
            mainWindow?.webContents.send('job:expand');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+F5',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom'
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn'
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut'
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'JobSwipe Help',
          click: () => {
            require('electron').shell.openExternal('https://jobswipe.com/help');
          }
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => {
            // Show keyboard shortcuts modal
            mainWindow?.webContents.send('help:shortcuts');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            require('electron').shell.openExternal('https://github.com/jobswipe/desktop/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  console.log('🚀 JobSwipe Desktop starting...');

  // Get API base URL from environment or use default
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

  // Initialize automation services with BackgroundProcessingService
  console.log('Initializing automation services with API base URL:', apiBaseUrl);
  initializeAutomationServices(apiBaseUrl);

  // Create main window
  createWindow();

  // Create application menu
  createMenu();

  console.log('✅ JobSwipe Desktop ready with queue-based automation');
});

app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('Cleaning up automation services before quit...');
  cleanupAutomationServices();
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    require('electron').shell.openExternal(url);
  });
});

// Handle protocol for deep links (optional)
app.setAsDefaultProtocolClient('jobswipe');

// Handle deep link on Windows/Linux
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, focus our window instead
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

// Handle app crashes gracefully
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Could send error report here
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Could send error report here
});

console.log('🎯 JobSwipe Desktop main process initialized');