Result Handler for JobSwipe Automation
Standardized result processing and validation for all company automations
"""

import json
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, validator
from enum import Enum


class ApplicationStatus(str, Enum):
    """Standard application statuses"""
    SUCCESS = "success"
    FAILED = "failed"
    CAPTCHA_REQUIRED = "captcha_required"
    LOGIN_REQUIRED = "login_required"
    TIMEOUT = "timeout"
    RATE_LIMITED = "rate_limited"
    FORM_ERROR = "form_error"
    NETWORK_ERROR = "network_error"
    UNKNOWN_ERROR = "unknown_error"


class CaptchaType(str, Enum):
    """Types of captchas encountered"""
    RECAPTCHA = "recaptcha"
    HCAPTCHA = "hcaptcha"
    CLOUDFLARE = "cloudflare"
    IMAGE_CAPTCHA = "image_captcha"
    TEXT_CAPTCHA = "text_captcha"
    UNKNOWN = "unknown"


class AutomationStep(BaseModel):
    """Individual step in the automation process"""
    step_name: str
    action: str
    timestamp: datetime
    success: bool
    duration_ms: Optional[int] = None
    screenshot_path: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = {}
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }


class CaptchaEvent(BaseModel):
    """Captcha detection and resolution details"""
    captcha_type: CaptchaType
    detected_at: datetime
    screenshot_path: Optional[str] = None
    resolved: bool = False
    resolution_method: Optional[str] = None  # 'ai', 'manual', 'service'
    resolution_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }


class ApplicationResult(BaseModel):
    """Standardized application result structure"""
    
    # Core result data
    job_id: str
    user_id: Optional[str] = None
    application_id: Optional[str] = None
    status: ApplicationStatus
    success: bool
    
    # Timing information
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_duration_ms: Optional[int] = None
    
    # Application details
    confirmation_number: Optional[str] = None
    confirmation_email: Optional[str] = None
    application_url: Optional[str] = None
    
    # Automation metadata
    company_automation: str  # Which company script was used
    automation_version: str = "1.0.0"
    steps_completed: int = 0
    total_steps: int = 0
    
    # Error information
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    retry_count: int = 0
    
    # Detailed logging
    steps: List[AutomationStep] = []
    screenshots: List[str] = []
    captcha_events: List[CaptchaEvent] = []
    
    # Performance metrics
    performance_metrics: Dict[str, Any] = {}
    
    # Raw data for debugging
    raw_output: Optional[str] = None
    browser_logs: List[str] = []
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
    
    @validator('success')
    def success_matches_status(cls, v, values):
        """Ensure success field matches status"""
        status = values.get('status')
        if status == ApplicationStatus.SUCCESS and not v:
            raise ValueError("Success must be True when status is SUCCESS")
        if status != ApplicationStatus.SUCCESS and v:
            raise ValueError("Success must be False when status is not SUCCESS")
        return v
    
    def add_step(self, step_name: str, action: str, success: bool, 
                 duration_ms: Optional[int] = None, screenshot_path: Optional[str] = None,
                 error_message: Optional[str] = None, metadata: Dict[str, Any] = None):
        """Add a step to the automation process"""
        step = AutomationStep(
            step_name=step_name,
            action=action,
            timestamp=datetime.now(timezone.utc),
            success=success,
            duration_ms=duration_ms,
            screenshot_path=screenshot_path,
            error_message=error_message,
            metadata=metadata or {}
        )
        self.steps.append(step)
        
        if success:
            self.steps_completed += 1
    
    def add_captcha_event(self, captcha_type: CaptchaType, screenshot_path: Optional[str] = None):
        """Add a captcha detection event"""
        event = CaptchaEvent(
            captcha_type=captcha_type,
            detected_at=datetime.now(timezone.utc),
            screenshot_path=screenshot_path
        )
        self.captcha_events.append(event)
        return event
    
    def resolve_captcha(self, event_index: int = -1, method: str = "ai", 
                       duration_ms: Optional[int] = None, success: bool = True,
                       error_message: Optional[str] = None):
        """Mark a captcha event as resolved"""
        if self.captcha_events:
            event = self.captcha_events[event_index]
            event.resolved = success
            event.resolution_method = method
            event.resolution_time_ms = duration_ms
            if error_message:
                event.error_message = error_message
    
    def set_completed(self, status: ApplicationStatus, confirmation_number: Optional[str] = None):
        """Mark the application as completed"""
        self.completed_at = datetime.now(timezone.utc)
        self.status = status
        self.success = (status == ApplicationStatus.SUCCESS)
        
        if self.started_at and self.completed_at:
            self.total_duration_ms = int((self.completed_at - self.started_at).total_seconds() * 1000)
        
        if confirmation_number:
            self.confirmation_number = confirmation_number
    
    def set_failed(self, error_message: str, error_type: Optional[str] = None, 
                   status: ApplicationStatus = ApplicationStatus.FAILED):
        """Mark the application as failed"""
        self.status = status
        self.success = False
        self.error_message = error_message
        self.error_type = error_type
        self.completed_at = datetime.now(timezone.utc)
        
        if self.started_at and self.completed_at:
            self.total_duration_ms = int((self.completed_at - self.started_at).total_seconds() * 1000)
    
    def get_success_rate(self) -> float:
        """Calculate step success rate"""
        if not self.steps:
            return 0.0
        successful_steps = sum(1 for step in self.steps if step.success)
        return successful_steps / len(self.steps)
    
    def get_captcha_count(self) -> int:
        """Get total number of captchas encountered"""
        return len(self.captcha_events)
    
    def get_resolved_captcha_count(self) -> int:
        """Get number of successfully resolved captchas"""
        return sum(1 for event in self.captcha_events if event.resolved)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return self.dict(exclude_none=False)
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return self.json(indent=2, ensure_ascii=False)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ApplicationResult':
        """Create ApplicationResult from dictionary"""
        # Convert string dates back to datetime objects
        if 'started_at' in data and isinstance(data['started_at'], str):
            data['started_at'] = datetime.fromisoformat(data['started_at'].replace('Z', '+00:00'))
        if 'completed_at' in data and isinstance(data['completed_at'], str):
            data['completed_at'] = datetime.fromisoformat(data['completed_at'].replace('Z', '+00:00'))
            
        return cls(**data)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'ApplicationResult':
        """Create ApplicationResult from JSON string"""
        data = json.loads(json_str)
        return cls.from_dict(data)


class ResultProcessor:
    """Utility class for processing and validating automation results"""
    
    @staticmethod
    def create_success_result(job_id: str, company_automation: str, 
                            confirmation_number: Optional[str] = None,
                            user_id: Optional[str] = None) -> ApplicationResult:
        """Create a successful application result"""
        result = ApplicationResult(
            job_id=job_id,
            user_id=user_id,
            status=ApplicationStatus.SUCCESS,
            success=True,
            started_at=datetime.now(timezone.utc),
            company_automation=company_automation
        )
        
        result.set_completed(ApplicationStatus.SUCCESS, confirmation_number)
        return result
    
    @staticmethod
    def create_failed_result(job_id: str, company_automation: str, 
                           error_message: str, error_type: Optional[str] = None,
                           status: ApplicationStatus = ApplicationStatus.FAILED,
                           user_id: Optional[str] = None) -> ApplicationResult:
        """Create a failed application result"""
        result = ApplicationResult(
            job_id=job_id,
            user_id=user_id,
            status=status,
            success=False,
            started_at=datetime.now(timezone.utc),
            company_automation=company_automation
        )
        
        result.set_failed(error_message, error_type, status)
        return result
    
    @staticmethod
    def parse_browser_use_output(output: str) -> Dict[str, Any]:
        """Parse output from browser-use automation"""
        try:
            # Look for JSON in the output
            lines = output.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    return json.loads(line)
            
            # If no JSON found, return a basic structure
            return {
                "success": "success" in output.lower() or "completed" in output.lower(),
                "raw_output": output
            }
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Failed to parse automation output",
                "raw_output": output
            }
    
    @staticmethod
    def extract_confirmation_number(text: str) -> Optional[str]:
        """Extract confirmation number from text using common patterns"""
        import re
        
        patterns = [
            r'confirmation.*?([A-Z0-9]{6,})',
            r'reference.*?([A-Z0-9]{6,})',
            r'application.*?id.*?([A-Z0-9]{6,})',
            r'tracking.*?([A-Z0-9]{6,})',
            r'ticket.*?([A-Z0-9]{6,})',
            r'(\b[A-Z0-9]{8,}\b)',  # Generic alphanumeric codes
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    @staticmethod
    def validate_result(result: ApplicationResult) -> List[str]:
        """Validate application result and return list of issues"""
        issues = []
        
        if not result.job_id:
            issues.append("Missing job_id")
        
        if not result.company_automation:
            issues.append("Missing company_automation")
        
        if result.success and not result.confirmation_number:
            issues.append("Successful application should have confirmation_number")
        
        if not result.success and not result.error_message:
            issues.append("Failed application should have error_message")
        
        if result.completed_at and result.started_at:
            if result.completed_at < result.started_at:
                issues.append("completed_at cannot be before started_at")
        
        if result.steps_completed > result.total_steps and result.total_steps > 0:
            issues.append("steps_completed cannot exceed total_steps")
        
        return issues


# Example usage and testing
if __name__ == "__main__":
    # Test successful result
    result = ResultProcessor.create_success_result(
        job_id="12345",
        company_automation="greenhouse",
        confirmation_number="CONF123456"
    )
    
    result.add_step("navigate", "Navigate to application page", True, 2000)
    result.add_step("fill_form", "Fill application form", True, 5000)
    result.add_step("submit", "Submit application", True, 1000)
    
    print("✅ Success result:")
    print(json.dumps(result.to_dict(), indent=2, default=str))
    
    # Test failed result
    failed_result = ResultProcessor.create_failed_result(
        job_id="67890",
        company_automation="linkedin",
        error_message="Form submission failed",
        error_type="FORM_ERROR"
    )
    
    captcha_event = failed_result.add_captcha_event(CaptchaType.RECAPTCHA)
    failed_result.resolve_captcha(method="manual", duration_ms=30000, success=False)
    
    print("\n❌ Failed result:")
    print(json.dumps(failed_result.to_dict(), indent=2, default=str))
    
    # Validate results
    issues = ResultProcessor.validate_result(result)
    print(f"\n✅ Success result validation: {'✓ Valid' if not issues else f'Issues: {issues}'}")
    
    issues = ResultProcessor.validate_result(failed_result)
    print(f"❌ Failed result validation: {'✓ Valid' if not issues else f'Issues: {issues}'}")