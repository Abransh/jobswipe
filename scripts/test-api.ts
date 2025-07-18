#!/usr/bin/env tsx

/**
 * Simple script to test the API server
 */

import { createServer } from '../apps/api/src/index';

async function testApi() {
  try {
    console.log('🧪 Testing JobSwipe API Server...');
    
    const server = await createServer();
    
    console.log('✅ Server created successfully');
    
    // Test health endpoint
    const healthResponse = await server.inject({
      method: 'GET',
      url: '/health'
    });
    
    console.log('🏥 Health check:', {
      statusCode: healthResponse.statusCode,
      payload: JSON.parse(healthResponse.payload)
    });
    
    // Test a protected route (should return 401)
    const protectedResponse = await server.inject({
      method: 'GET',
      url: '/api/v1/auth/profile'
    });
    
    console.log('🔒 Protected endpoint test:', {
      statusCode: protectedResponse.statusCode,
      payload: JSON.parse(protectedResponse.payload)
    });
    
    console.log('✅ API tests completed successfully');
    
    await server.close();
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testApi();
}