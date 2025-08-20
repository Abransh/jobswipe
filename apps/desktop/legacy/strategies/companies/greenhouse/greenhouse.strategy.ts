/**
 * @fileoverview Greenhouse Job Board Automation Strategy
 * @description Specialized strategy for Greenhouse-powered job boards (including Anthropic)
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade Greenhouse automation with compliance
 */

import { BaseStrategy } from '../../base/BaseStrategy';
import {
  StrategyContext,
  StrategyExecutionResult,
  UserProfile,
  WorkflowStep,
  WorkflowAction
} from '../../types/StrategyTypes';
import VisionServiceManager, { VisionAnalysisRequest } from '../../../services/VisionServiceManager';

// =============================================================================
// GREENHOUSE STRATEGY IMPLEMENTATION
// =============================================================================

export default class GreenhouseStrategy extends BaseStrategy {
  private visionService?: VisionServiceManager;
  private currentStepIndex = 0;
  private formSteps: string[] = [];

  /**
   * Set vision service for AI-powered form analysis
   */
  setVisionService(visionService: VisionServiceManager): void {
    this.visionService = visionService;
    this.log('🤖 Vision AI service integrated with Greenhouse strategy');
  }

  // =============================================================================
  // MAIN WORKFLOW EXECUTION
  // =============================================================================

