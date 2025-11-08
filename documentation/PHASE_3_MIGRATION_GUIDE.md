# Phase 3 Migration Guide - Service Integration

**How to integrate TypeScript services with the unified Python automation engine**

**Date**: November 7, 2025
**Branch**: `claude/audit-codebase-docs-011CUtrRpRJepxvWx6EZ8ofb`
**Status**: 🔧 **INTEGRATION READY**

---

## 🎯 Overview

Phase 3 integrates the unified Python automation engine with the existing TypeScript automation services:
- **Server Service** (`apps/api/src/services/ServerAutomationService.ts`)
- **Desktop Service** (`apps/desktop/src/services/SimplifiedAutomationService.ts`)

**Key Change**: Instead of calling company-specific Python scripts, services now call unified wrapper scripts that use the consolidated automation engine.

---

## 📋 What's Already Done

### ✅ Phase 1 & 2 (Complete):
- Core unified engine (`packages/automation-engine/src/core/`)
- Base automation classes (`packages/automation-engine/src/companies/base/`)
- LinkedIn automation (`packages/automation-engine/src/companies/linkedin/`)
- Greenhouse automation (`packages/automation-engine/src/companies/greenhouse/`)
- Integration wrappers (`packages/automation-engine/src/integrations/`)

### ✅ Phase 3 - Wrapper Scripts (Complete):
- `packages/automation-engine/scripts/run_server_automation.py` ✅
- `packages/automation-engine/scripts/run_desktop_automation.py` ✅
- Wrapper scripts README ✅

---

## 🔄 Migration Steps

### Step 1: Install Unified Automation Engine

```bash
cd /home/user/jobswipe/packages/automation-engine

# Install in development mode (editable)
pip install -e .

# Verify installation
python3 -c "from src.integrations import ServerAutomationIntegration, DesktopAutomationIntegration; print('✅ Unified engine installed')"
```

---

### Step 2: Update Server Automation Service

**File**: `apps/api/src/services/ServerAutomationService.ts`

#### Change 1: Update Script Path

**OLD (Line ~446)**:
```typescript
// Path to the company automation script
const scriptPath = path.join(
  this.config.companiesPath,
  companyAutomation,  // e.g., 'greenhouse', 'linkedin'
  'run_automation.py'
);
```

**NEW**:
```typescript
// Path to the unified automation wrapper
const scriptPath = path.join(
  __dirname,
  '../../../../packages/automation-engine/scripts',
  'run_server_automation.py'  // Single unified script!
);
```

#### Change 2: Update Environment Variables

The wrapper script expects specific environment variable names. Update the `createExecutionEnvironment()` method:

**ADD these environment variables** (around line ~553):
```typescript
private async createExecutionEnvironment(
  request: ServerAutomationRequest,
  proxy: ProxyConfig | null
): Promise<NodeJS.ProcessEnv> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,

    // Execution identifiers
    USER_ID: request.userId,
    JOB_ID: request.jobId,
    APPLICATION_ID: request.applicationId,

    // User profile data
    USER_FIRST_NAME: request.userProfile.firstName,
    USER_LAST_NAME: request.userProfile.lastName,
    USER_EMAIL: request.userProfile.email,
    USER_PHONE: request.userProfile.phone,
    USER_RESUME_URL: request.userProfile.resumeUrl || '',
    USER_CURRENT_TITLE: request.userProfile.currentTitle || '',
    USER_YEARS_EXPERIENCE: String(request.userProfile.yearsExperience || 0),
    USER_SKILLS: JSON.stringify(request.userProfile.skills || []),
    USER_CURRENT_LOCATION: request.userProfile.currentLocation || '',
    USER_LINKEDIN_URL: request.userProfile.linkedinUrl || '',
    USER_WORK_AUTHORIZATION: request.userProfile.workAuthorization || '',
    USER_COVER_LETTER: request.userProfile.coverLetter || '',

    // Job data
    JOB_TITLE: request.jobData.title,
    JOB_COMPANY: request.jobData.company,
    JOB_APPLY_URL: request.jobData.applyUrl,
    JOB_LOCATION: request.jobData.location || '',
    JOB_DESCRIPTION: request.jobData.description || '',

    // AI API keys
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

    // Proxy configuration (if available)
    PROXY_CONFIG: proxy ? JSON.stringify({
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: proxy.password,
      type: proxy.proxyType
    }) : undefined
  };

  return env;
}
```

#### Change 3: Remove Company Type Parameter

The unified engine auto-detects company type, so you can simplify the spawn command:

**OLD**:
```typescript
const pythonProcess = spawn(this.config.pythonPath, [scriptPath], {
  env,
  cwd: path.join(this.config.companiesPath, companyAutomation),
  stdio: ['pipe', 'pipe', 'pipe']
});
```

