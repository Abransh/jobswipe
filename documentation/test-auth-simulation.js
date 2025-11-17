#!/usr/bin/env node
/**
 * JobSwipe Authentication Issue Simulation
 * Simulates the user's exact scenario: refreshToken present, accessToken missing
 */

const http = require('http');

// Simulate user's exact cookie state
const userCookies = 'refreshToken=simulated_user_refresh_token; __next_hmr_refresh_hash__=57e90ffba3';

console.log('🧪 JobSwipe Authentication Test');
console.log('===============================');
console.log('🎯 Simulating user scenario: refreshToken present, accessToken missing');
console.log('🍪 Cookies:', userCookies);
console.log('');

// Test 1: Token Bridge
console.log('🔍 Test 1: Token Bridge Response');
console.log('GET /api/auth/token');

const options1 = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/token',
  method: 'GET',
  headers: {
    'Cookie': userCookies,
    'Content-Type': 'application/json',
    'User-Agent': 'JobSwipe-Test/1.0'
  }
};

const req1 = http.request(options1, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('📡 Status:', res.statusCode);
    console.log('📋 Response:', JSON.stringify(response, null, 2));
    
    if (response.shouldRefresh) {
      console.log('✅ GOOD: Token bridge correctly identified need for refresh');
      
      // Test 2: Manual Refresh
      console.log('');
      console.log('🔄 Test 2: Manual Token Refresh');
      console.log('POST /api/auth/refresh');
      
      const options2 = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/refresh',
        method: 'POST',
        headers: {
          'Cookie': userCookies,
          'Content-Type': 'application/json',
          'User-Agent': 'JobSwipe-Test/1.0'
        }
      };
      
      const req2 = http.request(options2, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('📡 Status:', res.statusCode);
          console.log('📋 Headers:', res.headers['set-cookie'] || 'No cookies set');
          
          try {
            const response = JSON.parse(data);
            console.log('📋 Response:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 && response.success) {
              console.log('✅ GOOD: Token refresh endpoint working');
              
              // Test 3: Simulate Swipe Right
              console.log('');
              console.log('💫 Test 3: Swipe Right Request');
              console.log('POST /api/queue/swipe-right');
              
              const testPayload = {
                jobId: 'test-job-123',
                resumeId: 'test-resume-456', 
                priority: 5,
                metadata: {
                  source: 'web',
                  deviceId: 'test-device',
                  userAgent: 'JobSwipe-Test/1.0'
                }
              };
              
              const options3 = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/queue/swipe-right',
                method: 'POST',
                headers: {
                  'Cookie': userCookies,
                  'Content-Type': 'application/json',
                  'User-Agent': 'JobSwipe-Test/1.0'
                }
              };
              
              const req3 = http.request(options3, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                  console.log('📡 Status:', res.statusCode);
                  
                  try {
                    const response = JSON.parse(data);
                    console.log('📋 Response:', JSON.stringify(response, null, 2));
                    
                    if (res.statusCode === 200 && response.success) {
                      console.log('🎉 SUCCESS: Complete flow working!');
                    } else if (res.statusCode === 401) {
                      if (response.details && response.details.refreshFailed) {
                        console.log('❌ ISSUE: Token refresh failed during request');
                      } else {
                        console.log('❌ ISSUE: Still getting 401 - retry logic not working');
                      }
                    } else {
                      console.log('❌ ISSUE: Unexpected response from swipe-right');
                    }
                  } catch (e) {
                    console.log('📋 Raw response:', data);
                  }
                  
                  console.log('');
                  console.log('🏁 Test Complete');
                });
              });
              
              req3.write(JSON.stringify(testPayload));
              req3.end();
              
            } else {
              console.log('❌ ISSUE: Token refresh failed');
              console.log('🏁 Test stopped due to refresh failure');
            }
            
          } catch (e) {
            console.log('📋 Raw response:', data);
            console.log('❌ ISSUE: Invalid JSON response from refresh endpoint');
          }
        });
      });
      
      req2.end();
      
    } else {
      console.log('❌ ISSUE: Token bridge not detecting refresh need correctly');
      console.log('🏁 Test stopped');
    }
  });
});

req1.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  console.log('💡 Make sure Next.js dev server is running on localhost:3000');
});

req1.end();