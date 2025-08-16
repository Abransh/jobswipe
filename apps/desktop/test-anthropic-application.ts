#!/usr/bin/env npx tsx

/**
 * Test Script: Anthropic Job Application Automation
 * 
 * Tests the complete JobSwipe automation system with a real job application
 * to demonstrate AI-powered browser automation, vision services, and 
 * end-to-end workflow orchestration.
 */

import JobSwipeSystemInitializer, { SystemConfig } from './src/JobSwipeSystemInitializer';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const TEST_JOB_URL = 'https://job-boards.greenhouse.io/anthropic/jobs/4496424008';

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
    resumeUrl: '/path/to/resume.pdf', // Would be actual file path
    coverLetterTemplate: `Dear Hiring Team,

I am excited to apply for this position at Anthropic. With my background in software engineering and passion for AI safety, I believe I would be a great fit for your team.

I have 5 years of experience in full-stack development and have been following Anthropic's work in developing safe and beneficial AI systems. I am particularly interested in contributing to responsible AI development.

Thank you for your consideration.

Best regards,
Abransh Baliyan`
  },
  preferences: {
    salaryMin: 120000,
    salaryMax: 180000,
    workType: 'hybrid',
    locationPreferences: ['San Francisco', 'Remote']
  }
};

const SYSTEM_CONFIG: SystemConfig = {
  // Environment Configuration
  environment: 'development',
  
  // Core API Configuration (Mock for testing)
  api: {
    baseUrl: 'http://localhost:3001',
    apiKey: 'test-api-key',
    timeout: 30000
  },
  
  // AI Services Configuration
  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'test-anthropic-key',
    openaiApiKey: process.env.OPENAI_API_KEY,
    enableMultiProvider: true
  },
  
  // Cloud Vision Services (Optional - for enhanced captcha resolution)
  cloudVision: {
    google: {
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/path/to/google-key.json',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'test-project'
    },
    azure: {
      endpoint: process.env.AZURE_COGNITIVE_ENDPOINT || 'https://test.cognitiveservices.azure.com/',
      apiKey: process.env.AZURE_COGNITIVE_KEY || 'test-azure-key'
    },
    aws: {
      region: process.env.AWS_REGION || 'us-west-2',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test-access-key',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test-secret-key'
    }
  },
  
  // Greenhouse Integration
  greenhouse: {
    boardTokens: ['anthropic'], // Anthropic's greenhouse board token
    syncInterval: 300000 // 5 minutes
  },
  
  // Browser Automation Configuration
  browser: {
    headless: false, // Set to false for testing to see the automation
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    slowMo: 1000, // Slow down for better visibility during testing
    enableScreenshots: true
  },
  
  // Queue Configuration (Mock Redis for testing)
  queue: {
    redisUrl: 'redis://localhost:6379',
    concurrency: 1, // Single job for testing
    retryAttempts: 2,
    batchSize: 1
  },
  
  // Performance Configuration
  performance: {
    maxConcurrentJobs: 1,
    jobTimeout: 300000, // 5 minutes timeout
    healthCheckInterval: 30000,
    enableAutoScaling: false
  },
  
  // Monitoring Configuration
  monitoring: {
    enableMetrics: true,
    enableAlerting: false, // Disable alerts for testing
    metricsRetentionDays: 1,
    alertThresholds: {
      errorRate: 0.1,
      responseTime: 5000,
      memoryUsage: 80,
      cpuUsage: 80
    }
  },
  
  // Testing Configuration
  testing: {
    enableAutomatedTesting: false, // Skip automated tests for this demo
    testInterval: 600000,
    performanceThresholds: {
      maxApplicationTime: 300000,
      minSuccessRate: 0.8,
      maxMemoryUsage: 500,
      maxCPUUsage: 70
    }
  },
  
  // Security Configuration
  security: {
    enableAuditLogging: true,
    enableEncryption: false, // Simplified for testing
    rateLimitRequests: 100,
    rateLimitWindow: 60000
  }
};

// =============================================================================
// MAIN TEST EXECUTION
// =============================================================================