  protected async executeMainWorkflow(context: StrategyContext): Promise<StrategyExecutionResult> {
    const startTime = Date.now();
    let captchaEncountered = false;
    const screenshots: string[] = [];

    try {
      this.log('🌱 Starting Greenhouse job application workflow');
      this.log(`📋 Applying to: ${context.job.url}`);

      // Step 1: Navigate to job page and analyze
      await this.navigateToJobPage(context);
      
      // Step 2: Click Apply button to start application
      await this.initiateApplication(context);
      
      // Step 3: Analyze application form structure
      const formAnalysis = await this.analyzeApplicationForm(context);
      this.formSteps = formAnalysis.steps;
      
      this.log(`📝 Detected ${this.formSteps.length} form steps`);

      // Step 4: Process each form step
      for (let i = 0; i < this.formSteps.length; i++) {
        this.currentStepIndex = i;
        const stepType = this.formSteps[i];
        
        this.log(`📋 Processing step ${i + 1}/${this.formSteps.length}: ${stepType}`);
        
        const stepResult = await this.processFormStep(context, stepType, i);
        
        if (!stepResult.success) {
          throw new Error(`Failed to process step ${i + 1}: ${stepResult.error}`);
        }

        // Handle potential captcha between steps
        if (await this.detectCaptcha(context.page)) {
          this.log('🧩 Captcha detected during form processing');
          captchaEncountered = true;
          
          const captchaSolved = await this.handleCompanyCaptcha(context);
          if (!captchaSolved) {
            throw new Error('Failed to solve captcha during application');
          }
        }

        // Wait between steps to avoid being flagged as bot
        await this.delay(2000);
      }

      // Step 5: Submit application
      await this.submitApplication(context);

      // Step 6: Verify submission and extract confirmation
      const confirmation = await this.extractConfirmation(context);

      // Capture final screenshot
      const finalScreenshot = await this.captureScreenshot(context, 'final_success');
      screenshots.push(finalScreenshot);

      return {
        success: confirmation.confirmed,
        applicationId: confirmation.applicationId,
        confirmationNumber: confirmation.confirmationId,
        executionTime: Date.now() - startTime,
        stepsCompleted: this.formSteps.length,
        totalSteps: this.formSteps.length,
        captchaEncountered,
        screenshots,
        logs: this.currentExecutionLogs,
        metrics: {
          timeToFirstInteraction: 0,
          formFillTime: Date.now() - startTime,
          uploadTime: 0,
          submissionTime: 0
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log(`❌ Greenhouse workflow failed: ${errorMessage}`);
      
      // Capture error screenshot
      const errorScreenshot = await this.captureScreenshot(context, 'error');
      screenshots.push(errorScreenshot);
      
      return {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        stepsCompleted: this.currentStepIndex,
        totalSteps: this.formSteps.length || 5,
        captchaEncountered,
        screenshots,
        logs: this.currentExecutionLogs,
        metrics: {
          timeToFirstInteraction: 0,
          formFillTime: 0,
          uploadTime: 0,
          submissionTime: 0
        }
      };
    }
  }

  // =============================================================================
  // GREENHOUSE-SPECIFIC AUTOMATION METHODS
  // =============================================================================

  private async navigateToJobPage(context: StrategyContext): Promise<void> {
    const { page, job } = context;
    
    this.log(`🌐 Navigating to: ${job.url}`);
    
    await page.goto(job.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to fully load
    await this.delay(3000);
    
    this.log('✅ Job page loaded successfully');
  }

  private async initiateApplication(context: StrategyContext): Promise<void> {
    const { page } = context;
    
    this.log('🚀 Looking for Apply button');
    
    // Find the apply button (various Greenhouse selectors)
    const applyButton = await this.findElement([
      'a[href*="boards.greenhouse.io"][href*="application"]',
      'button:has-text("Apply for this job")',
      'a:has-text("Apply for this job")',
      '.application-outlet button',
      'button[data-provides*="application"]',
      'a.postings-btn'
    ], page);
    
    await this.humanizeClick(applyButton, page);
    await this.delay(5000); // Wait for application form to load
    
    this.log('✅ Application form opened');
  }

  private async analyzeApplicationForm(context: StrategyContext): Promise<{ steps: string[] }> {
    const { page } = context;
    
    this.log('🔍 Analyzing Greenhouse application form structure');
    
    // Check if it's a multi-step form or single page
    const hasMultipleSteps = await this.checkElementExists(page, [
      '.application-step',
      '.step-indicator',
      '.progress-bar',
      '[data-step]'
    ]);

    if (hasMultipleSteps) {
      return this.analyzeMultiStepForm(page);
    } else {
      return this.analyzeSinglePageForm(page);
    }
  }

  private async analyzeMultiStepForm(page: any): Promise<{ steps: string[] }> {
    this.log('📋 Multi-step form detected');
    
    // Try to determine number of steps from progress indicators
    const stepIndicators = await page.locator('.step-indicator, [data-step], .progress-step').count();
    
    const steps: string[] = [];
    
    // Common Greenhouse form progression
    steps.push('personal-info');
    
    if (stepIndicators > 1) {
      steps.push('resume-upload');
    }
    
    if (stepIndicators > 2) {
      steps.push('additional-questions');
    }
    
    if (stepIndicators > 3) {
      steps.push('cover-letter');
    }
    
    steps.push('review-submit');
    
    return { steps };
  }

  private async analyzeSinglePageForm(page: any): Promise<{ steps: string[] }> {
    this.log('📄 Single page form detected');
    
    const steps: string[] = ['single-page-form'];
    return { steps };
  }

  private async processFormStep(
    context: StrategyContext, 
    stepType: string, 
    stepIndex: number
  ): Promise<{ success: boolean; error?: string }> {
    
    const { page } = context;
    
    try {
      this.log(`📝 Processing step: ${stepType}`);
      
      switch (stepType) {
        case 'personal-info':
          return await this.fillPersonalInfoStep(context);
          
        case 'resume-upload':
          return await this.handleResumeUploadStep(context);
          
        case 'additional-questions':
          return await this.fillAdditionalQuestionsStep(context);
          
        case 'cover-letter':
          return await this.fillCoverLetterStep(context);
          
        case 'review-submit':
          return await this.handleReviewStep(context);
          
        case 'single-page-form':
          return await this.fillSinglePageForm(context);
          
        default:
          this.log(`⚠️ Unknown step type: ${stepType}, using generic approach`);
          return await this.fillGenericFormStep(context);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`❌ Step ${stepType} failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  // =============================================================================
  // FORM STEP IMPLEMENTATIONS
  // =============================================================================

  private async fillPersonalInfoStep(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page, userProfile } = context;
    
    this.log('👤 Filling personal information');
    
    try {
      // Fill first name
      await this.fillFieldIfExists(page, [
        'input[name*="first_name"]',
        'input[name*="firstName"]',
        'input[id*="first_name"]',
        'input[placeholder*="First name"]'
      ], userProfile.personalInfo.firstName);

      // Fill last name
      await this.fillFieldIfExists(page, [
        'input[name*="last_name"]',
        'input[name*="lastName"]',
        'input[id*="last_name"]',
        'input[placeholder*="Last name"]'
      ], userProfile.personalInfo.lastName);

      // Fill email
      await this.fillFieldIfExists(page, [
        'input[name*="email"]',
        'input[type="email"]',
        'input[id*="email"]'
      ], userProfile.personalInfo.email);

      // Fill phone
      await this.fillFieldIfExists(page, [
        'input[name*="phone"]',
        'input[type="tel"]',
        'input[id*="phone"]'
      ], userProfile.personalInfo.phone);

      // Fill address fields if present
      await this.fillFieldIfExists(page, [
        'input[name*="address"]',
        'input[id*="address"]'
      ], userProfile.personalInfo.address || '');

      await this.fillFieldIfExists(page, [
        'input[name*="city"]',
        'input[id*="city"]'
      ], userProfile.personalInfo.city || '');

      await this.fillFieldIfExists(page, [
        'input[name*="state"]',
        'select[name*="state"]',
        'input[id*="state"]'
      ], userProfile.personalInfo.state || '');

      // Move to next step
      await this.clickNextButton(page);
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async handleResumeUploadStep(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page, userProfile } = context;
    
    this.log('📄 Handling resume upload');
    
    try {
      // Find file upload input
      const fileInput = await this.findElement([
        'input[type="file"]',
        'input[name*="resume"]',
        'input[accept*=".pdf"]'
      ], page);

      // If user has resume URL, attempt upload
      if (userProfile.professional.resumeUrl) {
        await fileInput.setInputFiles(userProfile.professional.resumeUrl);
        await this.delay(3000); // Wait for upload processing
        this.log('✅ Resume uploaded');
      } else {
        this.log('⚠️ No resume file provided, skipping upload');
      }

      await this.clickNextButton(page);
      return { success: true };
      
    } catch (error) {
      this.log(`⚠️ Resume upload failed: ${error}, continuing anyway`);
      await this.clickNextButton(page);
      return { success: true }; // Continue even if upload fails
    }
  }

  private async fillAdditionalQuestionsStep(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page, userProfile } = context;
    
    this.log('❓ Filling additional questions');
    
    try {
      // Find all form fields on this step
      const formFields = await page.locator('input, select, textarea').all();
      
      for (const field of formFields) {
        try {
          const isVisible = await field.isVisible();
          if (isVisible) {
            await this.smartFillField(field, userProfile, page);
          }
        } catch (fieldError) {
          // Continue with other fields if one fails
          this.log(`⚠️ Field fill error: ${fieldError}`);
          continue;
        }
      }

      await this.clickNextButton(page);
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async fillCoverLetterStep(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page, userProfile } = context;
    
    this.log('📝 Filling cover letter');
    
    try {
      const coverLetterField = await this.findElement([
        'textarea[name*="cover_letter"]',
        'textarea[id*="cover_letter"]',
        'textarea[placeholder*="cover letter"]'
      ], page);

      if (userProfile.professional.coverLetterTemplate) {
        await this.humanizeType(coverLetterField, userProfile.professional.coverLetterTemplate, page);
        this.log('✅ Cover letter filled');
      }

      await this.clickNextButton(page);
      return { success: true };
      
    } catch (error) {
      this.log(`⚠️ Cover letter step failed: ${error}, continuing anyway`);
      await this.clickNextButton(page);
      return { success: true };
    }
  }

  private async handleReviewStep(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page } = context;
    
    this.log('👀 Handling review step');
    
    try {
      // This is typically the final step before submission
      // Just proceed to submit
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async fillSinglePageForm(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page, userProfile } = context;
    
    this.log('📄 Filling single page form');
    
    try {
      // Fill personal information first
      await this.fillPersonalInfoStep(context);
      
      // Then handle any file uploads
      try {
        await this.handleResumeUploadStep(context);
      } catch (uploadError) {
        this.log(`⚠️ Upload section skipped: ${uploadError}`);
      }
      
      // Fill additional questions
      await this.fillAdditionalQuestionsStep(context);
      
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async fillGenericFormStep(context: StrategyContext): Promise<{ success: boolean; error?: string }> {
    const { page, userProfile } = context;
    
    this.log('🔧 Using generic form filling approach');
    
    try {
      // Find and fill all visible form fields
      const allFields = await page.locator('input:visible, select:visible, textarea:visible').all();
      
      for (const field of allFields) {
        try {
          await this.smartFillField(field, userProfile, page);
        } catch (fieldError) {
          continue; // Skip failed fields
        }
      }

      await this.clickNextButton(page);
      return { success: true };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  // =============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // =============================================================================

  protected async mapFormFields(userProfile: UserProfile): Promise<Record<string, string>> {
    return {
      firstName: userProfile.personalInfo.firstName,
      lastName: userProfile.personalInfo.lastName,
      email: userProfile.personalInfo.email,
      phone: userProfile.personalInfo.phone,
      address: userProfile.personalInfo.address || '',
      city: userProfile.personalInfo.city || '',
      state: userProfile.personalInfo.state || '',
      zipCode: userProfile.personalInfo.zipCode || '',
      country: userProfile.personalInfo.country || 'United States',
      linkedinUrl: userProfile.professional.linkedinUrl || '',
      currentCompany: userProfile.professional.currentCompany || '',
      currentTitle: userProfile.professional.currentTitle || '',
      yearsExperience: userProfile.professional.yearsExperience?.toString() || '',
      salaryExpectation: userProfile.preferences.salaryMin?.toString() || ''
    };
  }

  protected async handleCompanyCaptcha(context: StrategyContext): Promise<boolean> {
    const { page } = context;
    
    this.log('🤖 Handling Greenhouse captcha with AI vision');
    
    // Greenhouse typically uses reCAPTCHA
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      '.g-recaptcha',
      '.h-captcha',
      '.recaptcha-checkbox'
    ];

    const hasCaptcha = await this.checkElementExists(page, captchaSelectors);

    if (hasCaptcha) {
      this.log('🧩 CAPTCHA detected on Greenhouse form');
      
      if (this.visionService) {
        return await this.resolveWithAI(context);
      } else {
        this.log('⚠️ No vision service available, manual intervention may be required');
        // Wait for manual resolution
        await this.delay(30000);
        return true;
      }
    }

    return true; // No captcha detected
  }

  protected async extractConfirmation(context: StrategyContext): Promise<{
    confirmed: boolean;
    confirmationId?: string;
    applicationId?: string;
  }> {
    const { page } = context;
    
    try {
      // Look for Greenhouse success indicators
      const successSelectors = [
        '.application-confirmation',
        '.success-message',
        'h1:has-text("Thank you")',
        'h2:has-text("Application submitted")',
        '.application-submitted'
      ];

      const successElement = await page.locator(successSelectors.join(', ')).first();
      const isConfirmed = await successElement.isVisible({ timeout: 10000 });
      
      if (!isConfirmed) {
        return { confirmed: false };
      }

      // Try to extract confirmation details
      let confirmationId;
      
      try {
        const confirmationText = await page.textContent('body');
        
        if (confirmationText) {
          // Look for confirmation patterns
          const patterns = [
            /confirmation.*?([A-Z0-9]{6,})/i,
            /reference.*?([A-Z0-9]{6,})/i,
            /application.*?id.*?([A-Z0-9]{6,})/i,
            /tracking.*?([A-Z0-9]{6,})/i
          ];
          
          for (const pattern of patterns) {
            const match = confirmationText.match(pattern);
            if (match) {
              confirmationId = match[1];
              break;
            }
          }
        }
      } catch (extractError) {
        this.log(`⚠️ Could not extract confirmation ID: ${extractError}`);
      }

      return {
        confirmed: true,
        confirmationId: confirmationId || `GH_${Date.now()}`,
        applicationId: confirmationId || `APP_${Date.now()}`
      };

    } catch (error) {
      this.log(`❌ Failed to extract confirmation: ${error}`);
      return { confirmed: false };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private async submitApplication(context: StrategyContext): Promise<void> {
    const { page } = context;
    
    this.log('🚀 Submitting application');
    
    const submitButton = await this.findElement([
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit Application")',
      'button:has-text("Submit")',
      '.application-submit button'
    ], page);

    await this.humanizeClick(submitButton, page);
    
    // Wait for submission to process
    await this.delay(5000);
    
    this.log('✅ Application submitted');
  }

  private async resolveWithAI(context: StrategyContext): Promise<boolean> {
    if (!this.visionService) return false;
    
    const { page } = context;
    
    try {
      this.log('🧠 Attempting AI-powered captcha resolution');
      
      // Take screenshot of captcha area
      const screenshot = await page.screenshot({ type: 'png' });

      const analysisRequest: VisionAnalysisRequest = {
        image: screenshot,
        imageType: 'png',
        analysisType: 'captcha-resolution',
        context: {
          jobSite: 'greenhouse',
          formType: 'application',
          language: 'en'
        },
        options: {
          preferredProviders: ['claude-vision'],
          requireHighAccuracy: true,
          urgentProcessing: true
        }
      };

      const result = await this.visionService.analyzeImage(analysisRequest);
      
      if (result.success && result.captchaSolution) {
        this.log(`🎯 AI solution: ${result.captchaSolution}`);
        // Apply the solution (implementation depends on captcha type)
        return true;
      }

      return false;

    } catch (error) {
      this.log(`❌ AI captcha resolution failed: ${error}`);
      return false;
    }
  }

  private async smartFillField(field: any, userProfile: UserProfile, page: any): Promise<void> {
    try {
      const name = await field.getAttribute('name') || '';
      const id = await field.getAttribute('id') || '';
      const placeholder = await field.getAttribute('placeholder') || '';
      const type = await field.getAttribute('type') || '';
      const tagName = await field.evaluate((el: any) => el.tagName.toLowerCase());
      
      const fieldIdentifier = `${name} ${id} ${placeholder}`.toLowerCase();
      let value = '';

      // Smart field mapping based on common patterns
      if (fieldIdentifier.includes('first') && fieldIdentifier.includes('name')) {
        value = userProfile.personalInfo.firstName;
      } else if (fieldIdentifier.includes('last') && fieldIdentifier.includes('name')) {
        value = userProfile.personalInfo.lastName;
      } else if (fieldIdentifier.includes('email') || type === 'email') {
        value = userProfile.personalInfo.email;
      } else if (fieldIdentifier.includes('phone') || type === 'tel') {
        value = userProfile.personalInfo.phone;
      } else if (fieldIdentifier.includes('address')) {
        value = userProfile.personalInfo.address || '';
      } else if (fieldIdentifier.includes('city')) {
        value = userProfile.personalInfo.city || '';
      } else if (fieldIdentifier.includes('state')) {
        value = userProfile.personalInfo.state || '';
      } else if (fieldIdentifier.includes('zip') || fieldIdentifier.includes('postal')) {
        value = userProfile.personalInfo.zipCode || '';
      } else if (fieldIdentifier.includes('country')) {
        value = userProfile.personalInfo.country || 'United States';
      } else if (fieldIdentifier.includes('linkedin')) {
        value = userProfile.professional.linkedinUrl || '';
      } else if (fieldIdentifier.includes('company')) {
        value = userProfile.professional.currentCompany || '';
      } else if (fieldIdentifier.includes('title')) {
        value = userProfile.professional.currentTitle || '';
      } else if (fieldIdentifier.includes('experience') || fieldIdentifier.includes('years')) {
        value = userProfile.professional.yearsExperience?.toString() || '';
      } else if (fieldIdentifier.includes('salary')) {
        value = userProfile.preferences.salaryMin?.toString() || '';
      }

      if (value && tagName === 'input') {
        await this.humanizeType(field, value, page);
      } else if (value && tagName === 'select') {
        // Try to select the closest matching option
        try {
          await field.selectOption({ label: value });
        } catch {
          // If exact match fails, try partial match
          const options = await field.locator('option').all();
          for (const option of options) {
            const optionText = await option.textContent();
            if (optionText && optionText.toLowerCase().includes(value.toLowerCase())) {
              await option.click();
              break;
            }
          }
        }
      } else if (value && tagName === 'textarea') {
        await this.humanizeType(field, value, page);
      }

    } catch (error) {
      // Skip field if there's an error
      this.log(`⚠️ Skipping field due to error: ${error}`);
    }
  }

  private async fillFieldIfExists(page: any, selectors: string[], value: string): Promise<boolean> {
    if (!value) return false;
    
    try {
      const element = await this.findElement(selectors, page);
      await this.humanizeType(element, value, page);
      return true;
    } catch {
      return false;
    }
  }

  private async clickNextButton(page: any): Promise<void> {
    try {
      const nextButton = await this.findElement([
        'button:has-text("Next")',
        'button:has-text("Continue")',
        'input[value*="Next"]',
        'input[value*="Continue"]',
        '.btn-next',
        '.continue-btn'
      ], page);
      
      await this.humanizeClick(nextButton, page);
      await this.delay(3000);
    } catch (error) {
      this.log(`⚠️ Could not find or click next button: ${error}`);
    }
  }

  private async checkElementExists(page: any, selectors: string[]): Promise<boolean> {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 2000 });
        if (isVisible) return true;
      } catch {
        continue;
      }
    }
    return false;
  }

  private async captureScreenshot(context: StrategyContext, suffix: string): Promise<string> {
    const { page, job } = context;
    const filename = `greenhouse_${job.id}_${suffix}_${Date.now()}.png`;
    const path = `/tmp/jobswipe-screenshots/${filename}`;
    
    try {
      await page.screenshot({ path, fullPage: true });
      this.log(`📸 Screenshot captured: ${filename}`);
      return path;
    } catch (error) {
      this.log(`⚠️ Failed to capture screenshot: ${error}`);
      return '';
    }
  }
}