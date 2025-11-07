"""
Server Integration Wrapper for Unified Automation Engine
Provides convenient interface for server-side automation with proxy rotation
"""

import logging
from typing import Dict, Any, Optional
from pathlib import Path

from ..core.execution_context import ExecutionContext, ExecutionMode, ProxyConfig
from ..core.automation_engine import AutomationEngine
from ..core.proxy_manager import ProxyManager
from ..companies.base.user_profile import UserProfile, JobData
from ..companies.base.result_handler import ApplicationResult


class ServerAutomationIntegration:
    """
    Server-side integration wrapper for unified automation engine

    Usage:
        integration = ServerAutomationIntegration(proxy_manager=proxy_manager)
        result = await integration.execute_automation(user_profile, job_data)
    """

    def __init__(
        self,
        proxy_manager: Optional[ProxyManager] = None,
        logger: Optional[logging.Logger] = None
    ):
        """
        Initialize server automation integration

        Args:
            proxy_manager: ProxyManager instance for proxy rotation (optional)
            logger: Logger instance (optional)
        """
        self.engine = AutomationEngine()
        self.proxy_manager = proxy_manager
        self.logger = logger or self._setup_logger()

        self.logger.info("ServerAutomationIntegration initialized")
        if proxy_manager:
            self.logger.info(f"Proxy rotation enabled with {len(proxy_manager.proxies)} proxies")

    def _setup_logger(self) -> logging.Logger:
        """Setup default logger"""
        logger = logging.getLogger("jobswipe.server.automation")
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
        Execute automation in SERVER mode with proxy rotation

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

            self.logger.info(f"Executing server automation for {job.title} at {job.company}")

            # Get proxy from proxy manager (if available)
            proxy_config = None
            if self.proxy_manager:
                proxy_config = self.proxy_manager.get_next_proxy()
                if proxy_config:
                    self.logger.info(f"Using proxy: {proxy_config.host}:{proxy_config.port}")
                else:
                    self.logger.warning("No proxies available - running without proxy")

            # Execute automation using engine
            result = await self.engine.execute(
                job_data=job.to_dict(),
                user_profile=user_profile.to_dict(),
                mode=ExecutionMode.SERVER,
                proxy_config=proxy_config,
                session_id=session_id
            )

            self.logger.info(f"Server automation completed: {result.get('success', False)}")

            # Convert result dict to ApplicationResult if needed
            if isinstance(result, dict):
                from ..companies.base.result_handler import ApplicationResult
                return ApplicationResult.from_dict(result)

            return result

        except Exception as e:
            self.logger.error(f"Server automation failed: {e}", exc_info=True)
            from ..companies.base.result_handler import ResultProcessor
            return ResultProcessor.create_failed_result(
                job_data.get('job_id', 'unknown'),
                'server_automation',
                str(e),
                'SERVER_ERROR'
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


# Convenience function for quick server automation
async def execute_server_automation(
    user_profile: Dict[str, Any],
    job_data: Dict[str, Any],
    proxy_config: Optional[Dict[str, Any]] = None
) -> ApplicationResult:
    """
    Quick execution function for server-side automation

    Args:
        user_profile: User profile dictionary
        job_data: Job data dictionary
        proxy_config: Optional proxy configuration dict

    Returns:
        ApplicationResult
    """
    # Convert proxy config if provided
    proxy = None
    if proxy_config:
        proxy = ProxyConfig(**proxy_config)

    # Create proxy manager with single proxy if provided
    proxy_manager = None
    if proxy:
        from ..core.proxy_manager import ProxyServer
        proxy_server = ProxyServer(
            host=proxy.host,
            port=proxy.port,
            username=proxy.username,
            password=proxy.password,
            type=proxy.type
        )
        proxy_manager = ProxyManager()
        proxy_manager.add_proxy(proxy_server)

    # Execute automation
    integration = ServerAutomationIntegration(proxy_manager=proxy_manager)
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
            "resume_url": "https://example.com/resume.pdf"
        }

        job_data = {
            "job_id": "test123",
            "title": "Software Engineer",
            "company": "Example Corp",
            "apply_url": "https://boards.greenhouse.io/example/jobs/123"
        }

        proxy_config = {
            "enabled": True,
            "host": "proxy.example.com",
            "port": 8080,
            "username": "user",
            "password": "pass",
            "type": "http"
        }

        result = await execute_server_automation(user_profile, job_data, proxy_config)
        print(f"Result: {result.success}")

    asyncio.run(main())
