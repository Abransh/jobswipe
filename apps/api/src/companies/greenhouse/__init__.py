"""
Greenhouse Job Application Automation

This module provides AI-powered automation for Greenhouse job board applications.
It handles form filling, file uploads, captcha detection, and result confirmation
for job postings on *.greenhouse.io domains.

Usage:
    from greenhouse import GreenhouseAutomation
    
    automation = GreenhouseAutomation()
    result = await automation.apply_to_job(user_profile, job_data)
"""

from .greenhouse import GreenhouseAutomation

__version__ = "1.0.0"
__author__ = "JobSwipe Team"

__all__ = ["GreenhouseAutomation"]