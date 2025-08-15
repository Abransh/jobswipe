/**
 * @fileoverview Strategy System Types and Interfaces
 * @description Type definitions for company-specific automation strategies
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade strategy management types
 */

import { Page } from 'playwright';

// Forward declarations for types that will be imported at runtime
export interface QueueJob {
  id: string;
  userId: string;
  jobData: {
    id: string;
    title: string;
    company: string;
    url: string;
    location?: string;
    description?: string;
  };
  userProfile: UserProfile;
  priority: 'low' | 'normal' | 'high' | 'critical';
  createdAt: Date;
  scheduledAt?: Date;
}

// =============================================================================
// CORE STRATEGY INTERFACES
// =============================================================================

export interface JobSiteSelectors {
  /** Login and authentication selectors */
  login: {
    loginButton: string[];
    emailField: string[];
    passwordField: string[];
    submitButton: string[];
    twoFactorField?: string[];
  };
  
  /** Job application selectors */
  application: {
    applyButton: string[];
    easyApplyButton?: string[];
    resumeUpload: string[];
    coverLetterUpload?: string[];
    submitButton: string[];
    nextButton?: string[];
    continueButton?: string[];
  };
  
  /** Form field selectors */
  formFields: {
    firstName: string[];
    lastName: string[];
    fullName: string[];
    email: string[];
    phone: string[];
    address: string[];
    city: string[];
    state: string[];
    zipCode: string[];
    country: string[];
    linkedinUrl?: string[];
    portfolioUrl?: string[];
    currentCompany?: string[];
    yearsExperience?: string[];
    salaryExpectation?: string[];
  };
  
  /** Confirmation and success selectors */
  confirmation: {
    successMessages: string[];
    confirmationIds: string[];
    errorMessages: string[];
    applicationStatus: string[];
  };
  
  /** Captcha and anti-bot selectors */
  captcha: {
    recaptcha: string[];
    hcaptcha: string[];
    imageBasedCaptcha: string[];
    textBasedCaptcha: string[];
    cloudflareChallenge: string[];
  };
  
  /** Navigation and modal selectors */
  navigation: {
    closeModal: string[];
    skipStep: string[];
    backButton: string[];
    cancelButton: string[];
  };
}

export interface AutomationWorkflow {
  /** Pre-application steps */
  preApplication: WorkflowStep[];
  /** Main application flow */
  application: WorkflowStep[];
  /** Post-application verification */
  postApplication: WorkflowStep[];
  /** Error recovery steps */
  errorRecovery: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  action: WorkflowAction;
  selectors: string[];
  required: boolean;
  timeout: number;
  retryCount: number;
  successCriteria: string[];
  fallbackActions?: WorkflowAction[];
  metadata?: Record<string, any>;
}

export enum WorkflowAction {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  TYPE = 'type',
  UPLOAD = 'upload',
  SELECT = 'select',
  WAIT = 'wait',
  VALIDATE = 'validate',
  EXTRACT = 'extract',
  SCREENSHOT = 'screenshot',
  CUSTOM = 'custom'
}

export interface CaptchaStrategy {
  detection: {
    selectors: string[];
    patterns: string[];
    imageAnalysis: boolean;
  };
  resolution: {
    aiVision: boolean;
    ocrEnabled: boolean;
    externalService?: string;
    manualFallback: boolean;
    maxAttempts: number;
  };
  fallback: {
    switchToHeadful: boolean;
    notifyUser: boolean;
    skipApplication: boolean;
  };
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  backoffStrategy: 'linear' | 'exponential';
  respectRobotsTxt: boolean;
  userAgentRotation: boolean;
}

export interface AntiDetectionConfig {
  browserFingerprinting: {
    randomizeViewport: boolean;
    randomizeUserAgent: boolean;
    randomizeTimezone: boolean;
    randomizeLanguage: boolean;
  };
  humanBehavior: {
    naturalMouseMovements: boolean;
    variableTypingSpeed: boolean;
    randomDelays: boolean;
    scrollingBehavior: boolean;
  };
  networkBehavior: {
    proxyRotation: boolean;
    ipThrottling: boolean;
    cookieManagement: boolean;
    sessionPersistence: boolean;
  };
}

export interface StrategyMetrics {
  successRate: number;
  averageExecutionTime: number;
  captchaEncounterRate: number;
  errorRate: number;
  lastUpdated: Date;
  totalApplications: number;
  recentPerformance: PerformanceMetric[];
}

