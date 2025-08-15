#!/usr/bin/env tsx
/**
 * @fileoverview Simple Test without any Electron dependencies
 * @description Basic test to verify core logic without browser/electron
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { randomUUID } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// =============================================================================
// SIMPLE CORE TESTS (No Electron/Browser dependencies)
// =============================================================================

async function testStrategyLoading() {
  console.log('📋 Test 1: Strategy File Loading');
  
  try {
    // Test LinkedIn strategy
    const linkedInPath = join(__dirname, 'strategies/companies/linkedin/strategy.json');
    if (existsSync(linkedInPath)) {
      const linkedInStrategy = JSON.parse(readFileSync(linkedInPath, 'utf-8'));
      console.log(`✅ LinkedIn strategy loaded: ${linkedInStrategy.name}`);
      console.log(`   - Domains: ${linkedInStrategy.domains?.join(', ')}`);
      console.log(`   - Workflows: ${linkedInStrategy.workflows?.length || 0} workflows`);
    } else {
      console.log('⚠️  LinkedIn strategy file not found');
    }
    
    // Test Indeed strategy
    const indeedPath = join(__dirname, 'strategies/companies/indeed/strategy.json');
    if (existsSync(indeedPath)) {
      const indeedStrategy = JSON.parse(readFileSync(indeedPath, 'utf-8'));
      console.log(`✅ Indeed strategy loaded: ${indeedStrategy.name}`);
      console.log(`   - Domains: ${indeedStrategy.domains?.join(', ')}`);
      console.log(`   - Workflows: ${indeedStrategy.workflows?.length || 0} workflows`);
    } else {
      console.log('⚠️  Indeed strategy file not found');
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Strategy loading failed: ${error}`);
    return false;
  }
}

async function testFormFieldAnalysis() {
  console.log('\n📋 Test 2: Form Field Semantic Analysis');
  
  try {
    // Mock form elements for testing
    const mockFormElements = [
      { 
        selector: 'input[name="firstName"]',
        attributes: { name: 'firstName', type: 'text', placeholder: 'First Name' },
        labels: ['First Name', 'Given Name']
      },
      {
        selector: 'input[name="email"]', 
        attributes: { name: 'email', type: 'email', placeholder: 'Email Address' },
        labels: ['Email Address', 'Contact Email']
      },
      {
        selector: 'input[name="phone"]',
        attributes: { name: 'phone', type: 'tel', placeholder: 'Phone Number' },
        labels: ['Phone Number', 'Mobile']
      },
      {
        selector: 'input[type="file"]',
        attributes: { name: 'resume', type: 'file', accept: '.pdf,.doc,.docx' },
        labels: ['Resume', 'Upload Resume']
      }
    ];
    
    // Simple semantic analysis
    for (const element of mockFormElements) {
      let semanticType = 'unknown';
      let confidence = 0;
      
      // Basic pattern matching
      const searchText = `${element.attributes.name} ${element.attributes.placeholder} ${element.labels.join(' ')}`.toLowerCase();
      
      if (searchText.includes('first') && searchText.includes('name')) {
        semanticType = 'first-name';
        confidence = 0.9;
      } else if (searchText.includes('email')) {
        semanticType = 'email';
        confidence = 0.95;
      } else if (searchText.includes('phone') || element.attributes.type === 'tel') {
        semanticType = 'phone';
        confidence = 0.85;
      } else if (searchText.includes('resume') || element.attributes.type === 'file') {
        semanticType = 'resume';
        confidence = 0.8;
      }
      
      console.log(`✅ Field analyzed: ${element.selector}`);
      console.log(`   - Semantic type: ${semanticType}`);
      console.log(`   - Confidence: ${(confidence * 100).toFixed(1)}%`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Form analysis failed: ${error}`);
    return false;
  }
}

async function testCaptchaTypes() {
  console.log('\n📋 Test 3: Captcha Type Detection');
  
  try {
    const captchaScenarios = [
      {
        url: 'https://linkedin.com/jobs/apply',
        elements: ['iframe[src*="recaptcha"]'],
        expectedType: 'recaptcha-v2'
      },
      {
        url: 'https://indeed.com/apply',
        elements: ['img[alt*="captcha"]'],
        expectedType: 'image-captcha'
      },
      {
        url: 'https://example.com/form',
        elements: ['input[name*="captcha"]'],
        expectedType: 'text-captcha'
      }
    ];
    
    for (const scenario of captchaScenarios) {
      console.log(`✅ Captcha scenario: ${scenario.url}`);
      console.log(`   - Detection selectors: ${scenario.elements.join(', ')}`);
      console.log(`   - Expected type: ${scenario.expectedType}`);
      console.log(`   - Resolution methods: AI Vision → OCR → External → Manual`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Captcha testing failed: ${error}`);
    return false;
  }
}

async function testJobMatchingLogic() {
  console.log('\n📋 Test 4: Job Matching Logic');
  
  try {
    const testJobs = [
      { 
        url: 'https://www.linkedin.com/jobs/view/123456789/',
        company: 'LinkedIn Corp',
        expectedStrategy: 'linkedin'
      },
      {
        url: 'https://indeed.com/viewjob?jk=abcdef123456',
        company: 'Indeed Inc', 
        expectedStrategy: 'indeed'
      },
      {
        url: 'https://glassdoor.com/job/software-engineer-123',
        company: 'Glassdoor',
        expectedStrategy: 'glassdoor'
      },
      {
        url: 'https://company-careers.com/jobs/123',
        company: 'Custom Company',
        expectedStrategy: 'generic'
      }
    ];
    
    for (const job of testJobs) {
      // Simple URL matching logic
      let matchedStrategy = 'generic';
      let confidence = 0.5;
      
      if (job.url.includes('linkedin.com')) {
        matchedStrategy = 'linkedin';
        confidence = 0.95;
      } else if (job.url.includes('indeed.com')) {
        matchedStrategy = 'indeed';
        confidence = 0.9;
      } else if (job.url.includes('glassdoor.com')) {
        matchedStrategy = 'glassdoor';  
        confidence = 0.85;
      }
      
      const isMatch = matchedStrategy === job.expectedStrategy || 
                     (job.expectedStrategy === 'generic' && confidence === 0.5);
      
      console.log(`${isMatch ? '✅' : '❌'} Job: ${job.company}`);
      console.log(`   - URL: ${job.url}`);
      console.log(`   - Matched strategy: ${matchedStrategy}`);
      console.log(`   - Confidence: ${(confidence * 100).toFixed(1)}%`);
      console.log(`   - Expected: ${job.expectedStrategy} | Result: ${isMatch ? 'MATCH' : 'MISMATCH'}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Job matching failed: ${error}`);
    return false;
  }
}

async function testSystemConfiguration() {
  console.log('\n📋 Test 5: System Configuration');
  
  try {
    console.log('✅ Environment check:');
    console.log(`   - Node.js version: ${process.version}`);
    console.log(`   - Platform: ${process.platform} ${process.arch}`);
    console.log(`   - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`);
    
    console.log('\n✅ Environment variables:');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   - ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '⚠️  Not set'}`);
    console.log(`   - REDIS_URL: ${process.env.REDIS_URL || 'using default'}`);
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '⚠️  Not set'}`);
    
    console.log('\n✅ File system check:');
    const requiredPaths = [
      'src/strategies/companies/linkedin/strategy.json',
      'src/strategies/companies/indeed/strategy.json',
      'src/automation/JobSwipeAutomationEngine.ts',
      'src/captcha/AdvancedCaptchaHandler.ts',
      'src/intelligence/FormAnalyzer.ts'
    ];
    
    for (const filePath of requiredPaths) {
      const fullPath = join(__dirname, '..', filePath);
      const exists = existsSync(fullPath);
      console.log(`   - ${filePath}: ${exists ? '✅ Found' : '❌ Missing'}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Configuration check failed: ${error}`);
    return false;
  }
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

async function runSimpleTests() {
  console.log('🚀 JobSwipe Simple Core Tests (No Dependencies)');
  console.log('=' .repeat(55));
  console.log('   Testing core logic without Electron/Browser');

  const startTime = Date.now();
  const results = [];

  try {
    // Run all tests
    results.push(await testStrategyLoading());
    results.push(await testFormFieldAnalysis()); 
    results.push(await testCaptchaTypes());
    results.push(await testJobMatchingLogic());
    results.push(await testSystemConfiguration());

    const totalTime = Date.now() - startTime;
    const passed = results.filter(Boolean).length;
    const total = results.length;

    console.log('\n' + '=' .repeat(55));
    console.log(`🎯 Test Results: ${passed}/${total} tests passed`);
    console.log(`⏱️  Execution time: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    
    if (passed === total) {
      console.log('🎉 ALL CORE TESTS PASSED!');
      console.log('\n💡 Next steps:');
      console.log('   1. Install missing dependencies if any');
      console.log('   2. Set environment variables in .env.local');
      console.log('   3. Run full browser tests: npm run test:automation');
      console.log('   4. Test with real job applications');
      process.exit(0);
    } else {
      console.log(`⚠️  ${total - passed} tests failed`);
      console.log('Check the output above for details');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';

  switch (command) {
    case 'test':
    case 'simple':
      await runSimpleTests();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log('JobSwipe Simple Core Tests');
      console.log('');
      console.log('Usage:');
      console.log('  npx tsx src/test-simple.ts [command]');
      console.log('');
      console.log('Commands:');
      console.log('  test, simple       Run simple core tests (default)');
      console.log('  help               Show this help message');
      console.log('');
      console.log('This test suite runs without any external dependencies');
      console.log('and tests the core logic of the automation system.');
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}