/**
 * Electron IPC Handlers
 * Handles communication between renderer and main process
 * Integrates with enterprise automation services
 */

import { ipcMain, shell } from 'electron';
import type { JobData } from '../renderer/types/job';

// Import new simplified automation service
import { SimplifiedAutomationService } from '../services/SimplifiedAutomationService';

// Initialize automation service
let automationService: SimplifiedAutomationService | null = null;

async function initializeAutomationService() {
  if (!automationService) {
    try {
      automationService = new SimplifiedAutomationService({
        companiesPath: './companies',
        pythonPath: 'python3'
      });
      console.log('✅ JobSwipe automation service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize automation service:', error);
    }
  }
  return automationService;
}

// Job management handlers
export function setupJobHandlers() {
  // Get jobs
  ipcMain.handle('jobs:get', async () => {
    try {
      // Mock job data for now - could integrate with real job API
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
      
      return mockJobs;
    } catch (error) {
      console.error('Failed to get jobs:', error);
      throw error;
    }
  });

  // Apply to job with automation
  ipcMain.handle('jobs:apply', async (event, jobId: string, jobData: JobData) => {
    try {
      console.log('🚀 Starting job application process for:', jobData.title);
      
      const service = await initializeAutomationService();
      
      if (!service) {
        throw new Error('Automation service not available');
      }

      // Generate a unique application ID
      const applicationId = `app_${jobId}_${Date.now()}`;
      
      // Queue the job application (non-blocking)
      const applicationPromise = service.applyToJob({
        user: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'user@example.com',
          phone: '123-456-7890',
          resume_local_path: '/path/to/resume.pdf'
        },
        job: {
          job_id: jobData.id,
          title: jobData.title,
          company: jobData.company.name,
          apply_url: jobData.applicationUrl,
          location: jobData.location
        }
      }, applicationId);

      // Don't await - let it run in background
      applicationPromise.then((result) => {
        console.log('✅ Job application completed:', result);
        // Could send result back to renderer via event
        event.sender.send('application:completed', { applicationId, result });
      }).catch((error) => {
        console.error('❌ Job application failed:', error);
        event.sender.send('application:failed', { applicationId, error: error.message });
      });

      return {
        success: true,
        applicationId,
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
      // Could integrate with actual queue status
      return {
        queueId,
        status: 'in_progress',
        progress: 50,
        currentStep: 'Filling application form',
        estimatedTimeRemaining: 120 // seconds
      };
    } catch (error) {
      console.error('Failed to get application status:', error);
      throw error;
    }
  });

  // Get all applications
  ipcMain.handle('applications:list', async () => {
    try {
      // Mock application data
      return [
        {
          id: '1',
          jobId: '1',
          status: 'completed',
          queueId: 'job_1_123456',
          appliedAt: new Date(),
          completedAt: new Date(),
          result: {
            success: true,
            confirmationId: 'ANT_12345',
            message: 'Application submitted successfully'
          }
        }
      ];
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
        automationEnabled: automationService !== null
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
      // Could open a new window or switch to applications tab
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
  console.log('🔧 Setting up IPC handlers...');
  
  setupJobHandlers();
  setupSystemHandlers();
  setupUIHandlers();
  
  // Initialize automation service on startup
  initializeAutomationService();
  
  console.log('✅ IPC handlers set up successfully');
}