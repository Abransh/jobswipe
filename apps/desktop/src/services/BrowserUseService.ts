import { Agent } from 'browser-use';
import { Page, Browser } from 'playwright';
import { EventEmitter } from 'events';
import { VisionServiceManager } from './VisionServiceManager';
import { FormAnalyzer } from '../intelligence/FormAnalyzer';

/**
 * Browser-Use Service Bridge
 * 
 * Integrates the browser-use AI library with JobSwipe's automation engine.
 * Provides intelligent browser automation using Claude AI for job applications.
 * 
 * Features:
 * - AI-powered browser automation using browser-use library
 * - Seamless integration with existing JobSwipe automation engine
 * - Headless/headful mode switching for captcha resolution
 * - Real-time progress tracking and event emission
 * - Company-specific task delegation to existing strategies
 */

export interface BrowserUseConfig {
  anthropicApiKey: string;
  headless: boolean;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  slowMo?: number;
  timeout?: number;
  useVisionService?: boolean;
  captchaHandling?: {
    enableVisionFallback: boolean;
    enableManualFallback: boolean;
    manualFallbackTimeout: number;
  };
}

export interface JobApplicationTask {
  id: string;
  jobId: string;
  jobUrl: string;
  jobTitle: string;
  company: string;
  userProfile: UserProfile;
  strategy?: string;
  priority: 'low' | 'medium' | 'high' | 'immediate';
  context?: Record<string, any>;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  workAuthorization: 'citizen' | 'green_card' | 'visa' | 'other';
  experience: {
    years: number;
    currentTitle?: string;
    currentCompany?: string;
  };
  education: {
    degree: string;
    school: string;
    graduationYear: number;
  };
  resume: {
    fileUrl: string;
    fileName: string;
  };
  coverLetter?: {
    fileUrl: string;
    fileName: string;
  };
  linkedInProfile?: string;
  portfolioUrl?: string;
}

export interface AutomationResult {
  success: boolean;
  applicationId?: string;
  confirmationNumber?: string;
  error?: string;
  errorType?: 'network' | 'captcha' | 'form_error' | 'site_change' | 'blocked' | 'unknown';
  screenshots: string[];
  executionTime: number;
  steps: AutomationStep[];
  metadata: Record<string, any>;
}

export interface AutomationStep {
  step: string;
  description: string;
  timestamp: number;
  success: boolean;
  error?: string;
  screenshot?: string;
  metadata?: Record<string, any>;
}

export class BrowserUseService extends EventEmitter {
  private agent: Agent | null = null;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: BrowserUseConfig;
  private isInitialized = false;
  private visionService: VisionServiceManager | null = null;
  private formAnalyzer: FormAnalyzer | null = null;

  constructor(config: BrowserUseConfig) {
    super();
    this.config = {
      ...config,
      viewport: config.viewport || { width: 1920, height: 1080 },
      model: config.model || 'claude-3-sonnet-20240229',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.1
    };
    
    // Initialize form analyzer if requested
    if (config.useVisionService) {
      this.formAnalyzer = new FormAnalyzer();
    }
  }

  /**
   * Set the vision service for captcha handling
   */
  setVisionService(visionService: VisionServiceManager): void {
    this.visionService = visionService;
    console.log('🔗 Vision service connected to BrowserUseService');
  }

  /**
   * Initialize the browser-use agent with AI capabilities
   */
  async initialize(): Promise<void> {
    try {
      this.emit('status', { phase: 'initialization', message: 'Initializing browser-use agent...' });

      // Validate configuration
      if (!this.config.anthropicApiKey) {
        throw new Error('Anthropic API key is required for browser-use integration');
      }

      // Initialize the AI agent with browser-use library
      this.agent = new Agent({
        task: 'JobSwipe AI Automation Agent - Intelligent job application processing',
        llm: {
          provider: 'anthropic',
          model: this.config.model!,
          apiKey: this.config.anthropicApiKey,
          maxTokens: this.config.maxTokens!,
          temperature: this.config.temperature!
        },
        browser: {
          headless: this.config.headless,
          viewport: this.config.viewport!,
          slowMo: this.config.slowMo || 100,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        },
        timeout: this.config.timeout || 300000, // 5 minutes default
      });

      this.isInitialized = true;
      this.emit('status', { phase: 'initialization', message: 'Browser-use agent initialized successfully' });

    } catch (error) {
      this.emit('error', { phase: 'initialization', error: error.message });
      throw new Error(`Failed to initialize browser-use service: ${error.message}`);
    }
  }

