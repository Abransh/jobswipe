#!/usr/bin/env node
/**
 * @fileoverview JobSwipe Integration Test Runner
 * @description Complete end-to-end test of the browser automation system
 * @version 1.0.0
 * @author JobSwipe Team
 */

import path from 'path';
import { BrowserAutomationService } from './services/BrowserAutomationService';
import { PythonBridge } from './services/PythonBridge';

// =============================================================================
// INTEGRATION TEST RUNNER
// =============================================================================

async function runBasicIntegrationTest() {
  console.log('🚀 JobSwipe Integration Test Suite');
  console.log('=' .repeat(50));

  const startTime = Date.now();
  
  try {
    // Test 1: Python Bridge Validation
    console.log('\n📋 Test 1: Python Bridge Initialization');
    const pythonBridge = new PythonBridge();
    await pythonBridge.initialize();
    console.log('✅ Python bridge initialized successfully');

    // Test 2: Browser Automation Service
    console.log('\n📋 Test 2: Browser Automation Service');
    const automationService = new BrowserAutomationService();
    await automationService.initialize();
    console.log('✅ Browser automation service initialized');

    // Test 3: Simple Python Script Execution
    console.log('\n📋 Test 3: Python Script Execution');
    const testScriptPath = path.join(__dirname, '../data/temp/test_automation_simple.py');
    
    const result = await pythonBridge.executeScript(testScriptPath, [], {
      timeout: 60000, // 1 minute timeout for test
      priority: 'high'
    });

    console.log(`📊 Test execution result:`);
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Execution Time: ${result.executionTime}ms`);
    console.log(`   Process ID: ${result.processId}`);
    
    if (result.success && result.data) {
      console.log(`   Test Results:`, result.data);
    } else if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    // Test 4: Bridge Statistics
    console.log('\n📋 Test 4: System Statistics');
    const bridgeStats = pythonBridge.getStats();
    console.log(`   🐍 Total Processes: ${bridgeStats.totalProcesses}`);
    console.log(`   ⚡ Active Tasks: ${bridgeStats.activeTasks}`);
    console.log(`   📦 Total Tasks Executed: ${bridgeStats.totalTasksExecuted}`);
    console.log(`   ⏱️ Average Execution Time: ${bridgeStats.averageExecutionTime.toFixed(0)}ms`);
    console.log(`   💾 Memory Usage: ${(bridgeStats.memoryUsage / 1024 / 1024).toFixed(1)}MB`);

    // Cleanup
    console.log('\n🧹 Cleaning up test environment...');
    await automationService.cleanup();
    await pythonBridge.shutdown();

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
  console.log('🏥 JobSwipe Health Check');
  console.log('=' .repeat(30));

  try {
    // Health check for browser automation service
    const automationService = new BrowserAutomationService();
    const healthResult = await automationService.healthCheck();

    console.log(`📊 Health Status: ${healthResult.status.toUpperCase()}`);
    console.log('\n🔍 Component Checks:');
    
    Object.entries(healthResult.checks).forEach(([component, status]) => {
      console.log(`   ${status ? '✅' : '❌'} ${component}`);
    });

    console.log('\n📈 System Details:');
    console.log(`   Active Processes: ${healthResult.details.activeProcesses}`);
    console.log(`   Max Concurrent Jobs: ${healthResult.details.maxConcurrentJobs}`);
    console.log(`   Queued Jobs: ${healthResult.details.queuedJobs}`);

    if (healthResult.status === 'healthy') {
      console.log('\n🎉 System is HEALTHY');
      process.exit(0);
    } else {
      console.log(`\n⚠️ System is ${healthResult.status.toUpperCase()}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Health check failed:', error);
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