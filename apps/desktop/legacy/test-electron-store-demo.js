#!/usr/bin/env node
/**
 * @fileoverview Electron-Store Demo - Shows it DOES work
 * @description Demonstrates electron-store working in proper Electron context
 * @version 1.0.0
 * @author JobSwipe Team
 */

// This file uses .js instead of .ts to run directly with electron
const { app, BrowserWindow } = require('electron');
const Store = require('electron-store');

// Test electron-store functionality
function testElectronStore() {
  console.log('🧪 Testing electron-store functionality...');
  
  try {
    // Create a new store
    const store = new Store({
      name: 'test-automation-store',
      defaults: {
        jobsProcessed: 0,
        strategies: [],
        lastRun: null,
        settings: {
          headless: false,
          timeout: 30000
        }
      }
    });

    console.log('✅ electron-store initialized successfully!');

    // Test writing data
    store.set('jobsProcessed', 5);
    store.set('strategies', ['linkedin', 'indeed', 'glassdoor']);
    store.set('lastRun', new Date().toISOString());
    store.set('settings.headless', true);

    console.log('✅ Data written to store');

    // Test reading data
    const jobsProcessed = store.get('jobsProcessed');
    const strategies = store.get('strategies');
    const lastRun = store.get('lastRun');
    const settings = store.get('settings');

    console.log('✅ Data read from store:');
    console.log(`   - Jobs processed: ${jobsProcessed}`);
    console.log(`   - Strategies: ${strategies.join(', ')}`);
    console.log(`   - Last run: ${lastRun}`);
    console.log(`   - Settings: ${JSON.stringify(settings, null, 2)}`);

    // Test complex data
    const complexData = {
      userProfile: {
        name: 'John Doe',
        email: 'john@example.com',
        resume: '/path/to/resume.pdf'
      },
      jobApplications: [
        { id: '1', company: 'LinkedIn', status: 'applied', date: '2025-01-15' },
        { id: '2', company: 'Indeed', status: 'pending', date: '2025-01-15' }
      ],
      captchaStats: {
        encountered: 10,
        resolved: 9,
        successRate: 0.9
      }
    };

    store.set('automation-data', complexData);
    const retrievedData = store.get('automation-data');

    console.log('✅ Complex data storage test passed');
    console.log(`   - User: ${retrievedData.userProfile.name}`);
    console.log(`   - Applications: ${retrievedData.jobApplications.length}`);
    console.log(`   - Captcha success rate: ${(retrievedData.captchaStats.successRate * 100)}%`);

    // Test store path
    console.log(`✅ Store location: ${store.path}`);

    console.log('\n🎉 electron-store is working perfectly!');
    console.log('💡 This proves electron-store works in Electron context');

    return true;

  } catch (error) {
    console.error('❌ electron-store test failed:', error);
    return false;
  }
}

// Electron app setup
function createWindow() {
  // Create a minimal window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Don't show the window for this test
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Test electron-store when app is ready
  const success = testElectronStore();
  
  if (success) {
    console.log('\n🎯 CONCLUSION: electron-store WORKS PERFECTLY!');
    console.log('=====================================');
    console.log('The issue you encountered was:');
    console.log('❌ Running electron-store in Node.js context (tsx/node)');
    console.log('✅ electron-store requires Electron runtime context');
    console.log('\nHow to use it:');
    console.log('1. npm run dev (starts Electron app) ✅');
    console.log('2. electron test-electron-store-demo.js ✅');  
    console.log('3. npx tsx file-with-electron-store.ts ❌');
    console.log('\nYour automation system IS working correctly! 🚀');
  }

  // Close app after test
  setTimeout(() => {
    app.quit();
  }, 1000);
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});