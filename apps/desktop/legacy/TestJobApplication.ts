/**
 * @fileoverview Test Job Application Service
 * @description Test implementation for basic browser-use integration
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Test environment only - not for production use
 */

import path from 'path';
import fs from 'fs/promises';
import { BrowserAutomationService } from './BrowserAutomationService';
import { QueueJob, ProcessingResult } from './QueueService';

// =============================================================================
// TEST INTERFACES
// =============================================================================

export interface TestJobData {
  title: string;
  company: string;
  url: string;
  description: string;
  requirements?: string;
  location: string;
  remote: boolean;
  type: string;
  level: string;
}

export interface TestUserProfile {
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  coverLetter?: string;
  preferences: {
    remoteWork: boolean;
    salaryMin: number;
    salaryMax: number;
    jobTypes: string[];
  };
}

export interface TestResult {
  success: boolean;
  jobId: string;
  applicationResult?: ProcessingResult;
  error?: string;
  executionTime: number;
  logs: string[];
}

// =============================================================================
// TEST JOB APPLICATION SERVICE
// =============================================================================

export class TestJobApplicationService {
  private automationService: BrowserAutomationService;
  private testResults: TestResult[] = [];

  constructor() {
    this.automationService = new BrowserAutomationService();
    this.setupTestListeners();
  }

  /**
   * Setup test event listeners
   */
  private setupTestListeners(): void {
    this.automationService.on('processing-started', (data) => {
      console.log(`🚀 Test automation started for job: ${data.jobId}`);
    });

    this.automationService.on('processing-completed', (data) => {
      console.log(`✅ Test automation completed for job: ${data.jobId}`);
    });

    this.automationService.on('processing-failed', (data) => {
      console.error(`❌ Test automation failed for job: ${data.jobId}`, data.error);
    });

    this.automationService.on('captcha-detected', (data) => {
      console.warn(`🔍 Captcha detected in test for job: ${data.jobId}`);
    });

    this.automationService.on('automation-output', (data) => {
      console.log(`📝 Test output [${data.jobId}]:`, data.data.trim());
    });
  }

