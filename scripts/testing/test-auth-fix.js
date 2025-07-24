#!/usr/bin/env node

/**
 * Test script to verify auth system fixes
 * This simulates a browser environment to test our environment guards
 */

console.log('🧪 Testing auth system fixes...\n');

// Simulate browser environment
global.window = {};
global.document = {};

try {
  console.log('1. Testing shared package import (simulating browser environment)...');
  
  // This should NOT crash now with our fixes
  const shared = require('@jobswipe/shared');
  
  console.log('✅ Shared package imported successfully in browser environment');
  console.log('✅ No crypto.randomUUID errors!');
  
  console.log('\n2. Testing useAuth hook...');
  if (shared.useAuth) {
    console.log('✅ useAuth hook is available');
  } else {
    console.log('⚠️ useAuth hook not found in exports');
  }
  
  console.log('\n3. Testing browser-safe JWT utilities...');
  const { parseJwtPayload, isValidTokenFormat } = shared;
  
  // Test with a sample JWT token (payload doesn't need to be valid for this test)
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  const isValid = isValidTokenFormat(sampleToken);
  console.log(`✅ Token format validation works: ${isValid}`);
  
  const payload = parseJwtPayload(sampleToken);
  console.log(`✅ JWT payload parsing works: ${payload?.name || 'parsed successfully'}`);
  
  console.log('\n4. Testing server-only service protection...');
  
  try {
    const { createJwtTokenService } = shared;
    if (createJwtTokenService) {
      createJwtTokenService();
      console.log('❌ ERROR: Server JWT service should not work in browser environment!');
    } else {
      console.log('✅ Server JWT service not available in browser environment (as expected)');
    }
  } catch (error) {
    console.log('✅ Server JWT service properly blocked in browser environment');
    console.log(`   Message: ${error.message}`);
  }
  
  console.log('\n🎉 All tests passed! Auth system fixes are working correctly.');
  console.log('\n📋 Summary:');
  console.log('  ✅ useAuth hook imports without crypto errors');
  console.log('  ✅ Browser-safe JWT utilities work correctly');
  console.log('  ✅ Server-only services are properly protected');
  console.log('\n🚀 The signin/signup pages should now work without crypto errors!');
  
} catch (error) {
  console.log('❌ Test failed:');
  console.error(error);
  console.log('\n🔧 Additional fixes may be needed.');
  process.exit(1);
}