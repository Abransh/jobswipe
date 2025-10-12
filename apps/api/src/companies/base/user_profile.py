"""
User Profile Management for JobSwipe Automation
Standardized user data structure and validation for all company automations
"""

import json
from typing import Dict, Optional, Any, List
from pydantic import BaseModel, ValidationError, EmailStr, validator
from pathlib import Path


class UserProfile(BaseModel):
    """Standardized user profile data structure"""
    
    # Basic Information
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    
    # Resume and Cover Letter
    resume_url: Optional[str] = None
    resume_local_path: Optional[str] = None
    cover_letter: Optional[str] = None
    
    # Professional Information
    current_title: Optional[str] = None
    years_experience: Optional[int] = None
    skills: List[str] = []
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    
    # Location and Preferences
    current_location: Optional[str] = None
    willing_to_relocate: bool = False
    remote_work_preference: Optional[str] = None  # 'remote', 'hybrid', 'onsite'
    salary_expectation: Optional[str] = None
    
    # Legal Status (for applications requiring this)
    work_authorization: Optional[str] = None  # 'citizen', 'green_card', 'visa_required'
    require_sponsorship: Optional[bool] = None
    
    # Custom fields for specific company requirements
    custom_fields: Dict[str, Any] = {}
    
    @validator('phone')
    def validate_phone(cls, v):
        """Basic phone number validation"""
        if not v:
            raise ValueError('Phone number is required')
        # Remove non-digit characters for validation
        digits_only = ''.join(filter(str.isdigit, v))
        if len(digits_only) < 10:
            raise ValueError('Phone number must have at least 10 digits')
        return v
    
    @validator('years_experience')
    def validate_experience(cls, v):
        """Validate years of experience"""
        if v is not None and (v < 0 or v > 50):
            raise ValueError('Years of experience must be between 0 and 50')
        return v
    
    def get_full_name(self) -> str:
        """Get formatted full name"""
        return f"{self.first_name} {self.last_name}"
    
    def get_resume_path(self) -> Optional[str]:
        """Get the best available resume path"""
        if self.resume_local_path and Path(self.resume_local_path).exists():
            return self.resume_local_path
        return self.resume_url
    
    def has_work_authorization_info(self) -> bool:
        """Check if work authorization information is available"""
        return self.work_authorization is not None or self.require_sponsorship is not None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for easy JSON serialization"""
        return self.dict(exclude_none=True)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserProfile':
        """Create UserProfile from dictionary"""
        try:
            return cls(**data)
        except ValidationError as e:
            raise ValueError(f"Invalid user profile data: {e}")
    
    @classmethod
    def from_json(cls, json_str: str) -> 'UserProfile':
        """Create UserProfile from JSON string"""
        try:
            data = json.loads(json_str)
            return cls.from_dict(data)
        except (json.JSONDecodeError, ValidationError) as e:
            raise ValueError(f"Invalid user profile JSON: {e}")


class JobData(BaseModel):
    """Standardized job data structure"""
    
    job_id: str
    title: str
    company: str
    apply_url: str
    
    # Optional job details
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: List[str] = []
    salary_range: Optional[str] = None
    job_type: Optional[str] = None  # 'full-time', 'part-time', 'contract', 'internship'
    remote_option: Optional[str] = None  # 'remote', 'hybrid', 'onsite'
    
    # Company detection
    company_domain: Optional[str] = None
    job_board: Optional[str] = None  # 'greenhouse', 'lever', 'workday', 'linkedin', 'indeed'
    
    # Custom fields for specific requirements
    custom_fields: Dict[str, Any] = {}
    
    @validator('apply_url')
    def validate_url(cls, v):
        """Basic URL validation"""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Apply URL must be a valid HTTP/HTTPS URL')
        return v
    
    def get_company_identifier(self) -> str:
        """Get a standardized company identifier for automation selection"""
        if self.job_board:
            return self.job_board.lower()
        
        # Try to detect from URL
        url_lower = self.apply_url.lower()
        if 'greenhouse.io' in url_lower:
            return 'greenhouse'
        elif 'lever.co' in url_lower:
            return 'lever'
        elif 'myworkday.com' in url_lower or 'workday.com' in url_lower:
            return 'workday'
        elif 'linkedin.com' in url_lower:
            return 'linkedin'
        elif 'indeed.com' in url_lower:
            return 'indeed'
        elif 'jobvite.com' in url_lower:
            return 'jobvite'
        else:
            return 'generic'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for easy JSON serialization"""
        return self.dict(exclude_none=True)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'JobData':
        """Create JobData from dictionary"""
        try:
            return cls(**data)
        except ValidationError as e:
            raise ValueError(f"Invalid job data: {e}")


class AutomationConfig(BaseModel):
    """Configuration for automation execution"""

    # Browser settings
    headless: bool = True
    timeout: int = 300000  # 5 minutes in milliseconds
    screenshot_enabled: bool = True

    # Retry settings
    max_retries: int = 3
    retry_delay: int = 5000  # 5 seconds in milliseconds

    # Captcha handling
    captcha_timeout: int = 120000  # 2 minutes
    manual_captcha_fallback: bool = True

    # Proxy configuration (REQUIRED for free tier server automation)
    proxy: Optional[Dict[str, Any]] = None  # Contains: host, port, username, password, type
    
    # Company-specific settings
    company_settings: Dict[str, Any] = {}
    
    def get_timeout_seconds(self) -> int:
        """Get timeout in seconds"""
        return self.timeout // 1000
    
    def get_retry_delay_seconds(self) -> int:
        """Get retry delay in seconds"""
        return self.retry_delay // 1000


def validate_automation_data(user_profile_data: Dict[str, Any], job_data: Dict[str, Any]) -> tuple[UserProfile, JobData]:
    """
    Validate and create UserProfile and JobData objects from raw data
    
    Args:
        user_profile_data: Raw user profile dictionary
        job_data: Raw job data dictionary
        
    Returns:
        Tuple of (UserProfile, JobData) objects
        
    Raises:
        ValueError: If validation fails
    """
    try:
        user_profile = UserProfile.from_dict(user_profile_data)
        job_data_obj = JobData.from_dict(job_data)
        return user_profile, job_data_obj
    except ValueError as e:
        raise ValueError(f"Data validation failed: {e}")


# Example usage and testing
if __name__ == "__main__":
    # Test user profile creation
    user_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "123-456-7890",
        "resume_local_path": "/path/to/resume.pdf",
        "current_title": "Software Engineer",
        "years_experience": 5,
        "skills": ["Python", "JavaScript", "React"],
        "current_location": "San Francisco, CA",
        "work_authorization": "citizen"
    }
    
    job_data = {
        "job_id": "12345",
        "title": "Senior Software Engineer",
        "company": "Example Company",
        "apply_url": "https://job-boards.greenhouse.io/example/jobs/12345",
        "location": "San Francisco, CA",
        "job_type": "full-time",
        "remote_option": "hybrid"
    }
    
    try:
        user_profile, job = validate_automation_data(user_data, job_data)
        print(f"✅ User: {user_profile.get_full_name()}")
        print(f"✅ Job: {job.title} at {job.company}")
        print(f"✅ Company identifier: {job.get_company_identifier()}")
        print(f"✅ Resume path: {user_profile.get_resume_path()}")
    except ValueError as e:
        print(f"❌ Validation error: {e}")