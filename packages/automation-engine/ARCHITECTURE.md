# JobSwipe Automation Engine Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTOMATION ENGINE                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Entry Points                                            │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │  │
│  │  │  example.py    │  │  greenhouse_   │  │  run_      │ │  │
│  │  │  (direct)      │  │  automation.py │  │  server_   │ │  │
│  │  │                │  │  (production)  │  │  automation│ │  │
│  │  └────────────────┘  └────────────────┘  └────────────┘ │  │
│  │         │                    │                   │        │  │
│  └─────────┼────────────────────┼───────────────────┼────────┘  │
│            │                    │                   │           │
│            │                    ▼                   ▼           │
│            │          ┌─────────────────────────────────┐       │
│            │          │  automation_engine.py           │       │
│            │          │  - detect_company_type()        │       │
│            │          │  - execute()                    │       │
│            │          └─────────────────────────────────┘       │
│            │                    │                               │
│            │                    ▼                               │
│            │          ┌─────────────────────────────────┐       │
│            │          │  execution_context.py           │       │
│            │          │  - Initialize LLM ✅            │       │
│            │          │  - Configure BrowserProfile ✅  │       │
│            │          │  - Setup proxy (disabled)       │       │
│            │          └─────────────────────────────────┘       │
│            │                    │                               │
│            │                    ▼                               │
│            │          ┌─────────────────────────────────┐       │
│            │          │  Company Automations            │       │
│            │          │  ┌───────────────────────────┐  │       │
│            │          │  │ GreenhouseAutomation      │  │       │
│            │          │  │ - get_url_patterns()      │  │       │
│            │          │  │ - get_company_task()      │  │       │
│            │          │  │ - apply_to_job()          │  │       │
│            │          │  └───────────────────────────┘  │       │
│            │          │  ┌───────────────────────────┐  │       │
│            │          │  │ LinkedInAutomation        │  │       │
│            │          │  └───────────────────────────┘  │       │
│            │          │  ┌───────────────────────────┐  │       │
│            │          │  │ GenericAutomation         │  │       │
│            │          │  └───────────────────────────┘  │       │
│            │          └─────────────────────────────────┘       │
│            │                    │                               │
│            │                    │ inherits from                 │
│            │                    ▼                               │
│            │          ┌─────────────────────────────────┐       │
│            │          │  base_automation.py             │       │
│            │          │  - _get_llm()                   │       │
│            │          │  - _create_browser_session()    │       │
│            │          │  - apply_to_job() ✅            │       │
│            │          │  - _process_automation_result() │       │
│            │          │  - Custom actions (upload, etc) │       │
│            │          └─────────────────────────────────┘       │
│            │                    │                               │
│            └────────────────────┴───────────────────────────────┤
│                                 │                               │
│                                 ▼                               │
│                       ┌─────────────────────┐                   │
│                       │  browser-use Agent  │                   │
│                       │  - LLM (flash) ✅   │                   │
│                       │  - BrowserSession   │                   │
│                       │  - Controller       │                   │
│                       │  - flash_mode ✅    │                   │
│                       └─────────────────────┘                   │
│                                 │                               │
│                                 ▼                               │
│                       ┌─────────────────────┐                   │
│                       │  Playwright Browser │                   │
│                       │  - Navigate pages   │                   │
│                       │  - Fill forms       │                   │
│                       │  - Upload files     │                   │
│                       │  - Submit apps      │                   │
│                       └─────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Responsibilities

### Core Files

#### `execution_context.py` 🔧
**Purpose**: Configuration management for different execution modes

**Key Components**:
```python
class ExecutionContext:
    mode: ExecutionMode          # SERVER or DESKTOP
    llm: ChatGoogle              # AI model (gemini-flash-latest)
    browser_profile: BrowserProfile  # Browser configuration
    proxy_config: ProxyConfig    # Proxy settings (disabled)
    logger: Logger               # Logging instance
```

**Initialization Flow**:
```
__post_init__()
  ├─ Setup logger
  ├─ Initialize LLM (gemini-flash-latest) ✅
  ├─ Initialize BrowserProfile ✅
  │   ├─ headless=False
  │   ├─ wait_between_actions=0.3s
  │   ├─ use_vision=False
  │   └─ No max_actions_per_step limit
  └─ Configure for mode (SERVER/DESKTOP)
```

#### `base_automation.py` 🏗️
**Purpose**: Base class for all company-specific automations

**Key Methods**:
```python
apply_to_job(user_profile, job_data)
  ├─ Validate inputs
  ├─ Get LLM from context
  ├─ Create browser session
  ├─ Generate company-specific task
  ├─ Create Agent (flash_mode=True) ✅
  ├─ Execute agent.run()
  ├─ Process results
  └─ Return ApplicationResult
```

**Custom Actions**:
- `upload_resume()` - Upload resume files
- `detect_captcha()` - Detect captcha presence
- `extract_confirmation()` - Extract confirmation details

#### `automation_engine.py` 🎯
**Purpose**: Orchestrator that routes jobs to correct automation

**Flow**:
```python
execute(job_data, user_profile, mode, proxy)
  ├─ Create ExecutionContext
  ├─ Detect company type from URL
  │   ├─ linkedin.com → LinkedInAutomation
  │   ├─ greenhouse.io → GreenhouseAutomation
  │   ├─ lever.co → LeverAutomation
  │   └─ fallback → GenericAutomation
  ├─ Instantiate automation(context)
  ├─ Call automation.apply(job_data, user_profile)
  └─ Return result dict
```

