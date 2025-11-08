"""
Base Automation Class for JobSwipe Company Automations (UNIFIED VERSION)
Provides common functionality and patterns for all company-specific automation scripts
Works in both SERVER and DESKTOP modes using ExecutionContext
"""

import asyncio
import logging
import os
import sys
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any, Union

# Import browser-use - use only what's available in the pip package
from browser_use import Agent
from browser_use.controller.service import Controller

# Import LLMs from langchain (required by browser-use)
try:
    from langchain_anthropic import ChatAnthropic
    from langchain_google_genai import ChatGoogleGenerativeAI as ChatGoogle
    from langchain_openai import ChatOpenAI
except ImportError:
    ChatAnthropic = None
    ChatGoogle = None
    ChatOpenAI = None

# Placeholder type for browser session - will be handled by Agent
class BrowserSession:
    """Placeholder - actual browser is managed by Agent"""
    pass

# Import from unified core
from ...core.execution_context import ExecutionContext, ExecutionMode, ProxyConfig

from .user_profile import UserProfile, JobData, AutomationConfig
from .result_handler import (
    ApplicationResult, ApplicationStatus, CaptchaType,
    ResultProcessor, AutomationStep
)


class BaseJobAutomation(ABC):
    """
    Base class for all company-specific job application automations
    Provides common functionality for browser automation, form filling, and result handling

    UNIFIED VERSION: Works in both SERVER (with proxy) and DESKTOP (local browser) modes
    via ExecutionContext abstraction
    """

    def __init__(self, company_name: str, context: ExecutionContext):
        """
        Initialize base automation with execution context

        Args:
            company_name: Name of the company/ATS (e.g., 'greenhouse', 'linkedin')
            context: ExecutionContext containing mode (SERVER/DESKTOP), proxy config, etc.
        """
        self.company_name = company_name
        self.context = context
        self.logger = context.logger or self._setup_logging()
        self.controller = Controller()
        self.result: Optional[ApplicationResult] = None

        # Setup browser automation actions
        self._setup_common_actions()

        self.logger.info(f"Initialized {company_name} automation in {context.mode.value} mode")

    def _setup_logging(self) -> logging.Logger:
        """Setup logging for the automation (fallback if context doesn't have logger)"""
        logger = logging.getLogger(f"jobswipe.{self.company_name}")
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def _setup_common_actions(self):
        """Setup common browser automation actions"""

        @self.controller.action("Upload resume file to form")
        async def upload_resume(file_path: str):
            """Upload resume file to any file input element"""
            # Note: browser_session is auto-injected by browser-use, not needed as parameter
            return ActionResult(
                extracted_content=f"Resume upload requested for: {file_path}"
            )

        @self.controller.action("Detect and handle captcha")
        async def detect_captcha():
            """Detect various types of captchas on the page"""
            # Note: browser_session is auto-injected by browser-use
            return ActionResult(extracted_content="Captcha detection not yet implemented")

        @self.controller.action("Extract confirmation details")
        async def extract_confirmation():
            """Extract application confirmation details from the page"""
            # Note: browser_session is auto-injected by browser-use
            return ActionResult(extracted_content="Confirmation extraction not yet implemented")

    async def _take_screenshot(self, browser_session: BrowserSession,
                              name: str = "screenshot") -> str:
        """Take a screenshot and return the file path"""
        try:
            page = await browser_session.get_current_page()
            timestamp = int(time.time())
            filename = f"{name}_{timestamp}.png"

            # Create screenshots directory if it doesn't exist
            screenshots_dir = Path("screenshots")
            screenshots_dir.mkdir(exist_ok=True)

            screenshot_path = screenshots_dir / filename
            await page.screenshot(path=str(screenshot_path), full_page=True)

            return str(screenshot_path)
        except Exception as e:
            self.logger.error(f"Screenshot failed: {e}")
            return ""

    def _create_llm(self):
        """Create and return an LLM instance based on available API keys"""
        if os.getenv('ANTHROPIC_API_KEY') and ChatAnthropic:
            return ChatAnthropic(
                api_key=os.getenv('ANTHROPIC_API_KEY'),
                model="claude-3-5-sonnet-20241022",
                temperature=0.1
            )
        elif os.getenv('OPENAI_API_KEY') and ChatOpenAI:
            return ChatOpenAI(
                api_key=os.getenv('OPENAI_API_KEY'),
                model="gpt-4-turbo-preview",
                temperature=0.1
            )
        elif os.getenv('GOOGLE_API_KEY') and ChatGoogle:
            return ChatGoogle(
                api_key=os.getenv('GOOGLE_API_KEY'),
                model="gemini-2.5-pro",
                temperature=0.1
            )
        else:
            raise RuntimeError("No valid LLM API key found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY")

    def _create_browser_session(self) -> BrowserSession:
        """
        Create and return a browser session using ExecutionContext

        UNIFIED VERSION: ExecutionContext handles SERVER vs DESKTOP differences
        - SERVER mode: headless=True, with proxy rotation
        - DESKTOP mode: headless=False, with user's browser profile, no proxy
        """
        # Get browser options from context (automatically configured for mode)
        browser_options = self.context.get_browser_launch_options()

        self.logger.info(f"Creating browser session for {self.context.mode.value} mode")
        self.logger.info(f"Headless: {browser_options.get('headless', True)}")

        # Log proxy info if present (server mode)
        if 'proxy' in browser_options and browser_options['proxy']:
            self.logger.info(f"✅ Using proxy: {browser_options['proxy'].get('server', 'unknown')}")

        # Log browser profile if present (desktop mode)
        if 'user_data_dir' in browser_options and browser_options['user_data_dir']:
            self.logger.info(f"✅ Using browser profile: {browser_options['user_data_dir']}")

        # Note: Browser session is now managed by Agent, not created directly
        # Return a placeholder that won't be used
        self.logger.info("Browser will be managed by Agent instance")
        return BrowserSession()

    @abstractmethod
    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        """
        Generate company-specific task description for the AI agent
        Must be implemented by each company automation class
        """
        pass

    @abstractmethod
    def get_url_patterns(self) -> List[str]:
        """
        Return list of URL patterns that this automation can handle
        Must be implemented by each company automation class
        """
        pass

    def can_handle_url(self, url: str) -> bool:
        """Check if this automation can handle the given URL"""
        url_lower = url.lower()
        return any(pattern in url_lower for pattern in self.get_url_patterns())

    async def apply_to_job(self, user_profile: UserProfile, job_data: JobData) -> ApplicationResult:
        """
        Main method to apply to a job using AI-powered browser automation

        UNIFIED VERSION: Works in both SERVER and DESKTOP modes via ExecutionContext

        Args:
            user_profile: User's profile information
            job_data: Job details including application URL

        Returns:
            ApplicationResult with success/failure status and details
        """
        # Initialize result object
        self.result = ApplicationResult(
            job_id=job_data.job_id,
            user_id=getattr(user_profile, 'user_id', None),
            status=ApplicationStatus.FAILED,
            success=False,
            started_at=datetime.now(timezone.utc),
            company_automation=self.company_name,
            total_steps=5  # Approximate number of steps
        )

        try:
            self.logger.info(f"Starting job application for {job_data.title} at {job_data.company}")
            self.logger.info(f"Execution mode: {self.context.mode.value}")

            # Validate inputs
            if not self.can_handle_url(job_data.apply_url):
                raise ValueError(f"URL {job_data.apply_url} not supported by {self.company_name} automation")

            # Create LLM and browser session
            llm = self._create_llm()
            browser_session = self._create_browser_session()

            try:
                await browser_session.start()

                # Generate company-specific task
                task_description = self.get_company_specific_task(user_profile, job_data)

                # Create and run AI agent
                agent = Agent(
                    task=task_description,
                    llm=llm,
                    controller=self.controller,
                    browser_session=browser_session
                )

                self.result.add_step(
                    "initialize", "Initialize browser and AI agent", True, 2000
                )

                # Execute the automation
                self.logger.info("Executing AI-powered job application...")
                agent_result = await agent.run()

                self.result.add_step(
                    "execute", "Execute AI automation", True,
                    metadata={"agent_result": str(agent_result)}
                )

                # Process the results
                await self._process_automation_result(agent, browser_session)

                # Take final screenshot
                final_screenshot = await self._take_screenshot(browser_session, "final_result")
                if final_screenshot:
                    self.result.screenshots.append(final_screenshot)

            finally:
                await browser_session.stop()

            # Finalize result
            if self.result.status == ApplicationStatus.FAILED:
                # Check if we got any success indicators during the process
                success_indicators = [
                    step for step in self.result.steps
                    if step.success and ('success' in step.metadata.get('agent_result', '').lower())
                ]

                if success_indicators:
                    self.result.set_completed(ApplicationStatus.SUCCESS)
                else:
                    self.result.set_failed("Application process completed but success unclear")

            self.logger.info(f"Job application completed: {self.result.status}")
            return self.result

        except Exception as e:
            error_message = f"Automation failed: {str(e)}"
            self.logger.error(error_message, exc_info=True)

            if self.result:
                self.result.set_failed(error_message, "AUTOMATION_ERROR")
                return self.result
            else:
                return ResultProcessor.create_failed_result(
                    job_data.job_id,
                    self.company_name,
                    error_message,
                    "AUTOMATION_ERROR"
                )

    async def _process_automation_result(self, agent: Agent, browser_session: BrowserSession):
        """Process the automation result and update the result object"""
        try:
            # Extract information from agent memory/context
            if hasattr(agent, 'memory') and agent.memory:
                memory_content = str(agent.memory)

                if 'SUCCESS:' in memory_content:
                    # Extract confirmation ID
                    success_parts = memory_content.split('SUCCESS:')
                    if len(success_parts) > 1:
                        confirmation_id = success_parts[1].split()[0] if success_parts[1].split() else None
                        self.result.set_completed(ApplicationStatus.SUCCESS, confirmation_id)

                        self.result.add_step(
                            "confirm", "Extract confirmation details", True,
                            metadata={"confirmation_id": confirmation_id}
                        )
                        return

                elif 'CAPTCHA_DETECTED:' in memory_content:
                    self.result.set_failed(
                        "Captcha detected - manual intervention required",
                        "CAPTCHA_REQUIRED",
                        ApplicationStatus.CAPTCHA_REQUIRED
                    )
                    return

                elif 'ERROR:' in memory_content:
                    error_parts = memory_content.split('ERROR:')
                    error_msg = error_parts[1].split('\n')[0] if len(error_parts) > 1 else "Unknown error"
                    self.result.set_failed(error_msg, "FORM_ERROR", ApplicationStatus.FORM_ERROR)
                    return

            # Default: Check current page for success indicators
            page = await browser_session.get_current_page()
            page_text = await page.inner_text('body')

            if any(indicator in page_text.lower() for indicator in [
                'thank you', 'application submitted', 'successfully applied', 'confirmation'
            ]):
                confirmation_id = ResultProcessor.extract_confirmation_number(page_text)
                self.result.set_completed(ApplicationStatus.SUCCESS, confirmation_id)

                self.result.add_step(
                    "confirm", "Detected success on final page", True,
                    metadata={"page_indicators": True}
                )
            else:
                self.result.set_failed("No clear success indicators found", "UNCLEAR_RESULT")

        except Exception as e:
            self.logger.error(f"Failed to process automation result: {e}")
            self.result.set_failed(f"Result processing failed: {str(e)}", "PROCESSING_ERROR")