export interface PerformanceMetric {
  timestamp: Date;
  success: boolean;
  executionTime: number;
  errorType?: string;
  captchaEncountered: boolean;
}

// =============================================================================
// STRATEGY CONFIGURATION
// =============================================================================

export interface CompanyAutomationStrategy {
  /** Basic strategy information */
  id: string;
  name: string;
  companyDomain: string;
  version: string;
  description: string;
  
  /** Strategy configuration */
  selectors: JobSiteSelectors;
  workflow: AutomationWorkflow;
  captchaHandling: CaptchaStrategy;
  rateLimit: RateLimitConfig;
  antiDetection: AntiDetectionConfig;
  
  /** Strategy metadata */
  metadata: {
    author: string;
    createdAt: Date;
    lastModified: Date;
    supportedRegions: string[];
    requiredAuth: boolean;
    premiumOnly: boolean;
    beta: boolean;
  };
  
  /** Performance tracking */
  metrics: StrategyMetrics;
  
  /** A/B testing configuration */
  abTesting?: {
    enabled: boolean;
    variants: StrategyVariant[];
    trafficSplit: number;
  };
}

export interface StrategyVariant {
  id: string;
  name: string;
  description: string;
  modifications: Partial<CompanyAutomationStrategy>;
  trafficPercentage: number;
}

// =============================================================================
// STRATEGY EXECUTION INTERFACES
// =============================================================================

export interface StrategyContext {
  job: QueueJob;
  page: Page;
  userProfile: UserProfile;
  strategy: CompanyAutomationStrategy;
  sessionData: SessionData;
}

export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  professional: {
    currentTitle?: string;
    currentCompany?: string;
    yearsExperience?: number;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeUrl: string;
    coverLetterTemplate?: string;
  };
  preferences: {
    salaryMin?: number;
    salaryMax?: number;
    remoteWork?: boolean;
    workAuthorization?: string;
    availableStartDate?: string;
  };
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  navigationHistory: string[];
  screenshots: string[];
}

export interface StrategyExecutionResult {
  success: boolean;
  applicationId?: string;
  confirmationId?: string;
  executionTime: number;
  stepsCompleted: number;
  totalSteps: number;
  captchaEncountered: boolean;
  screenshots: string[];
  logs: string[];
  error?: string;
  metrics: {
    timeToFirstInteraction: number;
    formFillTime: number;
    uploadTime: number;
    submissionTime: number;
  };
}

// =============================================================================
// REGISTRY INTERFACES
// =============================================================================

export interface StrategyRegistryConfig {
  strategyDirectory: string;
  cacheStrategy: boolean;
  autoReload: boolean;
  performanceTracking: boolean;
  abTestingEnabled: boolean;
  fallbackStrategy?: string;
}

export interface StrategyLoadResult {
  success: boolean;
  strategy?: CompanyAutomationStrategy;
  error?: string;
  loadTime: number;
}

export interface StrategyMatchResult {
  matched: boolean;
  strategy?: CompanyAutomationStrategy;
  confidence: number;
  alternateStrategies: CompanyAutomationStrategy[];
}

// =============================================================================
// EVENT INTERFACES
// =============================================================================

export interface StrategyEvent {
  type: StrategyEventType;
  strategyId: string;
  timestamp: Date;
  data: any;
}

export enum StrategyEventType {
  STRATEGY_LOADED = 'strategy-loaded',
  STRATEGY_MATCHED = 'strategy-matched',
  EXECUTION_STARTED = 'execution-started',
  STEP_COMPLETED = 'step-completed',
  CAPTCHA_DETECTED = 'captcha-detected',
  ERROR_OCCURRED = 'error-occurred',
  EXECUTION_COMPLETED = 'execution-completed',
  METRICS_UPDATED = 'metrics-updated'
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type StrategySelector = string | string[] | {
  selector: string;
  fallbacks: string[];
  required: boolean;
  timeout?: number;
};

export type FormFieldMapping = Record<string, StrategySelector>;

export type ConditionalStep = WorkflowStep & {
  condition: string;
  ifTrue: WorkflowStep[];
  ifFalse?: WorkflowStep[];
};

export type DynamicWorkflow = {
  generate: (context: StrategyContext) => Promise<AutomationWorkflow>;
  validate: (workflow: AutomationWorkflow) => boolean;
};