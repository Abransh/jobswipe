"""
LinkedIn Easy Apply Automation

This module provides AI-powered automation for LinkedIn Easy Apply job applications.
It handles multi-step Easy Apply forms, file uploads, and provides comprehensive
error handling for LinkedIn-specific scenarios.

Usage:
    from linkedin import LinkedInAutomation
    
    automation = LinkedInAutomation()
    result = await automation.apply_to_job(user_profile, job_data)
"""

from .linkedin import LinkedInAutomation

__version__ = "1.0.0"
__author__ = "JobSwipe Team"

__all__ = ["LinkedInAutomation"]