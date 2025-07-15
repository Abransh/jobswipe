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

  // Event listeners
  on: (channel: string, callback: (data: any) => void) => {
    const validChannels = [
      'menu-new-application',
      'menu-preferences',
      'import-resume',
      'export-data',
      'system-theme-changed',
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