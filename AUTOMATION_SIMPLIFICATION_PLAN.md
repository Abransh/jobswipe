# 🎯 JobSwipe Automation Simplification Plan

## 📊 Current State Analysis

### Problem Diagnosis

You have **TWO PARALLEL AUTOMATION SYSTEMS** causing confusion:

**SYSTEM 1: SIMPLE** (partially working)
- Files: `simple_automation.py`, `simple_greenhouse.py`, `run.py`
- Issues: Uses outdated `Controller()` API instead of `Tools()`

**SYSTEM 2: COMPLEX** (over-engineered, broken imports)
- Files: `base_automation.py`, `greenhouse_automation.py`, `automation_engine.py`, `execution_context.py`, `result_handler.py`
- Issues: Too many abstraction layers, import path confusion

### Root Causes

1. **API Mismatch**: Your code uses `Controller()`, browser-use examples use `Tools()`
2. **Early Exit**: Agent completes immediately due to:
   - Missing/invalid LLM API keys
   - Incorrect API usage
   - Vague task instructions
3. **Import Chaos**: Multiple entry points, unclear which is active

---

## 🔧 The Solution: ULTRA-SIMPLE Architecture

### New Structure

```
packages/automation-engine/
├── run_automation.py          # SINGLE entry point (desktop & server)
├── greenhouse_automation.py   # ONE Greenhouse automation class
└── requirements.txt           # Python dependencies
```

**Just 3 files. That's it.**

---

## 🚀 Implementation Steps

### Phase 1: Create New Files

**Step 1.1: Create `run_automation.py`**
- Location: `packages/automation-engine/run_automation.py`
- Purpose: Universal entry point for both desktop and server modes
- Reads from environment variables
- Calls GreenhouseAutomation
- Outputs JSON result

**Step 1.2: Create `greenhouse_automation.py`**
- Location: `packages/automation-engine/greenhouse_automation.py`
- Uses `Tools()` API (correct browser-use pattern)
- Simple file upload action
- Clear task generation
- Returns simple dict result

### Phase 2: Update TypeScript Integration

**Step 2.1: Update PythonBridge.ts**
Change line 255:
```typescript
// OLD
const unifiedScriptPath = path.join(__dirname, '../../../../packages/automation-engine/scripts/run_server_automation.py');

// NEW
const unifiedScriptPath = path.join(__dirname, '../../../../packages/automation-engine/run_automation.py');
```

**Step 2.2: Test Environment Variables**
Ensure TypeScript passes:
- `USER_FIRST_NAME`, `USER_LAST_NAME`, `USER_EMAIL`, `USER_PHONE`
- `USER_RESUME_LOCAL_PATH` or `USER_RESUME_PATH`
- `JOB_TITLE`, `JOB_COMPANY`, `JOB_APPLY_URL`
- `EXECUTION_MODE` (`desktop` or `server`)
- `AUTOMATION_HEADLESS` (`true` or `false`)
- `GOOGLE_API_KEY` (for Gemini LLM)

### Phase 3: Cleanup Old Files

**Step 3.1: Archive Complex System**
Move to `packages/automation-engine/archived/`:
- `src/companies/base/base_automation.py`
- `src/companies/base/database_automation.py`
- `src/companies/base/result_handler.py`
- `src/companies/base/user_profile.py`
- `src/companies/greenhouse/greenhouse_automation.py`
- `src/core/automation_engine.py`
- `src/core/execution_context.py`
- `src/core/proxy_manager.py`
- `src/integrations/desktop_integration.py`
- `src/integrations/server_integration.py`

**Step 3.2: Remove Old Scripts**
Delete or archive:
- `scripts/run_desktop_automation.py`
- `scripts/run_server_automation.py`
- `src/run.py`

**Step 3.3: Keep Simple Files (Optional)**
If you want to keep the old simple files for reference:
- `src/companies/base/simple_automation.py` → Archive
- `src/companies/greenhouse/simple_greenhouse.py` → Archive

---

## 🧪 Testing Plan

### Test 1: Desktop Mode
```bash
export USER_FIRST_NAME="John"
export USER_LAST_NAME="Doe"
export USER_EMAIL="john@example.com"
export USER_PHONE="123-456-7890"
export USER_RESUME_PATH="/path/to/resume.pdf"
export JOB_TITLE="Software Engineer"
export JOB_COMPANY="Test Company"
export JOB_APPLY_URL="https://job-boards.greenhouse.io/test/jobs/123"
export EXECUTION_MODE="desktop"
export AUTOMATION_HEADLESS="false"
export GOOGLE_API_KEY="your-key"

python packages/automation-engine/run_automation.py
```

### Test 2: Server Mode (Headless)
```bash
# Same as above, but:
export EXECUTION_MODE="server"
export AUTOMATION_HEADLESS="true"

python packages/automation-engine/run_automation.py
```

### Test 3: Via TypeScript API
```bash
# Start API server
cd apps/api
npm run dev

# Test endpoint (use Postman or curl)
POST /api/automation/apply
{
  "userId": "test-user",
  "jobId": "test-job",
  "userProfile": {...},
  "jobData": {...}
}
```

---

## 🔍 Debugging Checklist

If automation still exits early:

### 1. Check LLM API Key
```bash
# Test Google AI API
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GOOGLE_API_KEY"
```

### 2. Check Browser-use Installation
```bash
pip show browser-use
# Should show version >= 0.1.x
```

### 3. Check Python Dependencies
```bash
cd packages/automation-engine
pip install -r requirements.txt
```

### 4. Add Debug Logging
In `greenhouse_automation.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 5. Test Browser Startup
```python
# Quick test script
import asyncio
from browser_use import BrowserSession

async def test():
    session = BrowserSession(headless=False)
    await session.start()
    print("✅ Browser started!")
    page = await session.get_current_page()
    await page.goto("https://google.com")
    print("✅ Navigation works!")
    await session.stop()

asyncio.run(test())
```

---

## 📋 Expected Results

### Success Output
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "confirmation": "Thank you for applying! We have received your application..."
}
```

### Failure Output
```json
{
  "success": false,
  "message": "Error: Missing API key",
  "page_content": "..."
}
```

---

## 🎯 Benefits of This Approach

1. **Simple**: Just 2 Python files + 1 entry point
2. **Correct**: Uses browser-use `Tools()` API properly
3. **Maintainable**: Easy to understand and debug
4. **Flexible**: Works for both desktop and server modes
5. **No over-engineering**: Minimal abstraction layers

---

## ⚡ Quick Start

1. Create the 2 new files (provided above)
2. Update PythonBridge.ts to call new entry point
3. Archive old complex system
4. Test with environment variables
5. Done!

---

## 🆘 If Still Stuck

Check these in order:

1. **LLM API Key**: `echo $GOOGLE_API_KEY` should return your key
2. **File Permissions**: `chmod +x packages/automation-engine/run_automation.py`
3. **Python Path**: `which python3` should show correct Python
4. **Browser-use**: `pip list | grep browser-use` should show package
5. **Import Paths**: Run `python -c "from greenhouse_automation import GreenhouseAutomation; print('✅ Import works')"`

If all else fails, run with maximum debug:
```bash
LOGLEVEL=DEBUG python packages/automation-engine/run_automation.py 2>&1 | tee automation.log
```

---

## 📚 Reference

- Browser-use docs: https://github.com/browser-use/browser-use
- Tools() API: `browser-use/examples/custom-functions/file_upload.py`
- Agent API: `browser-use/examples/features/initial_actions.py`

---

**Ready to implement? Start with Phase 1, Step 1.1! 🚀**
