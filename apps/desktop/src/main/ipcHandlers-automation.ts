/**
 * @fileoverview IPC Handlers for JobSwipe Desktop Automation
 * @description Handles IPC communication between renderer and main process for automation
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { ipcMain, BrowserWindow } from 'electron';
import BackgroundProcessingService from '../services/BackgroundProcessingService';
import { TokenStorageService } from '../services/TokenStorageService';

// =============================================================================
// GLOBAL SERVICES
// =============================================================================

let backgroundProcessingService: BackgroundProcessingService | null = null;
let tokenStorage: TokenStorageService | null = null;

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize automation services and IPC handlers
 */
export function initializeAutomationServices(apiBaseUrl?: string): void {
  console.log('Initializing automation services...');

  try {
    // Initialize services
    tokenStorage = new TokenStorageService();
    backgroundProcessingService = new BackgroundProcessingService(apiBaseUrl);

    // Set up event forwarding to renderer
    setupEventForwarding();

    // Register IPC handlers
    registerAutomationHandlers();
    registerQueueHandlers();
    registerConfigurationHandlers();
    registerAuthenticationHandlers();

    console.log('✅ Automation services initialized successfully');

    // Auto-start background processing if user is authenticated
    tokenStorage.getToken().then(token => {
      if (token && backgroundProcessingService) {
        console.log('User token found, auto-starting background processing service...');
        backgroundProcessingService.start()
          .then(() => {
            console.log('✅ Background processing service auto-started successfully');
          })
          .catch(error => {
            console.error('❌ Failed to auto-start background processing service:', error);
          });
      } else {
        console.log('No user token found, background processing will start after login');
      }
    }).catch(error => {
      console.error('Error checking for user token:', error);
    });

  } catch (error) {
    console.error('❌ Failed to initialize automation services:', error);
  }
}

/**
 * Cleanup automation services
 */
export function cleanupAutomationServices(): void {
  console.log('Cleaning up automation services...');

  if (backgroundProcessingService) {
    backgroundProcessingService.cleanup();
    backgroundProcessingService = null;
  }

  if (tokenStorage) {
    tokenStorage = null;
  }

  // Remove all IPC handlers
  ipcMain.removeAllListeners('automation:start');
  ipcMain.removeAllListeners('automation:stop');
  ipcMain.removeAllListeners('automation:getStats');
  ipcMain.removeAllListeners('automation:getConfig');
  ipcMain.removeAllListeners('automation:updateConfig');
  ipcMain.removeAllListeners('queue:getApplications');
  ipcMain.removeAllListeners('queue:getStats');
  ipcMain.removeAllListeners('auth:getToken');
  ipcMain.removeAllListeners('auth:setToken');
  ipcMain.removeAllListeners('auth:clearToken');

  console.log('✅ Automation services cleanup completed');
}

// =============================================================================
// EVENT FORWARDING
// =============================================================================

/**
 * Set up event forwarding from services to renderer process
 */
function setupEventForwarding(): void {
  if (!backgroundProcessingService) return;

  const forwardEvent = (eventName: string, data: any) => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send(eventName, data);
    });
  };

  // Background processing events
  backgroundProcessingService.on('service-started', () => {
    forwardEvent('automation:service-started', { timestamp: new Date() });
  });

  backgroundProcessingService.on('service-stopped', () => {
    forwardEvent('automation:service-stopped', { timestamp: new Date() });
  });

  backgroundProcessingService.on('application-queued', (data) => {
    forwardEvent('automation:application-queued', data);
  });

  backgroundProcessingService.on('processing-started', (data) => {
    forwardEvent('automation:processing-started', data);
  });

  backgroundProcessingService.on('execution-progress', (data) => {
    forwardEvent('automation:execution-progress', data);
  });

  backgroundProcessingService.on('application-completed', (data) => {
    forwardEvent('automation:application-completed', data);
  });

  backgroundProcessingService.on('application-failed', (data) => {
    forwardEvent('automation:application-failed', data);
  });

  backgroundProcessingService.on('application-cancelled', (data) => {
    forwardEvent('automation:application-cancelled', data);
  });

  backgroundProcessingService.on('polling-success', (data) => {
    forwardEvent('automation:polling-success', data);
  });

  backgroundProcessingService.on('polling-failed', (error) => {
    forwardEvent('automation:polling-failed', error);
  });

  backgroundProcessingService.on('auth-error', (error) => {
    forwardEvent('automation:auth-error', error);
  });

  console.log('✅ Event forwarding set up successfully');
}

// =============================================================================
// AUTOMATION HANDLERS
// =============================================================================

/**
 * Register automation control IPC handlers
 */
