# Automation Engine Wrapper Scripts

**Bridge between TypeScript services and Python unified automation engine**

These scripts allow the TypeScript automation services (ServerAutomationService and SimplifiedAutomationService) to use the unified Python automation engine seamlessly.

---

## 📁 Files

### `run_server_automation.py`
**Purpose**: Wrapper for server-side automation (apps/api)

**Features**:
- Reads data from environment variables
- Uses `ServerAutomationIntegration` from unified engine
- Handles proxy rotation automatically
- Outputs JSON results to stdout

**Usage**:
```bash
# Called by ServerAutomationService
python3 run_server_automation.py

# Environment variables required:
USER_ID=abc123
JOB_ID=job456
APPLICATION_ID=app789
USER_FIRST_NAME=John
USER_LAST_NAME=Doe
USER_EMAIL=john@example.com
USER_PHONE=555-1234
JOB_TITLE="Software Engineer"
JOB_COMPANY="Example Corp"
JOB_APPLY_URL="https://boards.greenhouse.io/example/jobs/123"
PROXY_CONFIG='{"host":"proxy.com","port":8080,"username":"user","password":"pass"}'
ANTHROPIC_API_KEY=your-api-key
```

### `run_desktop_automation.py`
**Purpose**: Wrapper for desktop-side automation (apps/desktop)

**Features**:
- Reads data from environment variables or data file
- Uses `DesktopAutomationIntegration` from unified engine
- Supports browser profile for pre-filled data
- No proxy needed (local execution)
- Outputs JSON results to stdout

**Usage**:
```bash
# Called by SimplifiedAutomationService
python3 run_desktop_automation.py

# Environment variables required:
USER_ID=abc123
JOB_ID=job456
APPLICATION_ID=app789
USER_FIRST_NAME=John
USER_LAST_NAME=Doe
USER_EMAIL=john@example.com
USER_PHONE=555-1234
USER_RESUME_LOCAL_PATH=/path/to/resume.pdf
JOB_TITLE="Software Engineer"
JOB_COMPANY="Example Corp"
JOB_APPLY_URL="https://www.linkedin.com/jobs/view/1234"
BROWSER_PROFILE_PATH=/home/user/.config/google-chrome/Default
ANTHROPIC_API_KEY=your-api-key

# Or with data file (legacy compatibility):
JOBSWIPE_DATA_FILE=/tmp/application_data.json
```

---

## 🔄 Integration with TypeScript Services

### Server Automation Service

**Current (OLD)**:
```typescript
// apps/api/src/services/ServerAutomationService.ts
const scriptPath = path.join(
  this.config.companiesPath,
  companyAutomation,  // e.g., 'greenhouse'
  'run_automation.py'
);
```

**New (UNIFIED)**:
```typescript
// apps/api/src/services/ServerAutomationService.ts
const scriptPath = path.join(
  __dirname,
  '../../../packages/automation-engine/scripts',
  'run_server_automation.py'  // Single unified script!
);
```

### Desktop Automation Service

**Current (OLD)**:
```typescript
// apps/desktop/src/services/SimplifiedAutomationService.ts
const scriptPath = path.join(
  this.config.companiesPath,
  companyAutomation,  // e.g., 'linkedin'
  'run_automation.py'
);
```

**New (UNIFIED)**:
```typescript
// apps/desktop/src/services/SimplifiedAutomationService.ts
const scriptPath = path.join(
  __dirname,
  '../../../packages/automation-engine/scripts',
  'run_desktop_automation.py'  // Single unified script!
);
```

---

## 🎯 How It Works

### Data Flow:

```
TypeScript Service → Wrapper Script → Unified Engine → Result
```

**Detailed Flow**:

1. **TypeScript Service** (ServerAutomationService or SimplifiedAutomationService)
   - Prepares user profile and job data
   - Sets environment variables
   - Spawns Python wrapper script

2. **Wrapper Script** (run_server_automation.py or run_desktop_automation.py)
   - Reads environment variables
   - Calls unified automation engine
   - Uses ServerAutomationIntegration or DesktopAutomationIntegration

