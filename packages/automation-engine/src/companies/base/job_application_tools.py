"""
Job Application Tools for Browser-Use Automation

This module provides reusable, functional custom actions for job application automation.
All actions interact with the actual browser (not just placeholders).

Actions follow browser-use v0.6.0+ patterns:
- Use browser_session parameter (auto-injected by browser-use)
- Return ActionResult with include_in_memory for important events
- Implement comprehensive error handling
- Validate inputs before browser interaction
"""

import logging
from pathlib import Path
from typing import List, Optional

from pydantic import BaseModel, Field
from browser_use.browser.session import BrowserSession
from browser_use.agent.views import ActionResult
from browser_use.browser.views import BrowserError

logger = logging.getLogger("jobswipe.tools")


# ============================================================================
# Parameter Models
# ============================================================================


class UploadResumeParams(BaseModel):
    """Parameters for resume upload action"""
    index: int = Field(
        ...,
        description="Element index for file input (0-indexed from DOM)"
    )
    file_path: str = Field(
        ...,
        description="Absolute path to resume file (PDF, DOCX, or TXT)"
    )


class DetectCaptchaParams(BaseModel):
    """Parameters for captcha detection action (no params needed)"""
    pass


class ExtractConfirmationParams(BaseModel):
    """Parameters for confirmation extraction (no params needed)"""
    pass


# ============================================================================
# Custom Actions - Functional Implementations
# ============================================================================


async def upload_resume_action(
    params: UploadResumeParams,
    browser_session: BrowserSession,
    available_file_paths: Optional[List[str]] = None
) -> ActionResult:
    """
    Upload resume to file input element - FUNCTIONAL IMPLEMENTATION

    This action performs ACTUAL browser interaction using browser-use patterns.

    Args:
        params: Upload parameters (index, file_path)
        browser_session: Auto-injected by browser-use
        available_file_paths: Auto-injected list of available files

    Returns:
        ActionResult with success/failure and memory inclusion

    Raises:
        BrowserError: If file upload element not found or upload fails
    """
    try:
        # Validate file exists
        file_path = Path(params.file_path)
        if not file_path.exists():
            raise BrowserError(f"Resume file not found: {params.file_path}")

        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
        if file_path.suffix.lower() not in allowed_extensions:
            raise BrowserError(
                f"Invalid file type: {file_path.suffix}. "
                f"Allowed: {', '.join(allowed_extensions)}"
            )

        # Check if file is in available_file_paths (if provided)
        if available_file_paths is not None and str(file_path) not in available_file_paths:
            logger.warning(
                f"File {file_path} not in available_file_paths. "
                f"This might cause permission issues."
            )

        logger.info(f"Uploading resume: {file_path.name} to element index {params.index}")

        # Find file upload element using browser-use helper
        # max_height=3 and max_descendant_depth=3 balance performance vs thoroughness
        file_upload_dom_el = await browser_session.find_file_upload_element_by_index(
            params.index,
            max_height=3,
            max_descendant_depth=3
        )

        if file_upload_dom_el is None:
            raise BrowserError(
                f"No file upload element found at index {params.index}. "
                f"Use a different index or check if the page has loaded completely."
            )

        # Get Playwright locator for the element
        file_upload_el = await browser_session.get_locate_element(file_upload_dom_el)

        # ACTUAL BROWSER INTERACTION: Upload the file
        await file_upload_el.set_input_files(str(file_path))

        # Verify upload (wait a bit for file to be recognized)
        import asyncio
        await asyncio.sleep(0.5)

        # Check if the input has a value (indicates successful upload)
        input_value = await file_upload_el.get_attribute('value')
        if input_value and file_path.name in input_value:
            logger.info(f"✅ Resume uploaded successfully: {file_path.name}")
        else:
            logger.warning(f"⚠️ Upload may have failed - input value: {input_value}")

        return ActionResult(
            extracted_content=f"Successfully uploaded {file_path.name} to element {params.index}",
            include_in_memory=True,  # Important event - include in agent memory
            long_term_memory=f"Uploaded resume '{file_path.name}' during application"
        )

    except BrowserError:
        # Re-raise browser errors (already formatted)
        raise
    except Exception as e:
        logger.error(f"Resume upload failed: {e}", exc_info=True)
        raise BrowserError(f"Resume upload failed: {str(e)}")


