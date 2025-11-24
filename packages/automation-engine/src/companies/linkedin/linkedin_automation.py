"""
LinkedIn Easy Apply Job Application Automation (UNIFIED VERSION)
AI-powered automation for LinkedIn Easy Apply job applications
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


class LinkedInAutomation(BaseJobAutomation):
    """
    LinkedIn-specific job application automation
    Handles LinkedIn Easy Apply job applications

    UNIFIED VERSION: Works in both SERVER (with proxy) and DESKTOP (local browser) modes
    """

    def __init__(self, context: ExecutionContext):
        """
        Initialize LinkedIn automation with execution context

        Args:
            context: ExecutionContext containing mode (SERVER/DESKTOP), proxy config, etc.
        """
        super().__init__("linkedin", context)
        self.logger.info(f"LinkedIn Easy Apply automation initialized in {context.mode.value} mode")

    def get_url_patterns(self) -> List[str]:
        """URL patterns that this automation can handle"""
        return [
            "linkedin.com/jobs",
            "linkedin.com/jobs/view",
            "linkedin.com/jobs/collections",
            "linkedin.com/jobs/search"
        ]

    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        """Generate LinkedIn-specific automation task"""

        resume_instruction = ""
        if user_profile.get_resume_path():
            resume_instruction = f"""

IMPORTANT: If you find a file upload input for resume/CV, use the 'upload_resume' action with this path:
Resume file path: {user_profile.get_resume_path()}
"""

        task = f"""
You are a professional job application assistant for JobSwipe, specializing in LinkedIn Easy Apply.

OBJECTIVE: Apply to the {job_data.title} position at {job_data.company} using LinkedIn Easy Apply

JOB APPLICATION URL: {job_data.apply_url}

CANDIDATE INFORMATION:
- Full Name: {user_profile.get_full_name()}
- First Name: {user_profile.first_name}
- Last Name: {user_profile.last_name}
- Email: {user_profile.email}
- Phone: {user_profile.phone}
- Current Title: {user_profile.current_title or "Software Engineer"}
- Years of Experience: {user_profile.years_experience or "5"}
- Location: {user_profile.current_location or ""}
- LinkedIn: {user_profile.linkedin_url or ""}
- Work Authorization: {user_profile.work_authorization or "Authorized to work"}
{resume_instruction}

STEP-BY-STEP INSTRUCTIONS:

1. NAVIGATE AND LOGIN CHECK
   - Go to the job application URL
   - Check if you're logged into LinkedIn
   - If not logged in, you'll see a login form - DO NOT attempt to log in
   - Instead, report that login is required and stop the automation
   - Take a screenshot to document the current state

2. FIND EASY APPLY BUTTON
   - Look for the blue "Easy Apply" button on the job posting page
   - If you only see "Apply" or "Apply on company website", this job doesn't support Easy Apply
   - Report that Easy Apply is not available for this job
   - Only proceed if you find the "Easy Apply" button

3. START EASY APPLY PROCESS
   - Click the "Easy Apply" button
   - Wait for the Easy Apply modal/form to load
   - Take a screenshot of the initial form

4. FILL OUT APPLICATION FORM - STEP BY STEP
   LinkedIn Easy Apply typically has multiple steps:

   STEP 1 - Contact Information:
   - Phone Number: {user_profile.phone}
   - Resume: Use upload_resume action if file upload is present
   - Most contact info should be pre-filled from LinkedIn profile

   STEP 2 - Experience and Background:
   - Years of Experience: {user_profile.years_experience or "5"}
   - Current Job Title: {user_profile.current_title or "Software Engineer"}
   - Education Level: Select appropriate level (Bachelor's, Master's, etc.)
   - Skills: Based on {', '.join(user_profile.skills) if user_profile.skills else "Python, JavaScript, Software Development"}

   STEP 3 - Additional Questions (if present):
   Common LinkedIn questions and how to answer them:
   - "Are you authorized to work in [Country]?" → Answer: {"Yes" if user_profile.work_authorization else "Yes"}
   - "Do you require sponsorship?" → Answer: {"No" if user_profile.require_sponsorship is False else "Yes" if user_profile.require_sponsorship is True else "No"}
   - "How many years of [specific skill] experience?" → Answer based on user profile or estimate: "3-5 years"
   - "What is your expected salary?" → Answer: "{user_profile.salary_expectation or 'Competitive salary based on experience'}"
   - "When can you start?" → Answer: "Within 2-4 weeks"
   - "Why are you interested?" → Answer: "I'm excited about this opportunity as it aligns with my experience and career goals."
   - Cover letter requests → Use: "{user_profile.cover_letter or 'Please see my attached resume for details of my qualifications and experience. I look forward to discussing this opportunity further.'}"

