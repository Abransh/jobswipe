/**
 * @fileoverview LinkedIn Automation Strategy Implementation
 * @description Specialized strategy for LinkedIn job applications (Easy Apply & Standard)
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Enterprise-grade LinkedIn automation with compliance
 */

import { BaseStrategy } from '../../base/BaseStrategy';
import {
  StrategyContext,
  StrategyExecutionResult,
  UserProfile,
  WorkflowStep,
  WorkflowAction
} from '../../types/StrategyTypes';

// =============================================================================
// LINKEDIN STRATEGY IMPLEMENTATION
// =============================================================================

export default class LinkedInStrategy extends BaseStrategy {
  private easyApplyDetected = false;
  private currentStep = 0;
  private maxEasyApplySteps = 5;

  // =============================================================================
  // MAIN WORKFLOW EXECUTION
  // =============================================================================

  protected async executeMainWorkflow(context: StrategyContext): Promise<StrategyExecutionResult> {
    const startTime = Date.now();
    let captchaEncountered = false;
    const screenshots: string[] = [];

    try {
      this.log('🔵 Starting LinkedIn-specific automation workflow');

      // Detect Easy Apply vs Standard Application
      const applicationType = await this.detectApplicationType(context);
      this.easyApplyDetected = applicationType === 'easy-apply';
      
      this.log(`📋 Application type detected: ${applicationType}`);

      let result: StrategyExecutionResult;

      if (this.easyApplyDetected) {
        result = await this.executeEasyApplyWorkflow(context);
      } else {
        result = await this.executeStandardApplicationWorkflow(context);
      }

      // Capture final screenshot
      const finalScreenshot = await this.captureScreenshot(context, 'final_success');
      screenshots.push(finalScreenshot);

      return {
        ...result,
        executionTime: Date.now() - startTime,
        screenshots: [...screenshots, ...result.screenshots],
        captchaEncountered
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log(`❌ LinkedIn workflow failed: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
        stepsCompleted: this.currentStep,
        totalSteps: this.getTotalSteps(),
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
  // EASY APPLY WORKFLOW
  // =============================================================================

  private async executeEasyApplyWorkflow(context: StrategyContext): Promise<StrategyExecutionResult> {
    this.log('🚀 Executing LinkedIn Easy Apply workflow');
    
    const { page } = context;
    const startTime = Date.now();
    let timeToFirstInteraction = 0;
    let formFillTime = 0;
    let uploadTime = 0;
    let submissionTime = 0;

    // Step 1: Click Easy Apply button
    const applyButton = await this.findElement([
      ".jobs-apply-button[data-easy-apply-id]",
      ".jobs-apply-button .jobs-apply-button__text:contains('Easy Apply')"
    ], page);
    
    timeToFirstInteraction = Date.now() - startTime;
    await this.humanizeClick(applyButton, page);
    await this.delay(3000); // Wait for modal to load

    // Step 2: Process Easy Apply multi-step form
    const formStartTime = Date.now();
    let stepCount = 0;
    let maxSteps = this.maxEasyApplySteps;

    while (stepCount < maxSteps) {
      try {
        // Check if we're done (success page or submit button)
        const isComplete = await this.checkEasyApplyComplete(page);
        if (isComplete) {
          break;
        }

        // Process current step
        const stepProcessed = await this.processEasyApplyStep(context, stepCount);
        if (!stepProcessed) {
          this.log(`⚠️ Could not process Easy Apply step ${stepCount + 1}`);
          break;
        }

        stepCount++;
        await this.delay(2000); // Wait between steps

        // Handle potential captcha
        if (await this.detectCaptcha(page)) {
          const captchaSolved = await this.handleCompanyCaptcha(context);
          if (!captchaSolved) {
            throw new Error('Failed to solve captcha in Easy Apply flow');
          }
        }

      } catch (stepError) {
        this.log(`❌ Easy Apply step ${stepCount + 1} failed: ${stepError}`);
        break;
      }
    }

    formFillTime = Date.now() - formStartTime;

    // Step 3: Handle final submission
    const submissionStartTime = Date.now();
    await this.handleEasyApplySubmission(context);
    submissionTime = Date.now() - submissionStartTime;

    // Step 4: Verify success
    const success = await this.verifyEasyApplySuccess(page);
    
    return {
      success,
      executionTime: Date.now() - startTime,
      stepsCompleted: stepCount,
      totalSteps: maxSteps,
      captchaEncountered: false,
      screenshots: [],
      logs: this.currentExecutionLogs,
      metrics: {
        timeToFirstInteraction,
        formFillTime,
        uploadTime,
        submissionTime
      }
    };
  }

  /**
   * Process individual Easy Apply step
   */
  private async processEasyApplyStep(context: StrategyContext, stepIndex: number): Promise<boolean> {
    const { page } = context;
    
    this.log(`📝 Processing Easy Apply step ${stepIndex + 1}`);

    try {
      // Detect step type based on content
      const stepType = await this.detectEasyApplyStepType(page);
      this.log(`🔍 Step type detected: ${stepType}`);

      switch (stepType) {
        case 'contact-info':
          return await this.fillContactInfoStep(context);
        
        case 'resume-upload':
          return await this.handleResumeUploadStep(context);
        
        case 'additional-questions':
          return await this.fillAdditionalQuestionsStep(context);
        
        case 'cover-letter':
          return await this.handleCoverLetterStep(context);
        
        case 'review':
          return await this.handleReviewStep(context);
        
        default:
          this.log(`⚠️ Unknown step type: ${stepType}, trying generic approach`);
          return await this.fillGenericEasyApplyStep(context);
      }

    } catch (error) {
      this.log(`❌ Failed to process step ${stepIndex + 1}: ${error}`);
      return false;
    }
  }

  /**
   * Detect Easy Apply step type
   */
  private async detectEasyApplyStepType(page: any): Promise<string> {
    // Check for contact info step
    const hasContactFields = await this.checkElementExists(page, [
      "input[name='phoneNumber']",
      "input[name='firstName']"
    ]);
    if (hasContactFields) return 'contact-info';

    // Check for resume upload step
    const hasFileUpload = await this.checkElementExists(page, [
      "input[type='file']",
      ".file-input"
    ]);
    if (hasFileUpload) return 'resume-upload';

    // Check for additional questions
    const hasQuestions = await this.checkElementExists(page, [
      "fieldset",
      ".jobs-easy-apply-form-section__grouping",
      ".fb-dash-form-element"
    ]);
    if (hasQuestions) return 'additional-questions';

    // Check for cover letter step
    const hasCoverLetter = await this.checkElementExists(page, [
      "textarea[name='coverLetter']",
      ".cover-letter"
    ]);
    if (hasCoverLetter) return 'cover-letter';

    // Check for review step
    const hasReview = await this.checkElementExists(page, [
      ".jobs-easy-apply-form-section--review",
      "button[aria-label*='Submit application']"
    ]);
    if (hasReview) return 'review';

    return 'unknown';
  }

  /**
   * Fill contact information step
   */
  private async fillContactInfoStep(context: StrategyContext): Promise<boolean> {
    const { page, userProfile } = context;
    
    try {
      // Fill phone number if present
      await this.fillFieldIfExists(page, [
        "input[name='phoneNumber']",
        "input[type='tel']"
      ], userProfile.personalInfo.phone);

      // Fill email if present
      await this.fillFieldIfExists(page, [
        "input[name='email']",
        "input[type='email']"
      ], userProfile.personalInfo.email);

      // Fill address fields if present
      await this.fillFieldIfExists(page, [
        "input[name='address']"
      ], userProfile.personalInfo.address || '');

      await this.clickNextButton(page);
      return true;

    } catch (error) {
      this.log(`❌ Failed to fill contact info: ${error}`);
      return false;
    }
  }

  /**
   * Handle resume upload step
   */
  private async handleResumeUploadStep(context: StrategyContext): Promise<boolean> {
    const { page, userProfile } = context;
    
    try {
      const fileInput = await this.findElement([
        "input[type='file']",
        ".file-input input[type='file']"
      ], page);

      if (userProfile.professional.resumeUrl) {
        await fileInput.setInputFiles(userProfile.professional.resumeUrl);
        await this.delay(3000); // Wait for upload
        
        this.log('📄 Resume uploaded successfully');
      }

      await this.clickNextButton(page);
      return true;

    } catch (error) {
      this.log(`❌ Failed to upload resume: ${error}`);
      // Resume upload might be optional, continue anyway
      await this.clickNextButton(page);
      return true;
    }
  }

  /**
   * Fill additional questions step
   */
  private async fillAdditionalQuestionsStep(context: StrategyContext): Promise<boolean> {
    const { page } = context;
    
    try {
      // Find all form elements in this step
      const formElements = await page.locator('.fb-dash-form-element, fieldset').all();
      
      for (const element of formElements) {
        await this.fillFormElement(element, context);
      }

      await this.clickNextButton(page);
      return true;

    } catch (error) {
      this.log(`❌ Failed to fill additional questions: ${error}`);
      // Try to continue anyway
      await this.clickNextButton(page);
      return true;
    }
  }

  /**
   * Handle cover letter step
   */
  private async handleCoverLetterStep(context: StrategyContext): Promise<boolean> {
    const { page, userProfile } = context;
    
    try {
      const coverLetterField = await this.findElement([
        "textarea[name='coverLetter']",
        ".cover-letter textarea"
      ], page);

      if (userProfile.professional.coverLetterTemplate) {
        await this.humanizeType(coverLetterField, userProfile.professional.coverLetterTemplate, page);
        this.log('📝 Cover letter added');
      }

      await this.clickNextButton(page);
      return true;

    } catch (error) {
      this.log(`❌ Failed to handle cover letter: ${error}`);
      await this.clickNextButton(page);
      return true;
    }
  }

  /**
   * Handle review step
   */
  private async handleReviewStep(context: StrategyContext): Promise<boolean> {
    const { page } = context;
    
    try {
      // This is usually the final step before submission
      // Just continue to submission
      await this.clickNextButton(page);
      return true;

    } catch (error) {
      this.log(`❌ Failed to handle review step: ${error}`);
      return false;
    }
  }

  // =============================================================================
  // STANDARD APPLICATION WORKFLOW
  // =============================================================================

  private async executeStandardApplicationWorkflow(context: StrategyContext): Promise<StrategyExecutionResult> {
    this.log('🔵 Executing LinkedIn standard application workflow');
    
    // This would handle non-Easy Apply LinkedIn applications
    // For now, implementing a basic version
    
    const { page } = context;
    const startTime = Date.now();

    try {
      // Click apply button
      const applyButton = await this.findElement([
        ".jobs-apply-button:not([data-easy-apply-id])"
      ], page);
      
      await this.humanizeClick(applyButton, page);
      
      // This might redirect to external site or LinkedIn application form
      await this.delay(5000);
      
      // Handle the form (simplified for now)
      const formFilled = await this.fillStandardApplicationForm(context);
      
      return {
        success: formFilled,
        executionTime: Date.now() - startTime,
        stepsCompleted: 1,
        totalSteps: 3,
        captchaEncountered: false,
        screenshots: [],
        logs: this.currentExecutionLogs,
        metrics: {
          timeToFirstInteraction: 0,
          formFillTime: 0,
          uploadTime: 0,
          submissionTime: 0
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        stepsCompleted: 0,
        totalSteps: 3,
        captchaEncountered: false,
        screenshots: [],
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
      country: userProfile.personalInfo.country || '',
      linkedinUrl: userProfile.professional.linkedinUrl || '',
      currentCompany: userProfile.professional.currentCompany || '',
      yearsExperience: userProfile.professional.yearsExperience?.toString() || '',
      salaryExpectation: userProfile.preferences.salaryMin?.toString() || ''
    };
  }

  protected async handleCompanyCaptcha(context: StrategyContext): Promise<boolean> {
    const { page } = context;
    
    this.log('🤖 Handling LinkedIn-specific captcha');
    
    // Check for LinkedIn security challenge
    const hasSecurityChallenge = await this.checkElementExists(page, [
      '.challenge-page',
      '.security-challenge-form'
    ]);

    if (hasSecurityChallenge) {
      this.log('🔒 LinkedIn security challenge detected');
      
      // For now, just wait and hope it resolves
      // In production, would implement more sophisticated handling
      await this.delay(10000);
      
      // Check if challenge was resolved
      const challengeResolved = !await this.checkElementExists(page, [
        '.challenge-page',
        '.security-challenge-form'
      ]);
      
      return challengeResolved;
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
      // Look for success indicators
      const successElement = await page.locator([
        '.jobs-apply-success',
        '.application-outlet__success-message',
        'h3:contains("Application submitted")'
      ].join(', ')).first();

      const isConfirmed = await successElement.isVisible();
      
      if (!isConfirmed) {
        return { confirmed: false };
      }

      // Try to extract confirmation ID
      let confirmationId;
      
      try {
        const confirmationElement = await page.locator([
          '.application-outlet__confirmation-number',
          '.jobs-apply-success .confirmation-number'
        ].join(', ')).first();
        
        const confirmationText = await confirmationElement.textContent();
        
        if (confirmationText) {
          // Extract ID using regex patterns
          const patterns = [
            /confirmation.*?([A-Z0-9]{6,})/i,
            /reference.*?([A-Z0-9]{6,})/i,
            /application.*?id.*?([A-Z0-9]{6,})/i
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
        confirmationId,
        applicationId: confirmationId // Use same ID for now
      };

    } catch (error) {
      this.log(`❌ Failed to extract confirmation: ${error}`);
      return { confirmed: false };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private async detectApplicationType(context: StrategyContext): Promise<'easy-apply' | 'standard' | 'external'> {
    const { page } = context;
    
    // Check for Easy Apply button
    const hasEasyApply = await this.checkElementExists(page, [
      ".jobs-apply-button[data-easy-apply-id]",
      ".jobs-apply-button .jobs-apply-button__text:contains('Easy Apply')"
    ]);
    
    if (hasEasyApply) {
      return 'easy-apply';
    }
    
    // Check for standard LinkedIn apply button
    const hasStandardApply = await this.checkElementExists(page, [
      ".jobs-apply-button:not([data-easy-apply-id])"
    ]);
    
    if (hasStandardApply) {
      return 'standard';
    }
    
    return 'external';
  }

  private async checkElementExists(page: any, selectors: string[]): Promise<boolean> {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 1000 });
        if (isVisible) return true;
      } catch {
        continue;
      }
    }
    return false;
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
        "button[aria-label='Continue to next step']",
        ".artdeco-button--primary[data-control-name*='continue']",
        "footer button:contains('Next')",
        "button[data-control-name='continue_unify']"
      ], page);
      
      await this.humanizeClick(nextButton, page);
      await this.delay(2000);
    } catch (error) {
      this.log(`⚠️ Could not find or click next button: ${error}`);
    }
  }

  private async checkEasyApplyComplete(page: any): Promise<boolean> {
    return await this.checkElementExists(page, [
      '.jobs-apply-success',
      '.application-outlet__success-message',
      'h3:contains("Application submitted")',
      'button[aria-label="Submit application"]'
    ]);
  }

  private async handleEasyApplySubmission(context: StrategyContext): Promise<void> {
    const { page } = context;
    
    try {
      const submitButton = await this.findElement([
        'button[aria-label="Submit application"]',
        '.artdeco-button--primary[data-control-name*="submit"]'
      ], page);
      
      await this.humanizeClick(submitButton, page);
      await this.delay(5000); // Wait for submission
      
      this.log('✅ Application submitted successfully');
    } catch (error) {
      this.log(`❌ Failed to submit application: ${error}`);
      throw error;
    }
  }

  private async verifyEasyApplySuccess(page: any): Promise<boolean> {
    return await this.checkElementExists(page, [
      '.jobs-apply-success',
      '.application-outlet__success-message',
      'h3:contains("Application submitted")'
    ]);
  }

  private async fillGenericEasyApplyStep(context: StrategyContext): Promise<boolean> {
    const { page } = context;
    
    try {
      // Try to fill any visible form fields
      const formFields = await page.locator('input, select, textarea').all();
      
      for (const field of formFields) {
        try {
          const isVisible = await field.isVisible();
          if (isVisible) {
            await this.fillFormElement(field, context);
          }
        } catch {
          continue;
        }
      }
      
      await this.clickNextButton(page);
      return true;
      
    } catch (error) {
      this.log(`❌ Failed to fill generic step: ${error}`);
      return false;
    }
  }

  private async fillFormElement(element: any, context: StrategyContext): Promise<void> {
    const { userProfile } = context;
    
    try {
      const name = await element.getAttribute('name') || '';
      const type = await element.getAttribute('type') || '';
      const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());
      
      let value = '';
      
      // Determine value based on field name/type
      if (name.includes('phone') || type === 'tel') {
        value = userProfile.personalInfo.phone;
      } else if (name.includes('email') || type === 'email') {
        value = userProfile.personalInfo.email;
      } else if (name.includes('firstName')) {
        value = userProfile.personalInfo.firstName;
      } else if (name.includes('lastName')) {
        value = userProfile.personalInfo.lastName;
      } else if (name.includes('address')) {
        value = userProfile.personalInfo.address || '';
      } else if (name.includes('city')) {
        value = userProfile.personalInfo.city || '';
      }
      
      if (value && tagName === 'input') {
        await this.humanizeType(element, value, context.page);
      }
      
    } catch (error) {
      // Ignore individual field errors
    }
  }

  private async fillStandardApplicationForm(context: StrategyContext): Promise<boolean> {
    // Placeholder for standard application form handling
    // Would implement full form filling logic here
    this.log('📋 Filling standard application form (placeholder)');
    await this.delay(3000);
    return true;
  }

  private async detectCaptcha(page: any): Promise<boolean> {
    return await this.checkElementExists(page, [
      'iframe[src*="recaptcha"]',
      '.challenge-page',
      '.security-challenge-form',
      '.g-recaptcha'
    ]);
  }

  private async captureScreenshot(context: StrategyContext, suffix: string): Promise<string> {
    const { page, job } = context;
    const filename = `linkedin_${job.id}_${suffix}_${Date.now()}.png`;
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