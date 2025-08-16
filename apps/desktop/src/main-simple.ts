/**
 * JobSwipe Desktop Main Process (Simplified)
 * Basic Electron main process without complex automation
 */

import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { setupAllIPCHandlers } from './main/ipcHandlers-simple';

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
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload/preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Load the renderer
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: load from dev server (if available)
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      // Fallback to file if dev server not running
      mainWindow?.loadFile(path.join(__dirname, '../renderer/index.html'));
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
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
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
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
            mainWindow?.webContents.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Swipe Left (Pass)',
          accelerator: 'Left'
        },
        {
          label: 'Swipe Right (Apply)',
          accelerator: 'Right'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
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
  
  // Set up IPC handlers
  setupAllIPCHandlers();
  
  // Create main window
  createWindow();
  
  // Create application menu
  createMenu();
  
  console.log('✅ JobSwipe Desktop ready');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security handlers
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
});

console.log('🎯 JobSwipe Desktop main process initialized');