5. NAVIGATE THROUGH MULTI-STEP FORM
   - LinkedIn Easy Apply often has 2-4 steps
   - Look for "Next" buttons to proceed through steps
   - Fill out all required fields in each step
   - Don't skip any required questions
   - Take screenshots at each major step

6. REVIEW AND SUBMIT
   - On the final step, review all information
   - Look for any validation errors or missed required fields
   - Click "Submit application" or "Send application"
   - Do NOT click "Save as draft" - we want to submit

7. CONFIRMATION HANDLING
   - Wait for the confirmation screen/modal
   - Use extract_confirmation action to capture success details
   - Look for messages like:
     * "Your application was sent"
     * "Application submitted successfully"
     * "Thanks for applying"
   - Take a final screenshot of the confirmation

8. CAPTCHA AND ERROR HANDLING
   - Use detect_captcha action if any captchas appear
   - If the form has validation errors, try to fix them
   - If login is required at any point, stop and report
   - Document any errors encountered

9. 🚨 HANDLING UNKNOWN/MISSING DATA (CRITICAL)

   If you encounter a form field that requires information NOT in the candidate information above,
   you MUST use the 'request_missing_data' action to pause and ask the user.

   WHEN TO REQUEST DATA:
   - Field asks specifically about THIS company (e.g., "Why do you want to work at {job_data.company}?")
   - Field requires company-specific motivation or interest
   - Field asks for information not in the profile (referral code, specific dates, custom questions)
   - Field is a required essay or long-form question

   DO NOT request for standard fields already in profile:
   - Name, email, phone (we have these)
   - Resume (we have this)
   - Work authorization (we have this)
   - Years of experience (we have this)

   HOW TO REQUEST:
   ```
   result = await request_missing_data(
       field_name="why_{job_data.company.lower().replace(' ', '_')}",
       field_label="Why do you want to work at {job_data.company}?",
       field_type="textarea",
       required=True,
       context="Asking about specific motivation for applying to {job_data.company}",
       max_length=500
   )

   if result['success']:
       # Use the value to fill the field
       fill_field_with_value(result['value'])
   else:
       # User didn't respond or timed out
       # Skip if optional, or abort if required
   ```

   EXAMPLES OF FIELDS TO REQUEST:
   - "Why do you want to work at {job_data.company}?" → request_missing_data
   - "Why are you interested in this specific role?" → request_missing_data
   - "What excites you about this opportunity?" → request_missing_data
   - "Do you have a referral code?" → request_missing_data
   - "When can you start?" (if asking for specific date) → request_missing_data

IMPORTANT LINKEDIN-SPECIFIC GUIDELINES:
- LinkedIn Easy Apply is typically 1-4 steps maximum
- Most profile information should be pre-filled
- Don't attempt to log in - the user should already be logged in
- Be careful with dropdown selections - choose the most appropriate option
- LinkedIn has rate limiting - be respectful with requests
- If Easy Apply is not available, report this clearly
- Handle dynamic loading - LinkedIn pages load content progressively

EXPECTED OUTCOME:
Successfully submit the Easy Apply application and provide confirmation of submission.

