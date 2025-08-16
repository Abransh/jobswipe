#!/usr/bin/env npx tsx

/**
 * JobSwipe Node.js Production Demo
 * 
 * PRODUCTION-READY demonstration using Node.js without Electron dependencies
 * Shows the AI automation capabilities using browser-use library directly
 */

import { chromium, Browser, Page } from 'playwright';
import { Agent } from 'browser-use';
import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { productionConfig, getConfigSummary } from './src/config/ProductionConfig';

// =============================================================================
// PRODUCTION TEST DATA
// =============================================================================

const PRODUCTION_USER_PROFILE = {
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
    currentTitle: 'Senior Software Engineer',
    currentCompany: 'Tech Solutions Inc.',
    yearsExperience: 5,
    linkedinUrl: 'https://linkedin.com/in/abranshbaliyan',
    portfolioUrl: 'https://abranshbaliyan.dev',
    resumeUrl: '/path/to/resume.pdf',
    coverLetterTemplate: 'I am excited to apply for this position...'
  },
  preferences: {
    salaryMin: 120000,
    salaryMax: 180000,
    remoteWork: true
  }
};

const TEST_JOBS = [
  {
    id: 'anthropic-swe',
    title: 'Software Engineer',
    company: 'Anthropic',
    url: 'https://job-boards.greenhouse.io/anthropic/jobs/4496424008',
    location: 'San Francisco, CA'
  }
];

// =============================================================================
// NODE.JS PRODUCTION AUTOMATION SERVICE
// =============================================================================

class NodeProductionAutomationService extends EventEmitter {
  private browser?: Browser;
  private agent?: Agent;
  private screenshots: string[] = [];
  private initialized = false;

