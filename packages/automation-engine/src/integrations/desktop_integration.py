"""
Desktop Integration Wrapper for Unified Automation Engine
Provides convenient interface for desktop-side automation with local browser
"""

import logging
from typing import Dict, Any, Optional
from pathlib import Path

from ..core.execution_context import ExecutionContext, ExecutionMode
from ..core.automation_engine import AutomationEngine
from ..companies.base.user_profile import UserProfile, JobData
from ..companies.base.result_handler import ApplicationResult


class DesktopAutomationIntegration:
    """
    Desktop-side integration wrapper for unified automation engine

    Usage:
        integration = DesktopAutomationIntegration(browser_profile_path="/path/to/profile")
        result = await integration.execute_automation(user_profile, job_data)
    """

    def __init__(
        self,
        browser_profile_path: Optional[str] = None,
        logger: Optional[logging.Logger] = None
    ):
        """
        Initialize desktop automation integration

        Args:
            browser_profile_path: Path to user's browser profile (optional)
            logger: Logger instance (optional)
        """
        self.engine = AutomationEngine()
        self.browser_profile_path = browser_profile_path
        self.logger = logger or self._setup_logger()

        self.logger.info("DesktopAutomationIntegration initialized")
        if browser_profile_path:
            self.logger.info(f"Using browser profile: {browser_profile_path}")

    def _setup_logger(self) -> logging.Logger:
        """Setup default logger"""
        logger = logging.getLogger("jobswipe.desktop.automation")
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    async def execute_automation(
        self,
        user_profile_data: Dict[str, Any],
        job_data: Dict[str, Any],
        session_id: Optional[str] = None
    ) -> ApplicationResult:
        """
        Execute automation in DESKTOP mode with local browser

        Args:
            user_profile_data: User profile dictionary
            job_data: Job data dictionary
            session_id: Optional session ID for tracking

        Returns:
            ApplicationResult with automation outcome
        """
        try:
            # Convert dictionaries to models
            user_profile = UserProfile.from_dict(user_profile_data)
            job = JobData.from_dict(job_data)

            self.logger.info(f"Executing desktop automation for {job.title} at {job.company}")

            # Add browser profile path to user profile if available
            if self.browser_profile_path:
                user_profile_dict = user_profile.to_dict()
                user_profile_dict['browser_profile_path'] = self.browser_profile_path
            else:
                user_profile_dict = user_profile.to_dict()

            # Execute automation using engine
            result = await self.engine.execute(
                job_data=job.to_dict(),
                user_profile=user_profile_dict,
                mode=ExecutionMode.DESKTOP,
                proxy_config=None,  # Desktop never uses proxy
                session_id=session_id
            )

            self.logger.info(f"Desktop automation completed: {result.get('success', False)}")

            # Convert result dict to ApplicationResult if needed
            if isinstance(result, dict):
                from ..companies.base.result_handler import ApplicationResult
                return ApplicationResult.from_dict(result)

            return result

        except Exception as e:
            self.logger.error(f"Desktop automation failed: {e}", exc_info=True)
            from ..companies.base.result_handler import ResultProcessor
            return ResultProcessor.create_failed_result(
                job_data.get('job_id', 'unknown'),
                'desktop_automation',
                str(e),
                'DESKTOP_ERROR'
            )

    def is_supported(self, job_url: str) -> bool:
        """
        Check if a job URL is supported by any automation

        Args:
            job_url: Job posting URL

        Returns:
            True if supported, False otherwise
        """
        return self.engine.is_company_supported(job_url)

    def get_supported_companies(self) -> Dict[str, str]:
        """
        Get list of supported companies/ATS systems

        Returns:
            Dict mapping company type to automation class name
        """
        return self.engine.get_supported_companies()

    def detect_company_type(self, job_url: str) -> str:
        """
        Detect company/ATS type from job URL

        Args:
            job_url: Job posting URL

        Returns:
            Company type identifier (e.g., 'linkedin', 'greenhouse', 'generic')
        """
        return self.engine.detect_company_type(job_url)

    def set_browser_profile_path(self, path: str):
        """
        Set or update browser profile path

        Args:
            path: Path to browser profile directory
        """
        self.browser_profile_path = path
        self.logger.info(f"Browser profile path updated: {path}")


# Convenience function for quick desktop automation
async def execute_desktop_automation(
    user_profile: Dict[str, Any],
    job_data: Dict[str, Any],
    browser_profile_path: Optional[str] = None
) -> ApplicationResult:
    """
    Quick execution function for desktop-side automation

    Args:
        user_profile: User profile dictionary
        job_data: Job data dictionary
        browser_profile_path: Optional path to browser profile

    Returns:
        ApplicationResult
    """
    integration = DesktopAutomationIntegration(browser_profile_path=browser_profile_path)
    return await integration.execute_automation(user_profile, job_data)


if __name__ == "__main__":
    import asyncio

    # Example usage
    async def main():
        user_profile = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone": "555-1234",
            "resume_local_path": "/path/to/resume.pdf"
        }

        job_data = {
            "job_id": "test123",
            "title": "Software Engineer",
            "company": "Example Corp",
            "apply_url": "https://www.linkedin.com/jobs/view/1234567890"
        }

        # Optional: use user's Chrome profile for pre-filled data
        browser_profile_path = "/home/user/.config/google-chrome/Default"

        result = await execute_desktop_automation(
            user_profile,
            job_data,
            browser_profile_path
        )

        print(f"Result: {result.success}")
        if result.success:
            print(f"Confirmation: {result.confirmation_number}")
        else:
            print(f"Error: {result.error_message}")

    asyncio.run(main())
