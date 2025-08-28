"""
JobSwipe Company Automation Scripts

This package contains AI-powered automation scripts for different job boards
and company career pages. Each company module provides specialized automation
for handling their specific application processes.

Available Companies:
- Greenhouse: greenhouse.io job boards
- LinkedIn: LinkedIn Easy Apply (coming soon)
- Indeed: Indeed job applications (coming soon) 
- Workday: Workday-based career pages (coming soon)

Usage:
    from companies.greenhouse import GreenhouseAutomation
    
    # Initialize automation for specific company
    automation = GreenhouseAutomation()
    
    # Run automation
    result = await automation.apply_to_job(user_profile, job_data)
"""

from .base import (
    BaseJobAutomation,
    UserProfile, 
    JobData,
    AutomationConfig,
    ApplicationResult,
    ApplicationStatus,
    validate_automation_data
)

# Import company-specific automations
try:
    from .greenhouse import GreenhouseAutomation
except ImportError:
    GreenhouseAutomation = None

try:
    from .linkedin import LinkedInAutomation
except ImportError:
    LinkedInAutomation = None

__version__ = "1.0.0"
__author__ = "JobSwipe Team"

# Registry of available automations
AVAILABLE_AUTOMATIONS = {}

if GreenhouseAutomation:
    AVAILABLE_AUTOMATIONS['greenhouse'] = GreenhouseAutomation

if LinkedInAutomation:
    AVAILABLE_AUTOMATIONS['linkedin'] = LinkedInAutomation

__all__ = [
    # Base framework
    "BaseJobAutomation",
    "UserProfile",
    "JobData", 
    "AutomationConfig",
    "ApplicationResult",
    "ApplicationStatus",
    "validate_automation_data",
    
    # Company automations
    "GreenhouseAutomation",
    "LinkedInAutomation",
    
    # Registry
    "AVAILABLE_AUTOMATIONS"
]


def get_automation_for_url(url: str) -> BaseJobAutomation:
    """
    Get the appropriate automation class for a given job URL
    
    Args:
        url: Job application URL
        
    Returns:
        Automation instance that can handle the URL
        
    Raises:
        ValueError: If no automation can handle the URL
    """
    url_lower = url.lower()
    
    for name, automation_class in AVAILABLE_AUTOMATIONS.items():
        automation_instance = automation_class()
        if automation_instance.can_handle_url(url):
            return automation_instance
    
    raise ValueError(f"No automation found for URL: {url}")


def list_supported_patterns() -> dict:
    """
    Get all supported URL patterns across all automations
    
    Returns:
        Dictionary mapping company names to their supported URL patterns
    """
    patterns = {}
    
    for name, automation_class in AVAILABLE_AUTOMATIONS.items():
        automation_instance = automation_class()
        patterns[name] = automation_instance.get_url_patterns()
    
    return patterns