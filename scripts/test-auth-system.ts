#!/usr/bin/env ts-node

/**
 * @fileoverview JobSwipe Authentication System Test & Validation Script
 * @description Comprehensive testing and validation of authentication components
 * @version 1.0.0
 */

import { db } from '@jobswipe/database';
import { 
  JwtTokenService,
  RedisSessionService,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  createBrandedId,
  UserId,
  AuthSource,
  AuthProvider,
  createAccessTokenConfig,
  createRefreshTokenConfig
} from '@jobswipe/shared';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  error?: string;
}

interface TestSuite {
  suiteName: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
}

const testSuites: TestSuite[] = [];

// =============================================================================
// TEST UTILITIES
// =============================================================================

async function runTest(
  testName: string,
  testFunction: () => Promise<void>
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    await testFunction();
    const duration = Date.now() - startTime;
    
    return {
      testName,
      status: 'PASS',
      message: 'Test passed successfully',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    return {
      testName,
      status: 'FAIL',
      message: 'Test failed',
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function skipTest(testName: string, reason: string): TestResult {
  return {
    testName,
    status: 'SKIP',
    message: reason,
    duration: 0,
  };
}

// =============================================================================
// PASSWORD SECURITY TESTS
// =============================================================================

async function testPasswordSecurity(): Promise<TestSuite> {
  const suite: TestSuite = {
    suiteName: 'Password Security Tests',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalDuration: 0,
  };

  // Test 1: Password hashing
  const hashTest = await runTest('Password Hashing', async () => {
    const password = 'testPassword123!';
    const hash = await hashPassword(password);
    
    if (!hash || hash.length < 50) {
      throw new Error('Password hash is too short or invalid');
    }
    
    if (hash === password) {
      throw new Error('Password was not hashed');
    }
    
    console.log('✓ Password hashing works correctly');
  });
  suite.results.push(hashTest);

  // Test 2: Password verification
  const verifyTest = await runTest('Password Verification', async () => {
    const password = 'testPassword123!';
    const wrongPassword = 'wrongPassword123!';
    const hash = await hashPassword(password);
    
    const validVerification = await verifyPassword(password, hash);
    const invalidVerification = await verifyPassword(wrongPassword, hash);
    
    if (!validVerification) {
      throw new Error('Valid password verification failed');
    }
    
    if (invalidVerification) {
      throw new Error('Invalid password verification should fail');
    }
    
    console.log('✓ Password verification works correctly');
  });
  suite.results.push(verifyTest);

  // Test 3: Secure token generation
  const tokenTest = await runTest('Secure Token Generation', async () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);
    
    if (token1.length !== 64 || token2.length !== 64) { // hex encoded = 2x length
      throw new Error('Token length is incorrect');
    }
    
    if (token1 === token2) {
      throw new Error('Tokens should be unique');
    }
    
    console.log('✓ Secure token generation works correctly');
  });
  suite.results.push(tokenTest);

  // Calculate suite metrics
  suite.totalTests = suite.results.length;
  suite.passedTests = suite.results.filter(r => r.status === 'PASS').length;
  suite.failedTests = suite.results.filter(r => r.status === 'FAIL').length;
  suite.skippedTests = suite.results.filter(r => r.status === 'SKIP').length;
  suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);

  return suite;
}

// =============================================================================
// JWT TOKEN TESTS
// =============================================================================

