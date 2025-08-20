#!/usr/bin/env tsx
/**
 * @fileoverview Basic Automation Test Script
 * @description Simple test to verify the automation system works
 * @usage: npm run test:automation or npx tsx apps/desktop/src/test-basic-automation.ts
 */

import { JobSwipeAutomationEngine } from './automation/JobSwipeAutomationEngine';
import { UserProfile } from './strategies/types/StrategyTypes';

// Test configuration
const TEST_CONFIG = {
  // Set to false to see the browser in action
  headless: false,
  // Test with a real job URL (LinkedIn Easy Apply works best)
  testJob: {
    url: 'https://www.linkedin.com/jobs/view/3804922179/', // Example job
    company: 'linkedin',
    title: 'Software Engineer'
  },
  // Mock user profile for testing
  userProfile: {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe', 
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US'
    },
    professional: {
      currentTitle: 'Senior Software Engineer',
      currentCompany: 'Tech Company Inc',
      yearsExperience: 5,
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      portfolioUrl: 'https://johndoe.dev',
      resumeUrl: '/path/to/resume.pdf', // Update this path
      coverLetterTemplate: 'I am excited to apply for this position...'
    },
    preferences: {
      salaryMin: 120000,
      salaryMax: 180000,
      remoteWork: true,
      workAuthorization: 'Authorized to work in US',
      availableStartDate: '2 weeks notice'
    }
  } as UserProfile
};