  /**
   * Initialize test service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🧪 Initializing test job application service...');
      await this.automationService.initialize();
      console.log('✅ Test service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize test service:', error);
      throw error;
    }
  }

  /**
   * Create a test job application
   */
  async runTestJobApplication(
    jobData: TestJobData,
    userProfile: TestUserProfile
  ): Promise<TestResult> {
    const startTime = Date.now();
    const jobId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    console.log(`🎯 Starting test job application: ${jobData.title} at ${jobData.company}`);

    const testResult: TestResult = {
      success: false,
      jobId,
      executionTime: 0,
      logs: []
    };

    try {
      // Create test queue job
      const queueJob: QueueJob = {
        id: jobId,
        jobId: jobId,
        userId: 'test_user',
        jobData: {
          title: jobData.title,
          company: jobData.company,
          url: jobData.url,
          description: jobData.description,
          requirements: jobData.requirements,
          location: jobData.location,
          remote: jobData.remote,
          type: jobData.type,
          level: jobData.level
        },
        userProfile: {
          resumeUrl: userProfile.resumeUrl,
          coverLetter: userProfile.coverLetter,
          preferences: userProfile.preferences
        },
        priority: 1,
        status: 'pending',
        metadata: {
          source: 'desktop',
          deviceId: 'test_device',
          timestamp: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Execute job application
      const result = await this.automationService.processJobApplication(queueJob);
      
      testResult.success = result.success;
      testResult.applicationResult = result;
      testResult.executionTime = Date.now() - startTime;
      testResult.logs = result.logs || [];

      if (result.success) {
        console.log(`🎉 Test job application SUCCESS: ${jobId}`);
        console.log(`   📋 Application ID: ${result.applicationId}`);
        console.log(`   🆔 Confirmation ID: ${result.confirmationId || 'N/A'}`);
        console.log(`   ⏱️ Execution Time: ${testResult.executionTime}ms`);
      } else {
        console.error(`💥 Test job application FAILED: ${jobId}`);
        console.error(`   ❌ Error: ${result.error}`);
        console.error(`   ⏱️ Execution Time: ${testResult.executionTime}ms`);
        testResult.error = result.error;
      }

    } catch (error) {
      testResult.success = false;
      testResult.error = error instanceof Error ? error.message : String(error);
      testResult.executionTime = Date.now() - startTime;
      
      console.error(`💥 Test job application EXCEPTION: ${jobId}`, error);
    }

    // Store test result
    this.testResults.push(testResult);
    
    return testResult;
  }

  /**
   * Run comprehensive test suite
   */
  async runTestSuite(): Promise<void> {
    console.log('🧪 Running JobSwipe automation test suite...');

    const testCases = [
      {
        name: 'Basic LinkedIn Job Test',
        jobData: {
          title: 'Software Engineer',
          company: 'Test Company',
          url: 'https://linkedin.com/jobs/view/test', // This would be a real test URL
          description: 'We are looking for a skilled software engineer...',
          requirements: 'JavaScript, TypeScript, React, Node.js',
          location: 'San Francisco, CA',
          remote: true,
          type: 'Full-time',
          level: 'Mid-level'
        },
        userProfile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          resumeUrl: './test_resume.pdf',
          coverLetter: 'I am excited to apply for this position...',
          preferences: {
            remoteWork: true,
            salaryMin: 80000,
            salaryMax: 120000,
            jobTypes: ['Full-time', 'Contract']
          }
        }
      },
      {
        name: 'Simple Company Website Test',
        jobData: {
          title: 'Frontend Developer',
          company: 'Startup Inc',
          url: 'https://example.com/careers/frontend-developer',
          description: 'Join our team as a frontend developer...',
          requirements: 'React, JavaScript, CSS, HTML',
          location: 'New York, NY',
          remote: false,
          type: 'Full-time',
          level: 'Entry-level'
        },
        userProfile: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0456',
          resumeUrl: './test_resume.pdf',
          coverLetter: 'I would love to contribute to your frontend team...',
          preferences: {
            remoteWork: false,
            salaryMin: 60000,
            salaryMax: 90000,
            jobTypes: ['Full-time']
          }
        }
      }
    ];

    console.log(`🎯 Running ${testCases.length} test cases...`);

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📋 Test Case ${i + 1}/${testCases.length}: ${testCase.name}`);
      
      try {
        const result = await this.runTestJobApplication(testCase.jobData, testCase.userProfile);
        
        if (result.success) {
          console.log(`   ✅ PASSED (${result.executionTime}ms)`);
        } else {
          console.log(`   ❌ FAILED: ${result.error} (${result.executionTime}ms)`);
        }
      } catch (error) {
        console.error(`   💥 EXCEPTION: ${error}`);
      }

      // Wait between tests
      if (i < testCases.length - 1) {
        console.log('   ⏳ Waiting 5 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Print test summary
    this.printTestSummary();
  }

  /**
   * Print test summary
   */
  private printTestSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageTime = this.testResults.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;

    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`⏱️ Average Execution Time: ${averageTime.toFixed(0)}ms`);

    if (failedTests > 0) {
      console.log('\n🔍 Failed Test Details:');
      this.testResults
        .filter(r => !r.success)
        .forEach((result, index) => {
          console.log(`   ${index + 1}. Job ${result.jobId}: ${result.error}`);
        });
    }

    console.log('\n🔧 System Performance:');
    const bridgeStats = this.automationService.getPythonBridgeStats();
    console.log(`   🐍 Python Processes: ${bridgeStats.totalProcesses}`);
    console.log(`   ⚡ Active Tasks: ${bridgeStats.activeTasks}`);
    console.log(`   📦 Queued Tasks: ${bridgeStats.queuedTasks}`);
    console.log(`   💾 Memory Usage: ${(bridgeStats.memoryUsage / 1024 / 1024).toFixed(1)}MB`);

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Create test resume file
   */
  async createTestResume(): Promise<string> {
    const resumeContent = `
# John Doe
## Software Engineer

**Email:** john.doe@example.com  
**Phone:** +1-555-0123  
**Location:** San Francisco, CA  

### Experience
- **Software Engineer** at Tech Corp (2020-2023)
  - Developed web applications using React and Node.js
  - Implemented automated testing and CI/CD pipelines
  - Led a team of 3 developers on key projects

### Skills
- JavaScript, TypeScript, Python
- React, Node.js, Express
- PostgreSQL, MongoDB
- AWS, Docker, Kubernetes

### Education
- **BS Computer Science** - University of California (2016-2020)
`;

    const resumePath = path.join(__dirname, '../../../data/temp/test_resume.txt');
    await fs.writeFile(resumePath, resumeContent);
    
    console.log(`📄 Test resume created at: ${resumePath}`);
    return resumePath;
  }

  /**
   * Cleanup test service
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test service...');
    await this.automationService.cleanup();
    console.log('✅ Test service cleanup completed');
  }

  /**
   * Get test results
   */
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }
}

// =============================================================================
// STANDALONE TEST RUNNER
// =============================================================================

export async function runStandaloneTest(): Promise<void> {
  const testService = new TestJobApplicationService();
  
  try {
    // Initialize
    await testService.initialize();
    
    // Create test resume
    await testService.createTestResume();
    
    // Run test suite
    await testService.runTestSuite();
    
  } catch (error) {
    console.error('💥 Test runner failed:', error);
  } finally {
    // Cleanup
    await testService.cleanup();
  }
}

// Run test if called directly
if (require.main === module) {
  runStandaloneTest().catch(console.error);
}