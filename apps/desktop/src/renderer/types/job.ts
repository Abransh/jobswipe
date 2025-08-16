/**
 * Job Type Definitions for Desktop App
 * Based on web app types but adapted for Electron environment
 */

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
}

export interface Salary {
  min: number;
  max: number;
  currency: string;
  period?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface JobData {
  id: string;
  title: string;
  company: Company;
  location: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  salary?: Salary;
  remote: boolean;
  isUrgent?: boolean;
  postedAt: Date;
  applicationUrl: string;
  
  // Optional metadata
  matchScore?: number;
  tags?: string[];
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship';
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  queueId?: string;
  appliedAt: Date;
  completedAt?: Date;
  
  // Automation metadata
  automationData?: {
    formFieldsFound: number;
    formFieldsFilled: number;
    captchaEncountered: boolean;
    screenshots: string[];
    error?: string;
  };
  
  // Result data
  result?: {
    success: boolean;
    confirmationId?: string;
    redirectUrl?: string;
    message?: string;
  };
}

export interface ApplicationStats {
  totalApplications: number;
  todayApplications: number;
  successRate: number;
  pendingApplications?: number;
  failedApplications?: number;
}