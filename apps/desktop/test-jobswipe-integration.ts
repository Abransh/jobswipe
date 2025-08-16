/**
 * JobSwipe Integration Test
 * Tests the complete integration of web-to-desktop components
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  duration?: number;
}

class JobSwipeIntegrationTester {
  private results: TestResult[] = [];
  
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting JobSwipe Integration Tests...\n');
    
    // Test 1: Check file structure
    await this.testFileStructure();
    
    // Test 2: TypeScript compilation
    await this.testTypeScriptCompilation();
    
    // Test 3: Component dependencies
    await this.testComponentDependencies();
    
    // Test 4: Enterprise service integration
    await this.testEnterpriseIntegration();
    
    // Test 5: IPC handlers
    await this.testIPCHandlers();
    
    // Print results
    this.printResults();
  }
  
  private async testFileStructure(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const requiredFiles = [
        'src/renderer/App.tsx',
        'src/renderer/components/JobDiscovery/JobSwipeInterface.tsx',
        'src/renderer/components/JobSwipe/JobSwipeContainer.tsx',
        'src/renderer/components/JobSwipe/JobSwipeCard.tsx',
        'src/renderer/hooks/useJobSwipe.ts',
        'src/renderer/types/jobSwipe.ts',
        'src/main/ipcHandlers.ts',
        'src/preload/preload.ts',
        'src/main-jobswipe.ts'
      ];
      
      const missingFiles: string[] = [];
      
      for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(__dirname, file))) {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length === 0) {
        this.results.push({
          test: 'File Structure',
          passed: true,
          message: `All ${requiredFiles.length} required files exist`,
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'File Structure',
          passed: false,
          message: `Missing files: ${missingFiles.join(', ')}`,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'File Structure',
        passed: false,
        message: `Error checking files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }
  
  private async testTypeScriptCompilation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test main process compilation
      execSync('npm run build:jobswipe:main', { 
        stdio: 'pipe',
        cwd: __dirname 
      });
      
      // Check if compiled files exist
      const compiledFiles = [
        'dist/main-jobswipe.js',
        'dist/main/ipcHandlers.js',
        'dist/preload/preload.js'
      ];
      
      const missingCompiled: string[] = [];
      for (const file of compiledFiles) {
        if (!fs.existsSync(path.join(__dirname, file))) {
          missingCompiled.push(file);
        }
      }
      
      if (missingCompiled.length === 0) {
        this.results.push({
          test: 'TypeScript Compilation',
          passed: true,
          message: 'Main process compiled successfully',
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'TypeScript Compilation',
          passed: false,
          message: `Missing compiled files: ${missingCompiled.join(', ')}`,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'TypeScript Compilation',
        passed: false,
        message: `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }
  
  private async testComponentDependencies(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if React components have proper imports
      const jobSwipeInterface = fs.readFileSync(
        path.join(__dirname, 'src/renderer/components/JobDiscovery/JobSwipeInterface.tsx'),
        'utf-8'
      );
      
      const requiredImports = [
        "import React",
        "import { JobSwipeContainer }",
        "import { useElectron }",
        "type { JobData }"
      ];
      
      const missingImports: string[] = [];
      for (const importStatement of requiredImports) {
        if (!jobSwipeInterface.includes(importStatement)) {
          missingImports.push(importStatement);
        }
      }
      
      if (missingImports.length === 0) {
        this.results.push({
          test: 'Component Dependencies',
          passed: true,
          message: 'All required imports present in JobSwipeInterface',
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'Component Dependencies',
          passed: false,
          message: `Missing imports: ${missingImports.join(', ')}`,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Component Dependencies',
        passed: false,
        message: `Error checking dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }
  
  private async testEnterpriseIntegration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if IPC handlers import automation services
      const ipcHandlers = fs.readFileSync(
        path.join(__dirname, 'src/main/ipcHandlers.ts'),
        'utf-8'
      );
      
      const requiredServices = [
        'JobSwipeAutomationEngine',
        'ProductionConfig'
      ];
      
      const missingServices: string[] = [];
      for (const service of requiredServices) {
        if (!ipcHandlers.includes(service)) {
          missingServices.push(service);
        }
      }
      
      if (missingServices.length === 0) {
        this.results.push({
          test: 'Enterprise Integration',
          passed: true,
          message: 'All enterprise services integrated in IPC handlers',
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'Enterprise Integration',
          passed: false,
          message: `Missing service integrations: ${missingServices.join(', ')}`,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Enterprise Integration',
        passed: false,
        message: `Error checking integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }
  
  private async testIPCHandlers(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if all required IPC handlers are defined
      const ipcHandlers = fs.readFileSync(
        path.join(__dirname, 'src/main/ipcHandlers.ts'),
        'utf-8'
      );
      
      const requiredHandlers = [
        'jobs:get',
        'jobs:apply', 
        'applications:list',
        'applications:status',
        'system:info',
        'system:openUrl'
      ];
      
      const missingHandlers: string[] = [];
      for (const handler of requiredHandlers) {
        if (!ipcHandlers.includes(`'${handler}'`)) {
          missingHandlers.push(handler);
        }
      }
      
      if (missingHandlers.length === 0) {
        this.results.push({
          test: 'IPC Handlers',
          passed: true,
          message: `All ${requiredHandlers.length} IPC handlers defined`,
          duration: Date.now() - startTime
        });
      } else {
        this.results.push({
          test: 'IPC Handlers',
          passed: false,
          message: `Missing handlers: ${missingHandlers.join(', ')}`,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      this.results.push({
        test: 'IPC Handlers',
        passed: false,
        message: `Error checking handlers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      });
    }
  }
  
  private printResults(): void {
    console.log('\n📊 Test Results Summary\n');
    console.log('=' + '='.repeat(60));
    
    let passed = 0;
    let total = this.results.length;
    
    for (const result of this.results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      
      console.log(`${status} ${result.test}${duration}`);
      console.log(`     ${result.message}`);
      console.log('');
      
      if (result.passed) passed++;
    }
    
    console.log('=' + '='.repeat(60));
    console.log(`📈 Overall Result: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! JobSwipe desktop integration is ready.');
      console.log('\n💡 Next steps:');
      console.log('   1. Run: npm run dev:jobswipe');
      console.log('   2. Test the swipe interface');
      console.log('   3. Verify automation works end-to-end');
    } else {
      console.log('⚠️  Some tests failed. Please fix the issues above.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new JobSwipeIntegrationTester();
  tester.runAllTests().catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}