/**
 * Electron Preload Script
 * Safely exposes IPC APIs to renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { JobData } from '../renderer/types/job';

// Define the API interface
export interface ElectronAPI {
  // Job management
  getJobs: () => Promise<JobData[]>;
  applyToJob: (jobId: string, jobData: JobData) => Promise<{
    success: boolean;
    queueId?: string;
    error?: string;
    message?: string;
  }>;
  
  // Application management
  getApplications: () => Promise<any[]>;
  getApplicationStatus: (queueId: string) => Promise<any>;
  
  // System APIs
  getSystemInfo: () => Promise<{
    platform: string;
    version: string;
    electronVersion: string;
    chromeVersion: string;
    nodeVersion: string;
    automationEnabled: boolean;
  }>;
  openJobInBrowser: (url: string) => Promise<{ success: boolean; error?: string }>;
  openDevTools: () => Promise<{ success: boolean; error?: string }>;
  
  // UI actions
  openApplicationsView: () => Promise<{ success: boolean; error?: string }>;
  
  // Event listeners
  onApplicationCompleted: (callback: (data: { queueId: string; result: any }) => void) => void;
  onApplicationFailed: (callback: (data: { queueId: string; error: string }) => void) => void;
  removeAllListeners: () => void;
}

// Create the API object
const electronAPI: ElectronAPI = {
  // Job management
  getJobs: () => ipcRenderer.invoke('jobs:get'),
  applyToJob: (jobId: string, jobData: JobData) => 
    ipcRenderer.invoke('jobs:apply', jobId, jobData),
  
  // Application management
  getApplications: () => ipcRenderer.invoke('applications:list'),
  getApplicationStatus: (queueId: string) => 
    ipcRenderer.invoke('applications:status', queueId),
  
  // System APIs
  getSystemInfo: () => ipcRenderer.invoke('system:info'),
  openJobInBrowser: (url: string) => ipcRenderer.invoke('system:openUrl', url),
  openDevTools: () => ipcRenderer.invoke('system:devtools'),
  
  // UI actions
  openApplicationsView: () => ipcRenderer.invoke('ui:applications'),
  
  // Event listeners
  onApplicationCompleted: (callback) => {
    ipcRenderer.on('application:completed', (event, data) => callback(data));
  },
  onApplicationFailed: (callback) => {
    ipcRenderer.on('application:failed', (event, data) => callback(data));
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('application:completed');
    ipcRenderer.removeAllListeners('application:failed');
  }
};

// Expose the API to the renderer process
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Failed to expose electronAPI:', error);
  }
} else {
  // Fallback for non-context-isolated environments
  (window as any).electronAPI = electronAPI;
}

// Type declaration for renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}