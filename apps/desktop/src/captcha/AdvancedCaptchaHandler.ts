/**
 * @fileoverview Advanced Captcha Resolution System
 * @description Multi-tier captcha resolution with AI, OCR, external services, and manual fallback
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade captcha handling with multiple resolution strategies
 */

import { EventEmitter } from 'events';
import { Page } from 'playwright';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import Store from 'electron-store';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface CaptchaContext {
  page: Page;
  jobId: string;
  userId: string;
  captchaType: CaptchaType;
  element?: any;
  screenshot?: Buffer;
  url: string;
  timestamp: Date;
}

export enum CaptchaType {
  TEXT = 'text',
  IMAGE = 'image', 
  RECAPTCHA_V2 = 'recaptcha-v2',
  RECAPTCHA_V3 = 'recaptcha-v3',
  HCAPTCHA = 'hcaptcha',
  CLOUDFLARE = 'cloudflare',
  CUSTOM = 'custom',
  UNKNOWN = 'unknown'
}

export interface CaptchaSolution {
  success: boolean;
  solution?: string;
  confidence: number;
  method: ResolutionMethod;
  executionTime: number;
  cost?: number;
  error?: string;
  attempts?: number;
}

export enum ResolutionMethod {
  AI_VISION = 'ai-vision',
  OCR_TESSERACT = 'ocr-tesseract', 
  OCR_CLOUD = 'ocr-cloud',
  EXTERNAL_SERVICE = 'external-service',
  MANUAL_INTERVENTION = 'manual-intervention',
  BEHAVIORAL_BYPASS = 'behavioral-bypass',
  FAILED = 'failed'
}

export interface CaptchaStats {
  totalEncountered: number;
  successfullyResolved: number;
  resolutionMethods: Record<ResolutionMethod, number>;
  averageResolutionTime: number;
  successRate: number;
  costMetrics: {
    totalCost: number;
    averageCostPerCaptcha: number;
  };
}

export interface CaptchaConfig {
  enabledMethods: ResolutionMethod[];
  aiVision: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    apiKey: string;
    maxTokens: number;
    temperature: number;
  };
  ocr: {
    tesseractPath: string;
    languages: string[];
    cloudProvider?: 'aws' | 'google' | 'azure';
    cloudApiKey?: string;
  };
  externalServices: {
    twoCaptcha?: {
      apiKey: string;
      timeout: number;
    };
    antiCaptcha?: {
      apiKey: string;
      timeout: number;
    };
    capMonster?: {
      apiKey: string;
      timeout: number;
    };
  };
  manual: {
    enabled: boolean;
    timeout: number;
    notificationMethod: 'email' | 'webhook' | 'ui';
  };
  behavioral: {
    mouseMovementVariance: number;
    typingSpeedVariance: number;
    clickDelayRange: [number, number];
    humanPatterns: boolean;
  };
}

// =============================================================================
// ADVANCED CAPTCHA HANDLER
// =============================================================================

export class AdvancedCaptchaHandler extends EventEmitter {
  private config: CaptchaConfig;
  private store: Store;
  private stats: CaptchaStats;
  private activeSessions = new Map<string, CaptchaContext>();
  private resolutionCache = new Map<string, CaptchaSolution>();

  constructor(config: Partial<CaptchaConfig> = {}) {
    super();

    this.config = {
      enabledMethods: [
        ResolutionMethod.AI_VISION,
        ResolutionMethod.OCR_TESSERACT,
        ResolutionMethod.EXTERNAL_SERVICE,
        ResolutionMethod.MANUAL_INTERVENTION
      ],
      aiVision: {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        maxTokens: 1000,
        temperature: 0.1
      },
      ocr: {
        tesseractPath: 'tesseract',
        languages: ['eng'],
        cloudProvider: 'aws',
        cloudApiKey: process.env.AWS_ACCESS_KEY_ID || ''
      },
      externalServices: {
        twoCaptcha: {
          apiKey: process.env.TWOCAPTCHA_API_KEY || '',
          timeout: 120000
        }
      },
      manual: {
        enabled: true,
        timeout: 300000, // 5 minutes
        notificationMethod: 'ui'
      },
      behavioral: {
        mouseMovementVariance: 0.2,
        typingSpeedVariance: 0.3,
        clickDelayRange: [100, 500],
        humanPatterns: true
      },
      ...config
    };

    this.store = new Store({
      name: 'captcha-handler',
      defaults: {
        stats: {
          totalEncountered: 0,
          successfullyResolved: 0,
          resolutionMethods: {},
          averageResolutionTime: 0,
          successRate: 0,
          costMetrics: {
            totalCost: 0,
            averageCostPerCaptcha: 0
          }
        },
        cache: {}
      }
    }) as any;

    this.stats = this.store.get('stats') as CaptchaStats;
    this.loadCachedSolutions();
  }

