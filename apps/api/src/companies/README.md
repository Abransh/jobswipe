# JobSwipe Automation System

A simplified, AI-powered job application automation system using Python and browser-use library.

## Overview

This system replaces the complex TypeScript automation engine with a clean, maintainable Python-first architecture that leverages the browser-use library for intelligent job applications.

## Architecture

```
JobSwipe Automation Flow:
User swipes right → API queues job → Desktop app → Python script → AI applies → Results stored
```

### Key Components

1. **Base Framework** (`base/`) - Shared automation classes and utilities
2. **Company Scripts** (`{company}/`) - Company-specific automation implementations  
3. **Desktop Service** (`../src/services/SimplifiedAutomationService.ts`) - TypeScript integration layer
4. **API Endpoints** (`../../api/src/routes/automation.routes.ts`) - Backend API routes
5. **Testing Framework** (`tests/`) - Comprehensive testing utilities

## Supported Companies

- ✅ **Greenhouse** (`greenhouse/`) - Complete implementation
- ✅ **LinkedIn** (`linkedin/`) - Easy Apply automation
- 🔄 **Indeed** (`indeed/`) - Coming soon
- 🔄 **Workday** (`workday/`) - Coming soon

## Quick Start

### 1. Install Dependencies

```bash
# Python dependencies (from browser-use directory)
cd browser-use
pip install -r requirements.txt

# Additional dependencies
pip install pydantic
```

### 2. Set Environment Variables

```bash
export ANTHROPIC_API_KEY="your-api-key"
export OPENAI_API_KEY="your-openai-key"  # Optional
export GOOGLE_API_KEY="your-gemini-key"   # Optional
```

### 3. Test the System

```bash
# Run all tests
cd companies/tests
python run_tests.py

# Run specific company tests
python run_tests.py --company greenhouse

# Verbose output
python run_tests.py -v
```

### 4. Manual Testing

```bash
# Test Greenhouse automation
cd companies/greenhouse
python greenhouse.py

# Test LinkedIn automation
cd companies/linkedin  
python linkedin.py
```

## Adding New Companies

### 1. Create Company Directory

```bash
mkdir companies/newcompany
cd companies/newcompany
```

### 2. Implement Automation Class

Create `newcompany.py`:

```python
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent / "base"))

from base_automation import BaseJobAutomation
from user_profile import UserProfile, JobData

class NewCompanyAutomation(BaseJobAutomation):
    def __init__(self):
        super().__init__("newcompany")
    
    def get_url_patterns(self) -> List[str]:
        return ["newcompany.com", "careers.newcompany.com"]
    
    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        return f"""
        Navigate to: {job_data.apply_url}
        Apply for {job_data.title} at {job_data.company}
        
        Fill forms with:
        - Name: {user_profile.get_full_name()}
        - Email: {user_profile.email}
        - Phone: {user_profile.phone}
        
        Use upload_resume action for file uploads.
        Use extract_confirmation to get confirmation details.
        """
```

### 3. Create Runner Script

Create `run_automation.py`:

```python
#!/usr/bin/env python3
import asyncio
import json
import os
from pathlib import Path
from datetime import datetime

# Add paths
sys.path.append(str(Path(__file__).parent.parent / "base"))

from user_profile import UserProfile, JobData, validate_automation_data
from newcompany import NewCompanyAutomation

async def main():
    data_file = os.getenv('JOBSWIPE_DATA_FILE')
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    user_profile, job_data = validate_automation_data(
        data['user_profile'], data['job_data']
    )
    
    automation = NewCompanyAutomation()
    result = await automation.apply_to_job(user_profile, job_data)
    
    # Output JSON result
    output = {
        "success": result.success,
        "application_id": result.application_id,
        "confirmation_number": result.confirmation_number,
        "execution_time_ms": result.total_duration_ms,
        # ... additional fields
    }
    
    print(json.dumps(output, indent=2))
    sys.exit(0 if result.success else 1)

if __name__ == "__main__":
    asyncio.run(main())
```

### 4. Update Registry

Add to `companies/__init__.py`:

```python
try:
    from .newcompany import NewCompanyAutomation
except ImportError:
    NewCompanyAutomation = None

if NewCompanyAutomation:
    AVAILABLE_AUTOMATIONS['newcompany'] = NewCompanyAutomation
```

### 5. Update Services

Add to `SimplifiedAutomationService.ts`:

```typescript
this.supportedCompanies.set('newcompany', [
  'newcompany.com',
  'careers.newcompany.com'
]);
```

### 6. Add Tests

Create `tests/test_newcompany.py` following the pattern in `test_greenhouse.py`.

## Data Structures

### User Profile