async function runBasicTest() {
  console.log('🚀 JobSwipe Automation System - Basic Test');
  console.log('==========================================');
  
  let engine: JobSwipeAutomationEngine | null = null;

  try {
    // Step 1: Initialize the automation engine
    console.log('\n📦 Step 1: Initializing Automation Engine...');
    
    engine = new JobSwipeAutomationEngine({
      browser: {
        headless: TEST_CONFIG.headless,
        timeout: 60000,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
      },
      captcha: {
        enabledMethods: ['manual-intervention'], // Start with manual for testing
        aiVisionProvider: 'anthropic' as const,
        externalServices: {},
        manualFallbackTimeout: 300000 // 5 minutes for manual captcha solving
      },
      intelligence: {
        formAnalysisCache: true,
        semanticAnalysisDepth: 'advanced',
        confidenceThreshold: 0.7
      },
      queue: {
        redisConnection: null,
        defaultConcurrency: 1, // Start with 1 for testing
        batchingEnabled: false,
        monitoringEnabled: true
      }
    });

    // Add event listeners for debugging
    engine.on('engine-initialized', (data) => {
      console.log('✅ Engine initialized successfully');
      console.log(`   - Strategies loaded: ${data.strategiesLoaded}`);
      console.log(`   - Components ready: ${Object.keys(data.componentsReady).length}`);
    });

    engine.on('job-processing-started', (data) => {
      console.log(`🏃 Job processing started: ${data.processingId}`);
    });

    engine.on('captcha-detected', (data) => {
      console.log(`🤖 Captcha detected: ${data.context.captchaType}`);
    });

    engine.on('manual-intervention-required', (data) => {
      console.log('👤 MANUAL INTERVENTION REQUIRED');
      console.log(`   Job ID: ${data.jobId}`);
      console.log('   Please solve the captcha manually in the browser window');
      console.log('   The automation will wait for you to continue...');
    });

    engine.on('job-processing-completed', (data) => {
      console.log(`✅ Job completed: ${data.processingId}`);
    });

    await engine.initialize();

    // Step 2: Create test job application request
    console.log('\n📋 Step 2: Creating Test Job Application Request...');
    
    const jobApplicationRequest = {
      id: `test-${Date.now()}`,
      userId: 'test-user-123',
      jobData: {
        id: `job-${Date.now()}`,
        title: TEST_CONFIG.testJob.title,
        company: TEST_CONFIG.testJob.company,
        url: TEST_CONFIG.testJob.url,
        location: 'San Francisco, CA',
        description: 'Test job application for automation system',
        applyUrl: TEST_CONFIG.testJob.url
      },
      userProfile: TEST_CONFIG.userProfile,
      priority: 'high' as const,
      options: {
        useHeadless: TEST_CONFIG.headless,
        skipCaptcha: false,
        maxRetries: 2,
        timeout: 180000 // 3 minutes
      }
    };

    console.log('   Job Details:');
    console.log(`   - Company: ${jobApplicationRequest.jobData.company}`);
    console.log(`   - Title: ${jobApplicationRequest.jobData.title}`);
    console.log(`   - URL: ${jobApplicationRequest.jobData.url}`);
    console.log(`   - User: ${jobApplicationRequest.userProfile.personalInfo.firstName} ${jobApplicationRequest.userProfile.personalInfo.lastName}`);

    // Step 3: Process the job application
    console.log('\n🔄 Step 3: Processing Job Application...');
    console.log('⏳ This may take 1-3 minutes depending on the job site...');
    
    if (!TEST_CONFIG.headless) {
      console.log('👀 Browser window will open - you can watch the automation in action!');
    }

    const startTime = Date.now();
    const result = await engine.processJobApplication(jobApplicationRequest);
    const totalTime = Date.now() - startTime;

    // Step 4: Display results
    console.log('\n📊 Step 4: Results Summary');
    console.log('========================');
    console.log(`🎯 Overall Success: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`⏱️  Total Time: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`🤖 Strategy Used: ${result.strategyUsed || 'Unknown'}`);
    console.log(`📝 Steps Completed: ${result.stepsCompleted}`);
    console.log(`🔐 Captcha Encountered: ${result.captchaEncountered ? 'Yes' : 'No'}`);
    
    if (result.applicationId) {
      console.log(`📋 Application ID: ${result.applicationId}`);
    }
    
    if (result.confirmationId) {
      console.log(`✅ Confirmation ID: ${result.confirmationId}`);
    }

    if (result.error) {
      console.log(`❌ Error Details: ${result.error}`);
    }

    // Performance metrics
    if (result.metadata?.performanceMetrics) {
      const metrics = result.metadata.performanceMetrics;
      console.log('\n⚡ Performance Metrics:');
      console.log(`   - Form Analysis: ${metrics.formAnalysisTime}ms`);
      console.log(`   - Form Fill: ${metrics.formFillTime}ms`);
      console.log(`   - Strategy Execution: ${metrics.strategyExecutionTime}ms`);
      if (metrics.captchaResolutionTime > 0) {
        console.log(`   - Captcha Resolution: ${metrics.captchaResolutionTime}ms`);
      }
      console.log(`   - Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
    }

    // Step 5: Show system statistics
    console.log('\n📈 Step 5: System Statistics');
    console.log('===========================');
    
    const engineStats = engine.getStats();
    console.log(`📊 Total Jobs Processed: ${engineStats.totalJobsProcessed}`);
    console.log(`✅ Successful Applications: ${engineStats.successfulApplications}`);
    console.log(`❌ Failed Applications: ${engineStats.failedApplications}`);
    console.log(`📈 Success Rate: ${engineStats.totalJobsProcessed > 0 ? ((engineStats.successfulApplications / engineStats.totalJobsProcessed) * 100).toFixed(1) : 0}%`);
    console.log(`⏱️  Average Processing Time: ${engineStats.averageProcessingTime.toFixed(0)}ms`);
    console.log(`🤖 Captcha Encounter Rate: ${(engineStats.captchaEncounterRate * 100).toFixed(1)}%`);
    console.log(`🔐 Captcha Success Rate: ${(engineStats.captchaSuccessRate * 100).toFixed(1)}%`);
    console.log(`📋 Strategies Loaded: ${engineStats.strategiesLoaded}`);
    console.log(`⏰ System Uptime: ${Math.floor(engineStats.uptime / 1000)}s`);

    // Final recommendations
    console.log('\n💡 Recommendations for Next Steps:');
    if (result.success) {
      console.log('✅ Basic automation is working! Try these next:');
      console.log('   1. Test with different job sites (Indeed, Glassdoor)');
      console.log('   2. Run load tests with multiple concurrent applications');
      console.log('   3. Test captcha resolution with AI vision enabled');
      console.log('   4. Test form analysis on complex multi-step forms');
    } else {
      console.log('⚠️  Automation needs attention. Check:');
      console.log('   1. Network connectivity and job site accessibility');
      console.log('   2. Browser dependencies (try: npx playwright install)');
      console.log('   3. Redis server (for queue management)');
      console.log('   4. API keys in environment variables');
      console.log('   5. Set headless: false to debug visually');
    }

  } catch (error) {
    console.error('\n💥 Test Failed with Error:');
    console.error('========================');
    console.error(error);
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure Redis is running: docker run -p 6379:6379 redis');
    console.log('2. Install browser dependencies: npx playwright install');
    console.log('3. Check your .env file has the required API keys');
    console.log('4. Try with headless: false to see what\'s happening');
    console.log('5. Check network connectivity to job sites');

  } finally {
    // Clean shutdown
    if (engine) {
      console.log('\n🛑 Shutting down automation engine...');
      await engine.shutdown();
      console.log('✅ Shutdown complete');
    }
  }

  console.log('\n🏁 Test Complete');
  console.log('================');
  process.exit(0);
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  process.exit(0);
});

// Run the test
if (require.main === module) {
  runBasicTest().catch(console.error);
}

export { runBasicTest };