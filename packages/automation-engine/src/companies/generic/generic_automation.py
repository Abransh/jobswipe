"""
Generic Job Application Automation (UNIFIED VERSION)
AI-powered automation for generic job sites and ATS systems
Works in both SERVER and DESKTOP modes via ExecutionContext
"""

import logging
from typing import List
from pathlib import Path

# Import from unified base
from ..base.base_automation import BaseJobAutomation
from ..base.user_profile import UserProfile, JobData
from ..base.result_handler import ApplicationResult, ApplicationStatus

# Import ExecutionContext
from ...core.execution_context import ExecutionContext


class GenericAutomation(BaseJobAutomation):
    """
    Generic job application automation for sites without specific handlers
    Uses AI to intelligently navigate and fill out any job application form

    UNIFIED VERSION: Works in both SERVER (with proxy) and DESKTOP (local browser) modes
    """

    def __init__(self, context: ExecutionContext):
        """
        Initialize Generic automation with execution context

        Args:
            context: ExecutionContext containing mode (SERVER/DESKTOP), proxy config, etc.
        """
        super().__init__("generic", context)
        self.logger.info(f"Generic job automation initialized in {context.mode.value} mode")

    def get_url_patterns(self) -> List[str]:
        """
        URL patterns that this automation can handle
        Generic automation accepts any URL that doesn't match specific patterns
        """
        return ["*"]  # Wildcard - matches all URLs

    def can_handle_url(self, url: str) -> bool:
        """Generic automation can handle any URL as fallback"""
        return True

    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        """Generate generic job application automation task"""

        # Get resume path for upload instructions
        resume_instruction = ""
        resume_path = user_profile.get_resume_path()
        if resume_path:
            resume_instruction = f"""
CRITICAL - RESUME UPLOAD:
If you encounter a file upload field for resume/CV/document:
1. Use the upload_file action with this exact path: {resume_path}
2. Wait for the upload to complete before proceeding
3. Verify the file name appears in the upload field
"""

        # Build user profile information
        user_info = f"""
USER INFORMATION:
- Name: {user_profile.first_name} {user_profile.last_name}
- Email: {user_profile.email}
- Phone: {user_profile.phone}"""

        if user_profile.current_title:
            user_info += f"\n- Current Title: {user_profile.current_title}"
        if user_profile.years_experience:
            user_info += f"\n- Years of Experience: {user_profile.years_experience}"
        if user_profile.current_location:
            user_info += f"\n- Location: {user_profile.current_location}"
        if user_profile.linkedin_url:
            user_info += f"\n- LinkedIn: {user_profile.linkedin_url}"
        if user_profile.work_authorization:
            user_info += f"\n- Work Authorization: {user_profile.work_authorization}"

        # Add skills if available
        if user_profile.skills:
            skills_str = ", ".join(user_profile.skills[:10])  # First 10 skills
            user_info += f"\n- Key Skills: {skills_str}"

        # Build cover letter section
        cover_letter_instruction = ""
        if user_profile.cover_letter:
            cover_letter_instruction = f"""
COVER LETTER:
If asked for a cover letter or "why are you interested" text field:
{user_profile.cover_letter}
"""

        # Main task description
        task = f"""
You are an intelligent job application automation agent. Your goal is to successfully submit a job application.

JOB DETAILS:
- Position: {job_data.title}
- Company: {job_data.company}
- Application URL: {job_data.apply_url}

{user_info}

{resume_instruction}

{cover_letter_instruction}

TASK INSTRUCTIONS:
1. Navigate to the job application page: {job_data.apply_url}
2. Look for application forms, "Apply" buttons, or "Easy Apply" options
3. Fill out ALL required fields accurately using the user information provided
4. Handle multi-step forms by clicking "Next", "Continue", or "Submit" as appropriate
5. If you encounter dropdown menus, select the most appropriate option based on user info
6. For yes/no questions about authorization, sponsorship, etc., answer truthfully based on user data
7. Upload the resume file when prompted (see RESUME UPLOAD instructions above)
8. Submit the application when all required fields are completed
9. Look for confirmation messages, confirmation numbers, or success indicators
10. If you encounter CAPTCHA, stop and report it (human intervention required)

IMPORTANT RULES:
- Always fill forms completely and accurately
- Never skip required fields
- Double-check that resume upload was successful before submitting
- If you can't proceed, explain why clearly
- Report the final status: SUCCESS with confirmation details OR reason for failure

EXPECTED OUTPUT FORMAT:
When successful, include: SUCCESS: [confirmation number or message]
If captcha detected: CAPTCHA_DETECTED: [captcha type]
If error occurs: ERROR: [detailed error message]

Begin the job application process now.
"""

        return task.strip()


# Alias for backwards compatibility
GenericJobAutomation = GenericAutomation


if __name__ == "__main__":
    import asyncio
    from ...core.execution_context import ExecutionContext, ExecutionMode

    async def test():
        """Test the generic automation"""
        # Create test context
        context = ExecutionContext(
            mode=ExecutionMode.DESKTOP,
            user_profile={},
            proxy_config=None
        )

        # Create automation
        automation = GenericAutomation(context)

        # Test data
        user_profile = UserProfile(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone="555-1234",
            resume_url="https://example.com/resume.pdf"
        )

        job_data = JobData(
            job_id="test123",
            title="Software Engineer",
            company="Test Company",
            apply_url="https://example.com/careers/apply/123"
        )

        # Generate task
        task = automation.get_company_specific_task(user_profile, job_data)
        print("Generated Task:")
        print("=" * 80)
        print(task)
        print("=" * 80)

    asyncio.run(test())