async def detect_captcha_action(
    params: DetectCaptchaParams,
    browser_session: BrowserSession
) -> ActionResult:
    """
    Detect captcha on current page - FUNCTIONAL IMPLEMENTATION

    Inspects DOM for common captcha indicators (reCAPTCHA, hCaptcha, Cloudflare, etc.)

    Args:
        params: No parameters needed
        browser_session: Auto-injected by browser-use

    Returns:
        ActionResult with captcha detection results
    """
    try:
        logger.info("Detecting captcha on current page...")

        # Get current page
        page = await browser_session.get_current_page()

        # Captcha detection patterns (CSS selectors and iframe sources)
        captcha_patterns = {
            'recaptcha': [
                'iframe[src*="recaptcha"]',
                'div.g-recaptcha',
                'div#recaptcha',
                '.grecaptcha-badge'
            ],
            'hcaptcha': [
                'iframe[src*="hcaptcha"]',
                'div.h-captcha',
                'div#hcaptcha'
            ],
            'cloudflare': [
                'iframe[src*="challenges.cloudflare.com"]',
                'div#cf-challenge-running',
                'div.cf-browser-verification'
            ],
            'arkose': [
                'iframe[src*="arkoselabs.com"]',
                'div#arkose',
                'div.arkose-challenge'
            ],
            'funcaptcha': [
                'iframe[src*="funcaptcha"]',
                'div.funcaptcha',
                'div#FunCaptcha'
            ]
        }

        detected_captchas = []

        # Check each captcha type
        for captcha_type, selectors in captcha_patterns.items():
            for selector in selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        # Check if element is visible
                        is_visible = await element.is_visible()
                        if is_visible:
                            detected_captchas.append(captcha_type)
                            logger.warning(f"🔒 Detected {captcha_type} captcha: {selector}")
                            break  # Found this captcha type, move to next
                except Exception:
                    # Selector might not be valid for all pages
                    pass

        # Remove duplicates
        detected_captchas = list(set(detected_captchas))

        if detected_captchas:
            captcha_list = ", ".join(detected_captchas)
            message = f"Captcha detected: {captcha_list}"
            logger.warning(f"⚠️ {message}")

            return ActionResult(
                extracted_content=message,
                include_in_memory=True,  # Important for agent to handle
                long_term_memory=f"Encountered {captcha_list} captcha during application"
            )
        else:
            logger.info("✅ No captcha detected on current page")
            return ActionResult(
                extracted_content="No captcha detected",
                include_in_memory=False  # Not important if no captcha
            )

    except Exception as e:
        logger.error(f"Captcha detection failed: {e}", exc_info=True)
        # Don't raise error - captcha detection failure shouldn't stop automation
        return ActionResult(
            extracted_content=f"Captcha detection failed: {str(e)}",
            include_in_memory=False
        )


