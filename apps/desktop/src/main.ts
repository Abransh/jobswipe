import { app, BrowserWindow, Menu, shell, ipcMain, dialog, systemPreferences } from 'electron';
import { autoUpdater } from 'electron-updater';
import windowStateKeeper from 'electron-window-state';
import Store from 'electron-store';
import isDev from 'electron-is-dev';
import path from 'path';
import { AuthService } from './services/AuthService';
import { QueueService } from './services/QueueService';
import { MonitoringService } from './services/MonitoringService';

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
  private authService: AuthService;
  private queueService: QueueService;
  private monitoringService: MonitoringService;

  constructor() {
    this.authService = AuthService.getInstance();
    this.queueService = new QueueService();
    this.monitoringService = new MonitoringService();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Set app user model ID for Windows
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.jobswipe.desktop');
    }

    // Handle app events
    app.whenReady().then(async () => {
      await this.authService.initialize();
      await this.initializeMonitoringService();
      await this.initializeQueueService();
      this.createMainWindow();
      this.setupApplicationMenu();
      this.setupAutoUpdater();
      this.setupIpcHandlers();
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

    app.on('before-quit', async () => {
      this.isQuitting = true;
      await this.authService.cleanup();
      await this.queueService.cleanup();
      await this.monitoringService.shutdown();
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (_, contents) => {
      contents.on('new-window', (navigationEvent, navigationUrl) => {
        navigationEvent.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });
  }

  private async createMainWindow(): Promise<void> {
    // Manage window state
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800,
    });

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      icon: path.join(__dirname, '../assets/icon.png'),
    });

    // Let windowStateKeeper manage the window
    mainWindowState.manage(this.mainWindow);

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/out/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      // Focus window on creation
      if (isDev) {
        this.mainWindow?.webContents.focus();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle close event (hide to tray instead of quit)
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    // Security: Prevent navigation to external URLs
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });
  }

  private setupApplicationMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'JobSwipe',
        submenu: [
          {
            label: 'About JobSwipe',
            role: 'about',
          },
          { type: 'separator' },
          {
            label: 'Services',
            role: 'services',
            submenu: [],
          },
          { type: 'separator' },
          {
            label: 'Hide JobSwipe',
            accelerator: 'Command+H',
            role: 'hide',
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            role: 'hideOthers',
          },
          {
            label: 'Show All',
            role: 'unhide',
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            },
          },
        ],
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'New Application',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu-new-application');
            },
          },
          { type: 'separator' },
          {
            label: 'Import Resume',
            accelerator: 'CmdOrCtrl+I',
            click: () => this.handleImportResume(),
          },
          {
            label: 'Export Data',
            accelerator: 'CmdOrCtrl+E',
            click: () => this.handleExportData(),
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow?.webContents.send('menu-preferences');
            },
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
          { role: 'selectall' },
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
          { type: 'separator' },
          { role: 'front' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              this.showAboutDialog();
            },
          },
          {
            label: 'Learn More',
            click: () => {
              shell.openExternal('https://jobswipe.io');
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupAutoUpdater(): void {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
      
      autoUpdater.on('update-available', () => {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'Update Available',
          message: 'A new version is available. It will be downloaded in the background.',
          buttons: ['OK'],
        });
      });

      autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'Update Ready',
          message: 'Update downloaded. The application will restart to apply the update.',
          buttons: ['Restart Now', 'Later'],
        }).then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
      });
    }
  }

  private async initializeMonitoringService(): Promise<void> {
    try {
      // Setup monitoring service event listeners
      this.monitoringService.on('error-tracked', (error) => {
        console.log('🚨 Error tracked:', error.message);
        this.mainWindow?.webContents.send('error-tracked', error);
      });

      this.monitoringService.on('alert', (alert) => {
        console.log('⚠️ Alert triggered:', alert.message);
        this.mainWindow?.webContents.send('monitoring-alert', alert);
      });

      this.monitoringService.on('health-check', (health) => {
        this.mainWindow?.webContents.send('health-check', health);
      });

      this.monitoringService.on('system-metrics', (metrics) => {
        this.mainWindow?.webContents.send('system-metrics', metrics);
      });

      this.monitoringService.on('application-metrics', (metrics) => {
        this.mainWindow?.webContents.send('application-metrics', metrics);
      });

      this.monitoringService.on('performance-metric', (metric) => {
        this.mainWindow?.webContents.send('performance-metric', metric);
      });

      // Initialize monitoring
      await this.monitoringService.initialize();
      
      console.log('✅ Monitoring service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize monitoring service:', error);
    }
  }

  private async initializeQueueService(): Promise<void> {
    try {
      // Setup queue service event listeners
      this.queueService.on('connected', () => {
        console.log('✅ Queue service connected');
        this.mainWindow?.webContents.send('queue-status-changed', { connected: true });
      });

      this.queueService.on('disconnected', (reason) => {
        console.log('❌ Queue service disconnected:', reason);
        this.mainWindow?.webContents.send('queue-status-changed', { connected: false, reason });
      });

      this.queueService.on('job-claimed', (data) => {
        console.log('🎯 Job claimed:', data);
        this.mainWindow?.webContents.send('job-claimed', data);
      });

      this.queueService.on('job-processed', (data) => {
        console.log('✅ Job processed:', data);
        this.mainWindow?.webContents.send('job-processed', data);
      });

      this.queueService.on('job-error', (data) => {
        console.error('❌ Job processing error:', data);
        this.mainWindow?.webContents.send('job-error', data);
      });

      this.queueService.on('error', (error) => {
        console.error('❌ Queue service error:', error);
        this.mainWindow?.webContents.send('queue-error', error);
      });

      // Browser automation event listeners
      this.queueService.on('browser-automation-started', (data) => {
        this.mainWindow?.webContents.send('browser-automation-started', data);
      });

      this.queueService.on('browser-automation-completed', (data) => {
        this.mainWindow?.webContents.send('browser-automation-completed', data);
      });

      this.queueService.on('browser-automation-failed', (data) => {
        this.mainWindow?.webContents.send('browser-automation-failed', data);
      });

      this.queueService.on('automation-step-completed', (data) => {
        this.mainWindow?.webContents.send('automation-step-completed', data);
      });

      this.queueService.on('automation-step-failed', (data) => {
        this.mainWindow?.webContents.send('automation-step-failed', data);
      });

      this.queueService.on('automation-output', (data) => {
        this.mainWindow?.webContents.send('automation-output', data);
      });

      this.queueService.on('job-stopped', (data) => {
        this.mainWindow?.webContents.send('job-stopped', data);
      });

      this.queueService.on('browser-config-updated', (data) => {
        this.mainWindow?.webContents.send('browser-config-updated', data);
      });

      // Integrate queue service with monitoring
      this.queueService.on('job-claimed', (data) => {
        this.monitoringService.incrementCounter('totalJobs');
        this.monitoringService.trackError('queue', 'info', 'Job claimed', `Job ${data.jobId} claimed`);
      });

      this.queueService.on('job-processed', (data) => {
        this.monitoringService.incrementCounter('completedJobs');
      });

      this.queueService.on('job-error', (data) => {
        this.monitoringService.incrementCounter('failedJobs');
        this.monitoringService.trackError('queue', 'error', 'Job processing failed', data.error?.message || 'Unknown error', undefined, { jobId: data.jobId });
      });

      this.queueService.on('error', (error) => {
        this.monitoringService.trackError('queue', 'error', 'Queue service error', error.message || String(error));
      });

      this.queueService.on('browser-automation-started', (data) => {
        this.monitoringService.incrementCounter('automationExecutions');
      });

      this.queueService.on('browser-automation-failed', (data) => {
        this.monitoringService.trackError('automation', 'error', 'Browser automation failed', data.error || 'Unknown error', undefined, { jobId: data.jobId });
      });

      // Initialize if user is authenticated
      if (this.authService.isAuthenticated()) {
        await this.queueService.initialize();
      } else {
        console.log('⏳ Waiting for authentication before initializing queue service');
      }
    } catch (error) {
      console.error('❌ Failed to initialize queue service:', error);
    }
  }

  private setupIpcHandlers(): void {
    // Handle app info requests
    ipcMain.handle('get-app-info', () => {
      return {
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
      };
    });

    // Queue service handlers
    ipcMain.handle('queue-get-stats', async () => {
      try {
        return await this.queueService.getQueueStats();
      } catch (error) {
        console.error('Failed to get queue stats:', error);
        return null;
      }
    });

    ipcMain.handle('queue-get-available-jobs', async () => {
      try {
        return await this.queueService.getAvailableJobs();
      } catch (error) {
        console.error('Failed to get available jobs:', error);
        return [];
      }
    });

    ipcMain.handle('queue-start-processing', async () => {
      try {
        this.queueService.startPolling();
        return { success: true };
      } catch (error) {
        console.error('Failed to start queue processing:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('queue-stop-processing', async () => {
      try {
        this.queueService.stopPolling();
        return { success: true };
      } catch (error) {
        console.error('Failed to stop queue processing:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('queue-get-processing-jobs', () => {
      return this.queueService.getProcessingJobs();
    });

    ipcMain.handle('queue-get-settings', () => {
      return this.queueService.getSettings();
    });

    ipcMain.handle('queue-update-settings', (_, settings) => {
      try {
        this.queueService.updateSettings(settings);
        return { success: true };
      } catch (error) {
        console.error('Failed to update queue settings:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('queue-reconnect', async () => {
      try {
        await this.queueService.disconnect();
        await this.queueService.initialize();
        return { success: true };
      } catch (error) {
        console.error('Failed to reconnect queue service:', error);
        return { success: false, error: error.message };
      }
    });

    // Browser automation handlers
    ipcMain.handle('queue-stop-job-automation', async (_, jobId: string) => {
      try {
        const stopped = await this.queueService.stopJobAutomation(jobId);
        return { success: stopped, error: stopped ? undefined : 'Failed to stop automation' };
      } catch (error) {
        console.error('Failed to stop job automation:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('queue-get-browser-config', () => {
      try {
        return this.queueService.getBrowserAutomationConfig();
      } catch (error) {
        console.error('Failed to get browser config:', error);
        return null;
      }
    });

    ipcMain.handle('queue-update-browser-config', (_, config) => {
      try {
        this.queueService.updateBrowserAutomationConfig(config);
        return { success: true };
      } catch (error) {
        console.error('Failed to update browser config:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('queue-get-automation-logs', () => {
      try {
        return this.queueService.getJobAutomationLogs();
      } catch (error) {
        console.error('Failed to get automation logs:', error);
        return {};
      }
    });

    ipcMain.handle('queue-get-running-automations-count', () => {
      try {
        return this.queueService.getRunningAutomationsCount();
      } catch (error) {
        console.error('Failed to get running automations count:', error);
        return 0;
      }
    });

    // Monitoring service handlers
    ipcMain.handle('monitoring-get-summary', () => {
      try {
        return this.monitoringService.getMetricsSummary();
      } catch (error) {
        console.error('Failed to get monitoring summary:', error);
        return null;
      }
    });

    ipcMain.handle('monitoring-get-errors', (_, limit?: number) => {
      try {
        return this.monitoringService.getErrorHistory(limit);
      } catch (error) {
        console.error('Failed to get error history:', error);
        return [];
      }
    });

    ipcMain.handle('monitoring-get-performance', (_, category?: string, limit?: number) => {
      try {
        return this.monitoringService.getPerformanceMetrics(category, limit);
      } catch (error) {
        console.error('Failed to get performance metrics:', error);
        return [];
      }
    });

    ipcMain.handle('monitoring-resolve-error', (_, errorId: string) => {
      try {
        const resolved = this.monitoringService.resolveError(errorId);
        return { success: resolved, error: resolved ? undefined : 'Error not found' };
      } catch (error) {
        console.error('Failed to resolve error:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('monitoring-get-config', () => {
      try {
        return this.monitoringService.getConfig();
      } catch (error) {
        console.error('Failed to get monitoring config:', error);
        return null;
      }
    });

    ipcMain.handle('monitoring-update-config', (_, config) => {
      try {
        this.monitoringService.updateConfig(config);
        return { success: true };
      } catch (error) {
        console.error('Failed to update monitoring config:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('monitoring-start-performance-tracking', (_, name: string, category?: string) => {
      try {
        const trackingId = this.monitoringService.startPerformanceTracking(name, category);
        return { success: true, trackingId };
      } catch (error) {
        console.error('Failed to start performance tracking:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('monitoring-end-performance-tracking', (_, trackingId: string, metadata?: Record<string, any>) => {
      try {
        this.monitoringService.endPerformanceTracking(trackingId, metadata);
        return { success: true };
      } catch (error) {
        console.error('Failed to end performance tracking:', error);
        return { success: false, error: error.message };
      }
    });

    // Handle store operations
    ipcMain.handle('store-get', (_, key: string) => {
      return store.get(key);
    });

    ipcMain.handle('store-set', (_, key: string, value: any) => {
      store.set(key, value);
    });

    ipcMain.handle('store-delete', (_, key: string) => {
      store.delete(key);
    });

    // Handle file operations
    ipcMain.handle('show-save-dialog', async (_, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    ipcMain.handle('show-open-dialog', async (_, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow!, options);
      return result;
    });

    // Handle system operations
    ipcMain.handle('get-system-preferences', () => {
      return {
        theme: systemPreferences.getEffectiveAppearance?.() || 'light',
      };
    });
  }

  private async handleImportResume(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: 'Import Resume',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'Word Documents', extensions: ['doc', 'docx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.mainWindow?.webContents.send('import-resume', result.filePaths[0]);
    }
  }

  private async handleExportData(): Promise<void> {
    const result = await dialog.showSaveDialog(this.mainWindow!, {
      title: 'Export Data',
      defaultPath: 'jobswipe-data.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (!result.canceled && result.filePath) {
      this.mainWindow?.webContents.send('export-data', result.filePath);
    }
  }

  private showAboutDialog(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: 'About JobSwipe',
      message: 'JobSwipe Desktop',
      detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
      buttons: ['OK'],
    });
  }
}

// Initialize the application
new JobSwipeApp();