  /**
   * Process a job application using AI automation
   */
  async processJobApplication(task: JobApplicationTask): Promise<AutomationResult> {
    const startTime = Date.now();
    const steps: AutomationStep[] = [];
    const screenshots: string[] = [];

    try {
      if (!this.isInitialized || !this.agent) {
        await this.initialize();
      }

      this.emit('progress', { taskId: task.id, progress: 5, message: 'Starting AI job application automation' });

      // Step 1: Navigate to job page
      const navigationStep = await this.executeStep(
        'navigate',
        `Navigate to job application page: ${task.jobUrl}`,
        async () => {
          const result = await this.agent!.run(
            `Navigate to the job application page at ${task.jobUrl} and analyze the application process`
          );
          return result;
        }
      );
      steps.push(navigationStep);
      this.emit('progress', { taskId: task.id, progress: 15, message: 'Navigated to job page' });

      // Step 2: Analyze application type and requirements
      const analysisStep = await this.executeStep(
        'analyze',
        'Analyze job application form and requirements',
        async () => {
          const result = await this.agent!.run(
            `Analyze this job application page. Determine:
             1. Is this an "Easy Apply" or multi-step application?
             2. What information is required?
             3. Are there any special requirements or assessments?
             4. What is the best strategy to complete this application?
             
             Job: ${task.jobTitle} at ${task.company}`
          );
          return result;
        }
      );
      steps.push(analysisStep);
      this.emit('progress', { taskId: task.id, progress: 25, message: 'Analyzed application requirements' });

      // Step 3: Fill out application form with user profile data
      const formFillingStep = await this.executeStep(
        'fill-form',
        'Fill out job application form with user profile information',
        async () => {
          const userInfo = this.formatUserProfileForAI(task.userProfile);
          
          const result = await this.agent!.run(
            `Fill out the job application form using the following user information:
             
             ${userInfo}
             
             Instructions:
             - Fill out all required fields accurately
             - Use the resume file when requested: ${task.userProfile.resume.fileName}
             - Answer screening questions appropriately based on user profile
             - Be honest about work authorization status
             - Save progress frequently if possible
             - Take screenshots of important steps`
          );
          return result;
        }
      );
      steps.push(formFillingStep);
      this.emit('progress', { taskId: task.id, progress: 60, message: 'Filled application form' });

      // Step 4: Handle captcha if present
      const captchaStep = await this.executeStep(
        'captcha',
        'Detect and resolve any captcha challenges',
        async () => {
          const result = await this.agent!.run(
            `Check for any captcha or verification challenges on this page.
             If found, attempt to solve them. If unable to solve automatically,
             switch to headful mode for manual intervention.`
          );
          
          // If captcha detected and needs manual intervention
          if (result.includes('captcha') && this.config.headless) {
            this.emit('captcha-detected', { 
              taskId: task.id, 
              message: 'Captcha detected, switching to headful mode' 
            });
            await this.switchToHeadfulMode();
          }
          
          return result;
        }
      );
      steps.push(captchaStep);
      this.emit('progress', { taskId: task.id, progress: 80, message: 'Handled captcha verification' });

      // Step 5: Submit application
      const submissionStep = await this.executeStep(
        'submit',
        'Submit the job application',
        async () => {
          const result = await this.agent!.run(
            `Review the completed application form for accuracy, then submit it.
             After submission:
             1. Look for confirmation message or application ID
             2. Take a screenshot of the confirmation page
             3. Extract any reference numbers or confirmation details
             4. Note any next steps mentioned`
          );
          return result;
        }
      );
      steps.push(submissionStep);
      this.emit('progress', { taskId: task.id, progress: 95, message: 'Application submitted' });

      // Step 6: Extract confirmation details
      const confirmationStep = await this.executeStep(
        'confirmation',
        'Extract application confirmation details',
        async () => {
          const result = await this.agent!.run(
            `Extract the application confirmation details from the current page:
             - Application ID or reference number
             - Confirmation message
             - Next steps or timeline
             - Any additional requirements
             
             Return this information in a structured format.`
          );
          return result;
        }
      );
      steps.push(confirmationStep);

      const executionTime = Date.now() - startTime;
      this.emit('progress', { taskId: task.id, progress: 100, message: 'Application completed successfully' });

      return {
        success: true,
        applicationId: this.extractApplicationId(confirmationStep.metadata?.result),
        confirmationNumber: this.extractConfirmationNumber(confirmationStep.metadata?.result),
        screenshots,
        executionTime,
        steps,
        metadata: {
          jobUrl: task.jobUrl,
          company: task.company,
          jobTitle: task.jobTitle,
          strategy: 'browser-use-ai',
          userAgent: this.config.userAgent,
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.emit('error', { 
        taskId: task.id, 
        error: error.message,
        steps: steps.length 
      });

      return {
        success: false,
        error: error.message,
        errorType: this.classifyError(error.message),
        screenshots,
        executionTime,
        steps,
        metadata: {
          jobUrl: task.jobUrl,
          company: task.company,
          jobTitle: task.jobTitle,
          strategy: 'browser-use-ai',
          failurePoint: steps.length > 0 ? steps[steps.length - 1].step : 'initialization',
        }
      };
    }
  }

  /**
   * Execute a single automation step with error handling and tracking
   */
  private async executeStep(
    stepName: string,
    description: string,
    action: () => Promise<any>
  ): Promise<AutomationStep> {
    const timestamp = Date.now();
    
    try {
      this.emit('step-start', { step: stepName, description });
      
      const result = await action();
      
      // Take screenshot after successful step
      const screenshot = await this.takeScreenshot();
      
      this.emit('step-complete', { step: stepName, success: true });
      
      return {
        step: stepName,
        description,
        timestamp,
        success: true,
        screenshot,
        metadata: { result }
      };
      
    } catch (error) {
      const screenshot = await this.takeScreenshot(); // Capture error state
      
      this.emit('step-error', { step: stepName, error: error.message });
      
      return {
        step: stepName,
        description,
        timestamp,
        success: false,
        error: error.message,
        screenshot,
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Switch from headless to headful mode for manual captcha solving
   */
  private async switchToHeadfulMode(): Promise<void> {
    try {
      this.emit('status', { phase: 'mode-switch', message: 'Switching to headful mode for captcha resolution' });
      
      // Create new headful agent
      const headfulAgent = new Agent({
        llm: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          apiKey: this.config.anthropicApiKey,
        },
        browser: {
          headless: false, // Switch to headful
          viewport: this.config.viewport,
          slowMo: this.config.slowMo || 100,
        },
        timeout: this.config.timeout || 300000,
      });

      // Replace the current agent
      this.agent = headfulAgent;
      this.config.headless = false;
      
      this.emit('status', { phase: 'mode-switch', message: 'Switched to headful mode successfully' });
      
    } catch (error) {
      this.emit('error', { phase: 'mode-switch', error: error.message });
      throw error;
    }
  }

  /**
   * Take a screenshot of the current page
   */
  private async takeScreenshot(): Promise<string> {
    try {
      if (this.agent && this.agent.page) {
        const screenshot = await this.agent.page.screenshot({ 
          type: 'png',
          fullPage: true 
        });
        return screenshot.toString('base64');
      }
      return '';
    } catch (error) {
      console.warn('Failed to take screenshot:', error.message);
      return '';
    }
  }

  /**
   * Format user profile data for AI consumption
   */
  private formatUserProfileForAI(profile: UserProfile): string {
    return `
Name: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
Phone: ${profile.phone}

Address:
${profile.address.street}
${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}
${profile.address.country}

Work Authorization: ${profile.workAuthorization}

Experience:
- Years of experience: ${profile.experience.years}
- Current title: ${profile.experience.currentTitle || 'Not specified'}
- Current company: ${profile.experience.currentCompany || 'Not specified'}

Education:
- Degree: ${profile.education.degree}
- School: ${profile.education.school}
- Graduation year: ${profile.education.graduationYear}

Documents:
- Resume: ${profile.resume.fileName}
- Cover letter: ${profile.coverLetter?.fileName || 'Not provided'}

Links:
- LinkedIn: ${profile.linkedInProfile || 'Not provided'}
- Portfolio: ${profile.portfolioUrl || 'Not provided'}
`;
  }

  /**
   * Extract application ID from confirmation text
   */
  private extractApplicationId(confirmationText: string): string | undefined {
    if (!confirmationText) return undefined;
    
    const patterns = [
      /application\s+id[:\s]+([a-zA-Z0-9\-_]+)/i,
      /reference\s+number[:\s]+([a-zA-Z0-9\-_]+)/i,
      /application\s+number[:\s]+([a-zA-Z0-9\-_]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = confirmationText.match(pattern);
      if (match) return match[1];
    }
    
    return undefined;
  }

  /**
   * Extract confirmation number from confirmation text
   */
  private extractConfirmationNumber(confirmationText: string): string | undefined {
    if (!confirmationText) return undefined;
    
    const patterns = [
      /confirmation\s+number[:\s]+([a-zA-Z0-9\-_]+)/i,
      /confirmation\s+code[:\s]+([a-zA-Z0-9\-_]+)/i,
      /confirmation[:\s]+([a-zA-Z0-9\-_]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = confirmationText.match(pattern);
      if (match) return match[1];
    }
    
    return undefined;
  }

  /**
   * Classify error type for retry strategy
   */
  private classifyError(errorMessage: string): 'network' | 'captcha' | 'form_error' | 'site_change' | 'blocked' | 'unknown' {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('captcha') || message.includes('verification') || message.includes('recaptcha')) {
      return 'captcha';
    }
    if (message.includes('form') || message.includes('field') || message.includes('validation')) {
      return 'form_error';
    }
    if (message.includes('blocked') || message.includes('forbidden') || message.includes('access denied')) {
      return 'blocked';
    }
    if (message.includes('element not found') || message.includes('page changed') || message.includes('layout')) {
      return 'site_change';
    }
    
    return 'unknown';
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.agent) {
        await this.agent.close();
        this.agent = null;
      }
      
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
      
      this.emit('status', { phase: 'cleanup', message: 'Browser-use service cleaned up successfully' });
      
    } catch (error) {
      this.emit('error', { phase: 'cleanup', error: error.message });
    }
  }

  /**
   * Get current service status
   */
  getStatus(): {
    initialized: boolean;
    hasActiveAgent: boolean;
    mode: 'headless' | 'headful';
    config: Partial<BrowserUseConfig>;
  } {
    return {
      initialized: this.isInitialized,
      hasActiveAgent: this.agent !== null,
      mode: this.config.headless ? 'headless' : 'headful',
      config: {
        viewport: this.config.viewport,
        timeout: this.config.timeout,
        slowMo: this.config.slowMo,
      }
    };
  }
}

export default BrowserUseService;