FAILURE CONDITIONS TO REPORT:
- Not logged into LinkedIn
- Easy Apply not available for this job
- Login required during process
- Form submission failed with errors
"""

        return task

    async def apply_to_job(self, user_profile: UserProfile, job_data: JobData) -> ApplicationResult:
        """
        Apply to a LinkedIn job posting using Easy Apply

        UNIFIED VERSION: Works in both SERVER and DESKTOP modes

        Args:
            user_profile: Candidate's profile information
            job_data: Job posting details

        Returns:
            ApplicationResult with detailed outcome
        """
        self.logger.info(f"Starting LinkedIn Easy Apply for {job_data.title} at {job_data.company}")
        self.logger.info(f"Execution mode: {self.context.mode.value}")

        # Validate that this is a LinkedIn URL
        if not self.can_handle_url(job_data.apply_url):
            error_msg = f"URL {job_data.apply_url} is not a valid LinkedIn job posting"
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

        # Add LinkedIn-specific metadata
        if result:
            result.performance_metrics.update({
                "linkedin_version": "1.0.0",
                "execution_mode": self.context.mode.value,
                "url_pattern_matched": self._get_matched_pattern(job_data.apply_url),
                "easy_apply_compatible": self._is_easy_apply_url(job_data.apply_url),
                "user_profile_completeness": self._calculate_profile_completeness(user_profile)
            })

        self.logger.info(f"LinkedIn Easy Apply completed: {result.status if result else 'Failed'}")
        return result

    def _validate_user_profile(self, user_profile: UserProfile) -> List[str]:
        """Validate that user profile has required fields for LinkedIn Easy Apply"""
        errors = []

        if not user_profile.first_name.strip():
            errors.append("First name is required")

        if not user_profile.last_name.strip():
            errors.append("Last name is required")

        if not user_profile.email:
            errors.append("Email is required")

        if not user_profile.phone.strip():
            errors.append("Phone number is required")

        # LinkedIn Easy Apply often requires a resume
        if not user_profile.get_resume_path():
            errors.append("Resume is highly recommended for LinkedIn Easy Apply")
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

    def _is_easy_apply_url(self, url: str) -> bool:
        """Check if URL likely supports Easy Apply (heuristic)"""
        # Most LinkedIn job URLs support Easy Apply, but some redirect to external sites
        return "linkedin.com/jobs" in url.lower()

    def _calculate_profile_completeness(self, user_profile: UserProfile) -> float:
        """Calculate what percentage of LinkedIn-relevant profile fields are filled"""
        linkedin_fields = [
            'current_title', 'years_experience', 'linkedin_url',
            'current_location', 'work_authorization', 'skills',
            'cover_letter'
        ]

        filled_fields = sum(1 for field in linkedin_fields
                           if getattr(user_profile, field, None))

        return (filled_fields / len(linkedin_fields)) * 100


async def main():
    """Test the LinkedIn automation with sample data"""
    try:
        from ...core.execution_context import ExecutionContext, ExecutionMode

        # Sample user profile
        user_profile = UserProfile(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="123-456-7890",
            resume_local_path="resume.pdf",
            current_title="Software Engineer",
            years_experience=5,
            skills=["Python", "JavaScript", "React", "Node.js"],
            current_location="San Francisco, CA",
            linkedin_url="https://linkedin.com/in/johndoe",
            work_authorization="citizen"
        )

        # Sample LinkedIn job data
        job_data = JobData(
            job_id="linkedin_test_123",
            title="Senior Software Engineer",
            company="Test Company",
            apply_url="https://www.linkedin.com/jobs/view/1234567890",
            location="San Francisco, CA",
            job_type="full-time"
        )

        # Create execution context (DESKTOP mode for testing)
        context = ExecutionContext(
            mode=ExecutionMode.DESKTOP,
            user_profile={"name": "John Doe"}
        )

        # Run the automation
        automation = LinkedInAutomation(context)
        result = await automation.apply_to_job(user_profile, job_data)

        print("\n" + "="*60)
        print("LINKEDIN EASY APPLY AUTOMATION TEST RESULT (UNIFIED VERSION)")
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
