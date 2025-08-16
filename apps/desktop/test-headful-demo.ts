#!/usr/bin/env npx tsx

/**
 * JobSwipe Headful Demo
 * 
 * Demonstrates the JobSwipe automation system with a VISIBLE browser
 * so you can watch the AI automation in action. Uses real Playwright
 * browser automation instead of mock services.
 */

import { chromium, Browser, Page } from 'playwright';
import { EventEmitter } from 'events';

// =============================================================================
// USER PROFILE AND JOB DATA
// =============================================================================

const TEST_USER_PROFILE = {
  personalInfo: {
    firstName: 'Abransh',
    lastName: 'Baliyan',
    email: 'abranshbaliyan2807@gmail.com',
    phone: '3801052451',
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  },
  professional: {
    currentTitle: 'Software Engineer',
    currentCompany: 'Tech Solutions Inc.',
    yearsExperience: 5,
    linkedinUrl: 'https://linkedin.com/in/abranshbaliyan',
    resumeUrl: '/path/to/resume.pdf',
    coverLetterTemplate: `Dear Hiring Team,

I am excited to apply for this position at Anthropic. With my background in software engineering and passion for AI safety, I believe I would be a great fit for your team.

Best regards,
Abransh Baliyan`
  },
  preferences: {
    salaryMin: 120000,
    salaryMax: 180000,
    workType: 'hybrid'
  }
};

const ANTHROPIC_JOB_URL = 'https://job-boards.greenhouse.io/anthropic/jobs/4496424008';

// =============================================================================
// REAL BROWSER AUTOMATION SERVICE
// =============================================================================

class HeadfulBrowserService extends EventEmitter {
  private browser?: Browser;
  private page?: Page;
  private screenshots: string[] = [];

  async initialize(): Promise<void> {
    console.log('🚀 Launching visible browser for demonstration...');
    
    // Launch browser in headful mode (visible)
    this.browser = await chromium.launch({
      headless: false,  // VISIBLE BROWSER
      slowMo: 2000,     // Slow down actions for visibility
      args: [
        '--window-size=1280,720',
        '--start-maximized'
      ]
    });

    // Create a new page
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Set user agent
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    console.log('✅ Browser launched successfully - you should see a browser window');
    this.emit('initialized');
  }

  async processJobApplication(): Promise<any> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const startTime = Date.now();
    
