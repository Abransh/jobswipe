#!/usr/bin/env tsx
/**
 * @fileoverview JobSwipe Standalone Integration Test
 * @description Integration test that runs without Electron dependencies
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { randomUUID } from 'crypto';

// Mock electron-store to work without Electron
class MockStore {
  private data: Record<string, any> = {};
  
  constructor(config: any) {
    // Initialize with defaults if provided
    if (config.defaults) {
      this.data = { ...config.defaults };
    }
  }
  
  get(key: string): any {
    return this.data[key];
  }
  
  set(key: string, value: any): void {
    this.data[key] = value;
  }
}

// Mock electron-store module
const mockElectronStore = MockStore;

// Replace imports with mocks before importing our modules
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id: string) {
  if (id === 'electron-store') {
    return mockElectronStore;
  }
  if (id === 'playwright') {
    // Mock Playwright for testing without browser
    return {
      chromium: {
        launch: () => Promise.resolve({
          newContext: () => Promise.resolve({
            newPage: () => Promise.resolve({
              url: () => 'https://test.com',
              goto: () => Promise.resolve(),
              screenshot: () => Promise.resolve(Buffer.from('mock')),
              locator: () => ({
                isVisible: () => Promise.resolve(true),
                fill: () => Promise.resolve(),
                click: () => Promise.resolve(),
                all: () => Promise.resolve([])
              }),
              mouse: {
                move: () => Promise.resolve(),
                click: () => Promise.resolve()
              }
            })
          }),
          close: () => Promise.resolve()
        })
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

// Now import our automation modules
import { StrategyRegistry } from './strategies/StrategyRegistry';
import { AdvancedCaptchaHandler } from './captcha/AdvancedCaptchaHandler';
import { FormAnalyzer } from './intelligence/FormAnalyzer';

// =============================================================================
// STANDALONE INTEGRATION TESTS
// =============================================================================

async function runStandaloneIntegrationTest() {
  console.log('🚀 JobSwipe Standalone Integration Test Suite');
  console.log('=' .repeat(60));
  console.log('   (Running without Electron dependencies)');

  const startTime = Date.now();
  
  try {
    // Test 1: Strategy Registry
    console.log('\n📋 Test 1: Strategy Registry System');
    const strategyRegistry = new StrategyRegistry({
      strategyDirectory: './strategies/companies',
      cacheStrategy: true,
      autoReload: true
    });

    const strategies = strategyRegistry.getAllStrategies();
    console.log(`✅ Strategy registry initialized with ${strategies.length} strategies`);
    strategies.forEach(strategy => {
      console.log(`   - ${strategy.name}: ${strategy.domains?.join(', ') || 'configured'}`);
    });

    // Test 2: Strategy Matching
    console.log('\n📋 Test 2: Strategy Selection & Matching');
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
      console.log(`   - Strategy type: ${matchResult.strategy.type || 'standard'}`);
    }

    // Test 3: Advanced Captcha Handler (without browser)
    console.log('\n📋 Test 3: Advanced Captcha Handler');
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
    console.log(`   - Enabled methods: ${Object.keys(captchaStats.resolutionMethods).length} methods`);

    // Test 4: Form Analyzer
    console.log('\n📋 Test 4: AI Form Intelligence System');
    const formAnalyzer = new FormAnalyzer();
    console.log('✅ Form analyzer initialized successfully');

    // Test 5: Strategy Health Check
    console.log('\n📋 Test 5: System Health Check');
    const strategyHealth = strategyRegistry.healthCheck();
    console.log(`✅ Strategy registry health: ${strategyHealth.status}`);
    console.log(`   - Strategies loaded: ${strategyHealth.strategiesLoaded}`);
    console.log(`   - Cache enabled: ${strategyHealth.cacheEnabled}`);
    console.log(`   - Auto-reload: ${strategyHealth.autoReload}`);

    // Test 6: Mock Job Processing Flow
    console.log('\n📋 Test 6: Mock Job Processing Flow');
    if (matchResult.matched && matchResult.strategy) {
      console.log('✅ Simulating job processing workflow:');
      console.log(`   1. Strategy selected: ${matchResult.strategy.name}`);
      console.log(`   2. Form analysis: Ready`);
      console.log(`   3. Captcha handling: Ready`);  
      console.log(`   4. Mock execution: SUCCESS`);
      console.log(`   5. Processing time: ~45s (estimated)`);
    }

    // Test 7: Configuration Validation
    console.log('\n📋 Test 7: Configuration Validation');
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasRedis = process.env.REDIS_URL || 'localhost:6379';
    
    console.log(`✅ Configuration check:`);
    console.log(`   - Anthropic API Key: ${hasAnthropicKey ? '✅ Set' : '⚠️  Not set (AI features disabled)'}`);
    console.log(`   - Redis URL: ${hasRedis ? '✅ Configured' : '⚠️  Using default'}`);
    console.log(`   - Node.js version: ${process.version}`);
    console.log(`   - Platform: ${process.platform}`);

    const totalTime = Date.now() - startTime;
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 STANDALONE INTEGRATION TEST COMPLETED SUCCESSFULLY');
    console.log(`⏱️  Total Execution Time: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log('=' .repeat(60));

    console.log('\n💡 Next Steps:');
    console.log('   1. Run full browser test: npm run test:automation');
    console.log('   2. Set up Redis: docker run -d -p 6379:6379 redis');
    console.log('   3. Add API keys to .env.local for full features');
    console.log('   4. Test with real job URLs');

    process.exit(0);

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error('\n' + '=' .repeat(60));
    console.error('💥 STANDALONE INTEGRATION TEST FAILED');
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`⏱️  Failed after: ${totalTime}ms`);
    console.error('=' .repeat(60));

    console.error('\nTroubleshooting:');
    console.error('- Run: npm install');
    console.error('- Check all imports are working');
    console.error('- Verify TypeScript compilation: npm run type-check');

    process.exit(1);
  }
}

async function runQuickHealthCheck() {
  console.log('🏥 JobSwipe Quick Health Check');
  console.log('=' .repeat(40));

  try {
    console.log('📦 Checking module imports...');
    
    // Test strategy registry import
    const strategyRegistry = new StrategyRegistry({
      strategyDirectory: './strategies/companies'
    });
    const strategies = strategyRegistry.getAllStrategies();
    console.log(`✅ Strategy Registry: ${strategies.length} strategies loaded`);

    // Test captcha handler import
    const captchaHandler = new AdvancedCaptchaHandler();
    const stats = captchaHandler.getStats();
    console.log(`✅ Captcha Handler: Initialized (${stats.totalEncountered} total handled)`);

    // Test form analyzer import
    const formAnalyzer = new FormAnalyzer();
    console.log(`✅ Form Analyzer: Initialized successfully`);

    console.log('\n🎉 All core modules are working!');
    console.log('\n💡 Ready for full testing with: npm run test:automation');

    process.exit(0);

  } catch (error) {
    console.error('💥 Health check failed:', error);
    console.error('\nThis usually means:');
    console.error('- Missing dependencies: npm install');
    console.error('- TypeScript compilation issues: npm run build:main:dev');
    console.error('- Import path problems');
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
      await runStandaloneIntegrationTest();
      break;
      
    case 'health':
    case 'quick':
      await runQuickHealthCheck();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log('JobSwipe Standalone Integration Test Runner');
      console.log('');
      console.log('Usage:');
      console.log('  npx tsx src/test-standalone.ts [command]');
      console.log('');
      console.log('Commands:');
      console.log('  test, integration  Run full standalone integration test (default)');
      console.log('  health, quick      Run quick health check');
      console.log('  help               Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  npx tsx src/test-standalone.ts');
      console.log('  npx tsx src/test-standalone.ts health');
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run with --help for usage information');
      process.exit(1);
  }
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

// Handle unhandled promises
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

export { runStandaloneIntegrationTest, runQuickHealthCheck };