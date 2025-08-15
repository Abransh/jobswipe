# JobSwipe Enterprise Automation System - Testing Guide

**Version:** 1.0.0  
**Date:** January 15, 2025  
**Usage:** Complete testing and implementation guide

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Install dependencies
npm install

# Environment variables
cp .env.example .env.local
# Add your API keys:
# ANTHROPIC_API_KEY=your_claude_api_key
# REDIS_URL=redis://localhost:6379
# DATABASE_URL=postgresql://username:password@localhost:5432/jobswipe
```

### Basic Usage Example

```typescript
// apps/desktop/src/test-automation.ts
import { JobSwipeAutomationEngine } from './automation/JobSwipeAutomationEngine';
import { UserProfile } from './strategies/types/StrategyTypes';

async function testBasicAutomation() {
  // Initialize the automation engine
  const engine = new JobSwipeAutomationEngine({
    browser: {
      headless: false, // Set to false for testing to see what happens
      timeout: 30000
    },
    captcha: {
      enabledMethods: ['ai-vision', 'manual-intervention']
    }
  });

  // Initialize the engine
  await engine.initialize();

  // Create test job application request
  const testRequest = {
    id: 'test-job-123',
    userId: 'user-456',
    jobData: {
      id: 'linkedin-job-789',
      title: 'Software Engineer',
      company: 'linkedin',
      url: 'https://www.linkedin.com/jobs/view/123456789/',
      location: 'San Francisco, CA',
      description: 'Great software engineering role'
    },
    userProfile: {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'US'
      },
      professional: {
        currentTitle: 'Senior Developer',
        currentCompany: 'Tech Corp',
        yearsExperience: 5,
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        resumeUrl: '/path/to/resume.pdf'
      },
      preferences: {
        salaryMin: 120000,
        salaryMax: 180000,
        remoteWork: true,
        workAuthorization: 'US Citizen'
      }
    },
    priority: 'high'
  };

  try {
    // Process the job application
    console.log('🚀 Starting job application automation...');
    const result = await engine.processJobApplication(testRequest);
    
    console.log('📊 Automation Result:', {
      success: result.success,
      executionTime: result.executionTime,
      strategyUsed: result.strategyUsed,
      stepsCompleted: result.stepsCompleted,
      captchaEncountered: result.captchaEncountered
    });

    if (result.success) {
      console.log('✅ Job application successful!');
      console.log('Application ID:', result.applicationId);
    } else {
      console.log('❌ Job application failed:', result.error);
    }

  } catch (error) {
    console.error('💥 Automation error:', error);
  } finally {
    await engine.shutdown();
  }
}

// Run the test
testBasicAutomation();
```

---

## 🧪 Component Testing

### 1. Test Strategy Registry

```typescript
// apps/desktop/src/test-strategy-registry.ts
import { StrategyRegistry } from './strategies/StrategyRegistry';

async function testStrategyRegistry() {
  const registry = new StrategyRegistry({
    strategyDirectory: './strategies/companies'
  });

  // Test strategy discovery
  console.log('🔍 Available strategies:', registry.getAllStrategies().map(s => s.name));

  // Test strategy matching
  const testJob = {
    jobData: {
      company: 'LinkedIn',
      url: 'https://www.linkedin.com/jobs/view/123456789/'
    }
  };

  const matchResult = await registry.findStrategy(testJob);
  console.log('🎯 Strategy match result:', {
    matched: matchResult.matched,
    strategy: matchResult.strategy?.name,
    confidence: matchResult.confidence
  });

  // Test health check
  const health = registry.healthCheck();
  console.log('💚 Registry health:', health);
}

testStrategyRegistry();
```

### 2. Test Captcha Handler

```typescript
// apps/desktop/src/test-captcha.ts
import { AdvancedCaptchaHandler } from './captcha/AdvancedCaptchaHandler';
import { playwright } from 'playwright';