3. **Unified Engine** (packages/automation-engine)
   - Creates ExecutionContext (SERVER or DESKTOP mode)
   - Detects company type (LinkedIn, Greenhouse, etc.)
   - Executes appropriate automation
   - Returns ApplicationResult

4. **Wrapper Script** (again)
   - Converts ApplicationResult to JSON
   - Outputs JSON to stdout
   - TypeScript service reads and parses

5. **TypeScript Service** (again)
   - Receives JSON result
   - Updates database
   - Emits WebSocket events
   - Returns result to caller

---

## 📊 Output Format

Both wrapper scripts output JSON in this format:

```json
{
  "success": true,
  "application_id": "app789",
  "confirmation_number": "CONF123456",
  "execution_time_ms": 15000,
  "company_automation": "greenhouse",
  "status": "success",
  "error_message": null,
  "steps": [
    {
      "step_name": "initialize",
      "action": "Initialize browser and AI agent",
      "success": true,
      "timestamp": "2025-11-07T10:30:00.000Z",
      "duration_ms": 2000,
      "error_message": null
    }
  ],
  "screenshots": ["/tmp/screenshot_1.png"],
  "captcha_events": [],
  "steps_completed": 5,
  "python_version": "3.11.0",
  "execution_mode": "server"
}
```

---

## 🔒 Security Considerations

### Environment Variables:
- **Sensitive data** (API keys, passwords) should be passed via environment variables, not command-line arguments
- Wrapper scripts never log sensitive data
- Proxy credentials are handled securely

### File Permissions:
- Scripts should be executable only by the application user
- Temporary data files should be created with restrictive permissions (0600)
- Screenshots should be stored in protected directories

---

## 🧪 Testing

### Test Server Automation:
```bash
cd /home/user/jobswipe/packages/automation-engine/scripts

export USER_ID=test123
export JOB_ID=job456
export APPLICATION_ID=app789
export USER_FIRST_NAME=John
export USER_LAST_NAME=Doe
export USER_EMAIL=john@example.com
export USER_PHONE=555-1234
export JOB_TITLE="Software Engineer"
export JOB_COMPANY="Example Corp"
export JOB_APPLY_URL="https://boards.greenhouse.io/example/jobs/123"
export ANTHROPIC_API_KEY=your-api-key

python3 run_server_automation.py
```

### Test Desktop Automation:
```bash
cd /home/user/jobswipe/packages/automation-engine/scripts

export USER_ID=test123
export JOB_ID=job456
export APPLICATION_ID=app789
export USER_FIRST_NAME=John
export USER_LAST_NAME=Doe
export USER_EMAIL=john@example.com
export USER_PHONE=555-1234
export USER_RESUME_LOCAL_PATH=/path/to/resume.pdf
export JOB_TITLE="Senior Developer"
export JOB_COMPANY="Tech Corp"
export JOB_APPLY_URL="https://www.linkedin.com/jobs/view/1234"
export ANTHROPIC_API_KEY=your-api-key

python3 run_desktop_automation.py
```

---

## 🚀 Migration Steps

### Step 1: Install Unified Engine
```bash
cd /home/user/jobswipe/packages/automation-engine
pip install -e .
```

### Step 2: Update TypeScript Services
Update the script paths in:
- `apps/api/src/services/ServerAutomationService.ts`
- `apps/desktop/src/services/SimplifiedAutomationService.ts`

### Step 3: Test
Run automated tests to verify both server and desktop automation work.

### Step 4: Remove Old Code
Once verified, delete:
- `apps/api/src/companies/` (except base classes if needed)
- `apps/desktop/companies/` (except base classes if needed)

---

## 📝 Notes

- **Backwards Compatible**: Wrapper scripts can read from both environment variables and data files
- **Company Detection**: Automatic - unified engine detects company type from URL
- **Single Source**: One automation codebase for both server and desktop
- **Easy Maintenance**: Fix bugs once, benefit both modes

---

**Built with ❤️ for unified automation excellence**

