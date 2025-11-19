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

# TEMPORARY: Hardcoded API key for testing


# Import browser-use - use only what's available in the pip package
from browser_use import Agent
from browser_use.tools.service import Controller
from browser_use.browser.session import BrowserSession
from browser_use.agent.views import ActionResult
from pydantic import BaseModel, Field


# Import browser-use native LLMs (preferred over langchain)
try:
    from browser_use.llm import ChatAnthropic, ChatGoogle, ChatOpenAI
except ImportError:
    # Fallback to langchain if browser-use doesn't have native wrappers
    try:
        from langchain_anthropic import ChatAnthropic
        from browser_use.llm.google.chat import ChatGoogle
        from langchain_openai import ChatOpenAI
    except ImportError:
        ChatAnthropic = None
        ChatGoogle = None
        ChatOpenAI = None

# Note: BrowserSession is imported from browser_use.browser.session above

# Import from unified core
from ...core.execution_context import ExecutionContext, ExecutionMode, ProxyConfig

from .user_profile import UserProfile, JobData, AutomationConfig
from .result_handler import (
    ApplicationResult, ApplicationStatus, CaptchaType,
    ResultProcessor, AutomationStep
)
from .job_application_tools import JobApplicationTools


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

        # Setup browser automation actions using JobApplicationTools
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
        """
        Setup common browser automation actions using JobApplicationTools

        JobApplicationTools provides functional implementations of:
        - upload_resume: Actually uploads file to browser input element
        - detect_captcha: Inspects DOM for captcha presence
        - extract_confirmation: Extracts confirmation details from page

        All actions use proper browser-use patterns with browser_session injection
        """
        # Initialize JobApplicationTools (automatically registers actions with controller)
        self.tools = JobApplicationTools(self.controller, self.logger)

        self.logger.info(f"Registered {len(self.controller.registry.actions)} custom actions")
        self.logger.debug(f"Available actions: {list(self.controller.registry.actions.keys())}")

    def _setup_event_monitoring(self, agent: Agent):
        """
        Setup event bus monitoring for production debugging

        Subscribes to browser-use agent events to track:
        - Agent steps and actions
        - Browser navigation
        - Task progress
        - Errors and failures

        Events are logged and recorded in ApplicationResult for debugging
        """
        if not hasattr(agent, 'eventbus'):
            self.logger.warning("Agent does not have eventbus - skipping event monitoring")
            return

        try:
            # Subscribe to all events (will filter in handler)
            def event_handler(event):
                """Handle agent events for logging and debugging"""
                event_type = type(event).__name__

                # Log navigation events at INFO level
                if 'Navigation' in event_type or 'PageLoad' in event_type:
                    self.logger.info(f"🌐 {event_type}: {getattr(event, 'url', 'N/A')}")

                # Log action events at DEBUG level
                elif 'Action' in event_type:
                    action_name = getattr(event, 'action', getattr(event, 'name', 'unknown'))
                    self.logger.debug(f"⚡ {event_type}: {action_name}")

                # Log step events at INFO level
                elif 'Step' in event_type:
                    step_info = getattr(event, 'description', getattr(event, 'step', 'N/A'))
                    self.logger.info(f"📍 {event_type}: {step_info}")

                # Log error events at ERROR level
                elif 'Error' in event_type or 'Failure' in event_type:
                    error_msg = getattr(event, 'message', getattr(event, 'error', 'N/A'))
                    self.logger.error(f"❌ {event_type}: {error_msg}")

                # Record significant events in result
                if self.result and event_type in ['CreateAgentStepEvent', 'UpdateAgentTaskEvent']:
                    self.result.events.append({
                        'type': event_type,
                        'timestamp': datetime.now(timezone.utc).isoformat(),
                        'data': str(event)[:500]  # Limit size
                    })

            # Subscribe to all events with wildcard
            agent.eventbus.on('*', event_handler)

            self.logger.info("✅ Event monitoring enabled for agent")

        except Exception as e:
            self.logger.warning(f"Failed to setup event monitoring: {e}")
            # Don't fail the automation if event monitoring setup fails

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
        # Debug: Check which API keys are available
        self.logger.debug(f"API Keys check - ANTHROPIC: {bool(os.getenv('ANTHROPIC_API_KEY'))}, OPENAI: {bool(os.getenv('OPENAI_API_KEY'))}, GOOGLE: {bool(os.getenv('GOOGLE_API_KEY'))}")

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
                model="gemini-2.0-flash-exp",
                temperature=0.1
            )
        else:
            raise RuntimeError("No valid LLM API key found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY")

    def _create_browser_session(self) -> BrowserSession:
        """
        Create and return a browser session using ExecutionContext

        UNIFIED VERSION: ExecutionContext handles SERVER vs DESKTOP differences
        - SERVER mode: headless=True, stealth enabled, with proxy rotation
        - DESKTOP mode: headless=False, keep_alive=True, with user's browser profile, no proxy

        Uses browser-use v0.6.0+ BrowserProfile pattern: all parameters passed to constructor
        to ensure proper Pydantic validation.
        """
        from browser_use.browser import BrowserProfile

        # Get browser-use BrowserProfile configuration from context
        # This returns all parameters ready for BrowserProfile constructor
        profile_config = self.context.get_browser_profile_config()

        self.logger.info(f"Creating browser session for {self.context.mode.value} mode")
        self.logger.debug(f"Browser profile config: {profile_config}")

        # Create BrowserProfile with ALL parameters at once (browser-use v0.6.0+ pattern)
        # This ensures proper Pydantic validation and avoids post-creation modification
        browser_profile = BrowserProfile(**profile_config)

        # Create BrowserSession with the configured profile
        browser_session = BrowserSession(browser_profile=browser_profile)

        # Log configuration summary
        self.logger.info(f"Browser session created:")
        self.logger.info(f"  - Headless: {browser_profile.headless}")
        self.logger.info(f"  - Stealth: {browser_profile.stealth}")
        if browser_profile.user_data_dir:
            self.logger.info(f"  - User data dir: {browser_profile.user_data_dir}")
        if browser_profile.proxy:
            self.logger.info(f"  - Proxy: {browser_profile.proxy.get('server', 'configured')}")

        return browser_session

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

    async def apply(self, job_data, user_profile) -> dict:
        """
        Apply to job - called by automation engine
        This is a wrapper that calls apply_to_job with correct parameter order

        Args:
            job_data: Either JobData object or dict
            user_profile: Either UserProfile object or dict
        """
        # Convert dicts to objects if needed
        if isinstance(job_data, dict):
            job_data = JobData(**job_data)
        if isinstance(user_profile, dict):
            user_profile = UserProfile(**user_profile)

        result = await self.apply_to_job(user_profile, job_data)
        # Convert ApplicationResult to dict for engine
        return result.to_dict() if hasattr(result, 'to_dict') else result.__dict__

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

                # Create logs directory structure for conversation and debugging
                log_dir = Path(f"./logs/automation/{job_data.job_id}")
                log_dir.mkdir(parents=True, exist_ok=True)

                # Get resume path for available_file_paths
                resume_path = user_profile.get_resume_path() if hasattr(user_profile, 'get_resume_path') else None
                available_files = [resume_path] if resume_path else []

                # Create and run AI agent with advanced browser-use features
                agent = Agent(
                    task=task_description,
                    llm=llm,
                    controller=self.controller,
                    browser_session=browser_session,

                    # Vision capabilities for analyzing job postings and forms
                    use_vision=True,

                    # Memory system for debugging (enabled per user preference)
                    save_conversation_path=str(log_dir / "conversation.json"),

                    # File access for resume upload
                    available_file_paths=available_files,

                    # Error handling configuration
                    max_failures=5,  # Job applications can be complex with multiple retries

                    # Performance tuning
                    max_actions_per_step=10,  # Allow multiple actions per step
                    use_thinking=True,  # Enable chain-of-thought reasoning
                )

                self.logger.info(f"Agent configured with vision={agent.use_vision}, memory={bool(agent.save_conversation_path)}")
                self.logger.debug(f"Available files for agent: {available_files}")

                # Setup event monitoring for production debugging
                self._setup_event_monitoring(agent)

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
