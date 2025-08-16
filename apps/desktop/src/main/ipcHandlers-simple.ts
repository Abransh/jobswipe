/**
 * Simplified Electron IPC Handlers
 * Basic version without complex automation services
 */

import { ipcMain, shell } from 'electron';
import type { JobData } from '../renderer/types/job';

// Mock job data for testing
const mockJobs: JobData[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: {
      id: 'anthropic',
      name: 'Anthropic',
      logo: 'https://via.placeholder.com/64'
    },
    location: 'San Francisco, CA',
    salary: {
      min: 150000,
      max: 220000,
      currency: 'USD'
    },
    description: 'Join our AI safety team to build responsible AI systems that benefit humanity.',
    requirements: ['React', 'TypeScript', 'Node.js', 'AI/ML', 'Python'],
    benefits: ['Health insurance', 'Stock options', 'Remote work', 'Unlimited PTO'],
    remote: true,
    isUrgent: false,
    postedAt: new Date(),
    applicationUrl: 'https://jobs.lever.co/anthropic/software-engineer'
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: {
      id: 'google',
      name: 'Google',
      logo: 'https://via.placeholder.com/64'
    },
    location: 'Mountain View, CA',
    salary: {
      min: 130000,
      max: 180000,
      currency: 'USD'
    },
    description: 'Build the next generation of web applications used by billions of people.',
    requirements: ['JavaScript', 'React', 'CSS', 'HTML', 'Angular'],
    benefits: ['Health insurance', 'Free meals', 'Gym access', 'Learning budget'],
    remote: false,
    isUrgent: true,
    postedAt: new Date(),
    applicationUrl: 'https://careers.google.com/jobs/frontend-developer'
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: {
      id: 'stripe',
      name: 'Stripe',
      logo: 'https://via.placeholder.com/64'
    },
    location: 'Remote',
    salary: {
      min: 140000,
      max: 200000,
      currency: 'USD'
    },
    description: 'Help build the economic infrastructure for the internet.',
    requirements: ['Ruby', 'JavaScript', 'React', 'PostgreSQL', 'AWS'],
    benefits: ['Equity', 'Remote work', 'Health insurance', 'Professional development'],
    remote: true,
    isUrgent: false,
    postedAt: new Date(),
    applicationUrl: 'https://stripe.com/jobs/listing/full-stack-engineer'
  }
];

// Simple application store
const applications: Map<string, any> = new Map();

// Job management handlers
export function setupJobHandlers() {
  // Get jobs
  ipcMain.handle('jobs:get', async () => {
    try {
      console.log('📋 Fetching jobs...');
      return mockJobs;
    } catch (error) {
      console.error('Failed to get jobs:', error);
      throw error;
    }
  });

  // Apply to job (simplified)
  ipcMain.handle('jobs:apply', async (event, jobId: string, jobData: JobData) => {
    try {
      console.log('🚀 Starting job application process for:', jobData.title);
      
      // Generate a unique queue ID
      const queueId = `job_${jobId}_${Date.now()}`;
      
      // Store application
      applications.set(queueId, {
        jobId: jobData.id,
        status: 'processing',
        queueId,
        appliedAt: new Date(),
        jobData
      });

      // Simulate processing in background
      setTimeout(() => {
        applications.set(queueId, {
          ...applications.get(queueId),
          status: 'completed',
          completedAt: new Date(),
          result: {
            success: true,
            confirmationId: `CONF_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            message: 'Application submitted successfully'
          }
        });
        
        // Notify renderer
        event.sender.send('application:completed', { 
          queueId, 
          result: applications.get(queueId) 
        });
      }, 3000); // 3 second delay

      return {
        success: true,
        queueId,
        message: `Application queued for ${jobData.title}`
      };
      
    } catch (error) {
      console.error('Failed to apply to job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });

  // Get application status
  ipcMain.handle('applications:status', async (event, queueId: string) => {
    try {
      const app = applications.get(queueId);
      if (!app) {
        throw new Error('Application not found');
      }
      
      return {
        queueId,
        status: app.status,
        progress: app.status === 'completed' ? 100 : app.status === 'processing' ? 50 : 0,
        currentStep: app.status === 'completed' ? 'Complete' : 'Processing application',
        estimatedTimeRemaining: app.status === 'completed' ? 0 : 120
      };
    } catch (error) {
      console.error('Failed to get application status:', error);
      throw error;
    }
  });

  // Get all applications
  ipcMain.handle('applications:list', async () => {
    try {
      return Array.from(applications.values());
    } catch (error) {
      console.error('Failed to get applications:', error);
      throw error;
    }
  });
}

// System handlers
export function setupSystemHandlers() {
  // Get system information
  ipcMain.handle('system:info', async () => {
    try {
      return {
        platform: process.platform,
        version: process.version,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node,
        automationEnabled: true // Simplified - always true
      };
    } catch (error) {
      console.error('Failed to get system info:', error);
      throw error;
    }
  });

  // Open external URL
  ipcMain.handle('system:openUrl', async (event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('Failed to open URL:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Open dev tools
  ipcMain.handle('system:devtools', async (event) => {
    try {
      const webContents = event.sender;
      if (webContents.isDevToolsOpened()) {
        webContents.closeDevTools();
      } else {
        webContents.openDevTools();
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle dev tools:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}

// UI handlers
export function setupUIHandlers() {
  // Open applications view
  ipcMain.handle('ui:applications', async () => {
    try {
      console.log('Opening applications view');
      return { success: true };
    } catch (error) {
      console.error('Failed to open applications view:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
}

// Initialize all handlers
export function setupAllIPCHandlers() {
  console.log('🔧 Setting up simplified IPC handlers...');
  
  setupJobHandlers();
  setupSystemHandlers();
  setupUIHandlers();
  
  console.log('✅ Simplified IPC handlers set up successfully');
}