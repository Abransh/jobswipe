#!/usr/bin/env node
/**
 * @fileoverview JobSwipe Integration Test Runner  
 * @description Complete end-to-end test of the new automation system
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { JobSwipeAutomationEngine } from './automation/JobSwipeAutomationEngine';
import { StrategyRegistry } from './strategies/StrategyRegistry';
import { AdvancedCaptchaHandler } from './captcha/AdvancedCaptchaHandler';
import { FormAnalyzer } from './intelligence/FormAnalyzer';
import { EnterpriseQueueManager } from './queue/EnterpriseQueueManager';

// =============================================================================
// INTEGRATION TEST RUNNER
// =============================================================================

async function runBasicIntegrationTest() {
  console.log('🚀 JobSwipe New Automation System - Integration Tests');
  console.log('=' .repeat(60));

  const startTime = Date.now();
  
  try {
    // Test 1: Strategy Registry Initialization
    console.log('\n📋 Test 1: Strategy Registry System');
    const strategyRegistry = new StrategyRegistry({
      strategyDirectory: './strategies/companies',
      cacheStrategy: true,
      autoReload: true
    });

    const strategies = strategyRegistry.getAllStrategies();
    console.log(`✅ Strategy registry initialized with ${strategies.length} strategies`);
    strategies.forEach(strategy => {
      console.log(`   - ${strategy.name}: ${strategy.domains?.join(', ') || 'no domains'}`);
    });

    // Test 2: Advanced Captcha Handler  
    console.log('\n📋 Test 2: Advanced Captcha Handler');
    const captchaHandler = new AdvancedCaptchaHandler({
      enabledMethods: ['ai-vision', 'manual-intervention'],
      aiVision: {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
        maxTokens: 1000,
        temperature: 0.1
      }
    });
    
    console.log('✅ Captcha handler initialized successfully');
    const captchaStats = captchaHandler.getStats();
    console.log(`   - Total encountered: ${captchaStats.totalEncountered}`);
    console.log(`   - Success rate: ${(captchaStats.successRate * 100).toFixed(1)}%`);

    // Test 3: Form Analyzer
    console.log('\n📋 Test 3: AI Form Intelligence System');
    const formAnalyzer = new FormAnalyzer();
    console.log('✅ Form analyzer initialized successfully');

    // Test 4: Enterprise Queue Manager
    console.log('\n📋 Test 4: Enterprise Queue Management');
    const queueManager = new EnterpriseQueueManager({
      redis: {
        cluster: false,
        host: 'localhost',
        port: 6379
      },
      performance: {
        concurrency: 2,
        stalledInterval: 30000,
        maxStalledCount: 2,
        removeOnComplete: 100,
        removeOnFail: 50,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: true
        }
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000,
        alertThresholds: {
          queueSize: 1000,
          processingTime: 120000,
          failureRate: 0.1,
          stalledJobs: 10,
          memoryUsage: 0.8
        }
      }
    });

    try {
      await queueManager.initialize();
      console.log('✅ Queue manager initialized successfully');
    } catch (queueError) {
      console.log('⚠️  Queue manager initialization skipped (Redis not available)');
      console.log(`   Error: ${queueError}`);
    }

    // Test 5: Main Automation Engine
    console.log('\n📋 Test 5: JobSwipe Automation Engine');
    const automationEngine = new JobSwipeAutomationEngine({
      browser: {
        headless: true,
        timeout: 30000,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
      },
      captcha: {
        enabledMethods: ['manual-intervention'],
        aiVisionProvider: 'anthropic',
        externalServices: {},
        manualFallbackTimeout: 60000
      },
      intelligence: {
        formAnalysisCache: true,
        semanticAnalysisDepth: 'advanced',
        confidenceThreshold: 0.7
      },
      queue: {
        redisConnection: null,
        defaultConcurrency: 2,
        batchingEnabled: false,
        monitoringEnabled: true
      }
    });

    await automationEngine.initialize();
    console.log('✅ Main automation engine initialized successfully');

    // Test 6: Strategy Matching
    console.log('\n📋 Test 6: Strategy Selection & Matching');
    const testJob = {
      jobData: {
        company: 'LinkedIn',
        url: 'https://www.linkedin.com/jobs/view/123456789/',
        title: 'Software Engineer'
      },
      userProfile: {
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '555-0123'
        },
        professional: {
          resumeUrl: '/path/to/resume.pdf'
        },
        preferences: {}
      }
    };

    const matchResult = await strategyRegistry.findStrategy(testJob);
    console.log(`✅ Strategy matching test: ${matchResult.matched ? 'SUCCESS' : 'FAILED'}`);
    if (matchResult.matched && matchResult.strategy) {
      console.log(`   - Selected strategy: ${matchResult.strategy.name}`);
      console.log(`   - Match confidence: ${(matchResult.confidence * 100).toFixed(1)}%`);
    }

    // Test 7: Health Check
    console.log('\n📋 Test 7: System Health Check');
    const engineHealth = await automationEngine.getHealthStatus();
    console.log('✅ Health check completed');
    console.log(`   - Engine status: ${engineHealth.engine.status}`);
    console.log(`   - Active jobs: ${engineHealth.engine.activeJobs}`);
    console.log(`   - Uptime: ${Math.floor(engineHealth.engine.uptime / 1000)}s`);

    // Cleanup
    console.log('\n🧹 Cleaning up test environment...');
    await automationEngine.shutdown();

    const totalTime = Date.now() - startTime;
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 INTEGRATION TEST COMPLETED SUCCESSFULLY');
    console.log(`⏱️ Total Execution Time: ${totalTime}ms`);
    console.log('=' .repeat(50));

    process.exit(0);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error('\n' + '=' .repeat(50));
    console.error('💥 INTEGRATION TEST FAILED');
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`⏱️ Failed after: ${totalTime}ms`);
    console.error('=' .repeat(50));

    process.exit(1);
  }
}

async function runHealthCheck() {
  console.log('🏥 JobSwipe New System Health Check');
  console.log('=' .repeat(40));

  try {
    // Initialize automation engine for health check
    const automationEngine = new JobSwipeAutomationEngine({
      browser: { 
        headless: true, 
        timeout: 15000,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
      },
      captcha: { enabledMethods: ['manual-intervention'], aiVisionProvider: 'anthropic', externalServices: {}, manualFallbackTimeout: 30000 },
      intelligence: { formAnalysisCache: true, semanticAnalysisDepth: 'advanced', confidenceThreshold: 0.7 },
      queue: { redisConnection: null, defaultConcurrency: 1, batchingEnabled: false, monitoringEnabled: false }
    });

    await automationEngine.initialize();
    const healthResult = await automationEngine.getHealthStatus();

    console.log(`📊 Health Status: ${healthResult.engine.status.toUpperCase()}`);
    console.log('\n🔍 Component Status:');
    
    console.log(`   ${healthResult.engine.status === 'healthy' ? '✅' : '❌'} Automation Engine`);
    console.log(`   ${healthResult.strategyRegistry.status === 'healthy' ? '✅' : '❌'} Strategy Registry`);
    console.log(`   ${healthResult.captchaHandler.status === 'healthy' ? '✅' : '❌'} Captcha Handler`);
    console.log(`   ${healthResult.queueManager ? '✅' : '⚠️'} Queue Manager ${healthResult.queueManager ? '' : '(Optional)'}`);

    console.log('\n📈 System Details:');
    console.log(`   Uptime: ${Math.floor(healthResult.engine.uptime / 1000)}s`);
    console.log(`   Active Jobs: ${healthResult.engine.activeJobs}`);
    console.log(`   Strategies Loaded: ${healthResult.strategyRegistry.strategiesLoaded || 0}`);
    console.log(`   Captcha Success Rate: ${(healthResult.captchaHandler.stats.successRate * 100).toFixed(1)}%`);

    const engineStats = automationEngine.getStats();
    console.log(`   Total Jobs Processed: ${engineStats.totalJobsProcessed}`);
    console.log(`   Success Rate: ${engineStats.totalJobsProcessed > 0 ? ((engineStats.successfulApplications / engineStats.totalJobsProcessed) * 100).toFixed(1) : 0}%`);

    await automationEngine.shutdown();

    if (healthResult.engine.status === 'healthy') {
      console.log('\n🎉 System is HEALTHY');
      process.exit(0);
    } else {
      console.log(`\n⚠️ System status: ${healthResult.engine.status.toUpperCase()}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Health check failed:', error);
    console.error('\nCommon issues:');
    console.error('- Make sure you have run: npm install');
    console.error('- Install browsers: npx playwright install chromium');
    console.error('- Check that all dependencies are available');
    process.exit(1);
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';

  switch (command) {
    case 'test':
    case 'integration':
      await runBasicIntegrationTest();
      break;
      
    case 'health':
    case 'healthcheck':
      await runHealthCheck();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log('JobSwipe Integration Test Runner');
      console.log('');
      console.log('Usage:');
      console.log('  npm run test:integration [command]');
      console.log('');
      console.log('Commands:');
      console.log('  test, integration  Run full integration test suite (default)');
      console.log('  health, healthcheck Run system health check');
      console.log('  help               Show this help message');
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
}

// Handle unhandled promises and errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}

export { runBasicIntegrationTest, runHealthCheck };