```python
UserProfile(
    first_name="John",
    last_name="Doe",
    email="john@example.com",
    phone="123-456-7890",
    resume_local_path="/path/to/resume.pdf",
    current_title="Software Engineer",
    years_experience=5,
    skills=["Python", "JavaScript"],
    work_authorization="citizen"
)
```

### Job Data

```python
JobData(
    job_id="12345",
    title="Senior Developer",
    company="Tech Corp", 
    apply_url="https://company.com/jobs/12345",
    location="San Francisco, CA"
)
```

### Automation Result

```python
ApplicationResult(
    success=True,
    status=ApplicationStatus.SUCCESS,
    confirmation_number="CONF123456",
    execution_time=45000,
    steps_completed=5,
    screenshots=["/path/to/screenshot1.png"],
    captcha_events=[],
    performance_metrics={...}
)
```

## Browser-Use Integration

### Common Actions

The base automation provides these pre-built actions:

- `upload_resume(file_path)` - Upload resume files
- `detect_captcha()` - Detect and handle captchas  
- `extract_confirmation()` - Extract success confirmation

### Custom Actions

Add company-specific actions in your automation class:

```python
@self.controller.action("Custom company action")
async def custom_action(param: str, browser_session: BrowserSession):
    page = await browser_session.get_current_page()
    # Custom logic here
    return ActionResult(extracted_content="Success")
```

## Error Handling

### Validation Errors

```python
def _validate_user_profile(self, user_profile: UserProfile) -> List[str]:
    errors = []
    if not user_profile.email:
        errors.append("Email is required")
    return errors
```

### Automation Errors

The system automatically handles:
- Network timeouts
- Browser crashes
- Captcha detection
- Form validation errors
- Rate limiting

## Testing

### Test Structure

```python
{
    "name": "Test Name",
    "user_profile": {...},
    "job_data": {...},
    "mock_responses": {
        "page_text": "Expected page content",
        "count_selector": 1,
        "visible_selector": True
    },
    "expected": {
        "success": True,
        "status": "success",
        "min_steps": 3
    }
}
```

### Running Tests

```bash
# All tests
python tests/run_tests.py

# Specific company
python tests/run_tests.py --company greenhouse

# Verbose mode
python tests/run_tests.py -v
```

## Best Practices

### 1. Task Descriptions

Write clear, detailed task descriptions:

```python
def get_company_specific_task(self, user_profile, job_data):
    return f"""
    OBJECTIVE: Apply to {job_data.title} at {job_data.company}
    
    STEPS:
    1. Navigate to {job_data.apply_url}
    2. Find application form
    3. Fill required fields:
       - Name: {user_profile.get_full_name()}
       - Email: {user_profile.email}
    4. Upload resume using upload_resume action
    5. Submit application
    6. Extract confirmation using extract_confirmation
    
    Be professional and accurate.
    """
```

### 2. Error Handling

Always validate inputs and handle failures gracefully:

```python
validation_errors = self._validate_user_profile(user_profile)
if validation_errors:
    return ResultProcessor.create_failed_result(
        job_data.job_id, 
        self.company_name,
        f"Validation failed: {', '.join(validation_errors)}",
        "VALIDATION_ERROR"
    )
```

### 3. Testing

Write comprehensive tests covering:
- Successful applications
- Form errors
- Captcha handling
- Network failures
- Invalid inputs

## Migration from Legacy System

The new system replaces these old files:
- ❌ `JobSwipeAutomationEngine.ts` (798 lines) 
- ❌ `BrowserAutomationService.ts` (1700+ lines)
- ❌ `WorkflowIntegrationService.ts` (708 lines)
- ❌ Complex strategy registry and queue systems

Benefits of new system:
- ✅ 90% reduction in code complexity
- ✅ Direct use of proven browser-use library
- ✅ Easy to add new companies (hours vs weeks)
- ✅ Better error handling and debugging
- ✅ Comprehensive testing framework

## Troubleshooting

### Common Issues

1. **Python Import Errors**
   ```bash
   # Ensure paths are correct
   export PYTHONPATH=/path/to/jobswipe/apps/desktop/companies
   ```

2. **Browser-Use Not Found**
   ```bash
   # Install browser-use dependencies
   cd browser-use
   pip install -e .
   ```

3. **API Key Issues**
   ```bash
   # Verify environment variables
   echo $ANTHROPIC_API_KEY
   ```

4. **Resume Upload Failures**
   ```bash
   # Check file exists and is valid PDF
   file /path/to/resume.pdf
   ```

### Debugging

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

View automation steps:

```python
for step in result.steps:
    print(f"{step.step_name}: {step.success} - {step.action}")
```

## Support

For issues:
1. Check the test suite: `python tests/run_tests.py -v`
2. Review automation logs in the result object
3. Test with a simple job posting first
4. Verify all environment variables are set

The system is designed to be simple, reliable, and easy to extend. Each company automation is independent and can be developed/tested separately.