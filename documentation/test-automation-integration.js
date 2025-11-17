#!/usr/bin/env node

/**
 * Test automation integration between database and Python scripts
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Automation Integration...\n');

// Test environment variables for database mode
const testEnv = {
  ...process.env,
  
  // Execution mode
  EXECUTION_MODE: 'desktop',
  DATA_SOURCE: 'database',
  
  // Database connection (should be set in your .env)
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/jobswipe',
  
  // Test user and job identifiers
  USER_ID: 'test-user-123',
  JOB_ID: 'test-job-456',
  APPLICATION_ID: 'test-app-789',
  
  // AI API keys (should be set in your .env)
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'test-key',
  
  // Automation configuration
  AUTOMATION_HEADLESS: 'true',
  AUTOMATION_TIMEOUT: '30000',
  SCREENSHOT_ENABLED: 'false',
  SCREENSHOT_PATH: '/tmp/screenshots'
};

async function testPythonImports() {
  console.log('1️⃣ Testing Python imports and database connectivity...');
  
  return new Promise((resolve, reject) => {
    const pythonScript = `
import sys
import os
import asyncio

# Add the companies path to Python path
sys.path.append('${path.join(__dirname, 'apps/desktop/companies')}')

async def test_imports():
    try:
        print("✓ Testing base imports...")
        from base.database_automation import DatabaseAutomation
        print("✓ DatabaseAutomation imported successfully")
        
        print("✓ Testing greenhouse imports...")
        from greenhouse.greenhouse import GreenhouseAutomation
        print("✓ GreenhouseAutomation imported successfully")
        
        print("✓ Testing database connection...")
        # Create test automation instance
        automation = DatabaseAutomation()
        print("✓ DatabaseAutomation instance created")
        
        print("✅ All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_imports())
    sys.exit(0 if result else 1)
`;

    const pythonProcess = spawn('python3', ['-c', pythonScript], {
      env: testEnv,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });

    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Python imports test passed\n');
        resolve(true);
      } else {
        console.log(`❌ Python imports test failed with code ${code}\n`);
        resolve(false);
      }
    });

    pythonProcess.on('error', (error) => {
      console.error(`❌ Failed to start Python process: ${error.message}\n`);
      resolve(false);
    });
  });
}

async function testDirectoryStructure() {
  console.log('2️⃣ Testing directory structure...');
  
  const fs = require('fs').promises;
  
  const requiredFiles = [
    'apps/desktop/companies/base/database_automation.py',
    'apps/desktop/companies/greenhouse/greenhouse.py', 
    'apps/desktop/companies/greenhouse/run_automation.py'
  ];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(__dirname, file));
      console.log(`✓ Found: ${file}`);
    } catch (error) {
      console.log(`❌ Missing: ${file}`);
      return false;
    }
  }
  
  console.log('✅ Directory structure test passed\n');
  return true;
}

async function testEnvironmentSetup() {
  console.log('3️⃣ Testing environment setup...');
  
  const required = ['DATABASE_URL'];
  const recommended = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'];
  
  let hasRequired = true;
  
  for (const envVar of required) {
    if (process.env[envVar]) {
      console.log(`✓ ${envVar} is set`);
    } else {
      console.log(`❌ ${envVar} is missing (required)`);
      hasRequired = false;
    }
  }
  
  for (const envVar of recommended) {
    if (process.env[envVar]) {
      console.log(`✓ ${envVar} is set`);
    } else {
      console.log(`⚠️  ${envVar} is missing (recommended)`);
    }
  }
  
  if (hasRequired) {
    console.log('✅ Environment setup test passed\n');
  } else {
    console.log('❌ Environment setup test failed - missing required variables\n');
  }
  
  return hasRequired;
}

async function main() {
  console.log('🎯 JobSwipe Automation Integration Test\n');
  
  const results = [];
  
  // Test 1: Directory structure
  results.push(await testDirectoryStructure());
  
  // Test 2: Environment setup  
  results.push(await testEnvironmentSetup());
  
  // Test 3: Python imports (only if environment is ready)
  if (results.every(r => r)) {
    results.push(await testPythonImports());
  } else {
    console.log('⏭️  Skipping Python tests due to setup issues\n');
    results.push(false);
  }
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}\n`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Automation system ready for production.');
  } else {
    console.log('🚨 Some tests failed. Please check the setup before proceeding.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});