  // =============================================================================
  // MAIN CAPTCHA RESOLUTION INTERFACE
  // =============================================================================

  /**
   * Detect and resolve captcha using multi-tier approach
   */
  async resolveCaptcha(context: CaptchaContext): Promise<CaptchaSolution> {
    const sessionId = randomUUID();
    this.activeSessions.set(sessionId, context);

    console.log(`🤖 [${sessionId}] Starting captcha resolution for ${context.captchaType}`);
    this.emit('captcha-detected', { sessionId, context });

    const startTime = Date.now();

    try {
      // Update stats
      this.stats.totalEncountered++;

      // Check cache first
      const cachedSolution = this.checkCache(context);
      if (cachedSolution) {
        console.log(`💾 [${sessionId}] Using cached solution`);
        return cachedSolution;
      }

      // Take screenshot for analysis
      await this.captureContext(context);

      // Execute resolution tiers in order
      const solution = await this.executeResolutionTiers(context, sessionId);

      // Update statistics
      const executionTime = Date.now() - startTime;
      solution.executionTime = executionTime;

      if (solution.success) {
        this.stats.successfullyResolved++;
        this.updateMethodStats(solution.method);
        this.cacheSuccessfulSolution(context, solution);
      }

      this.updateStats();
      this.emit('captcha-resolved', { sessionId, solution, context });

      console.log(`✅ [${sessionId}] Captcha resolved: ${solution.success} via ${solution.method}`);
      return solution;

    } catch (error) {
      const failedSolution: CaptchaSolution = {
        success: false,
        confidence: 0,
        method: ResolutionMethod.FAILED,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };

      this.emit('captcha-failed', { sessionId, error: failedSolution.error, context });
      return failedSolution;

    } finally {
      this.activeSessions.delete(sessionId);
    }
  }

  // =============================================================================
  // CAPTCHA DETECTION
  // =============================================================================