# Example implementation for testing
class TestAutomation(BaseJobAutomation):
    """Test implementation of the base automation class"""

    def __init__(self, context: ExecutionContext):
        super().__init__("test", context)

    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        return f"""
        Navigate to: {job_data.apply_url}

        This is a test automation. Fill out any application form with:
        - Name: {user_profile.get_full_name()}
        - Email: {user_profile.email}
        - Phone: {user_profile.phone}

        If there's a file upload, upload the resume from: {user_profile.get_resume_path()}
        Submit the application and look for confirmation.
        """

    def get_url_patterns(self) -> List[str]:
        return ["example.com", "test.com"]


if __name__ == "__main__":
    # Test the unified base automation class
    from ...core.execution_context import ExecutionContext, ExecutionMode

    # Test user profile
    test_user = UserProfile(
        first_name="John",
        last_name="Doe",
        email="john.doe@example.com",
        phone="123-456-7890"
    )

    test_job = JobData(
        job_id="test123",
        title="Test Job",
        company="Test Company",
        apply_url="https://example.com/apply"
    )

    # Test in DESKTOP mode
    desktop_context = ExecutionContext(
        mode=ExecutionMode.DESKTOP,
        user_profile={"name": "John Doe"}
    )

    automation = TestAutomation(context=desktop_context)

    print("✅ Unified base automation class created")
    print(f"Execution mode: {automation.context.mode.value}")
    print(f"Can handle URL: {automation.can_handle_url(test_job.apply_url)}")
    print(f"Task: {automation.get_company_specific_task(test_user, test_job)}")
