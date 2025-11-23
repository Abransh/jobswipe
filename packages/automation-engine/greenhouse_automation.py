"""
Greenhouse Job Automation - Simplified & Correct
Uses browser-use properly with Tools() API (not Controller)

This is the SIMPLE, CORRECT implementation that follows browser-use best practices.
"""
import logging
import sys
from pathlib import Path
from typing import Dict, Any

# Import browser-use components
try:
    from browser_use import Agent, BrowserSession
    from browser_use.agent.service import Tools
    from browser_use.agent.views import ActionResult
    from browser_use.browser.events import UploadFileEvent
    from browser_use.llm import ChatGoogle
except ImportError as e:
    print(f"ERROR: Failed to import browser-use: {e}", file=sys.stderr)
    print("Run: pip install browser-use", file=sys.stderr)
    sys.exit(1)

logger = logging.getLogger(__name__)


class GreenhouseAutomation:
    """
    Simple Greenhouse job application automation

    Uses browser-use correctly:
    - Tools() for custom actions (not Controller)
    - Proper file upload with UploadFileEvent
    - Clear task instructions for AI agent
    """

    def __init__(self, headless: bool = False):
        """
        Initialize Greenhouse automation

        Args:
            headless: Run browser in headless mode (True for server, False for desktop)
        """
        self.headless = headless
        self.tools = Tools()  # ← CORRECT: Use Tools(), not Controller()
        self._setup_custom_actions()
        logger.info(f"GreenhouseAutomation initialized (headless={headless})")

    def _setup_custom_actions(self):
        """Setup custom actions for the AI agent"""

        # File upload action (follows browser-use example pattern)
        @self.tools.action('Upload resume file to file input element')
        async def upload_resume(index: int, file_path: str, browser_session: BrowserSession):
            """
            Upload resume to a file input element

            Args:
                index: Index of the file input element on the page
                file_path: Absolute path to the resume file
                browser_session: Auto-injected by browser-use

            Returns:
                ActionResult with success/error status
            """
            try:
                logger.info(f"📎 Uploading resume: {file_path} to element {index}")

                # Validate file exists
                if not Path(file_path).exists():
                    error_msg = f"File not found: {file_path}"
                    logger.error(error_msg)
                    return ActionResult(error=error_msg)

                # Get DOM element by index
                element = await browser_session.get_dom_element_by_index(index)
                if not element:
                    error_msg = f"No element found at index {index}"
                    logger.error(error_msg)
                    return ActionResult(error=error_msg)

                # Verify it's a file input element
                if element.tag_name.lower() != 'input' or element.attributes.get('type') != 'file':
                    error_msg = f"Element {index} is not a file input (tag={element.tag_name}, type={element.attributes.get('type')})"
                    logger.error(error_msg)
                    return ActionResult(error=error_msg)

                # Upload file using browser-use event system
                event = browser_session.event_bus.dispatch(
                    UploadFileEvent(node=element, file_path=file_path)
                )
                await event

                success_msg = f"✅ Successfully uploaded resume to element {index}"
                logger.info(success_msg)
                return ActionResult(
                    extracted_content=success_msg,
                    include_in_memory=True  # Agent will remember this step
                )

            except Exception as e:
                error_msg = f"Upload failed: {str(e)}"
                logger.error(error_msg, exc_info=True)
                return ActionResult(error=error_msg)

        logger.info("✅ Custom actions registered")

    def _generate_task(self, user: Dict[str, str], job: Dict[str, str]) -> str:
        """
        Generate detailed task instructions for the AI agent

        Args:
            user: User data dict with first_name, last_name, email, phone, resume_path
            job: Job data dict with title, company, apply_url

        Returns:
            Detailed task string for the AI agent
        """
        resume_note = ""
        if user.get('resume_path'):
            resume_note = f"""
5. IMPORTANT: If you find a file upload field for resume/CV:
   - Look for input elements with type="file"
   - Note the element index number
   - Use the 'upload_resume' action with:
     - index: [the element index]
     - file_path: {user.get('resume_path')}
   - Wait for the upload to complete
"""

        task = f"""
You are applying to the job "{job['title']}" at {job['company']} on Greenhouse.

APPLICATION URL: {job['apply_url']}

CANDIDATE INFORMATION:
- First Name: {user['first_name']}
- Last Name: {user['last_name']}
- Email: {user['email']}
- Phone: {user['phone']}

STEP-BY-STEP INSTRUCTIONS:

1. Navigate to the application URL
   - Go to {job['apply_url']}
   - Wait for the page to fully load (look for "Apply" buttons or forms)

2. Find and click the "Apply" button
   - Look for buttons with text like:
     * "Apply for this job"
     * "Apply Now"
     * "Submit Application"
   - Click the button to open the application form

3. Wait for application form to load
   - Make sure all form fields are visible
   - The page should show input fields for name, email, etc.

4. Fill out ALL form fields carefully:
   - First Name → Enter "{user['first_name']}"
   - Last Name → Enter "{user['last_name']}"
   - Email → Enter "{user['email']}"
   - Phone → Enter "{user['phone']}"
   - Fill any other required fields appropriately
{resume_note}
6. Review the form before submitting
   - Make sure all required fields are filled
   - Check for any error messages
   - Fix any validation errors

7. Submit the application
   - Find the "Submit Application" or "Submit" button
   - Click it to submit
   - Wait for the page to process the submission

8. Verify submission success
   - Look for confirmation messages like:
     * "Thank you for applying"
     * "Application submitted"
     * "We have received your application"
   - Take note of any confirmation number or reference ID

IMPORTANT GUIDELINES:
- Be patient - wait for each page to fully load before proceeding
- If you encounter a captcha, report it and pause
- If any step fails, report the error clearly
- Make sure to complete ALL steps in order
- Do not skip any required fields

Your goal is to SUCCESSFULLY COMPLETE the entire application process.
"""

        return task

    async def apply(self, user_data: Dict[str, str], job_data: Dict[str, str]) -> Dict[str, Any]:
        """
        Apply to a Greenhouse job posting using AI-powered automation

        Args:
            user_data: Dict with first_name, last_name, email, phone, resume_path
            job_data: Dict with title, company, apply_url

        Returns:
            Result dict with:
            {
                'success': bool,
                'message': str,
                'confirmation': str (if successful),
                'page_content': str (if failed - for debugging)
            }
        """
        try:
            logger.info("=" * 80)
            logger.info(f"🚀 Starting Greenhouse automation")
            logger.info(f"📋 Job: {job_data['title']} at {job_data['company']}")
            logger.info(f"👤 User: {user_data['first_name']} {user_data['last_name']}")
            logger.info(f"🔗 URL: {job_data['apply_url']}")
            logger.info("=" * 80)

            # Create LLM instance
            logger.info("🤖 Creating Google Gemini LLM...")
            llm = ChatGoogle(model='gemini-2.0-flash-lite')
            logger.info("✅ LLM created")

            # Create browser session
            logger.info(f"🌐 Creating browser session (headless={self.headless})...")
            browser_session = BrowserSession(headless=self.headless)
            logger.info("✅ Browser session created")

            try:
                # Start browser
                logger.info("▶️  Starting browser...")
                await browser_session.start()
                logger.info("✅ Browser started successfully")

                # Generate task for AI agent
                logger.info("📝 Generating task instructions...")
                task = self._generate_task(user_data, job_data)
                logger.info(f"✅ Task generated ({len(task)} characters)")
                logger.debug(f"Task preview: {task[:200]}...")

                # Create AI agent
                logger.info("🤖 Creating AI agent with custom tools...")
                agent = Agent(
                    task=task,
                    llm=llm,
                    browser_session=browser_session,
                    tools=self.tools  # ← CORRECT: Pass Tools instance
                )
                logger.info("✅ Agent created")

                # Run automation
                logger.info("=" * 80)
                logger.info("▶️  EXECUTING AI-POWERED AUTOMATION...")
                logger.info("=" * 80)
                result = await agent.run(max_steps=20)
                logger.info("=" * 80)
                logger.info(f"✅ Agent execution completed!")
                logger.info(f"📊 Result: {str(result)[:300]}...")
                logger.info("=" * 80)

                # Check final page for success indicators
                logger.info("🔍 Checking for success indicators...")
                page = await browser_session.get_current_page()
                page_text = await page.inner_text('body')
                page_text_lower = page_text.lower()

                # Success phrases to look for
                success_phrases = [
                    'thank you for applying',
                    'thank you for your application',
                    'application submitted',
                    'successfully submitted',
                    'submission successful',
                    'application received',
                    'we have received your application',
                    'confirmation'
                ]

                is_success = any(phrase in page_text_lower for phrase in success_phrases)

                if is_success:
                    confirmation_text = page_text[:300]  # First 300 chars
                    logger.info("✅ SUCCESS: Application submitted!")
                    logger.info(f"Confirmation: {confirmation_text[:100]}...")

                    return {
                        'success': True,
                        'message': 'Application submitted successfully',
                        'confirmation': confirmation_text,
                        'job_title': job_data['title'],
                        'company': job_data['company']
                    }
                else:
                    logger.warning("⚠️  Could not confirm submission")
                    logger.warning(f"Page content: {page_text[:500]}...")

                    return {
                        'success': False,
                        'message': 'Application process completed but could not verify submission',
                        'page_content': page_text[:500],
                        'job_title': job_data['title'],
                        'company': job_data['company']
                    }

            finally:
                # Always stop the browser
                logger.info("🛑 Stopping browser...")
                await browser_session.stop()
                logger.info("✅ Browser stopped")

        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Automation failed: {error_msg}", exc_info=True)

            return {
                'success': False,
                'message': f'Automation error: {error_msg}',
                'error_type': type(e).__name__,
                'job_title': job_data.get('title', 'Unknown'),
                'company': job_data.get('company', 'Unknown')
            }


# Standalone testing
if __name__ == "__main__":
    import asyncio

    # Setup logging for testing
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Test data
    test_user = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john.doe@example.com',
        'phone': '123-456-7890',
        'resume_path': '/path/to/resume.pdf'  # Update this path for real testing
    }

    test_job = {
        'title': 'Software Engineer',
        'company': 'Example Corp',
        'apply_url': 'https://job-boards.greenhouse.io/example/jobs/123'  # Update for real testing
    }

    async def test():
        automation = GreenhouseAutomation(headless=False)
        result = await automation.apply(test_user, test_job)
        print("\n" + "=" * 80)
        print("TEST RESULT:")
        print(json.dumps(result, indent=2))
        print("=" * 80)

    import json
    asyncio.run(test())
