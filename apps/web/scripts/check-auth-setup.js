#!/usr/bin/env node

/**
 * Authentication Setup Checker
 * Validates that all required environment variables are configured correctly
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  log('\n🔍 Checking environment configuration...\n', 'cyan');

  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found', 'red');

    if (fs.existsSync(envExamplePath)) {
      log('💡 Tip: Copy .env.example to .env.local:', 'yellow');
      log('   cp .env.example .env.local', 'yellow');
    } else {
      log('❌ .env.example file also not found', 'red');
    }

    return false;
  }

  log('✅ .env.local file exists', 'green');
  return true;
}

function checkEnvVariables() {
  // Load .env.local
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

  const requiredVars = [
    {
      name: 'JWT_SECRET',
      description: 'JWT signing secret (must match API server)',
      example: 'Generate with: openssl rand -base64 32',
    },
    {
      name: 'NEXT_PUBLIC_JWT_SECRET',
      description: 'Public JWT secret (should match JWT_SECRET)',
      example: 'Same value as JWT_SECRET',
    },
    {
      name: 'API_URL',
      description: 'Backend API server URL',
      example: 'http://localhost:3001',
    },
    {
      name: 'API_BASE_URL',
      description: 'Backend API base URL (fallback)',
      example: 'http://localhost:3001',
    },
  ];

  const optionalVars = [
    'DATABASE_URL',
    'REDIS_HOST',
    'GOOGLE_CLIENT_ID',
    'GITHUB_CLIENT_ID',
  ];

  log('\n📋 Required Environment Variables:\n', 'cyan');

  let allRequiredPresent = true;

  requiredVars.forEach((varConfig) => {
    const value = process.env[varConfig.name];

    if (!value) {
      log(`❌ ${varConfig.name} - MISSING`, 'red');
      log(`   ${varConfig.description}`, 'yellow');
      log(`   ${varConfig.example}`, 'yellow');
      allRequiredPresent = false;
    } else if (value.includes('your-') || value.includes('change-this')) {
      log(`⚠️  ${varConfig.name} - PLACEHOLDER VALUE`, 'yellow');
      log(`   Current: ${value}`, 'yellow');
      log(`   ${varConfig.description}`, 'yellow');
      allRequiredPresent = false;
    } else {
      const displayValue = varConfig.name.includes('SECRET') || varConfig.name.includes('PASSWORD')
        ? '***' + value.substring(value.length - 4)
        : value;
      log(`✅ ${varConfig.name} = ${displayValue}`, 'green');
    }
  });

  // Check JWT secret match
  if (process.env.JWT_SECRET && process.env.NEXT_PUBLIC_JWT_SECRET) {
    if (process.env.JWT_SECRET === process.env.NEXT_PUBLIC_JWT_SECRET) {
      log('✅ JWT secrets match', 'green');
    } else {
      log('❌ JWT_SECRET and NEXT_PUBLIC_JWT_SECRET do not match', 'red');
      allRequiredPresent = false;
    }
  }

  log('\n📋 Optional Environment Variables:\n', 'cyan');

  optionalVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      log(`✅ ${varName} - configured`, 'green');
    } else {
      log(`ℹ️  ${varName} - not configured (optional)`, 'blue');
    }
  });

  return allRequiredPresent;
}

function checkAPIConnection() {
  log('\n🌐 Checking API Connection...\n', 'cyan');

  const apiUrl = process.env.API_URL || process.env.API_BASE_URL;

  if (!apiUrl) {
    log('❌ No API URL configured', 'red');
    return;
  }

  log(`📡 Testing connection to: ${apiUrl}`, 'cyan');

  // Try to connect to API health endpoint
  fetch(`${apiUrl}/api/health`)
    .then((response) => {
      if (response.ok) {
        log('✅ API server is reachable', 'green');
      } else {
        log(`⚠️  API server responded with status: ${response.status}`, 'yellow');
      }
    })
    .catch((error) => {
      log('❌ Cannot connect to API server', 'red');
      log(`   ${error.message}`, 'yellow');
      log('\n💡 Make sure the API server is running:', 'yellow');
      log('   cd apps/api && npm run dev', 'yellow');
    });
}

function generateJWTSecret() {
  const crypto = require('crypto');
  const secret = crypto.randomBytes(32).toString('base64');

  log('\n🔑 Generated JWT Secret:', 'cyan');
  log(`   ${secret}`, 'green');
  log('\n💡 Add this to your .env.local file:', 'yellow');
  log(`   JWT_SECRET=${secret}`, 'yellow');
  log(`   NEXT_PUBLIC_JWT_SECRET=${secret}`, 'yellow');
}

function main() {
  log('╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     JobSwipe Authentication Setup Checker             ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  const hasEnvFile = checkEnvFile();

  if (!hasEnvFile) {
    log('\n❌ Setup incomplete - .env.local file is required', 'red');
    generateJWTSecret();
    process.exit(1);
  }

  const hasRequiredVars = checkEnvVariables();

  if (!hasRequiredVars) {
    log('\n❌ Setup incomplete - missing required environment variables', 'red');
    generateJWTSecret();
    process.exit(1);
  }

  checkAPIConnection();

  log('\n╔════════════════════════════════════════════════════════╗', 'green');
  log('║     ✅ Authentication setup looks good!                ║', 'green');
  log('╚════════════════════════════════════════════════════════╝', 'green');

  log('\n📚 For troubleshooting, see: AUTHENTICATION_SETUP.md\n', 'cyan');
}

main();
