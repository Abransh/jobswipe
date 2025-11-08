"""
Automation Engine - Core orchestrator for job application automation
Detects company type and executes appropriate automation in SERVER or DESKTOP mode
"""

import sys
from pathlib import Path
from typing import Dict, Any, Optional
from urllib.parse import urlparse

# Add browser-use to path (assumes it's in parent directory)
browser_use_path = Path(__file__).parent.parent.parent.parent.parent / "browser-use"
if browser_use_path.exists():
    sys.path.insert(0, str(browser_use_path))

from .execution_context import ExecutionContext, ExecutionMode, ProxyConfig
from ..companies.base.base_automation import BaseJobAutomation


class AutomationEngine:
    """
    Main automation engine
    Detects company type from job URL and executes appropriate automation
    """

    def __init__(self):
        self.automations = {}
        self._register_automations()

    def _register_automations(self):
        """Register all available company automations"""
        try:
            # Import automation classes
            from ..companies.linkedin.linkedin_automation import LinkedInAutomation
            from ..companies.greenhouse.greenhouse_automation import GreenhouseAutomation

            # Register automations
            self.automations['linkedin'] = LinkedInAutomation
            self.automations['greenhouse'] = GreenhouseAutomation

            # Generic fallback
            self.automations['generic'] = BaseJobAutomation

            print(f"✅ Registered {len(self.automations)} automation types")
        except ImportError as e:
            print(f"⚠️  Warning: Could not import all automation classes: {e}")
            # Fallback to base automation only
            self.automations['generic'] = BaseJobAutomation

    def detect_company_type(self, job_url: str) -> str:
        """
        Detect company/ATS type from job URL

        Args:
            job_url: URL of the job posting

        Returns:
            Company type identifier (e.g., 'linkedin', 'greenhouse', 'generic')
        """
        url_lower = job_url.lower()

        # LinkedIn detection
        if 'linkedin.com' in url_lower:
            return 'linkedin'

        # Greenhouse detection
        if 'greenhouse.io' in url_lower or 'boards.greenhouse.io' in url_lower:
            return 'greenhouse'

        # Lever detection
        if 'lever.co' in url_lower or 'jobs.lever.co' in url_lower:
            return 'lever'

        # Workday detection
        if 'myworkdayjobs.com' in url_lower or 'workday.com' in url_lower:
            return 'workday'

        # Indeed detection
        if 'indeed.com' in url_lower:
            return 'indeed'

        # BambooHR detection
        if 'bamboohr.com' in url_lower:
            return 'bamboohr'

        # Generic fallback
        return 'generic'

    async def execute(
        self,
        job_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        mode: ExecutionMode,
        proxy_config: Optional[ProxyConfig] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute automation for a job application

        Args:
            job_data: Job information (title, company, url, description, etc.)
            user_profile: User information (name, email, resume, etc.)
            mode: Execution mode (SERVER or DESKTOP)
            proxy_config: Proxy configuration (for SERVER mode)
            session_id: Session ID for tracking

        Returns:
            Result dict with:
            {
                'success': bool,
                'application_id': Optional[str],
                'confirmation_number': Optional[str],
                'screenshots': List[str],
                'error': Optional[str],
                'logs': List[str],
                'execution_time_ms': int,
                'company_type': str,
                'mode': str
            }
        """
        import time
        start_time = time.time()

        # Create execution context
        context = ExecutionContext(
            mode=mode,
            user_profile=user_profile,
            proxy_config=proxy_config,
            session_id=session_id
        )

        context.log_info("AutomationEngine starting execution", extra={
            'job_title': job_data.get('title'),
            'company': job_data.get('company'),
            'mode': mode.value
        })

        try:
            # Detect company type
            job_url = job_data.get('apply_url') or job_data.get('url', '')
            company_type = self.detect_company_type(job_url)

            context.log_info(f"Detected company type: {company_type}")

            # Get automation class
            AutomationClass = self.automations.get(company_type)

            if not AutomationClass:
                context.log_warning(f"No automation found for {company_type}, using generic")
                AutomationClass = self.automations.get('generic', BaseJobAutomation)

            # Execute automation
            automation = AutomationClass(context=context)
            result = await automation.apply(job_data, user_profile)

            # Add metadata
            execution_time = int((time.time() - start_time) * 1000)
            result['execution_time_ms'] = execution_time
            result['company_type'] = company_type
            result['mode'] = mode.value

            context.log_info("Automation completed", extra={
                'success': result.get('success', False),
                'execution_time_ms': execution_time
            })

            return result

        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)

            context.log_error(f"Automation failed: {str(e)}", exc_info=True)

            return {
                'success': False,
                'error': str(e),
                'error_type': type(e).__name__,
                'logs': [f"Fatal error: {str(e)}"],
                'screenshots': [],
                'execution_time_ms': execution_time,
                'company_type': company_type if 'company_type' in locals() else 'unknown',
                'mode': mode.value
            }

    def get_supported_companies(self) -> Dict[str, str]:
        """
        Get list of supported companies

        Returns:
            Dict mapping company type to automation class name
        """
        return {
            company_type: automation_class.__name__
            for company_type, automation_class in self.automations.items()
        }

    def is_company_supported(self, job_url: str) -> bool:
        """
        Check if a company/ATS is supported

        Args:
            job_url: Job posting URL

        Returns:
            True if supported (specific automation available)
        """
        company_type = self.detect_company_type(job_url)
        return company_type in self.automations and company_type != 'generic'


# Convenience function for quick execution
async def execute_automation(
    job_data: Dict[str, Any],
    user_profile: Dict[str, Any],
    mode: str = "DESKTOP",
    proxy_config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Quick execution function for automation

    Args:
        job_data: Job information
        user_profile: User information
        mode: "SERVER" or "DESKTOP"
        proxy_config: Proxy configuration dict (optional)

    Returns:
        Automation result
    """
    engine = AutomationEngine()

    # Convert mode string to enum
    exec_mode = ExecutionMode(mode.upper())

    # Convert proxy config if provided
    proxy = None
    if proxy_config:
        proxy = ProxyConfig(**proxy_config)

    return await engine.execute(job_data, user_profile, exec_mode, proxy)


if __name__ == "__main__":
    import asyncio

    # Example usage
    async def main():
        job = {
            "title": "Senior Python Developer",
            "company": "Example Corp",
            "url": "https://boards.greenhouse.io/example/jobs/123456",
            "apply_url": "https://boards.greenhouse.io/example/jobs/123456",
            "description": "We are looking for a Senior Python Developer..."
        }

        user = {
            "name": "John Doe",
            "email": "john@example.com",
            "resume_path": "/path/to/resume.pdf",
            "phone": "555-1234"
        }

        result = await execute_automation(job, user, mode="DESKTOP")
        print("Result:", result)

    asyncio.run(main())