### Company-Specific Files

#### `greenhouse_automation.py` 🌱
**Purpose**: Greenhouse job board automation

**Methods**:
- `get_url_patterns()` - Returns Greenhouse URL patterns
- `get_company_specific_task()` - Generates detailed task prompt
- `apply_to_job()` - Validates and executes automation
- `_validate_user_profile()` - Ensures required fields

**Task Prompt Structure**:
```
1. Navigate to application URL
2. Find and click "Apply" button
3. Fill basic info (name, email, phone)
4. Fill professional info (title, location, LinkedIn)
5. Upload resume (if required)
6. Answer additional questions
7. Handle captchas (if present)
8. Review and submit
9. Extract confirmation details
```

### Data Models

#### `user_profile.py` 📝
**Models**:
- `UserProfile` - User data with validation
- `JobData` - Job posting information
- `AutomationConfig` - Automation settings

#### `result_handler.py` 📊
**Models**:
- `ApplicationResult` - Complete automation result
- `AutomationStep` - Individual step tracking
- `CaptchaEvent` - Captcha detection/resolution
- `ApplicationStatus` - Status enum

**Result Structure**:
```python
ApplicationResult:
  ├─ status: ApplicationStatus
  ├─ success: bool
  ├─ steps: List[AutomationStep]
  ├─ screenshots: List[str]
  ├─ captcha_events: List[CaptchaEvent]
  ├─ total_duration_ms: int
  ├─ confirmation_number: Optional[str]
  └─ error_message: Optional[str]
```

### Integration Files

#### `server_integration.py` 🖥️
**Purpose**: Server-side wrapper for automation engine

**Features**:
- Proxy manager integration
- Model conversion (dict ↔ Pydantic)
- Error handling
- Result formatting

#### `run_server_automation.py` 🐍
**Purpose**: CLI script called by TypeScript backend

**Flow**:
```
1. Read environment variables
   ├─ USER_ID, JOB_ID, APPLICATION_ID
   └─ Or JOB_DATA_FILE
2. Parse user profile and job data
3. Configure proxy (if provided)
4. Execute automation
5. Format result as JSON
6. Output to stdout
7. Exit with status code
```

## Data Flow Examples

### Example 1: Direct Usage (example.py)
```
example.py
  └─ ChatGoogle(model='gemini-flash-latest')
  └─ Agent(llm, task, flash_mode=True)
  └─ agent.run()
  └─ Done ✅
```

**Pros**: Simple, fast, direct
**Cons**: No abstraction, no database, no result tracking

### Example 2: Production Usage (greenhouse_automation.py)
```
greenhouse_automation.py
  └─ ExecutionContext (creates LLM + BrowserProfile)
  └─ BaseJobAutomation.apply_to_job()
      └─ Get LLM from context ✅
      └─ Create browser session ✅
      └─ Generate task prompt
      └─ Create Agent(flash_mode=True) ✅
      └─ agent.run()
      └─ Process results
      └─ Return ApplicationResult
```

**Pros**: Full abstraction, database support, result tracking, error handling
**Cons**: More complex, more layers

## Configuration Comparison

| Setting | example.py | greenhouse (before) | greenhouse (after) |
|---------|-----------|---------------------|-------------------|
| LLM Model | flash-latest | 2.5-pro ❌ | flash-latest ✅ |
| flash_mode | True | Not set ❌ | True ✅ |
| use_vision | Default | True ❌ | False ✅ |
| max_actions | None | 4 ❌ | None ✅ |
| wait_between | Default | 0.5s ❌ | 0.3s ✅ |

## Debugging Tips

### 1. Enable Debug Logging
```python
from debug_config import setup_debug_logging
setup_debug_logging()
```

### 2. Compare Execution Paths
```python
# Add to base_automation.py
self.logger.info(f"LLM: {type(self.context.llm).__name__}")
self.logger.info(f"Flash mode: {getattr(agent, 'flash_mode', False)}")
```

### 3. Monitor Action Counts
```python
# Track how many actions each step takes
self.logger.info(f"Step completed with {action_count} actions")
```

### 4. Check Browser Profile
```python
# Log browser profile settings
self.logger.info(f"Browser profile: {self.context.browser_profile.__dict__}")
```

## Performance Metrics

### Before Optimization
- LLM: gemini-2.5-pro (slower)
- Vision: Enabled (overhead)
- Actions/step: Limited to 4 (stops early)
- Wait time: 0.5s per action
- **Result**: Stops mid-process ❌

### After Optimization
- LLM: gemini-flash-latest (faster)
- Vision: Disabled (no overhead)
- Actions/step: Unlimited
- Wait time: 0.3s per action
- **Result**: Completes successfully ✅

**Expected Improvement**: 40-60% faster execution

## Common Issues & Solutions

### Issue: Agent stops mid-process
**Cause**: `max_actions_per_step=4` limit
**Solution**: Removed limit ✅

### Issue: Slower than example.py
**Cause**: Wrong LLM model (2.5-pro vs flash)
**Solution**: Changed to flash-latest ✅

### Issue: Inconsistent behavior
**Cause**: flash_mode not enabled
**Solution**: Added flash_mode=True ✅

### Issue: Unnecessary overhead
**Cause**: Vision mode enabled
**Solution**: Disabled vision mode ✅