    try {
      console.log('🌐 Navigating to Anthropic job page...');
      this.emit('progress', { step: 'navigation', message: 'Navigating to job page' });
      
      // Navigate to the job page
      await this.page.goto(ANTHROPIC_JOB_URL, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Take screenshot after navigation
      await this.takeScreenshot('01_job_page_loaded');
      
      console.log('✅ Job page loaded - you should see the Anthropic job posting');
      await this.delay(3000); // Pause so you can see the page

      this.emit('progress', { step: 'analyzing', message: 'Looking for Apply button' });
      console.log('🔍 Looking for Apply button...');

      // Look for apply button (various selectors for Greenhouse)
      const applyButtonSelectors = [
        'a[href*="application"]',
        'button:has-text("Apply for this job")',
        'a:has-text("Apply for this job")',
        '.application-outlet button',
        'a.postings-btn',
        'a[href*="boards.greenhouse.io"]'
      ];

      let applyButton = null;
      for (const selector of applyButtonSelectors) {
        try {
          applyButton = await this.page.locator(selector).first();
          const isVisible = await applyButton.isVisible({ timeout: 2000 });
          if (isVisible) {
            console.log(`✅ Found Apply button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!applyButton) {
        console.log('⚠️ Apply button not found, checking page content...');
        
        // Take screenshot for debugging
        await this.takeScreenshot('02_apply_button_search');
        
        // Log page title and URL for debugging
        const title = await this.page.title();
        const url = this.page.url();
        console.log(`Page title: ${title}`);
        console.log(`Current URL: ${url}`);
        
        // Look for any links that might be apply buttons
        const allLinks = await this.page.locator('a').all();
        console.log(`Found ${allLinks.length} links on the page`);
        
        for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
          try {
            const href = await allLinks[i].getAttribute('href');
            const text = await allLinks[i].textContent();
            if (href && (href.includes('application') || (text && text.toLowerCase().includes('apply')))) {
              console.log(`Potential apply link: "${text}" -> ${href}`);
            }
          } catch (error) {
            continue;
          }
        }
        
        throw new Error('Could not find Apply button on the page');
      }

      this.emit('progress', { step: 'clicking', message: 'Clicking Apply button' });
      console.log('🖱️ Clicking Apply button...');
      
      // Highlight the button before clicking (for visual demo)
      await applyButton.evaluate(el => {
        el.style.border = '3px solid red';
        el.style.backgroundColor = 'yellow';
      });
      
      await this.delay(2000); // Pause so you can see the highlight
      
      // Click the apply button
      await applyButton.click();
      
      console.log('🔄 Waiting for application form to load...');
      await this.delay(5000); // Wait for form to load
      
      // Take screenshot of application form
      await this.takeScreenshot('03_application_form');

      this.emit('progress', { step: 'form-analysis', message: 'Analyzing application form' });
      console.log('📋 Analyzing application form structure...');

      // Look for form fields
      const formFields = await this.page.locator('input, select, textarea').all();
      console.log(`Found ${formFields.length} form fields`);

      this.emit('progress', { step: 'form-filling', message: 'Filling out application form' });
      console.log('✍️ Filling out application form...');

      // Fill out the form with user data
      for (let i = 0; i < formFields.length; i++) {
        try {
          const field = formFields[i];
          const isVisible = await field.isVisible();
          
          if (!isVisible) continue;

          const name = await field.getAttribute('name') || '';
          const id = await field.getAttribute('id') || '';
          const placeholder = await field.getAttribute('placeholder') || '';
          const type = await field.getAttribute('type') || '';
          const tagName = await field.evaluate(el => el.tagName.toLowerCase());

          const fieldIdentifier = `${name} ${id} ${placeholder}`.toLowerCase();
          let value = '';

          // Smart field mapping
          if (fieldIdentifier.includes('first') && fieldIdentifier.includes('name')) {
            value = TEST_USER_PROFILE.personalInfo.firstName;
          } else if (fieldIdentifier.includes('last') && fieldIdentifier.includes('name')) {
            value = TEST_USER_PROFILE.personalInfo.lastName;
          } else if (fieldIdentifier.includes('email') || type === 'email') {
            value = TEST_USER_PROFILE.personalInfo.email;
          } else if (fieldIdentifier.includes('phone') || type === 'tel') {
            value = TEST_USER_PROFILE.personalInfo.phone;
          } else if (fieldIdentifier.includes('address')) {
            value = TEST_USER_PROFILE.personalInfo.address || '';
          } else if (fieldIdentifier.includes('city')) {
            value = TEST_USER_PROFILE.personalInfo.city || '';
          } else if (fieldIdentifier.includes('state')) {
            value = TEST_USER_PROFILE.personalInfo.state || '';
          }

          if (value && tagName === 'input') {
            console.log(`📝 Filling field: ${name || id || placeholder} = ${value}`);
            
            // Highlight field before filling
            await field.evaluate(el => {
              el.style.border = '2px solid blue';
            });
            
            await field.fill(value);
            await this.delay(1000); // Pause so you can see each field being filled
            
            // Remove highlight
            await field.evaluate(el => {
              el.style.border = '';
            });
          }

        } catch (fieldError) {
          console.log(`⚠️ Skipping field due to error: ${fieldError.message}`);
          continue;
        }
      }

      // Take screenshot after filling form
      await this.takeScreenshot('04_form_filled');

      // Look for submit button
      this.emit('progress', { step: 'submitting', message: 'Looking for submit button' });
      console.log('🔍 Looking for submit button...');

      const submitButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Submit Application")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        '.submit-button',
        '.btn-submit'
      ];

      let submitButton = null;
      for (const selector of submitButtonSelectors) {
        try {
          submitButton = await this.page.locator(selector).first();
          const isVisible = await submitButton.isVisible({ timeout: 2000 });
          if (isVisible) {
            console.log(`✅ Found submit button with selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (submitButton) {
        console.log('🚀 Found submit button - highlighting it...');
        
        // Highlight submit button
        await submitButton.evaluate(el => {
          el.style.border = '3px solid green';
          el.style.backgroundColor = 'lightgreen';
        });
        
        await this.delay(2000); // Pause so you can see the highlight
        
        console.log('⚠️ DEMO MODE: Not actually submitting to avoid real application');
        console.log('   In production, this would click the submit button');
        
        // Take screenshot of ready-to-submit state
        await this.takeScreenshot('05_ready_to_submit');
        
      } else {
        console.log('⚠️ Submit button not found');
        await this.takeScreenshot('06_submit_button_search');
      }

      this.emit('progress', { step: 'completed', message: 'Demo completed successfully' });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        applicationId: `DEMO_${Date.now()}`,
        confirmationNumber: `DEMO_CONF_${Math.random().toString(36).substr(2, 9)}`,
        executionTime,
        automationType: 'headful-demo',
        metadata: {
          captchaEncountered: false,
          retryCount: 0,
          screenshots: this.screenshots,
          logs: ['Navigation successful', 'Form analyzed', 'Form filled', 'Demo completed']
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Take error screenshot
      await this.takeScreenshot('error_state');
      
      console.error(`❌ Demo failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        executionTime,
        automationType: 'headful-demo',
        metadata: {
          captchaEncountered: false,
          retryCount: 0,
          screenshots: this.screenshots,
          logs: ['Demo failed', error.message]
        }
      };
    }
  }

  private async takeScreenshot(suffix: string): Promise<string> {
    if (!this.page) return '';
    
    try {
      const filename = `headful_demo_${suffix}_${Date.now()}.png`;
      const path = `/tmp/jobswipe-screenshots/${filename}`;
      
      await this.page.screenshot({ 
        path, 
        fullPage: true 
      });
      
      this.screenshots.push(path);
      console.log(`📸 Screenshot saved: ${filename}`);
      
      return path;
    } catch (error) {
      console.warn(`⚠️ Failed to take screenshot: ${error.message}`);
      return '';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Closing browser...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  getScreenshots(): string[] {
    return [...this.screenshots];
  }
}

// =============================================================================
// DEMO ORCHESTRATOR
// =============================================================================

class HeadfulDemoOrchestrator extends EventEmitter {
  private browserService?: HeadfulBrowserService;

  async runDemo(): Promise<void> {
    try {
      console.log('🎬 Starting JobSwipe Headful Demo');
      console.log('=' .repeat(70));
      console.log('🎯 Target: Anthropic Software Engineer Position');
      console.log('🌐 URL: https://job-boards.greenhouse.io/anthropic/jobs/4496424008');
      console.log('👤 Applicant: Abransh Baliyan (abranshbaliyan2807@gmail.com)');
      console.log('📱 Phone: 3801052451');
      console.log('=' .repeat(70));
      console.log('');
      console.log('🔍 WATCH THE BROWSER WINDOW - You will see:');
      console.log('   • Browser navigate to the job page');
      console.log('   • Apply button being found and highlighted');
      console.log('   • Application form being analyzed');
      console.log('   • Form fields being filled automatically');
      console.log('   • Submit button being identified');
      console.log('');
      console.log('⚠️  NOTE: This is a demo - we will NOT actually submit');
      console.log('   to avoid creating a real job application.');
      console.log('');

      // Initialize browser service
      this.browserService = new HeadfulBrowserService();
      
      // Set up progress monitoring
      this.browserService.on('progress', (data) => {
        console.log(`🤖 ${data.step.toUpperCase()}: ${data.message}`);
      });

      this.browserService.on('initialized', () => {
        console.log('✅ Browser launched - check for the browser window!');
      });

      // Give user time to read
      console.log('⏳ Starting demo in 5 seconds...');
      await this.delay(5000);

      // Initialize browser
      await this.browserService.initialize();
      
      // Wait a moment for user to see browser
      console.log('⏳ Browser ready, starting automation in 3 seconds...');
      await this.delay(3000);

      // Run the application process
      const result = await this.browserService.processJobApplication();

      // Display results
      console.log('\n📊 Demo Results:');
      console.log('=' .repeat(50));
      console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`Execution Time: ${result.executionTime}ms`);
      console.log(`Automation Type: ${result.automationType}`);
      
      if (result.success) {
        console.log(`Application ID: ${result.applicationId}`);
        console.log(`Confirmation: ${result.confirmationNumber}`);
      } else {
        console.log(`Error: ${result.error}`);
      }

      console.log(`Screenshots: ${result.metadata.screenshots.length}`);
      console.log('');

      // Show screenshots
      if (result.metadata.screenshots.length > 0) {
        console.log('📸 Screenshots saved:');
        result.metadata.screenshots.forEach((screenshot, index) => {
          console.log(`   ${index + 1}. ${screenshot}`);
        });
        console.log('');
        console.log('🔍 View screenshots with:');
        console.log(`   open ${result.metadata.screenshots[0]}`);
        console.log('   or');
        console.log('   ./screenshot-viewer.sh');
      }

      console.log('\n🎉 Demo completed! You should have seen:');
      console.log('   ✅ Real browser automation in action');
      console.log('   ✅ Intelligent form field detection');
      console.log('   ✅ Automatic data filling');
      console.log('   ✅ Step-by-step visual feedback');
      console.log('   ✅ Screenshot capture at key moments');

      // Keep browser open for a moment
      console.log('\n⏳ Keeping browser open for 10 seconds for review...');
      await this.delay(10000);

    } catch (error) {
      console.error('\n💥 Demo failed:', error.message);
      console.error('Stack:', error.stack);
    } finally {
      // Cleanup
      if (this.browserService) {
        await this.browserService.cleanup();
      }
      console.log('\n🏁 Headful demo complete!');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runHeadfulDemo(): Promise<void> {
  const orchestrator = new HeadfulDemoOrchestrator();
  await orchestrator.runDemo();
}

// Execute demo
if (require.main === module) {
  runHeadfulDemo().catch((error) => {
    console.error('💥 Unhandled demo error:', error);
    process.exit(1);
  });
}

export { runHeadfulDemo };