"""
Base automation classes for JobSwipe unified automation engine
"""

from .base_automation import BaseJobAutomation
from .user_profile import UserProfile, JobData, AutomationConfig
from .result_handler import (
    ApplicationResult, ApplicationStatus, CaptchaType,
    ResultProcessor, AutomationStep, CaptchaEvent
)

__all__ = [
    'BaseJobAutomation',
    'UserProfile',
    'JobData',
    'AutomationConfig',
    'ApplicationResult',
    'ApplicationStatus',
    'CaptchaType',
    'ResultProcessor',
    'AutomationStep',
    'CaptchaEvent',
]