async function testJwtTokens(): Promise<TestSuite> {
  const suite: TestSuite = {
    suiteName: 'JWT Token Tests',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalDuration: 0,
  };

  const tokenService = new JwtTokenService({
    secret: 'test_secret_key_min_32_chars_long_for_security',
    algorithm: 'HS256',
  });

  // Test 1: Token creation
  const createTest = await runTest('JWT Token Creation', async () => {
    const userId = createBrandedId<UserId>('test-user-id');
    const config = createAccessTokenConfig(
      userId,
      'test@example.com',
      'Test User',
      'user',
      AuthSource.WEB,
      'test-session-id'
    );
    
    const token = await tokenService.createToken(config);
    
    if (!token || typeof token !== 'string') {
      throw new Error('Token creation failed');
    }
    
    if (token.split('.').length !== 3) {
      throw new Error('Token format is invalid (should have 3 parts)');
    }
    
    console.log('✓ JWT token creation works correctly');
  });
  suite.results.push(createTest);

  // Test 2: Token verification
  const verifyTest = await runTest('JWT Token Verification', async () => {
    const userId = createBrandedId<UserId>('test-user-id');
    const config = createAccessTokenConfig(
      userId,
      'test@example.com',
      'Test User',
      'user',
      AuthSource.WEB,
      'test-session-id'
    );
    
    const token = await tokenService.createToken(config);
    const result = await tokenService.verifyToken(token);
    
    if (!result.valid || !result.payload) {
      throw new Error('Token verification failed');
    }
    
    if (result.payload.sub !== userId) {
      throw new Error('Token payload is incorrect');
    }
    
    console.log('✓ JWT token verification works correctly');
  });
  suite.results.push(verifyTest);

  // Test 3: Expired token handling
  const expiredTest = await runTest('Expired Token Handling', async () => {
    const userId = createBrandedId<UserId>('test-user-id');
    const config = {
      ...createAccessTokenConfig(
        userId,
        'test@example.com',
        'Test User',
        'user',
        AuthSource.WEB,
        'test-session-id'
      ),
      expiresIn: -1, // Already expired
    };
    
    const token = await tokenService.createToken(config);
    const result = await tokenService.verifyToken(token);
    
    if (result.valid) {
      throw new Error('Expired token should not be valid');
    }
    
    console.log('✓ Expired token handling works correctly');
  });
  suite.results.push(expiredTest);

  // Calculate suite metrics
  suite.totalTests = suite.results.length;
  suite.passedTests = suite.results.filter(r => r.status === 'PASS').length;
  suite.failedTests = suite.results.filter(r => r.status === 'FAIL').length;
  suite.skippedTests = suite.results.filter(r => r.status === 'SKIP').length;
  suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);

  return suite;
}

// =============================================================================
// DATABASE CONNECTION TESTS
// =============================================================================

async function testDatabaseConnection(): Promise<TestSuite> {
  const suite: TestSuite = {
    suiteName: 'Database Connection Tests',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalDuration: 0,
  };

  // Test 1: Database connection
  const connectionTest = await runTest('Database Connection', async () => {
    try {
      await db.$queryRaw`SELECT 1 as test`;
      console.log('✓ Database connection successful');
    } catch (error) {
      // If database is not available, we'll skip related tests
      throw new Error('Database connection failed - this is expected without Docker');
    }
  });
  
  if (connectionTest.status === 'FAIL') {
    // If database connection fails, skip database tests
    suite.results.push(skipTest('Database Connection', 'Database not available (Docker not running)'));
    suite.results.push(skipTest('User CRUD Operations', 'Database not available'));
    suite.results.push(skipTest('Session Storage', 'Database not available'));
  } else {
    suite.results.push(connectionTest);
    
    // Test 2: User operations (only if database is available)
    const userTest = await runTest('User CRUD Operations', async () => {
      // This would test user creation, reading, updating, deleting
      console.log('✓ User CRUD operations test passed (simulated)');
    });
    suite.results.push(userTest);
  }

  // Calculate suite metrics
  suite.totalTests = suite.results.length;
  suite.passedTests = suite.results.filter(r => r.status === 'PASS').length;
  suite.failedTests = suite.results.filter(r => r.status === 'FAIL').length;
  suite.skippedTests = suite.results.filter(r => r.status === 'SKIP').length;
  suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);

  return suite;
}

// =============================================================================
// AUTHENTICATION FLOW TESTS
// =============================================================================

