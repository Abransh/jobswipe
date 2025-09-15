import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import windowStateKeeper from 'electron-window-state';
import Store from 'electron-store';
import isDev from 'electron-is-dev';
import path from 'path';

// Initialize electron store for persistent data
const store = new Store({
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    userPreferences: {
      theme: 'system',
      notifications: true,
      autoStart: false,
    },
  },
});

class JobSwipeApp {
  private mainWindow: BrowserWindow | null = null;
  private isQuitting = false;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Set app user model ID for Windows
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.jobswipe.desktop');
    }

    // Handle app events
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupApplicationMenu();
      this.setupIPC();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
      this.cleanupServices();
    });
  }

  private createMainWindow(): void {
    // Load window state
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800,
    });

    // Create the main window
    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      show: false,
      icon: isDev ? undefined : path.join(__dirname, '../assets/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    // Let windowStateKeeper manage the window
    mainWindowState.manage(this.mainWindow);

    // Load the app
    if (isDev) {
      // Try to load Next.js development server
      this.loadDevelopmentRenderer().catch(() => {
        console.log('Next.js development server not available, loading fallback');
        if (this.mainWindow) {
          this.mainWindow.loadFile(path.join(__dirname, '../renderer/.next/server/pages/index.html'));
        }
      });
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/out/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        
        if (isDev) {
          this.mainWindow.webContents.openDevTools();
        }
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Prevent new window creation
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  private async loadDevelopmentRenderer(): Promise<void> {
    const nextUrl = 'http://localhost:3000'; // Updated to match running Next.js server
    const maxRetries = 30; // 30 seconds timeout
    let retries = 0;

    while (retries < maxRetries) {
      try {
        await this.mainWindow!.loadURL(nextUrl);
        console.log('✅ Connected to Next.js development server');
        return;
      } catch (error) {
        retries++;
        if (retries === 1) {
          console.log('⏳ Waiting for Next.js development server to start...');
        }
        
        if (retries >= maxRetries) {
          throw new Error('Next.js development server timeout');
        }
        
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private setupApplicationMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Preferences',
            accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
            click: () => {
              this.showPreferences();
            },
          },
          { type: 'separator' },
          {
            role: process.platform === 'darwin' ? 'close' : 'quit',
          },
        ],
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
        ],
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
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About JobSwipe',
            click: () => {
              this.showAbout();
            },
          },
        ],
      },
    ];

    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIPC(): void {
    // Handle store operations
    ipcMain.handle('store-get', (_, key: string) => {
      return store.get(key);
    });

    ipcMain.handle('store-set', (_, key: string, value: any) => {
      store.set(key as any, value);
    });

    ipcMain.handle('store-delete', (_, key: string) => {
      store.delete(key as any);
    });

    // Handle system info requests
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        version: process.version,
        appVersion: app.getVersion(),
      };
    });

    // Handle file dialogs
    ipcMain.handle('show-open-dialog', async (_, options) => {
      if (this.mainWindow) {
        return await dialog.showOpenDialog(this.mainWindow, options);
      }
      return { canceled: true };
    });

    ipcMain.handle('show-save-dialog', async (_, options) => {
      if (this.mainWindow) {
        return await dialog.showSaveDialog(this.mainWindow, options);
      }
      return { canceled: true };
    });

    // Setup JobSwipe IPC handlers
    this.setupJobSwipeIPC();
  }

  private setupJobSwipeIPC(): void {
    // Import and setup automation IPC handlers
    try {
      const { initializeAutomationServices } = require('./main/ipcHandlers-automation');
      const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

      initializeAutomationServices(apiBaseUrl);
      console.log('✅ JobSwipe automation services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to load JobSwipe automation services:', error);
      // Try to load simplified handlers as fallback
      try {
        require('./main/ipcHandlers-simple');
        console.log('✅ Fallback to simplified IPC handlers');
      } catch (fallbackError) {
        console.error('❌ Failed to load fallback handlers:', fallbackError);
        this.setupFallbackIPC();
      }
    }
  }

  private setupFallbackIPC(): void {
    // Fallback IPC handlers if simplified handlers fail to load
    ipcMain.handle('jobs:getJobs', async () => {
      console.log('Using fallback job handler');
      return [];
    });

    ipcMain.handle('jobs:apply', async (_, jobId: string) => {
      console.log('Using fallback apply handler for job:', jobId);
      return { success: false, message: 'Job application system not available' };
    });

    ipcMain.handle('auth:login', async () => {
      return { success: false, message: 'Authentication system not available' };
    });
  }

  private showPreferences(): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('show-preferences');
    }
  }

  private showAbout(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About JobSwipe',
      message: 'JobSwipe Desktop',
      detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
      buttons: ['OK'],
    });
  }

  private cleanupServices(): void {
    // Cleanup automation services
    try {
      const { cleanupAutomationServices } = require('./main/ipcHandlers-automation');
      cleanupAutomationServices();
      console.log('✅ Automation services cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup automation services:', error);
    }
  }
}

// Initialize the app
new JobSwipeApp();