async function testCaptchaHandler() {
  const handler = new AdvancedCaptchaHandler({
    enabledMethods: ['ai-vision', 'ocr-tesseract', 'manual-intervention'],
    manual: {
      enabled: true,
      timeout: 60000,
      notificationMethod: 'ui'
    }
  });

  // Create test browser context
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to a page with captcha for testing
  await page.goto('https://example.com/captcha-test');

  try {
    // Detect captcha
    const captchaContext = await handler.detectCaptcha(page, 'test-job-123', 'user-456');
    
    if (captchaContext) {
      console.log('🤖 Captcha detected:', captchaContext.captchaType);
      
      // Resolve captcha
      const solution = await handler.resolveCaptcha(captchaContext);
      console.log('✅ Captcha solution:', {
        success: solution.success,
        method: solution.method,
        confidence: solution.confidence,
        executionTime: solution.executionTime
      });
    } else {
      console.log('ℹ️ No captcha detected');
    }

  } catch (error) {
    console.error('❌ Captcha test error:', error);
  } finally {
    await browser.close();
  }

  // Check stats
  console.log('📊 Captcha stats:', handler.getStats());
}

testCaptchaHandler();
```

### 3. Test Form Analyzer

```typescript
// apps/desktop/src/test-form-analyzer.ts
import { FormAnalyzer } from './intelligence/FormAnalyzer';
import { playwright } from 'playwright';

async function testFormAnalyzer() {
  const analyzer = new FormAnalyzer();
  
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to a job application form
  await page.goto('https://www.linkedin.com/jobs/view/123456789/');

  try {
    // Analyze the form
    console.log('🧠 Analyzing form...');
    const schema = await analyzer.analyzeForm(page);
    
    console.log('📋 Form analysis results:', {
      formId: schema.id,
      elementsFound: schema.elements.length,
      formType: schema.metadata.formType,
      complexity: schema.metadata.complexity,
      estimatedFillTime: schema.metadata.estimatedFillTime
    });

    // Show semantic analysis results
    schema.elements.forEach((element, index) => {
      if (element.semanticMeaning.confidence > 0.7) {
        console.log(`🎯 Element ${index + 1}:`, {
          type: element.semanticMeaning.fieldType,
          confidence: element.semanticMeaning.confidence,
          selector: element.selector
        });
      }
    });

    // Create mapping plan
    const userProfile = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567'
      },
      professional: {
        resumeUrl: '/path/to/resume.pdf'
      },
      preferences: {}
    };

    const mappingPlan = await analyzer.createDataMappingPlan(schema, userProfile);
    console.log('🗺️ Mapping plan:', {
      mappingsCreated: mappingPlan.mappings.length,
      estimatedTime: mappingPlan.estimatedTime,
      fillOrder: mappingPlan.fillOrder.length
    });

  } catch (error) {
    console.error('❌ Form analysis error:', error);
  } finally {
    await browser.close();
  }
}

testFormAnalyzer();
```

### 4. Test Queue Manager

```typescript
// apps/desktop/src/test-queue.ts
import { EnterpriseQueueManager } from './queue/EnterpriseQueueManager';

async function testQueueManager() {
  const queueManager = new EnterpriseQueueManager({
    redis: {
      host: 'localhost',
      port: 6379
    },
    performance: {
      concurrency: 5
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000
    }
  });

  await queueManager.initialize();

  // Create test jobs
  const testJobs = [
    {
      id: 'test-1',
      userId: 'user-123',
      jobId: 'linkedin-job-1',
      type: 'standard',
      payload: { company: 'LinkedIn', position: 'Engineer' },
      metadata: {
        createdAt: new Date(),
        priority: 50,
        attempts: 3
      }
    },
    {
      id: 'test-2',
      userId: 'user-123',
      jobId: 'indeed-job-1',
      type: 'priority',
      payload: { company: 'Indeed', position: 'Developer' },
      metadata: {
        createdAt: new Date(),
        priority: 75,
        attempts: 3
      }
    }
  ];

  try {
    // Add jobs to queue
    for (const jobData of testJobs) {
      const job = await queueManager.addJob(jobData);
      console.log(`📥 Added job ${jobData.id} to queue`);
    }

    // Monitor queue metrics
    setInterval(async () => {
      const metrics = queueManager.getMetrics();
      const health = await queueManager.getHealthStatus();
      
      console.log('📊 Queue Metrics:');
      Object.entries(metrics).forEach(([queueName, queueMetrics]) => {
        console.log(`  ${queueName}: ${queueMetrics.activeJobs} active, ${queueMetrics.waitingJobs} waiting`);
      });
    }, 5000);

    // Let it run for a bit
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Queue test error:', error);
  }
}