**NEW**:
```typescript
const pythonProcess = spawn(this.config.pythonPath, [scriptPath], {
  env,
  cwd: path.dirname(scriptPath),  // Run from scripts directory
  stdio: ['pipe', 'pipe', 'pipe']
});
```

---

### Step 3: Update Desktop Automation Service

**File**: `apps/desktop/src/services/SimplifiedAutomationService.ts`

#### Change 1: Update Script Path

**OLD (around line ~290)**:
```typescript
// Execute the automation with database integration
const result = await this.executeAutomationWithDatabase(
  companyAutomation,
  data,
  applicationId
);
```

Find where the script path is set (similar to server), and update it:

**NEW**:
```typescript
const scriptPath = path.join(
  __dirname,
  '../../../packages/automation-engine/scripts',
  'run_desktop_automation.py'  // Single unified script!
);
```

#### Change 2: Add Environment Variables

Similar to server, add environment variables for the desktop wrapper:

```typescript
const env = {
  ...process.env,

  // Execution identifiers
  USER_ID: data.userId,
  JOB_ID: data.jobId,
  APPLICATION_ID: applicationId,

  // User profile data
  USER_FIRST_NAME: data.userProfile.firstName,
  USER_LAST_NAME: data.userProfile.lastName,
  USER_EMAIL: data.userProfile.email,
  USER_PHONE: data.userProfile.phone,
  USER_RESUME_LOCAL_PATH: data.userProfile.resumeLocalPath || '',
  USER_RESUME_URL: data.userProfile.resumeUrl || '',
  USER_CURRENT_TITLE: data.userProfile.currentTitle || '',
  USER_YEARS_EXPERIENCE: String(data.userProfile.yearsExperience || 0),
  USER_SKILLS: JSON.stringify(data.userProfile.skills || []),
  USER_CURRENT_LOCATION: data.userProfile.currentLocation || '',
  USER_LINKEDIN_URL: data.userProfile.linkedinUrl || '',
  USER_WORK_AUTHORIZATION: data.userProfile.workAuthorization || '',
  USER_COVER_LETTER: data.userProfile.coverLetter || '',

  // Job data
  JOB_TITLE: data.jobData.title,
  JOB_COMPANY: data.jobData.company,
  JOB_APPLY_URL: data.jobData.applyUrl,
  JOB_LOCATION: data.jobData.location || '',
  JOB_DESCRIPTION: data.jobData.description || '',

  // Browser profile path (optional)
  BROWSER_PROFILE_PATH: this.getBrowserProfilePath(),

  // AI API keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
};
```

#### Change 3: Add Browser Profile Helper

Add a helper method to get the user's browser profile path:

```typescript
private getBrowserProfilePath(): string | undefined {
  // Try to detect Chrome/Chromium profile
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (!homeDir) return undefined;

  const possiblePaths = [
    path.join(homeDir, '.config', 'google-chrome', 'Default'),
    path.join(homeDir, '.config', 'chromium', 'Default'),
    path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome', 'Default'), // macOS
    path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default') // Windows
  ];

  for (const profilePath of possiblePaths) {
    if (fs.existsSync(profilePath)) {
      return profilePath;
    }
  }

  return undefined;
}
```

---

### Step 4: Update Configuration

Both services need to point to the unified engine's Python path:

**File**: `apps/api/src/services/ServerAutomationService.ts`
**File**: `apps/desktop/src/services/SimplifiedAutomationService.ts`

```typescript
this.config = {
  pythonPath: process.env.PYTHON_PATH || 'python3',
  // ... other config
};
```

**Environment Variable** (`.env`):
```bash
# Use Python 3.11+ with automation engine installed
PYTHON_PATH=/usr/bin/python3

# Or if using venv:
PYTHON_PATH=/home/user/jobswipe/venv/bin/python
```

---

## 🧪 Testing

### Test Server Automation