  constructor() {
    super();
    this.ensureDirectories();
    this.validateConfiguration();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initializing Node.js Production Automation...');
    console.log('=' .repeat(80));
    
    // Display configuration
    const configSummary = getConfigSummary();
    console.log('📋 Configuration Summary:');
    console.log(`   Environment: ${configSummary.environment}`);
    console.log(`   Demo Mode: ${configSummary.demoMode ? '🎬 Yes' : '🚀 Production'}`);
    console.log(`   AI Provider: ${configSummary.aiProviders.anthropic ? '✅ Anthropic' : '❌ Missing'}`);
    console.log(`   Browser: ${configSummary.browser.headless ? 'Headless' : 'Visible'}`);
    console.log('=' .repeat(80));

    try {
      // Launch browser
      console.log('🌐 Launching browser...');
      this.browser = await chromium.launch({
        headless: !productionConfig.demoMode, // Visible in demo mode
        slowMo: productionConfig.demoMode ? 1000 : 100,
        args: [
          '--window-size=1280,720',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });

      // Initialize AI agent
      console.log('🤖 Initializing AI agent...');
      this.agent = new Agent({
        task: 'JobSwipe AI Automation - Intelligent job application processing',
        llm: {
          provider: 'anthropic',
          model: productionConfig.ai.anthropic.model,
          apiKey: productionConfig.ai.anthropic.apiKey,
          maxTokens: productionConfig.ai.anthropic.maxTokens,
          temperature: productionConfig.ai.anthropic.temperature
        },
        browser: this.browser,
        timeout: productionConfig.browser.timeout
      });

      this.initialized = true;
      console.log('✅ Production automation system ready');
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  async processJobApplication(jobData: any): Promise<any> {
    if (!this.initialized || !this.agent) {
      await this.initialize();
    }

    const startTime = Date.now();
    const jobId = randomUUID();

    console.log(`\n🚀 Processing Job Application:`);
    console.log(`   Job ID: ${jobId}`);
    console.log(`   Company: ${jobData.company}`);
    console.log(`   Position: ${jobData.title}`);
    console.log(`   URL: ${jobData.url}`);
    console.log('');

    try {
      // Create comprehensive task instruction for AI
      const taskInstruction = `
You are an AI automation agent helping to apply for a job on behalf of a user. Here's what you need to do:

JOB INFORMATION:
- Company: ${jobData.company}
- Position: ${jobData.title}
- Job URL: ${jobData.url}

USER PROFILE:
- Name: ${PRODUCTION_USER_PROFILE.personalInfo.firstName} ${PRODUCTION_USER_PROFILE.personalInfo.lastName}
- Email: ${PRODUCTION_USER_PROFILE.personalInfo.email}
- Phone: ${PRODUCTION_USER_PROFILE.personalInfo.phone}
- Location: ${PRODUCTION_USER_PROFILE.personalInfo.city}, ${PRODUCTION_USER_PROFILE.personalInfo.state}
- Experience: ${PRODUCTION_USER_PROFILE.professional.yearsExperience} years as ${PRODUCTION_USER_PROFILE.professional.currentTitle}
- Current Company: ${PRODUCTION_USER_PROFILE.professional.currentCompany}
- LinkedIn: ${PRODUCTION_USER_PROFILE.professional.linkedinUrl}

INSTRUCTIONS:
1. Navigate to the job application page: ${jobData.url}
2. Analyze the application process (Easy Apply vs. Full Application)
3. Fill out the application form with the user's information
4. If you encounter a captcha, describe it but DO NOT solve it (demo mode)
5. Stop before actually submitting the application (this is a demo)
6. Take screenshots at key steps
7. Provide a detailed summary of what you accomplished

IMPORTANT: This is a demonstration. Do NOT actually submit the application.
`;

      console.log('🎯 Starting AI-powered automation...');
      
      // Execute the AI automation
      const result = await this.agent.run(taskInstruction);
      
      // Take final screenshot
      await this.takeScreenshot('final_state');
      
      const executionTime = Date.now() - startTime;
      
      console.log('✅ AI automation completed');
      console.log(`⏱️ Execution time: ${executionTime}ms`);
      
      return {
        success: true,
        jobId,
        executionTime,
        result: result.trim(),
        screenshots: this.screenshots,
        metadata: {
          company: jobData.company,
          position: jobData.title,
          aiModel: productionConfig.ai.anthropic.model,
          demoMode: productionConfig.demoMode
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await this.takeScreenshot('error_state');
      
      console.error('❌ Automation failed:', error);
      
      return {
        success: false,
        jobId,
        executionTime,
        error: error.message,
        screenshots: this.screenshots,
        metadata: {
          company: jobData.company,
          position: jobData.title,
          aiModel: productionConfig.ai.anthropic.model,
          demoMode: productionConfig.demoMode
        }
      };
    }
  }

  private async takeScreenshot(suffix: string): Promise<string> {
    if (!this.browser) return '';
    
    try {
      const pages = await this.browser.pages();
      if (pages.length === 0) return '';
      
      const page = pages[0];
      const filename = `node_production_${suffix}_${Date.now()}.png`;
      const path = `${productionConfig.browser.screenshotDir}/${filename}`;
      
      await page.screenshot({ 
        path, 
        fullPage: true 
      });
      
      this.screenshots.push(path);
      console.log(`📸 Screenshot saved: ${filename}`);
      
      return path;
      
    } catch (error) {
      console.warn(`⚠️ Screenshot failed: ${error.message}`);
      return '';
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up automation service...');
    
    try {
      if (this.agent) {
        await this.agent.close();
      }
      
      if (this.browser) {
        await this.browser.close();
      }
      
      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.warn(`⚠️ Cleanup warning: ${error}`);
    }
  }

  private ensureDirectories(): void {
    const screenshotDir = productionConfig.browser.screenshotDir;
    if (!existsSync(screenshotDir)) {
      mkdirSync(screenshotDir, { recursive: true });
    }
  }

  private validateConfiguration(): void {
    console.log('🔍 Validating configuration...');
    
    if (!productionConfig.ai.anthropic.apiKey) {
      console.error('❌ ANTHROPIC_API_KEY is required. Please set it in your .env file.');
      console.log('💡 Get your API key from: https://console.anthropic.com/');
      process.exit(1);
    }
    
    console.log('✅ Configuration valid');
  }
}

// =============================================================================
// DEMO ORCHESTRATOR
// =============================================================================

class NodeProductionDemoOrchestrator extends EventEmitter {
  private automationService: NodeProductionAutomationService;
  private results: any[] = [];

  constructor() {
    super();
    this.automationService = new NodeProductionAutomationService();
  }

  async runDemo(): Promise<void> {
    try {
      console.log('\n🎬 JobSwipe Node.js Production Demo');
      console.log('=' .repeat(80));
      console.log('🎯 Demonstrating AI-powered job application automation:');
      console.log('   • Claude AI integration with browser-use library');
      console.log('   • Intelligent form analysis and completion');
      console.log('   • Real browser automation (visible in demo mode)');
      console.log('   • Production-ready architecture');
      console.log('');
      console.log('🔍 WATCH: Browser window will show AI automation in action');
      console.log('⚠️  NOTE: Demo stops before actual submission');
      console.log('=' .repeat(80));
      console.log('');

      // Initialize automation
      await this.automationService.initialize();
      
      console.log('⏳ Starting automation demo in 3 seconds...');
      await this.delay(3000);

      // Process each test job
      for (let i = 0; i < TEST_JOBS.length; i++) {
        const job = TEST_JOBS[i];
        
        console.log(`\n📋 [${i + 1}/${TEST_JOBS.length}] Processing Job:`);
        console.log(`   ${job.company} - ${job.title}`);
        
        const result = await this.automationService.processJobApplication(job);
        this.results.push(result);
        
        // Display result
        this.displayResult(result);
        
        if (i < TEST_JOBS.length - 1) {
          console.log('\n⏳ Pausing before next job...');
          await this.delay(2000);
        }
      }

      // Display final summary
      await this.displayFinalSummary();

    } catch (error) {
      console.error('\n💥 Demo failed:', error);
    } finally {
      await this.automationService.cleanup();
    }
  }

  private displayResult(result: any): void {
    console.log(`\n📊 Job Application Result:`);
    console.log('─'.repeat(50));
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Job ID: ${result.jobId}`);
    console.log(`Execution Time: ${result.executionTime}ms`);
    console.log(`AI Model: ${result.metadata.aiModel}`);
    console.log(`Screenshots: ${result.screenshots.length} captured`);
    
    if (result.success && result.result) {
      console.log('\n🤖 AI Automation Summary:');
      console.log(result.result);
    }
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
  }

  private async displayFinalSummary(): Promise<void> {
    console.log('\n🏆 Node.js Production Demo - Final Summary');
    console.log('=' .repeat(80));
    
    const totalJobs = this.results.length;
    const successfulJobs = this.results.filter(r => r.success).length;
    const avgTime = totalJobs > 0 ? 
      this.results.reduce((sum, r) => sum + r.executionTime, 0) / totalJobs : 0;
    
    console.log(`📈 Results:`);
    console.log(`   Jobs Processed: ${totalJobs}`);
    console.log(`   Successful: ${successfulJobs}`);
    console.log(`   Success Rate: ${totalJobs > 0 ? (successfulJobs/totalJobs*100).toFixed(1) : 0}%`);
    console.log(`   Avg Time: ${avgTime.toFixed(0)}ms`);
    
    const allScreenshots = this.results.flatMap(r => r.screenshots);
    if (allScreenshots.length > 0) {
      console.log(`\n📸 Screenshots (${allScreenshots.length} total):`);
      console.log(`   Directory: ${productionConfig.browser.screenshotDir}`);
      console.log(`   View: open "${allScreenshots[0]}"`);
    }
    
    console.log('\n🎉 Demo Features Demonstrated:');
    console.log('   ✅ AI-powered browser automation');
    console.log('   ✅ Claude AI integration');
    console.log('   ✅ Intelligent form processing');
    console.log('   ✅ Production configuration system');
    console.log('   ✅ Real browser interaction');
    console.log('   ✅ Screenshot capture');
    console.log('   ✅ Error handling');
    
    console.log('\n🚀 Production Ready Features:');
    console.log('   ✅ Node.js environment compatibility');
    console.log('   ✅ Environment-based configuration');
    console.log('   ✅ Scalable architecture');
    console.log('   ✅ Enterprise AI integration');
    
    console.log('=' .repeat(80));
    
    // Save results to file
    const reportPath = `${productionConfig.browser.screenshotDir}/demo_report.json`;
    writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      environment: productionConfig.environment,
      demoMode: productionConfig.demoMode,
      results: this.results,
      summary: {
        totalJobs,
        successfulJobs,
        successRate: totalJobs > 0 ? successfulJobs/totalJobs : 0,
        avgTime,
        screenshots: allScreenshots
      }
    }, null, 2));
    
    console.log(`📄 Detailed report saved: ${reportPath}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runNodeProductionDemo(): Promise<void> {
  const orchestrator = new NodeProductionDemoOrchestrator();
  await orchestrator.runDemo();
}

// Execute demo
if (require.main === module) {
  runNodeProductionDemo().catch((error) => {
    console.error('💥 Demo error:', error);
    process.exit(1);
  });
}

export { runNodeProductionDemo };