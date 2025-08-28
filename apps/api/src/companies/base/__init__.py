"""
JobSwipe Base Automation Framework

This package provides the base classes and utilities for building 
company-specific job application automations using AI-powered browser automation.

Key Components:
- BaseJobAutomation: Base class for all company automations
- UserProfile: Standardized user data structure
- JobData: Standardized job information structure
- ApplicationResult: Comprehensive result tracking
- ResultProcessor: Utility functions for result processing
"""

from .base_automation import BaseJobAutomation
from .user_profile import UserProfile, JobData, AutomationConfig, validate_automation_data
from .result_handler import (
    ApplicationResult, 
    ApplicationStatus, 
    CaptchaType,
    AutomationStep,
    CaptchaEvent,
    ResultProcessor
)

__version__ = "1.0.0"
__author__ = "JobSwipe Team"

__all__ = [
    # Base classes
    "BaseJobAutomation",
    
    # Data structures
    "UserProfile",
    "JobData", 
    "AutomationConfig",
    
    # Result handling
    "ApplicationResult",
    "ApplicationStatus",
    "CaptchaType",
    "AutomationStep",
    "CaptchaEvent",
    "ResultProcessor",
    
    # Utility functions
    "validate_automation_data"
]