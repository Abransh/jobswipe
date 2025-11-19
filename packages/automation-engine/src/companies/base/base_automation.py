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
from browser_use.browser.events import UploadFileEvent
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

        # Define parameter model for upload_resume
        class UploadResumeParams(BaseModel):
            index: int = Field(..., description="Index of the file input element to upload to")
            file_path: str = Field(..., description="Path to the resume file to upload")

        @self.controller.action("Upload resume file to file input element", param_model=UploadResumeParams)
        async def upload_resume(params: UploadResumeParams, browser_session: BrowserSession):
            """
            Upload resume file to a file input element using browser-use UploadFileEvent

            Args:
                params: Contains index and file_path
                browser_session: Auto-injected by browser-use
            """
            try:
                self.logger.info(f"📎 Uploading resume from: {params.file_path} to element at index {params.index}")

                # Verify file exists
                if not Path(params.file_path).exists():
                    error_msg = f"Resume file not found at: {params.file_path}"
                    self.logger.error(error_msg)
                    return ActionResult(error=error_msg)

                # Get the DOM element by index
                dom_element = await browser_session.get_dom_element_by_index(params.index)

                if dom_element is None:
                    error_msg = f"No element found at index {params.index}"
                    self.logger.error(error_msg)
                    return ActionResult(error=error_msg)

                # Verify it's a file input element
                if dom_element.tag_name.lower() != 'input' or dom_element.attributes.get('type') != 'file':
                    error_msg = f"Element at index {params.index} is not a file input (tag: {dom_element.tag_name}, type: {dom_element.attributes.get('type')})"
                    self.logger.error(error_msg)
                    return ActionResult(error=error_msg)

                # Dispatch the upload file event using browser-use's event system
                event = browser_session.event_bus.dispatch(
                    UploadFileEvent(node=dom_element, file_path=params.file_path)
                )
                await event

                success_msg = f"✅ Successfully uploaded resume to element {params.index}"
                self.logger.info(success_msg)
                return ActionResult(extracted_content=success_msg, include_in_memory=True)

            except Exception as e:
                error_msg = f"Failed to upload resume: {str(e)}"
                self.logger.error(error_msg, exc_info=True)
                return ActionResult(error=error_msg)

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

    def _get_llm(self):
        """
        Get LLM from ExecutionContext (already initialized)

        Returns the LLM instance that was initialized in ExecutionContext.__post_init__()
        This ensures we use the same LLM configuration across the automation system
        """
        if self.context.llm is None:
            raise RuntimeError("LLM not initialized in ExecutionContext! This should never happen.")

        self.logger.info(f"✅ Using LLM from ExecutionContext: {type(self.context.llm).__name__}")
        return self.context.llm

    def _create_browser_session(self) -> BrowserSession:
        """
        Create and return a browser session using BrowserProfile from ExecutionContext

        UNIFIED VERSION: ExecutionContext already configured BrowserProfile for:
        - SERVER mode: headless=True, with proxy
        - DESKTOP mode: headless=False, with user's browser profile, no proxy
        """
        if self.context.browser_profile is None:
            raise RuntimeError("BrowserProfile not initialized in ExecutionContext! This should never happen.")

        self.logger.info(f"Creating browser session for {self.context.mode.value} mode")
        self.logger.info(f"Using BrowserProfile: headless={self.context.browser_profile.headless}, proxy={self.context.browser_profile.proxy is not None}")

        # Create BrowserSession with the pre-configured profile from ExecutionContext
        browser_session = BrowserSession(browser_profile=self.context.browser_profile)

        self.logger.info(f"✅ Browser session created successfully")
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
            self.logger.info(f"🚀 Starting job application for {job_data.title} at {job_data.company}")
            self.logger.info(f"📍 Execution mode: {self.context.mode.value}")
            self.logger.info(f"🔗 Apply URL: {job_data.apply_url}")

            # Validate inputs
            if not self.can_handle_url(job_data.apply_url):
                raise ValueError(f"URL {job_data.apply_url} not supported by {self.company_name} automation")

            # Get LLM from ExecutionContext (already initialized)
            self.logger.info("🤖 Getting LLM from ExecutionContext...")
            llm = self._get_llm()
            self.logger.info(f"✅ LLM ready: {llm.__class__.__name__}")

            self.logger.info("🌐 Creating browser session...")
            browser_session = self._create_browser_session()
            self.logger.info("✅ Browser session created")

            try:
                self.logger.info("🔄 Starting browser...")
                await browser_session.start()
                self.logger.info("✅ Browser started successfully")

                # Generate company-specific task
                self.logger.info("📝 Generating task description...")
                task_description = self.get_company_specific_task(user_profile, job_data)
                self.logger.info(f"✅ Task generated ({len(task_description)} characters)")
                self.logger.debug(f"Task: {task_description[:200]}...")  # Log first 200 chars

                # Create and run AI agent
                self.logger.info("🤖 Creating AI agent...")
                agent = Agent(
                    task=task_description,
                    llm=llm,
                    controller=self.controller,
                    browser_session=browser_session,
                    max_actions_per_step=10,  # Increased from default 4 to allow more actions per step
                    max_failures=5,  # Allow more failures before giving up
                )
                self.logger.info("✅ Agent created, preparing to execute...")

                self.result.add_step(
                    "initialize", "Initialize browser and AI agent", True, 2000
                )

                # Define step monitoring callbacks
                step_count = [0]  # Use list to allow modification in nested function

                async def on_step_start(agent_instance: Agent):
                    step_count[0] += 1
                    self.logger.info(f"🔄 Step {step_count[0]} STARTED - Current n_steps: {agent_instance.state.n_steps}")

                async def on_step_end(agent_instance: Agent):
                    self.logger.info(f"✅ Step {step_count[0]} COMPLETED")
                    # Log current state after step
                    if hasattr(agent_instance, 'state') and agent_instance.state:
                        self.logger.info(f"   📊 Consecutive failures: {agent_instance.state.consecutive_failures}")
                        self.logger.info(f"   📊 Agent stopped flag: {agent_instance.state.stopped}")

                    # Log recent history item
                    if hasattr(agent_instance, 'history') and agent_instance.history and agent_instance.history.history:
                        recent = agent_instance.history.history[-1]
                        if hasattr(recent, 'model_output') and recent.model_output:
                            output = recent.model_output
                            if hasattr(output, 'current_state') and output.current_state:
                                state = output.current_state
                                if hasattr(state, 'next_goal'):
                                    self.logger.info(f"   🎯 Next goal: {state.next_goal}")
                                if hasattr(state, 'evaluation_previous_goal'):
                                    self.logger.info(f"   📝 Evaluation: {state.evaluation_previous_goal}")

                # Execute the automation with step monitoring
                self.logger.info("▶️  EXECUTING AI-POWERED JOB APPLICATION...")
                self.logger.info("=" * 60)
                self.logger.info("🎯 Max steps: 50 (job applications typically take 10-30 steps)")

                agent_result = await agent.run(
                    max_steps=50,  # Explicitly set max steps for job applications
                    on_step_start=on_step_start,
                    on_step_end=on_step_end
                )

                self.logger.info("=" * 60)
                self.logger.info(f"✅ Agent execution completed!")
                self.logger.info(f"📊 Total steps executed: {step_count[0]}")
                self.logger.info(f"📊 Agent state n_steps: {agent.state.n_steps}")

                # Log detailed history
                if hasattr(agent_result, 'history') and agent_result.history:
                    self.logger.info(f"📚 History items: {len(agent_result.history)}")
                    for idx, item in enumerate(agent_result.history[-5:], 1):  # Log last 5 items
                        self.logger.info(f"   History item {idx}: {str(item)[:200]}")

                # Log final result if available
                if hasattr(agent_result, 'final_result'):
                    final = agent_result.final_result()
                    self.logger.info(f"📄 Final result: {final}")

                self.result.add_step(
                    "execute", "Execute AI automation", True,
                    metadata={
                        "agent_steps": step_count[0],
                        "agent_n_steps": agent.state.n_steps,
                        "history_items": len(agent_result.history) if hasattr(agent_result, 'history') else 0
                    }
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
            self.logger.info("📊 Processing automation result...")

            # Analyze Agent history for detailed execution information
            if hasattr(agent, 'history') and agent.history:
                history = agent.history
                self.logger.info(f"📚 Analyzing {len(history.history)} history items...")

                # Check if agent completed successfully
                if hasattr(history, 'is_done') and callable(history.is_done):
                    is_done = history.is_done()
                    self.logger.info(f"   ✓ Agent is_done: {is_done}")

                # Get final result text
                if hasattr(history, 'final_result') and callable(history.final_result):
                    final_result = history.final_result()
                    self.logger.info(f"   ✓ Final result: {final_result}")

                    # Check for success indicators in final result
                    if final_result and isinstance(final_result, str):
                        success_keywords = ['success', 'submitted', 'complete', 'thank you', 'confirmation']
                        if any(keyword in final_result.lower() for keyword in success_keywords):
                            # Try to extract confirmation number
                            confirmation_id = ResultProcessor.extract_confirmation_number(final_result)
                            self.result.set_completed(ApplicationStatus.SUCCESS, confirmation_id)
                            self.logger.info(f"   ✅ SUCCESS detected in final result! Confirmation: {confirmation_id}")
                            self.result.add_step(
                                "confirm", "Application completed successfully", True,
                                metadata={"final_result": final_result, "confirmation_id": confirmation_id}
                            )
                            return

                # Check the last few history items for action results
                for idx, history_item in enumerate(reversed(history.history[-5:]), 1):
                    self.logger.info(f"   📝 Analyzing history item {idx}...")

                    # Check model output
                    if hasattr(history_item, 'model_output') and history_item.model_output:
                        output = history_item.model_output
                        if hasattr(output, 'current_state') and output.current_state:
                            state = output.current_state

                            # Log evaluation
                            if hasattr(state, 'evaluation_previous_goal') and state.evaluation_previous_goal:
                                eval_text = state.evaluation_previous_goal
                                self.logger.info(f"      Evaluation: {eval_text}")

                                # Check for success in evaluation
                                if 'success' in eval_text.lower() or 'completed' in eval_text.lower():
                                    self.logger.info(f"      ✅ Success indicator found in evaluation!")

                            # Log memory
                            if hasattr(state, 'memory') and state.memory:
                                self.logger.info(f"      Memory: {state.memory[:200]}...")

                    # Check result actions
                    if hasattr(history_item, 'result') and history_item.result:
                        for action_result in history_item.result:
                            if hasattr(action_result, 'extracted_content') and action_result.extracted_content:
                                content = action_result.extracted_content
                                self.logger.info(f"      Extracted content: {content[:200]}...")

                            if hasattr(action_result, 'error') and action_result.error:
                                self.logger.warning(f"      ⚠️  Action error: {action_result.error}")

            # Extract information from agent memory/context
            if hasattr(agent, 'memory') and agent.memory:
                memory_content = str(agent.memory)
                self.logger.info(f"💭 Agent memory: {memory_content[:300]}...")

                if 'SUCCESS:' in memory_content or 'CONFIRMATION:' in memory_content:
                    # Extract confirmation ID
                    success_parts = memory_content.split('SUCCESS:') if 'SUCCESS:' in memory_content else memory_content.split('CONFIRMATION:')
                    if len(success_parts) > 1:
                        confirmation_id = success_parts[1].split()[0] if success_parts[1].split() else None
                        self.result.set_completed(ApplicationStatus.SUCCESS, confirmation_id)
                        self.logger.info(f"✅ SUCCESS found in memory! Confirmation: {confirmation_id}")

                        self.result.add_step(
                            "confirm", "Extract confirmation details from memory", True,
                            metadata={"confirmation_id": confirmation_id}
                        )
                        return

                elif 'CAPTCHA' in memory_content.upper():
                    self.result.set_failed(
                        "Captcha detected - manual intervention required",
                        "CAPTCHA_REQUIRED",
                        ApplicationStatus.CAPTCHA_REQUIRED
                    )
                    self.logger.warning("⚠️  CAPTCHA detected in memory")
                    return

                elif 'ERROR:' in memory_content or 'FAILED:' in memory_content:
                    error_parts = memory_content.split('ERROR:') if 'ERROR:' in memory_content else memory_content.split('FAILED:')
                    error_msg = error_parts[1].split('\n')[0] if len(error_parts) > 1 else "Unknown error"
                    self.result.set_failed(error_msg, "FORM_ERROR", ApplicationStatus.FORM_ERROR)
                    self.logger.error(f"❌ ERROR found in memory: {error_msg}")
                    return

            # Default: Check current page for success indicators
            self.logger.info("🔍 Checking current page for success indicators...")
            page = await browser_session.get_current_page()
            page_text = await page.inner_text('body')
            page_url = page.url
            self.logger.info(f"   Current URL: {page_url}")
            self.logger.info(f"   Page text length: {len(page_text)} characters")

            success_indicators = [
                'thank you', 'application submitted', 'successfully applied',
                'confirmation', 'received your application', 'application complete'
            ]

            found_indicators = [ind for ind in success_indicators if ind in page_text.lower()]
            self.logger.info(f"   Found indicators: {found_indicators}")

            if found_indicators:
                confirmation_id = ResultProcessor.extract_confirmation_number(page_text)
                self.result.set_completed(ApplicationStatus.SUCCESS, confirmation_id)
                self.logger.info(f"✅ SUCCESS detected on page! Confirmation: {confirmation_id}")

                self.result.add_step(
                    "confirm", "Detected success on final page", True,
                    metadata={"page_indicators": found_indicators, "confirmation_id": confirmation_id}
                )
            else:
                self.logger.warning("⚠️  No clear success indicators found")
                self.result.set_failed("No clear success indicators found", "UNCLEAR_RESULT")

        except Exception as e:
            self.logger.error(f"Failed to process automation result: {e}", exc_info=True)
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