  /**
   * Detect captcha type and create context
   */
  async detectCaptcha(page: Page, jobId: string, userId: string): Promise<CaptchaContext | null> {
    const detectionSelectors = {
      [CaptchaType.RECAPTCHA_V2]: [
        'iframe[src*="recaptcha"]',
        '.g-recaptcha',
        '[data-sitekey]'
      ],
      [CaptchaType.HCAPTCHA]: [
        'iframe[src*="hcaptcha"]',
        '.h-captcha'
      ],
      [CaptchaType.CLOUDFLARE]: [
        '.cf-browser-verification',
        '#challenge-form',
        '.challenge-page'
      ],
      [CaptchaType.IMAGE]: [
        'img[alt*="captcha" i]',
        'img[src*="captcha" i]',
        '.captcha-image'
      ],
      [CaptchaType.TEXT]: [
        'input[name*="captcha" i]',
        'input[placeholder*="captcha" i]'
      ]
    };

    for (const [type, selectors] of Object.entries(detectionSelectors)) {
      for (const selector of selectors) {
        try {
          const element = page.locator(selector);
          const isVisible = await element.isVisible({ timeout: 1000 });
          
          if (isVisible) {
            console.log(`🔍 Detected ${type} captcha with selector: ${selector}`);
            
            return {
              page,
              jobId,
              userId,
              captchaType: type as CaptchaType,
              element: await element.first(),
              url: page.url(),
              timestamp: new Date()
            };
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  // =============================================================================
  // RESOLUTION TIERS
  // =============================================================================

  /**
   * Execute resolution tiers in priority order
   */
  private async executeResolutionTiers(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<CaptchaSolution> {
    const enabledMethods = this.config.enabledMethods;
    const tierAttempts: Array<{ method: ResolutionMethod; attempt: () => Promise<CaptchaSolution> }> = [];

    // Tier 1: AI Vision (fastest, most intelligent)
    if (enabledMethods.includes(ResolutionMethod.AI_VISION) && 
        this.canUseAIVision(context.captchaType)) {
      tierAttempts.push({
        method: ResolutionMethod.AI_VISION,
        attempt: () => this.resolveWithAIVision(context, sessionId)
      });
    }

    // Tier 2: OCR Recognition
    if (enabledMethods.includes(ResolutionMethod.OCR_TESSERACT) && 
        this.canUseOCR(context.captchaType)) {
      tierAttempts.push({
        method: ResolutionMethod.OCR_TESSERACT,
        attempt: () => this.resolveWithOCR(context, sessionId)
      });
    }

    // Tier 3: External Services
    if (enabledMethods.includes(ResolutionMethod.EXTERNAL_SERVICE)) {
      tierAttempts.push({
        method: ResolutionMethod.EXTERNAL_SERVICE,
        attempt: () => this.resolveWithExternalService(context, sessionId)
      });
    }

    // Tier 4: Behavioral Bypass
    if (enabledMethods.includes(ResolutionMethod.BEHAVIORAL_BYPASS)) {
      tierAttempts.push({
        method: ResolutionMethod.BEHAVIORAL_BYPASS,
        attempt: () => this.resolveWithBehavioralBypass(context, sessionId)
      });
    }

    // Tier 5: Manual Intervention
    if (enabledMethods.includes(ResolutionMethod.MANUAL_INTERVENTION) && 
        this.config.manual.enabled) {
      tierAttempts.push({
        method: ResolutionMethod.MANUAL_INTERVENTION,
        attempt: () => this.resolveWithManualIntervention(context, sessionId)
      });
    }

    // Execute tiers in order
    for (const { method, attempt } of tierAttempts) {
      try {
        console.log(`🔄 [${sessionId}] Attempting ${method}`);
        const solution = await attempt();
        
        if (solution.success && solution.confidence > 0.7) {
          console.log(`✅ [${sessionId}] ${method} successful (confidence: ${solution.confidence})`);
          return solution;
        } else {
          console.log(`⚠️ [${sessionId}] ${method} failed or low confidence (${solution.confidence})`);
        }
      } catch (error) {
        console.log(`❌ [${sessionId}] ${method} error: ${error}`);
      }
    }

    // All tiers failed
    return {
      success: false,
      confidence: 0,
      method: ResolutionMethod.FAILED,
      executionTime: 0,
      error: 'All resolution tiers failed'
    };
  }

  // =============================================================================
  // TIER IMPLEMENTATIONS
  // =============================================================================

  /**
   * Tier 1: AI Vision Resolution
   */
  private async resolveWithAIVision(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<CaptchaSolution> {
    const startTime = Date.now();

    try {
      if (!context.screenshot) {
        throw new Error('Screenshot required for AI vision');
      }

      const prompt = this.buildAIVisionPrompt(context.captchaType);
      const solution = await this.callAIVisionService(context.screenshot, prompt);

      return {
        success: !!solution,
        solution,
        confidence: solution ? 0.9 : 0,
        method: ResolutionMethod.AI_VISION,
        executionTime: Date.now() - startTime,
        cost: this.calculateAIVisionCost()
      };

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        method: ResolutionMethod.AI_VISION,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Tier 2: OCR Resolution
   */
  private async resolveWithOCR(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<CaptchaSolution> {
    const startTime = Date.now();

    try {
      if (!context.screenshot) {
        throw new Error('Screenshot required for OCR');
      }

      // Try Tesseract first
      let solution = await this.runTesseractOCR(context.screenshot);
      
      // Fallback to cloud OCR if available and Tesseract fails
      if (!solution && this.config.ocr.cloudProvider && this.config.ocr.cloudApiKey) {
        solution = await this.runCloudOCR(context.screenshot);
      }

      const confidence = this.calculateOCRConfidence(solution, context.captchaType);

      return {
        success: !!solution && confidence > 0.6,
        solution,
        confidence,
        method: ResolutionMethod.OCR_TESSERACT,
        executionTime: Date.now() - startTime,
        cost: 0 // Free for Tesseract
      };

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        method: ResolutionMethod.OCR_TESSERACT,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Tier 3: External Service Resolution
   */
  private async resolveWithExternalService(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<CaptchaSolution> {
    const startTime = Date.now();

    try {
      // Try 2captcha first if configured
      if (this.config.externalServices.twoCaptcha?.apiKey) {
        const solution = await this.resolve2Captcha(context);
        if (solution) {
          return {
            success: true,
            solution,
            confidence: 0.95,
            method: ResolutionMethod.EXTERNAL_SERVICE,
            executionTime: Date.now() - startTime,
            cost: this.calculate2CaptchaCost(context.captchaType)
          };
        }
      }

      // Try other services...
      throw new Error('No external service available or all failed');

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        method: ResolutionMethod.EXTERNAL_SERVICE,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Tier 4: Behavioral Bypass
   */
  private async resolveWithBehavioralBypass(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<CaptchaSolution> {
    const startTime = Date.now();

    try {
      // Implement human-like behavioral patterns
      await this.simulateHumanBehavior(context);
      
      // Check if captcha was bypassed
      const bypassed = await this.checkCaptchaBypassed(context);

      return {
        success: bypassed,
        confidence: bypassed ? 0.8 : 0,
        method: ResolutionMethod.BEHAVIORAL_BYPASS,
        executionTime: Date.now() - startTime,
        cost: 0
      };

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        method: ResolutionMethod.BEHAVIORAL_BYPASS,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Tier 5: Manual Intervention
   */
  private async resolveWithManualIntervention(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<CaptchaSolution> {
    const startTime = Date.now();

    try {
      console.log(`👤 [${sessionId}] Requesting manual intervention`);
      
      // Switch to headful mode
      await this.switchToHeadfulMode(context);
      
      // Notify user
      await this.notifyUserForManualSolution(context, sessionId);
      
      // Wait for manual resolution or timeout
      const solution = await this.waitForManualResolution(context, sessionId);

      return {
        success: !!solution,
        solution,
        confidence: solution ? 1.0 : 0,
        method: ResolutionMethod.MANUAL_INTERVENTION,
        executionTime: Date.now() - startTime,
        cost: 0
      };

    } catch (error) {
      return {
        success: false,
        confidence: 0,
        method: ResolutionMethod.MANUAL_INTERVENTION,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private canUseAIVision(captchaType: CaptchaType): boolean {
    return [CaptchaType.IMAGE, CaptchaType.TEXT, CaptchaType.CUSTOM].includes(captchaType);
  }

  private canUseOCR(captchaType: CaptchaType): boolean {
    return [CaptchaType.TEXT, CaptchaType.IMAGE].includes(captchaType);
  }

  private async captureContext(context: CaptchaContext): Promise<void> {
    if (!context.screenshot) {
      try {
        context.screenshot = await context.page.screenshot({ 
          clip: context.element ? await context.element.boundingBox() : undefined 
        });
      } catch (error) {
        console.warn(`⚠️ Failed to capture captcha screenshot: ${error}`);
      }
    }
  }

  private buildAIVisionPrompt(captchaType: CaptchaType): string {
    const basePrompt = `You are an expert captcha solver. Please analyze this captcha image and provide the solution.`;
    
    switch (captchaType) {
      case CaptchaType.TEXT:
        return `${basePrompt} This is a text-based captcha. Read and return exactly the characters shown.`;
      case CaptchaType.IMAGE:
        return `${basePrompt} This is an image captcha. Identify what is shown and return the answer.`;
      default:
        return `${basePrompt} Return only the solution, no explanation.`;
    }
  }

  private async callAIVisionService(screenshot: Buffer, prompt: string): Promise<string | null> {
    // Implementation would call Claude Vision API or OpenAI GPT-4V
    // For now, returning null to indicate not implemented
    return null;
  }

  private async runTesseractOCR(screenshot: Buffer): Promise<string | null> {
    // Implementation would use Tesseract.js or system Tesseract
    // For now, returning null to indicate not implemented
    return null;
  }

  private async runCloudOCR(screenshot: Buffer): Promise<string | null> {
    // Implementation would use AWS Textract, Google Vision, or Azure OCR
    return null;
  }

  private calculateOCRConfidence(solution: string | null, captchaType: CaptchaType): number {
    if (!solution) return 0;
    
    // Basic confidence calculation based on solution characteristics
    let confidence = 0.5;
    
    if (captchaType === CaptchaType.TEXT && /^[A-Za-z0-9]{4,8}$/.test(solution)) {
      confidence = 0.8;
    }
    
    return confidence;
  }

  private async resolve2Captcha(context: CaptchaContext): Promise<string | null> {
    // Implementation would integrate with 2captcha API
    return null;
  }

  private async simulateHumanBehavior(context: CaptchaContext): Promise<void> {
    const { page } = context;
    
    // Random mouse movements
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      await page.mouse.move(x, y, { steps: 10 });
      await this.randomDelay();
    }
    
    // Random scrolling
    await page.mouse.wheel(0, Math.random() * 100 - 50);
    await this.randomDelay();
  }

  private async checkCaptchaBypassed(context: CaptchaContext): Promise<boolean> {
    // Check if captcha elements are no longer visible
    try {
      const element = context.element;
      if (!element) return false;
      
      const isVisible = await element.isVisible({ timeout: 2000 });
      return !isVisible;
    } catch {
      return true; // Assume bypassed if can't check
    }
  }

  private async switchToHeadfulMode(context: CaptchaContext): Promise<void> {
    // This would be handled by the BrowserAutomationService
    this.emit('request-headful-mode', { 
      jobId: context.jobId, 
      reason: 'manual-captcha-resolution' 
    });
  }

  private async notifyUserForManualSolution(context: CaptchaContext, sessionId: string): Promise<void> {
    const notification = {
      type: 'captcha-manual-intervention',
      sessionId,
      jobId: context.jobId,
      captchaType: context.captchaType,
      url: context.url,
      message: 'Manual captcha resolution required',
      timestamp: new Date()
    };

    this.emit('manual-intervention-required', notification);
  }

  private async waitForManualResolution(
    context: CaptchaContext, 
    sessionId: string
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null);
      }, this.config.manual.timeout);

      // Listen for manual resolution event
      const onResolved = (data: any) => {
        if (data.sessionId === sessionId) {
          clearTimeout(timeout);
          this.off('manual-resolution-provided', onResolved);
          resolve(data.solution);
        }
      };

      this.on('manual-resolution-provided', onResolved);
    });
  }

  private checkCache(context: CaptchaContext): CaptchaSolution | null {
    // Simple cache key based on captcha type and screenshot hash
    // In production, would use more sophisticated caching
    return null;
  }

  private cacheSuccessfulSolution(context: CaptchaContext, solution: CaptchaSolution): void {
    // Cache successful solutions for reuse
    // Implementation would hash screenshot and store solution
  }

  private updateMethodStats(method: ResolutionMethod): void {
    if (!this.stats.resolutionMethods[method]) {
      this.stats.resolutionMethods[method] = 0;
    }
    this.stats.resolutionMethods[method]++;
  }

  private updateStats(): void {
    this.stats.successRate = this.stats.totalEncountered > 0 ? 
      (this.stats.successfullyResolved / this.stats.totalEncountered) * 100 : 0;
    
    this.store.set('stats', this.stats);
  }

  private loadCachedSolutions(): void {
    const cache = this.store.get('cache') as Record<string, CaptchaSolution>;
    for (const [key, solution] of Object.entries(cache)) {
      this.resolutionCache.set(key, solution);
    }
  }

  private calculateAIVisionCost(): number {
    return 0.01; // Approximate cost per API call
  }

  private calculate2CaptchaCost(captchaType: CaptchaType): number {
    const costs = {
      [CaptchaType.TEXT]: 0.5,
      [CaptchaType.IMAGE]: 1.0,
      [CaptchaType.RECAPTCHA_V2]: 2.0,
      [CaptchaType.HCAPTCHA]: 2.0,
      [CaptchaType.CLOUDFLARE]: 3.0
    };
    return costs[captchaType] || 1.0;
  }

  private async randomDelay(min: number = 100, max: number = 500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get captcha resolution statistics
   */
  getStats(): CaptchaStats {
    return { ...this.stats };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CaptchaConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Provide manual solution for a captcha session
   */
  provideManualSolution(sessionId: string, solution: string): void {
    this.emit('manual-resolution-provided', { sessionId, solution });
  }

  /**
   * Get active captcha sessions
   */
  getActiveSessions(): Map<string, CaptchaContext> {
    return new Map(this.activeSessions);
  }
}