function registerAutomationHandlers(): void {
  // Start automation service
  ipcMain.handle('automation:start', async () => {
    try {
      if (!backgroundProcessingService) {
        throw new Error('Background processing service not initialized');
      }

      await backgroundProcessingService.start();

      return {
        success: true,
        message: 'Automation service started successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Failed to start automation service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  });

  // Stop automation service
  ipcMain.handle('automation:stop', async () => {
    try {
      if (!backgroundProcessingService) {
        throw new Error('Background processing service not initialized');
      }

      await backgroundProcessingService.stop();

      return {
        success: true,
        message: 'Automation service stopped successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Failed to stop automation service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  });

  // Get automation statistics
  ipcMain.handle('automation:getStats', () => {
    try {
      if (!backgroundProcessingService) {
        return {
          success: false,
          error: 'Background processing service not initialized',
        };
      }

      const stats = backgroundProcessingService.getStats();
      const activeExecutions = backgroundProcessingService.getActiveExecutions();

      return {
        success: true,
        data: {
          stats,
          activeExecutions,
          isActive: backgroundProcessingService.isActive(),
          timestamp: new Date(),
        },
      };

    } catch (error) {
      console.error('Failed to get automation stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Get automation configuration
  ipcMain.handle('automation:getConfig', () => {
    try {
      if (!backgroundProcessingService) {
        return {
          success: false,
          error: 'Background processing service not initialized',
        };
      }

      const config = backgroundProcessingService.getConfig();

      return {
        success: true,
        data: config,
      };

    } catch (error) {
      console.error('Failed to get automation config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Update automation configuration
  ipcMain.handle('automation:updateConfig', (_, newConfig) => {
    try {
      if (!backgroundProcessingService) {
        return {
          success: false,
          error: 'Background processing service not initialized',
        };
      }

      backgroundProcessingService.updateConfig(newConfig);

      return {
        success: true,
        message: 'Configuration updated successfully',
        data: backgroundProcessingService.getConfig(),
      };

    } catch (error) {
      console.error('Failed to update automation config:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  console.log('✅ Automation handlers registered');
}

// =============================================================================
// QUEUE HANDLERS
// =============================================================================

/**
 * Register queue management IPC handlers
 */
function registerQueueHandlers(): void {
  // Get queue applications (for display in UI)
  ipcMain.handle('queue:getApplications', async (_, filters = {}) => {
    try {
      // This would fetch applications from the server
      // For now, return mock data
      return {
        success: true,
        data: {
          applications: [],
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        },
      };

    } catch (error) {
      console.error('Failed to get queue applications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Get queue statistics
  ipcMain.handle('queue:getStats', () => {
    try {
      if (!backgroundProcessingService) {
        return {
          success: false,
          error: 'Background processing service not initialized',
        };
      }

      const stats = backgroundProcessingService.getStats();

      return {
        success: true,
        data: stats,
      };

    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  console.log('✅ Queue handlers registered');
}

// =============================================================================
// CONFIGURATION HANDLERS
// =============================================================================

/**
 * Register configuration management IPC handlers
 */
function registerConfigurationHandlers(): void {
  // Get application settings
  ipcMain.handle('config:getSettings', () => {
    try {
      // Return default settings - this would integrate with electron-store
      return {
        success: true,
        data: {
          apiBaseUrl: 'http://localhost:3001',
          autoStart: true,
          notifications: true,
          maxConcurrentExecutions: 3,
          retryFailedApplications: true,
          maxRetries: 3,
          theme: 'system',
        },
      };

    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Update application settings
  ipcMain.handle('config:updateSettings', (_, settings) => {
    try {
      console.log('Updating settings:', settings);

      // Update automation config if provided
      if (backgroundProcessingService && settings.automation) {
        backgroundProcessingService.updateConfig(settings.automation);
      }

      // This would save to electron-store
      return {
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      };

    } catch (error) {
      console.error('Failed to update settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  console.log('✅ Configuration handlers registered');
}

// =============================================================================
// AUTHENTICATION HANDLERS
// =============================================================================

/**
 * Register authentication IPC handlers
 */
function registerAuthenticationHandlers(): void {
  // Get stored authentication token
  ipcMain.handle('auth:getToken', async () => {
    try {
      if (!tokenStorage) {
        return {
          success: false,
          error: 'Token storage not initialized',
        };
      }

      const token = await tokenStorage.getToken();

      return {
        success: true,
        data: {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
        },
      };

    } catch (error) {
      console.error('Failed to get token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Store authentication token
  ipcMain.handle('auth:setToken', async (_, token: string) => {
    try {
      if (!tokenStorage) {
        return {
          success: false,
          error: 'Token storage not initialized',
        };
      }

      await tokenStorage.storeToken(token);

      return {
        success: true,
        message: 'Token stored successfully',
      };

    } catch (error) {
      console.error('Failed to store token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Clear authentication token
  ipcMain.handle('auth:clearToken', async () => {
    try {
      if (!tokenStorage) {
        return {
          success: false,
          error: 'Token storage not initialized',
        };
      }

      await tokenStorage.clearToken();

      return {
        success: true,
        message: 'Token cleared successfully',
      };

    } catch (error) {
      console.error('Failed to clear token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Test authentication with server
  ipcMain.handle('auth:testConnection', async () => {
    try {
      // This would test the connection to the server
      // For now, return success if we have a token
      if (!tokenStorage) {
        return {
          success: false,
          error: 'Token storage not initialized',
        };
      }

      const token = await tokenStorage.getToken();

      return {
        success: !!token,
        message: token ? 'Authentication token found' : 'No authentication token',
        data: {
          hasToken: !!token,
          serverReachable: true, // Would be determined by actual server ping
        },
      };

    } catch (error) {
      console.error('Failed to test connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  console.log('✅ Authentication handlers registered');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the background processing service instance
 */
export function getBackgroundProcessingService(): BackgroundProcessingService | null {
  return backgroundProcessingService;
}

/**
 * Get the token storage service instance
 */
export function getTokenStorageService(): TokenStorageService | null {
  return tokenStorage;
}

/**
 * Check if automation services are initialized
 */
export function areServicesInitialized(): boolean {
  return !!(backgroundProcessingService && tokenStorage);
}

export default {
  initializeAutomationServices,
  cleanupAutomationServices,
  getBackgroundProcessingService,
  getTokenStorageService,
  areServicesInitialized,
};