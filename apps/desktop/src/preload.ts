import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
export interface ElectronAPI {
  // App info
  getAppInfo: () => Promise<{
    name: string;
    version: string;
    platform: string;
    arch: string;
  }>;

  // Store operations
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  // File operations
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;

  // System operations
  getSystemPreferences: () => Promise<{
    theme: string;
  }>;

  // Queue operations
  queue: {
    getStats: () => Promise<any>;
    getAvailableJobs: () => Promise<any[]>;
    startProcessing: () => Promise<{ success: boolean; error?: string }>;
    stopProcessing: () => Promise<{ success: boolean; error?: string }>;
    getProcessingJobs: () => Promise<any[]>;
    getSettings: () => Promise<any>;
    updateSettings: (settings: any) => Promise<{ success: boolean; error?: string }>;
    reconnect: () => Promise<{ success: boolean; error?: string }>;
    stopJobAutomation: (jobId: string) => Promise<{ success: boolean; error?: string }>;
    getBrowserConfig: () => Promise<any>;
    updateBrowserConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
    getAutomationLogs: () => Promise<Record<string, any>>;
    getRunningAutomationsCount: () => Promise<number>;
  };

  // Monitoring operations
  monitoring: {
    getSummary: () => Promise<any>;
    getErrors: (limit?: number) => Promise<any[]>;
    getPerformanceMetrics: (category?: string, limit?: number) => Promise<any[]>;
    resolveError: (errorId: string) => Promise<{ success: boolean; error?: string }>;
    getConfig: () => Promise<any>;
    updateConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
    startPerformanceTracking: (name: string, category?: string) => Promise<{ success: boolean; trackingId?: string; error?: string }>;
    endPerformanceTracking: (trackingId: string, metadata?: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  };

  // Event listeners
  on: (channel: string, callback: (data: any) => void) => void;
  off: (channel: string, callback: (data: any) => void) => void;

  // Menu actions
  onMenuAction: (callback: (action: string, data?: any) => void) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Store operations
  store: {
    get: (key: string) => ipcRenderer.invoke('store-get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store-set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store-delete', key),
  },

  // File operations
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),

  // System operations
  getSystemPreferences: () => ipcRenderer.invoke('get-system-preferences'),

  // Monitoring operations
  monitoring: {
    getSummary: () => ipcRenderer.invoke('monitoring-get-summary'),
    getErrors: (limit?: number) => ipcRenderer.invoke('monitoring-get-errors', limit),
    getPerformanceMetrics: (category?: string, limit?: number) => ipcRenderer.invoke('monitoring-get-performance', category, limit),
    resolveError: (errorId: string) => ipcRenderer.invoke('monitoring-resolve-error', errorId),
    getConfig: () => ipcRenderer.invoke('monitoring-get-config'),
    updateConfig: (config: any) => ipcRenderer.invoke('monitoring-update-config', config),
    startPerformanceTracking: (name: string, category?: string) => ipcRenderer.invoke('monitoring-start-performance-tracking', name, category),
    endPerformanceTracking: (trackingId: string, metadata?: Record<string, any>) => ipcRenderer.invoke('monitoring-end-performance-tracking', trackingId, metadata),
  },

  // Queue operations
  queue: {
    getStats: () => ipcRenderer.invoke('queue-get-stats'),
    getAvailableJobs: () => ipcRenderer.invoke('queue-get-available-jobs'),
    startProcessing: () => ipcRenderer.invoke('queue-start-processing'),
    stopProcessing: () => ipcRenderer.invoke('queue-stop-processing'),
    getProcessingJobs: () => ipcRenderer.invoke('queue-get-processing-jobs'),
    getSettings: () => ipcRenderer.invoke('queue-get-settings'),
    updateSettings: (settings: any) => ipcRenderer.invoke('queue-update-settings', settings),
    reconnect: () => ipcRenderer.invoke('queue-reconnect'),
    stopJobAutomation: (jobId: string) => ipcRenderer.invoke('queue-stop-job-automation', jobId),
    getBrowserConfig: () => ipcRenderer.invoke('queue-get-browser-config'),
    updateBrowserConfig: (config: any) => ipcRenderer.invoke('queue-update-browser-config', config),
    getAutomationLogs: () => ipcRenderer.invoke('queue-get-automation-logs'),
    getRunningAutomationsCount: () => ipcRenderer.invoke('queue-get-running-automations-count'),
  },

  // Event listeners
  on: (channel: string, callback: (data: any) => void) => {
    const validChannels = [
      'menu-new-application',
      'menu-preferences',
      'import-resume',
      'export-data',
      'system-theme-changed',
      'queue-status-changed',
      'job-claimed',
      'job-processed',
      'job-error',
      'queue-error',
      'browser-automation-started',
      'browser-automation-completed',
      'browser-automation-failed',
      'automation-step-completed',
      'automation-step-failed',
      'automation-output',
      'job-stopped',
      'browser-config-updated',
      'error-tracked',
      'monitoring-alert',
      'health-check',
      'system-metrics',
      'application-metrics',
      'performance-metric',
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, data) => callback(data));
    }
  },

  off: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // Menu actions helper
  onMenuAction: (callback: (action: string, data?: any) => void) => {
    const menuChannels = [
      'menu-new-application',
      'menu-preferences',
      'import-resume',
      'export-data',
    ];

    menuChannels.forEach(channel => {
      ipcRenderer.on(channel, (_, data) => {
        callback(channel.replace('menu-', ''), data);
      });
    });
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}