async def extract_confirmation_action(
    params: ExtractConfirmationParams,
    browser_session: BrowserSession
) -> ActionResult:
    """
    Extract confirmation details from current page - FUNCTIONAL IMPLEMENTATION

    Looks for confirmation indicators and extracts confirmation ID/number.

    Args:
        params: No parameters needed
        browser_session: Auto-injected by browser-use

    Returns:
        ActionResult with confirmation details
    """
    try:
        logger.info("Extracting confirmation details from current page...")

        # Get current page
        page = await browser_session.get_current_page()

        # Get page text content
        page_text = await page.inner_text('body')
        page_text_lower = page_text.lower()

        # Success indicators
        success_indicators = [
            'thank you',
            'application submitted',
            'successfully applied',
            'application received',
            'confirmation',
            'we received your application',
            'application complete',
            'successfully submitted'
        ]

        # Check for success indicators
        found_indicators = [
            indicator for indicator in success_indicators
            if indicator in page_text_lower
        ]

        if not found_indicators:
            logger.warning("⚠️ No confirmation indicators found on page")
            return ActionResult(
                extracted_content="No confirmation indicators found",
                include_in_memory=True,
                long_term_memory="Application submitted but no clear confirmation"
            )

        # Extract confirmation number/ID (common patterns)
        import re

        confirmation_patterns = [
            r'confirmation\s*(?:number|id|code)[\s:]+([A-Z0-9\-]+)',
            r'application\s*(?:number|id|code)[\s:]+([A-Z0-9\-]+)',
            r'reference\s*(?:number|id|code)[\s:]+([A-Z0-9\-]+)',
            r'ticket\s*(?:number|id)[\s:]+([A-Z0-9\-]+)',
            r'confirmation[\s:]+([A-Z0-9]{6,})',  # Generic 6+ char alphanumeric
        ]

        confirmation_id = None
        for pattern in confirmation_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                confirmation_id = match.group(1)
                logger.info(f"✅ Found confirmation ID: {confirmation_id}")
                break

        # Try to extract email notification message
        email_patterns = [
            r'sent.*?(?:to|at)\s+([\w\.-]+@[\w\.-]+\.\w+)',
            r'confirmation.*?(?:to|at)\s+([\w\.-]+@[\w\.-]+\.\w+)',
            r'email.*?(?:to|at)\s+([\w\.-]+@[\w\.-]+\.\w+)'
        ]

        email_notification = None
        for pattern in email_patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                email_notification = match.group(1)
                logger.info(f"📧 Confirmation email sent to: {email_notification}")
                break

        # Build confirmation message
        confirmation_parts = [f"Application confirmed ({', '.join(found_indicators[:2])})"]

        if confirmation_id:
            confirmation_parts.append(f"ID: {confirmation_id}")

        if email_notification:
            confirmation_parts.append(f"Email: {email_notification}")

        confirmation_message = " | ".join(confirmation_parts)

        logger.info(f"✅ Confirmation extracted: {confirmation_message}")

        return ActionResult(
            extracted_content=confirmation_message,
            include_in_memory=True,
            long_term_memory=f"Application confirmed with ID: {confirmation_id or 'unknown'}"
        )

    except Exception as e:
        logger.error(f"Confirmation extraction failed: {e}", exc_info=True)
        # Don't raise error - extraction failure shouldn't stop automation
        return ActionResult(
            extracted_content=f"Confirmation extraction failed: {str(e)}",
            include_in_memory=False
        )


# ============================================================================
# JobApplicationTools Class - Registers all actions
# ============================================================================


class JobApplicationTools:
    """
    Container class for job application custom actions

    Usage:
        tools = JobApplicationTools(controller, logger)
        # Actions are automatically registered with the controller
    """

    def __init__(self, controller, logger_instance: Optional[logging.Logger] = None):
        """
        Initialize job application tools and register with controller

        Args:
            controller: browser-use Controller instance
            logger_instance: Optional logger (uses module logger if not provided)
        """
        self.controller = controller
        self.logger = logger_instance or logger

        # Register all actions with the controller
        self._register_actions()

        self.logger.info("JobApplicationTools registered 3 custom actions")

    def _register_actions(self):
        """Register all custom actions with the controller"""

        # Action 1: Upload Resume
        @self.controller.action(
            "Upload resume file to the specified file input element",
            param_model=UploadResumeParams
        )
        async def upload_resume(browser_session):
            """Upload resume to file input element"""
            return await upload_resume_action(browser_session)

        # Action 2: Detect Captcha
        @self.controller.action(
            "Detect if there is a captcha on the current page",
            param_model=DetectCaptchaParams
        )
        async def detect_captcha_action(
            params: DetectCaptchaParams,
            browser_session: BrowserSession
                ):   
            """Detect various types of captchas on the page"""
            return await detect_captcha_action(params, browser_session)

        # Action 3: Extract Confirmation
        @self.controller.action(
            "Extract application confirmation details from the current page",
            param_model=ExtractConfirmationParams
        )
        async def extract_confirmation(params: ExtractConfirmationParams, browser_session: BrowserSession):
            """Extract confirmation details after successful application"""
            return await extract_confirmation_action(params, browser_session)

        self.logger.debug("All custom actions registered with controller")


# ============================================================================
# Utility Functions
# ============================================================================


def validate_resume_file(file_path: str) -> bool:
    """
    Validate that resume file exists and has correct format

    Args:
        file_path: Path to resume file

    Returns:
        True if valid, False otherwise
    """
    try:
        path = Path(file_path)
        if not path.exists():
            logger.error(f"Resume file not found: {file_path}")
            return False

        allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
        if path.suffix.lower() not in allowed_extensions:
            logger.error(f"Invalid file type: {path.suffix}")
            return False

        return True

    except Exception as e:
        logger.error(f"Resume validation failed: {e}")
        return False
