/**
 * Electron Context Provider
 * Provides Electron-specific APIs and services to React components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { JobData } from '../../types/job';

interface ElectronAPI {
  // Job management
  getJobs: () => Promise<JobData[]>;
  applyToJob: (jobId: string, jobData: JobData) => Promise<{ success: boolean; queueId?: string; error?: string }>;
  
  // Application management
  getApplications: () => Promise<any[]>;
  getApplicationStatus: (queueId: string) => Promise<any>;
  
  // UI actions
  openApplicationsView: () => void;
  openJobInBrowser: (url: string) => void;
  
  // System
  getSystemInfo: () => Promise<any>;
  openDevTools: () => void;
}

interface ElectronContextType {
  api: ElectronAPI | null;
  isElectron: boolean;
  systemInfo: any;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const ElectronContext = createContext<ElectronContextType>({
  api: null,
  isElectron: false,
  systemInfo: null
});

export function useElectron() {
  const context = useContext(ElectronContext);
  if (!context) {
    throw new Error('useElectron must be used within ElectronContextProvider');
  }
  return context;
}

interface ElectronContextProviderProps {
  children: React.ReactNode;
}

export function ElectronContextProvider({ children }: ElectronContextProviderProps) {
  const [api, setApi] = useState<ElectronAPI | null>(null);
  const [isElectron, setIsElectron] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    // Check if we're running in Electron
    const electronAPI = window.electronAPI;
    
    if (electronAPI) {
      setApi(electronAPI);
      setIsElectron(true);
      
      // Load system info
      electronAPI.getSystemInfo?.().then((info) => {
        setSystemInfo(info);
      }).catch((err) => {
        console.warn('Failed to load system info:', err);
      });
    } else {
      // Provide mock API for development
      const mockAPI: ElectronAPI = {
        getJobs: async () => [],
        applyToJob: async (jobId) => ({ 
          success: true, 
          queueId: `mock-${jobId}-${Date.now()}` 
        }),
        getApplications: async () => [],
        getApplicationStatus: async () => ({ status: 'pending' }),
        openApplicationsView: () => console.log('Mock: Opening applications view'),
        openJobInBrowser: (url) => window.open(url, '_blank'),
        getSystemInfo: async () => ({ platform: 'web', version: '1.0.0' }),
        openDevTools: () => console.log('Mock: Opening dev tools')
      };
      
      setApi(mockAPI);
      setIsElectron(false);
      setSystemInfo({ platform: 'web', version: '1.0.0' });
    }
  }, []);

  const contextValue: ElectronContextType = {
    api,
    isElectron,
    systemInfo
  };

  return (
    <ElectronContext.Provider value={contextValue}>
      {children}
    </ElectronContext.Provider>
  );
}