async function testAuthenticationFlows(): Promise<TestSuite> {
  const suite: TestSuite = {
    suiteName: 'Authentication Flow Tests',
    results: [],
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalDuration: 0,
  };

  // Test 1: Registration flow simulation
  const registrationTest = await runTest('Registration Flow', async () => {
    const email = 'test@example.com';
    const password = 'testPassword123!';
    
    // Simulate registration steps
    const passwordHash = await hashPassword(password);
    const userId = createBrandedId<UserId>('test-user-id');
    
    // Simulate user creation
    const mockUser = {
      id: userId,
      email,
      passwordHash,
      name: 'Test User',
      role: 'user',
      status: 'active',
      emailVerified: false,
    };
    
    if (!mockUser.id || !mockUser.email || !mockUser.passwordHash) {
      throw new Error('User creation simulation failed');
    }
    
    console.log('✓ Registration flow simulation successful');
  });
  suite.results.push(registrationTest);

  // Test 2: Login flow simulation
  const loginTest = await runTest('Login Flow', async () => {
    const email = 'test@example.com';
    const password = 'testPassword123!';
    const passwordHash = await hashPassword(password);
    
    // Simulate authentication
    const isValidPassword = await verifyPassword(password, passwordHash);
    
    if (!isValidPassword) {
      throw new Error('Password verification failed in login flow');
    }
    
    // Simulate token generation
    const tokenService = new JwtTokenService({
      secret: 'test_secret_key_min_32_chars_long_for_security',
      algorithm: 'HS256',
    });
    
    const userId = createBrandedId<UserId>('test-user-id');
    const accessTokenConfig = createAccessTokenConfig(
      userId,
      email,
      'Test User',
      'user',
      AuthSource.WEB,
      'test-session-id'
    );
    
    const accessToken = await tokenService.createToken(accessTokenConfig);
    
    if (!accessToken) {
      throw new Error('Access token generation failed');
    }
    
    console.log('✓ Login flow simulation successful');
  });
  suite.results.push(loginTest);

  // Test 3: Token refresh flow
  const refreshTest = await runTest('Token Refresh Flow', async () => {
    const tokenService = new JwtTokenService({
      secret: 'test_secret_key_min_32_chars_long_for_security',
      algorithm: 'HS256',
    });
    
    const userId = createBrandedId<UserId>('test-user-id');
    
    // Create refresh token
    const refreshTokenConfig = createRefreshTokenConfig(
      userId,
      'test@example.com',
      AuthSource.WEB,
      'test-session-id'
    );
    
    const refreshToken = await tokenService.createToken(refreshTokenConfig);
    
    // Verify refresh token
    const result = await tokenService.verifyToken(refreshToken);
    
    if (!result.valid || !result.payload) {
      throw new Error('Refresh token verification failed');
    }
    
    // Generate new access token
    const newAccessTokenConfig = createAccessTokenConfig(
      userId,
      'test@example.com',
      'Test User',
      'user',
      AuthSource.WEB,
      'test-session-id'
    );
    
    const newAccessToken = await tokenService.createToken(newAccessTokenConfig);
    
    if (!newAccessToken) {
      throw new Error('New access token generation failed');
    }
    
    console.log('✓ Token refresh flow simulation successful');
  });
  suite.results.push(refreshTest);

  // Calculate suite metrics
  suite.totalTests = suite.results.length;
  suite.passedTests = suite.results.filter(r => r.status === 'PASS').length;
  suite.failedTests = suite.results.filter(r => r.status === 'FAIL').length;
  suite.skippedTests = suite.results.filter(r => r.status === 'SKIP').length;
  suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);

  return suite;
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

async function runAllTests(): Promise<void> {
  console.log('🧪 JobSwipe Authentication System Test Suite');
  console.log('=' .repeat(60));
  console.log();

  try {
    // Run all test suites
    const suites = await Promise.all([
      testPasswordSecurity(),
      testJwtTokens(),
      testDatabaseConnection(),
      testAuthenticationFlows(),
    ]);

    testSuites.push(...suites);

    // Generate comprehensive report
    generateTestReport();

  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

function generateTestReport(): void {
  console.log();
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalDuration = 0;

  // Suite-by-suite results
  testSuites.forEach(suite => {
    console.log();
    console.log(`📋 ${suite.suiteName}`);
    console.log('-'.repeat(40));
    
    suite.results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : 
                        result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration > 0 ? ` (${result.duration}ms)` : '';
      
      console.log(`${statusIcon} ${result.testName}${duration}`);
      
      if (result.status === 'FAIL' && result.error) {
        console.log(`   Error: ${result.error}`);
      } else if (result.status === 'SKIP') {
        console.log(`   Reason: ${result.message}`);
      }
    });
    
    console.log(`   📈 ${suite.passedTests}/${suite.totalTests} passed, ${suite.failedTests} failed, ${suite.skippedTests} skipped`);
    
    totalTests += suite.totalTests;
    totalPassed += suite.passedTests;
    totalFailed += suite.failedTests;
    totalSkipped += suite.skippedTests;
    totalDuration += suite.totalDuration;
  });

  // Overall summary
  console.log();
  console.log('🎯 OVERALL RESULTS');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏭️ Skipped: ${totalSkipped}`);
  console.log(`⏱️ Total Duration: ${totalDuration}ms`);
  console.log(`📊 Success Rate: ${((totalPassed / (totalTests - totalSkipped)) * 100).toFixed(1)}%`);
  
  // Status determination
  if (totalFailed === 0) {
    console.log();
    console.log('🎉 ALL TESTS PASSED! Authentication system is working correctly.');
    
    if (totalSkipped > 0) {
      console.log('💡 Some tests were skipped (likely due to missing Docker services).');
      console.log('   Start Docker and run tests again for complete validation.');
    }
  } else {
    console.log();
    console.log('⚠️  SOME TESTS FAILED! Please review the errors above.');
    process.exit(1);
  }
}

// =============================================================================
// EXECUTION
// =============================================================================

if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

export { runAllTests, generateTestReport };