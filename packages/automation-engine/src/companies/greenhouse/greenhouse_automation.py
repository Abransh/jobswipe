"""
Greenhouse Job Application Automation (UNIFIED VERSION)
AI-powered automation for Greenhouse job board applications
Works in both SERVER and DESKTOP modes via ExecutionContext
"""

import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import List, Dict, Any

# Import from unified base
from ..base.base_automation import BaseJobAutomation
from ..base.user_profile import UserProfile, JobData
from ..base.result_handler import ApplicationResult, ApplicationStatus, ResultProcessor

# Import ExecutionContext
from ...core.execution_context import ExecutionContext


class GreenhouseAutomation(BaseJobAutomation):
    """
    Greenhouse-specific job application automation
    Handles job applications on Greenhouse job boards (*.greenhouse.io)

    UNIFIED VERSION: Works in both SERVER (with proxy) and DESKTOP (local browser) modes
    """

    def __init__(self, context: ExecutionContext):
        """
        Initialize Greenhouse automation with execution context

        Args:
            context: ExecutionContext containing mode (SERVER/DESKTOP), proxy config, etc.
        """
        super().__init__("greenhouse", context)
        self.logger.info(f"Greenhouse automation initialized in {context.mode.value} mode")

    def get_url_patterns(self) -> List[str]:
        """URL patterns that this automation can handle"""
        return [
            "greenhouse.io",
            "job-boards.greenhouse.io",
            "boards.greenhouse.io",
            "grnh.se"  # Greenhouse short URLs
        ]

    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        """Generate Greenhouse-specific automation task"""

        resume_instruction = ""
        if user_profile.get_resume_path():
            resume_instruction = f"""

IMPORTANT: If you find a file upload input for resume/CV, use the 'upload_resume' action with this path:
Resume file path: {user_profile.get_resume_path()}
"""

        task = f"""
You are a professional job application assistant for JobSwipe, specializing in Greenhouse job boards.

OBJECTIVE: Apply to the {job_data.title} position at {job_data.company}

JOB APPLICATION URL: {job_data.apply_url}

CANDIDATE INFORMATION:
- Full Name: {user_profile.get_full_name()}
- First Name: {user_profile.first_name}
- Last Name: {user_profile.last_name}
- Email: {user_profile.email}
- Phone: {user_profile.phone}
- Current Title: {user_profile.current_title or "Not specified"}
- Years of Experience: {user_profile.years_experience or "Not specified"}
- Location: {user_profile.current_location or "Not specified"}
- LinkedIn: {user_profile.linkedin_url or "Not specified"}
- Work Authorization: {user_profile.work_authorization or "Not specified"}
{resume_instruction}

STEP-BY-STEP INSTRUCTIONS:

1. NAVIGATE TO APPLICATION
   - Go to the job application URL
   - Wait for the page to fully load
   - Take a screenshot to document the starting point

2. FIND APPLICATION FORM
   - Look for "Apply" buttons or "Apply for this job" links
   - Click on the application button/link
   - If redirected to a new page, wait for it to load completely

3. FILL OUT APPLICATION FORM
   Greenhouse forms typically have these sections:

   a) Basic Information:
      - First Name: {user_profile.first_name}
      - Last Name: {user_profile.last_name}
      - Email: {user_profile.email}
      - Phone: {user_profile.phone}

   b) Professional Information:
      - Current/Most Recent Job Title: {user_profile.current_title or "Software Engineer"}
      - Location/City: {user_profile.current_location or ""}
      - LinkedIn Profile: {user_profile.linkedin_url or ""}

   c) Experience and Skills:
      - Years of Experience: {user_profile.years_experience or "5"}
      - Relevant Skills: {', '.join(user_profile.skills) if user_profile.skills else "Python, JavaScript, React"}

   d) Work Authorization (if asked):
      - Are you authorized to work in the US? Answer based on: {user_profile.work_authorization or "Yes"}
      - Do you require sponsorship? Answer based on: {"No" if user_profile.require_sponsorship is False else "Yes" if user_profile.require_sponsorship is True else "No"}

4. HANDLE FILE UPLOADS
   - Look for resume/CV upload fields
   - If found, use the upload_resume action to upload the file
   - Verify the upload was successful

5. HANDLE ADDITIONAL QUESTIONS
   Common Greenhouse questions and how to answer them:
   - "Why are you interested in this role?" → "I'm excited about this opportunity because it aligns with my experience and career goals. The role would allow me to contribute my skills while growing in a dynamic environment."
   - "Salary expectations?" → "{user_profile.salary_expectation or 'Competitive salary based on experience'}"
   - "When can you start?" → "I'm available to start within 2-4 weeks notice period"
   - "Cover letter" → "{user_profile.cover_letter or 'Please see my attached resume for details of my experience and qualifications.'}"

6. CAPTCHA HANDLING
   - Use detect_captcha action to check for captchas
   - If captcha detected, document it and wait for manual intervention
   - Do not proceed until captcha is resolved

7. REVIEW AND SUBMIT
   - Review all filled information for accuracy
   - Look for any required fields that might be missed
   - Click "Submit Application" or similar button
   - Wait for confirmation page to load

8. CONFIRMATION VERIFICATION
   - Use extract_confirmation action to get confirmation details
   - Look for success messages like:
     * "Thank you for your application"
     * "Application submitted successfully"
     * "We have received your application"
   - Try to extract any confirmation numbers or reference IDs
   - Take a final screenshot of the confirmation page

IMPORTANT GUIDELINES:
- Be patient with page loads and form submissions
- Handle dynamic content that loads after the initial page
- If you encounter multi-step forms, complete all steps
- Don't skip required fields - ask for clarification if needed
- Be professional in all text responses
- If something fails, document the error and continue where possible
- Use the provided actions for file uploads, captcha detection, and confirmation

EXPECTED OUTCOME:
Successfully submit the job application and provide confirmation of submission.
"""

        return task

    async def apply_to_job(self, user_profile: UserProfile, job_data: JobData) -> ApplicationResult:
        """
        Apply to a Greenhouse job posting

        UNIFIED VERSION: Works in both SERVER and DESKTOP modes

        Args:
            user_profile: Candidate's profile information
            job_data: Job posting details

        Returns:
            ApplicationResult with detailed outcome
        """
        self.logger.info(f"Starting Greenhouse application for {job_data.title} at {job_data.company}")
        self.logger.info(f"Execution mode: {self.context.mode.value}")

        # Validate that this is a Greenhouse URL
        if not self.can_handle_url(job_data.apply_url):
            error_msg = f"URL {job_data.apply_url} is not a valid Greenhouse job posting"
            self.logger.error(error_msg)
            return ResultProcessor.create_failed_result(
                job_data.job_id,
                self.company_name,
                error_msg,
                "INVALID_URL"
            )

        # Validate required user profile fields
        validation_errors = self._validate_user_profile(user_profile)
        if validation_errors:
            error_msg = f"User profile validation failed: {', '.join(validation_errors)}"
            self.logger.error(error_msg)
            return ResultProcessor.create_failed_result(
                job_data.job_id,
                self.company_name,
                error_msg,
                "VALIDATION_ERROR"
            )

        # Execute the automation using the base class
        result = await super().apply_to_job(user_profile, job_data)

        # Add Greenhouse-specific metadata
        if result:
            result.performance_metrics.update({
                "greenhouse_version": "1.0.0",
                "execution_mode": self.context.mode.value,
                "url_pattern_matched": self._get_matched_pattern(job_data.apply_url),
                "form_complexity": self._estimate_form_complexity(job_data),
                "user_profile_completeness": self._calculate_profile_completeness(user_profile)
            })

        self.logger.info(f"Greenhouse application completed: {result.status if result else 'Failed'}")
        return result

    def _validate_user_profile(self, user_profile: UserProfile) -> List[str]:
        """Validate that user profile has required fields for Greenhouse"""
        errors = []

        if not user_profile.first_name.strip():
            errors.append("First name is required")

        if not user_profile.last_name.strip():
            errors.append("Last name is required")

        if not user_profile.email:
            errors.append("Email is required")

        if not user_profile.phone.strip():
            errors.append("Phone number is required")

        # Check resume availability (optional - log warning if missing)
        if not user_profile.get_resume_path():
            self.logger.warning("No resume provided - application may fail at resume upload step")
            # errors.append("Resume file path is required for Greenhouse applications")
        elif user_profile.resume_local_path:
            resume_path = Path(user_profile.resume_local_path)
            if not resume_path.exists():
                errors.append(f"Resume file not found at: {user_profile.resume_local_path}")
            elif resume_path.suffix.lower() not in ['.pdf', '.doc', '.docx']:
                errors.append("Resume must be in PDF, DOC, or DOCX format")

        return errors

    def _get_matched_pattern(self, url: str) -> str:
        """Get which URL pattern matched this job posting"""
        url_lower = url.lower()
        for pattern in self.get_url_patterns():
            if pattern in url_lower:
                return pattern
        return "unknown"

    def _estimate_form_complexity(self, job_data: JobData) -> str:
        """Estimate form complexity based on job data"""
        # This is a simple heuristic - in practice, we could analyze the actual form
        if job_data.company and len(job_data.company) > 50:
            return "high"  # Large companies often have complex forms
        elif job_data.description and len(job_data.description) > 1000:
            return "medium"  # Detailed job descriptions might indicate complex applications
        else:
            return "low"

    def _calculate_profile_completeness(self, user_profile: UserProfile) -> float:
        """Calculate what percentage of optional profile fields are filled"""
        optional_fields = [
            'current_title', 'years_experience', 'linkedin_url',
            'github_url', 'portfolio_url', 'current_location',
            'work_authorization', 'cover_letter'
        ]

        filled_fields = sum(1 for field in optional_fields
                           if getattr(user_profile, field, None))

        return (filled_fields / len(optional_fields)) * 100