testQueueManager();
```

---

## 🔧 Development Testing

### Running Individual Tests

```bash
# Test Strategy Registry
npx tsx apps/desktop/src/test-strategy-registry.ts

# Test Captcha Handler
npx tsx apps/desktop/src/test-captcha.ts

# Test Form Analyzer  
npx tsx apps/desktop/src/test-form-analyzer.ts

# Test Queue Manager
npx tsx apps/desktop/src/test-queue.ts

# Test Full Automation
npx tsx apps/desktop/src/test-automation.ts
```

### Integration Testing

```typescript
// apps/desktop/src/test-integration.ts
import { JobSwipeAutomationEngine } from './automation/JobSwipeAutomationEngine';

async function runIntegrationTests() {
  console.log('🧪 Starting integration tests...');
  
  const engine = new JobSwipeAutomationEngine({
    browser: { headless: false },
    captcha: { enabledMethods: ['manual-intervention'] }
  });

  await engine.initialize();

  // Test 1: LinkedIn Easy Apply
  await testLinkedInEasyApply(engine);
  
  // Test 2: Indeed Application
  await testIndeedApplication(engine);
  
  // Test 3: Captcha Handling
  await testCaptchaHandling(engine);
  
  // Test 4: Form Analysis
  await testFormAnalysis(engine);

  await engine.shutdown();
  console.log('✅ Integration tests completed');
}

async function testLinkedInEasyApply(engine: JobSwipeAutomationEngine) {
  console.log('🔵 Testing LinkedIn Easy Apply...');
  
  const linkedInRequest = {
    id: 'linkedin-test-1',
    userId: 'test-user',
    jobData: {
      id: 'li-123',
      title: 'Software Engineer',
      company: 'linkedin',
      url: 'https://www.linkedin.com/jobs/view/3804922179/' // Real LinkedIn job
    },
    userProfile: createTestUserProfile(),
    priority: 'high' as const
  };

  const result = await engine.processJobApplication(linkedInRequest);
  console.log('LinkedIn result:', result.success ? '✅ Success' : '❌ Failed');
}

function createTestUserProfile() {
  return {
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-0123',
      city: 'San Francisco',
      state: 'CA'
    },
    professional: {
      currentTitle: 'Software Engineer',
      yearsExperience: 3,
      resumeUrl: '/path/to/test-resume.pdf'
    },
    preferences: {
      remoteWork: true,
      workAuthorization: 'US Citizen'
    }
  };
}

runIntegrationTests();
```

---

## 🎛️ Production Testing

### Environment Setup

```bash
# Production environment
NODE_ENV=production
REDIS_CLUSTER_NODES=redis1:6379,redis2:6379,redis3:6379
DATABASE_URL=postgresql://prod_user:password@prod-db:5432/jobswipe
ANTHROPIC_API_KEY=your_production_key
MONITORING_ENABLED=true
```

### Load Testing

```typescript
// apps/desktop/src/test-load.ts
import { JobSwipeAutomationEngine } from './automation/JobSwipeAutomationEngine';