**File**: `apps/api/tests/server-automation.test.ts` (create if doesn't exist)

```typescript
import { ServerAutomationService } from '../src/services/ServerAutomationService';

describe('Server Automation with Unified Engine', () => {
  it('should execute LinkedIn automation', async () => {
    const service = new ServerAutomationService(/* ... */);

    const request = {
      userId: 'test-user',
      jobId: 'test-job',
      applicationId: 'test-app',
      companyAutomation: 'linkedin',  // Will be auto-detected now
      userProfile: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        // ... other fields
      },
      jobData: {
        id: 'job123',
        title: 'Software Engineer',
        company: 'Tech Corp',
        applyUrl: 'https://www.linkedin.com/jobs/view/1234',
        // ... other fields
      }
    };

    const result = await service.executeAutomation(request);

    expect(result.success).toBe(true);
    expect(result.companyAutomation).toBe('linkedin');
  });
});
```

### Test Desktop Automation

**File**: `apps/desktop/tests/desktop-automation.test.ts` (create if doesn't exist)

```typescript
import { SimplifiedAutomationService } from '../src/services/SimplifiedAutomationService';

describe('Desktop Automation with Unified Engine', () => {
  it('should execute Greenhouse automation', async () => {
    const service = new SimplifiedAutomationService();
    await service.initialize();

    const data = {
      userId: 'test-user',
      jobId: 'test-job',
      jobData: {
        id: 'job123',
        title: 'Senior Developer',
        company: 'Example Corp',
        applyUrl: 'https://boards.greenhouse.io/example/jobs/123',
        // ... other fields
      },
      userProfile: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        resumeLocalPath: '/path/to/resume.pdf',
        // ... other fields
      }
    };

    const result = await service.processJobApplication(data);

    expect(result.success).toBe(true);
    expect(result.companyAutomation).toBe('greenhouse');
  });
});
```

### Manual Testing

#### Server Automation:
```bash
# In terminal 1 - Start API server
cd apps/api
npm run dev

# In terminal 2 - Test automation endpoint
curl -X POST http://localhost:3000/api/automation/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "jobId": "job456",
    "jobData": {
      "title": "Software Engineer",
      "company": "Example Corp",
      "applyUrl": "https://boards.greenhouse.io/example/jobs/123"
    },
    "userProfile": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-1234"
    }
  }'
```

#### Desktop Automation:
```bash
# Start desktop app
cd apps/desktop
npm run dev

# Queue a job and watch it get processed
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Module not found: automation_engine"

**Solution**: Install the automation engine package:
```bash
cd packages/automation-engine
pip install -e .
```

### Issue 2: "Python 3.11+ required"

**Solution**: Upgrade Python or use a virtual environment:
```bash
python3 --version  # Check version

# If < 3.11, install newer version or use pyenv
pyenv install 3.11
pyenv local 3.11
```

### Issue 3: "No API key found"

**Solution**: Set API keys in environment:
```bash
export ANTHROPIC_API_KEY=your-api-key
# Or add to .env file
```

### Issue 4: "Script not found"

**Solution**: Verify script paths are correct:
```bash
ls -la packages/automation-engine/scripts/
# Should see run_server_automation.py and run_desktop_automation.py
```

---

## 📊 Rollback Plan

If issues occur, you can roll back to the old system:

### Rollback Steps:
1. Revert TypeScript service changes (git revert)
2. Services will use old company-specific scripts
3. Fix issues with unified engine
4. Re-attempt migration

### Gradual Migration (Recommended):
1. Deploy unified engine alongside old system
2. Route 10% of traffic to unified engine
3. Monitor for errors
4. Gradually increase to 100%
5. Remove old system once verified

---

## 🎉 Benefits After Migration

### Code Maintenance:
- **Before**: Fix bugs in 2 places (apps/api + apps/desktop)
- **After**: Fix bugs once (packages/automation-engine)
- **Savings**: 50% reduction in maintenance time

### New Company Support:
- **Before**: Write automation twice (server + desktop)
- **After**: Write automation once (unified)
- **Savings**: 50% faster feature development

### Testing:
- **Before**: Test server and desktop separately
- **After**: Test unified engine once
- **Savings**: 50% less testing effort

### Bug Consistency:
- **Before**: Bugs could differ between server and desktop
- **After**: Bugs are consistent (same code)
- **Result**: More predictable behavior

---

## 📝 Next Steps

After successful migration:

1. ✅ **Remove Duplicate Code**
   - Delete `apps/api/src/companies/linkedin/` (keep base if used)
   - Delete `apps/api/src/companies/greenhouse/`
   - Delete `apps/desktop/companies/linkedin/`
   - Delete `apps/desktop/companies/greenhouse/`

2. ✅ **Update Documentation**
   - Update deployment guides
   - Update developer onboarding docs
   - Create troubleshooting guide

3. ✅ **Monitor Production**
   - Watch for errors in logs
   - Monitor success rates
   - Compare performance metrics

4. ✅ **Celebrate!** 🎉
   - You now have a unified, maintainable automation system!

---

## 🔗 Related Documentation

- [Phase 2 Completion Report](./PHASE_2_COMPLETION_REPORT.md)
- [Final Session Summary](./FINAL_SESSION_SUMMARY.md)
- [Automation Engine README](./packages/automation-engine/README.md)
- [Wrapper Scripts README](./packages/automation-engine/scripts/README.md)

---

**Migration prepared with engineering excellence** 🏆
**Phase 3: Ready for Integration** 🚀