async def main():
    """Test the Greenhouse automation with sample data"""
    try:
        from ...core.execution_context import ExecutionContext, ExecutionMode

        # Sample user profile
        user_profile = UserProfile(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="123-456-7890",
            resume_local_path="cv_04_24.pdf",  # This should exist for real testing
            current_title="Software Engineer",
            years_experience=5,
            skills=["Python", "JavaScript", "React"],
            current_location="San Francisco, CA",
            work_authorization="citizen"
        )

        # Sample job data
        job_data = JobData(
            job_id="greenhouse_test_123",
            title="Senior Software Engineer",
            company="Test Company",
            apply_url="https://job-boards.greenhouse.io/example/jobs/12345",
            location="San Francisco, CA",
            job_type="full-time"
        )

        # Create execution context (DESKTOP mode for testing)
        context = ExecutionContext(
            mode=ExecutionMode.DESKTOP,
            user_profile={"name": "John Doe"}
        )

        # Run the automation
        automation = GreenhouseAutomation(context)
        result = await automation.apply_to_job(user_profile, job_data)

        print("\n" + "="*60)
        print("GREENHOUSE AUTOMATION TEST RESULT (UNIFIED VERSION)")
        print("="*60)
        print(f"Execution Mode: {context.mode.value}")
        print(f"Status: {result.status}")
        print(f"Success: {result.success}")
        print(f"Duration: {result.total_duration_ms}ms")
        print(f"Steps completed: {result.steps_completed}/{result.total_steps}")

        if result.success:
            print(f"Confirmation: {result.confirmation_number}")
        else:
            print(f"Error: {result.error_message}")

        print(f"Screenshots: {len(result.screenshots)}")
        print(f"Captchas encountered: {len(result.captcha_events)}")

        # Print detailed steps
        print("\nAutomation Steps:")
        for i, step in enumerate(result.steps, 1):
            status = "✅" if step.success else "❌"
            print(f"{i}. {status} {step.step_name}: {step.action}")
            if step.duration_ms:
                print(f"   Duration: {step.duration_ms}ms")
            if step.error_message:
                print(f"   Error: {step.error_message}")

        print("\n" + "="*60)

    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