async function runLoadTest() {
  console.log('⚡ Starting load test...');
  
  const engine = new JobSwipeAutomationEngine({
    queue: { defaultConcurrency: 50 },
    monitoring: { enabled: true }
  });

  await engine.initialize();

  // Create 100 concurrent job applications
  const promises = [];
  for (let i = 0; i < 100; i++) {
    const request = {
      id: `load-test-${i}`,
      userId: `user-${i % 10}`, // 10 different users
      jobData: {
        id: `job-${i}`,
        title: 'Test Position',
        company: i % 2 === 0 ? 'linkedin' : 'indeed',
        url: 'https://example.com/job'
      },
      userProfile: createTestUserProfile(),
      priority: 'normal' as const
    };

    promises.push(engine.processJobApplication(request));
  }

  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`📊 Load test results: ${successful} successful, ${failed} failed`);
  
  const stats = engine.getStats();
  console.log('📈 Engine stats:', stats);

  await engine.shutdown();
}

runLoadTest();
```

---

## 🚨 Debugging & Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Start Redis locally
   docker run -p 6379:6379 redis:latest
   ```

2. **Browser Launch Failed**
   ```bash
   # Install Playwright browsers
   npx playwright install chromium
   ```

3. **Captcha Always Fails**
   ```typescript
   // Enable manual intervention for testing
   const config = {
     captcha: {
       enabledMethods: ['manual-intervention'],
       manual: { enabled: true, timeout: 300000 }
     }
   };
   ```

4. **Form Analysis Not Working**
   ```typescript
   // Use non-headless mode to see what's happening
   const config = {
     browser: { headless: false }
   };
   ```

### Debug Mode

```typescript
// Enable comprehensive logging
const engine = new JobSwipeAutomationEngine({
  // ... config
});

engine.on('job-processing-started', (data) => {
  console.log('🚀 Job started:', data.processingId);
});

engine.on('captcha-detected', (data) => {
  console.log('🤖 Captcha detected:', data.context.captchaType);
});

engine.on('manual-intervention-required', (data) => {
  console.log('👤 Manual intervention needed:', data.jobId);
});
```

---

## 📊 Monitoring & Analytics

### Health Checks

```typescript
// apps/desktop/src/health-check.ts
import { JobSwipeAutomationEngine } from './automation/JobSwipeAutomationEngine';

async function healthCheck() {
  const engine = new JobSwipeAutomationEngine();
  await engine.initialize();

  const health = await engine.getHealthStatus();
  console.log('🏥 System Health:', JSON.stringify(health, null, 2));

  const stats = engine.getStats();
  console.log('📊 Performance Stats:', {
    totalJobs: stats.totalJobsProcessed,
    successRate: `${((stats.successfulApplications / stats.totalJobsProcessed) * 100).toFixed(1)}%`,
    avgTime: `${stats.averageProcessingTime}ms`,
    uptime: `${Math.floor(stats.uptime / 1000)}s`
  });

  await engine.shutdown();
}

healthCheck();
```

### Performance Monitoring

```typescript
// Monitor real-time performance
setInterval(async () => {
  const metrics = queueManager.getMetrics();
  const engineStats = engine.getStats();
  
  console.log('⚡ Real-time Metrics:', {
    queueThroughput: Object.values(metrics).reduce((sum, m) => sum + m.throughputPerSecond, 0),
    totalActive: Object.values(metrics).reduce((sum, m) => sum + m.activeJobs, 0),
    successRate: `${engineStats.successfulApplications / engineStats.totalJobsProcessed * 100}%`
  });
}, 10000);
```

---

## 🎯 Next Steps

1. **Start with Basic Testing**: Run the simple automation test first
2. **Test Individual Components**: Verify each component works independently  
3. **Integration Testing**: Test components working together
4. **Load Testing**: Test with multiple concurrent jobs
5. **Production Deployment**: Deploy with monitoring enabled

The system is designed to be production-ready with comprehensive error handling, monitoring, and graceful degradation when services are unavailable.