async function runAnthropicJobApplicationTest(): Promise<void> {
  let systemInitializer: JobSwipeSystemInitializer | undefined;
  
  try {
    console.log('🚀 Starting Anthropic Job Application Test');
    console.log('=' .repeat(60));
    console.log(`📋 Job URL: ${TEST_JOB_URL}`);
    console.log(`👤 Applicant: ${TEST_USER_PROFILE.personalInfo.firstName} ${TEST_USER_PROFILE.personalInfo.lastName}`);
    console.log(`📧 Email: ${TEST_USER_PROFILE.personalInfo.email}`);
    console.log(`📞 Phone: ${TEST_USER_PROFILE.personalInfo.phone}`);
    console.log('=' .repeat(60));

    // Step 1: Initialize the JobSwipe System
    console.log('\n🔧 Phase 1: System Initialization');
    systemInitializer = new JobSwipeSystemInitializer(SYSTEM_CONFIG);
    
    // Set up event listeners for real-time monitoring
    setupEventListeners(systemInitializer);
    
    // Initialize all services
    await systemInitializer.initialize();
    
    console.log('✅ JobSwipe system initialized successfully!\n');

    // Step 2: Check System Health
    console.log('🏥 Phase 2: System Health Check');
    const healthStatus = systemInitializer.getSystemStatus();
    console.log(`Overall Status: ${healthStatus.overall}`);
    console.log(`Services Healthy: ${healthStatus.statistics.servicesHealthy}/${healthStatus.statistics.servicesTotal}`);
    console.log(`Capabilities:`, healthStatus.capabilities);
    
    if (healthStatus.overall !== 'healthy') {
      console.warn('⚠️ System health issues detected, but proceeding with test...');
    }

    // Step 3: Process Job Application
    console.log('\n🎯 Phase 3: Processing Job Application');
    
    const jobApplicationRequest = {
      userId: 'test-user-123',
      jobId: 'anthropic-4496424008',
      userProfile: TEST_USER_PROFILE,
      priority: 'high' as const,
      options: {
        skipAI: false, // Use AI automation
        preferredStrategy: 'greenhouse', // Use Greenhouse strategy
        maxRetries: 2
      }
    };

    console.log('🤖 Initiating AI-powered job application...');
    const applicationResult = await systemInitializer.processJobApplication(jobApplicationRequest);
    
    // Step 4: Display Results
    console.log('\n📊 Phase 4: Application Results');
    console.log('=' .repeat(60));
    console.log(`✨ Application Status: ${applicationResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`⏱️  Execution Time: ${applicationResult.executionTime}ms`);
    console.log(`🔧 Strategy Used: ${applicationResult.strategy}`);
    console.log(`🤖 Automation Type: ${applicationResult.automationType}`);
    
    if (applicationResult.success) {
      console.log(`🎉 Application ID: ${applicationResult.applicationId || 'N/A'}`);
      console.log(`📋 Confirmation: ${applicationResult.confirmationNumber || 'N/A'}`);
    } else {
      console.log(`❌ Error: ${applicationResult.error}`);
    }
    
    console.log('\n📸 Metadata:');
    console.log(`🧩 Captcha Encountered: ${applicationResult.metadata.captchaEncountered ? 'Yes' : 'No'}`);
    console.log(`🔄 Retry Count: ${applicationResult.metadata.retryCount}`);
    console.log(`📷 Screenshots: ${applicationResult.metadata.screenshots.length}`);
    console.log(`📝 Logs: ${applicationResult.metadata.logs.length} entries`);

    // Step 5: Run System Test
    console.log('\n🧪 Phase 5: System Validation Test');
    try {
      const testResults = await systemInitializer.runSystemTest();
      console.log(`✅ System test completed: ${testResults.overall.passedTests}/${testResults.overall.totalTests} tests passed`);
    } catch (testError) {
      console.log(`⚠️ System test skipped: ${testError}`);
    }

    // Step 6: Final Statistics
    console.log('\n📈 Phase 6: Final System Statistics');
    const finalStatus = systemInitializer.getSystemStatus();
    console.log(`Total Applications Processed: ${finalStatus.statistics.totalApplications}`);
    console.log(`Success Rate: ${(finalStatus.statistics.successRate * 100).toFixed(1)}%`);
    console.log(`AI Automation Rate: ${(finalStatus.statistics.aiAutomationRate * 100).toFixed(1)}%`);
    console.log(`System Uptime: ${Math.round(finalStatus.statistics.uptime / 1000)}s`);

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
  } finally {
    // Cleanup
    if (systemInitializer) {
      console.log('\n🛑 Shutting down system...');
      await systemInitializer.shutdown();
      console.log('✅ System shutdown complete');
    }
    
    console.log('\n🏁 Test execution completed');
  }
}

// =============================================================================
// EVENT LISTENERS FOR REAL-TIME MONITORING
// =============================================================================

function setupEventListeners(systemInitializer: JobSwipeSystemInitializer): void {
  // System Events
  systemInitializer.on('system-ready', (data) => {
    console.log('🎉 System Ready:', data.capabilities.length, 'capabilities active');
  });

  systemInitializer.on('system-alert', (alert) => {
    console.log(`🚨 Alert [${alert.severity}]: ${alert.title}`);
  });

  // Application Events
  systemInitializer.on('application-request', (data) => {
    console.log(`📝 Application requested for job ${data.jobId} (priority: ${data.priority})`);
  });

  systemInitializer.on('application-complete', (result) => {
    console.log(`${result.success ? '✅' : '❌'} Application ${result.success ? 'completed' : 'failed'} in ${result.executionTime}ms`);
  });

  // Workflow Events
  systemInitializer.on('workflow-service-ready', () => {
    console.log('🔄 Workflow integration service ready');
  });

  systemInitializer.on('monitoring-service-ready', () => {
    console.log('📊 Production monitoring service ready');
  });

  // Automation Events
  systemInitializer.on('automation-progress', (data) => {
    console.log(`🤖 Automation Progress: ${data.step || data.message}`);
  });

  systemInitializer.on('captcha-detected', (data) => {
    console.log(`🧩 Captcha detected: ${data.type || 'Unknown type'}`);
  });

  systemInitializer.on('vision-analysis-complete', (data) => {
    console.log(`👁️ Vision analysis complete: ${data.analysisType} (${data.provider})`);
  });

  // Strategy Events
  systemInitializer.on('strategy-matched', (data) => {
    console.log(`🎯 Strategy matched: ${data.strategy} (confidence: ${data.confidence})`);
  });

  systemInitializer.on('ai-automation-complete', (data) => {
    console.log(`🤖 AI automation completed: ${data.success ? 'Success' : 'Failed'}`);
  });
}

// =============================================================================
// EXECUTE TEST
// =============================================================================

if (require.main === module) {
  runAnthropicJobApplicationTest().catch((error) => {
    console.error('💥 Unhandled test error:', error);
    process.exit(1);
  });
}

export { runAnthropicJobApplicationTest, TEST_USER_PROFILE, SYSTEM_CONFIG };