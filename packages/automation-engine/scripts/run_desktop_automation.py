#!/usr/bin/env python3
"""
Desktop Automation Wrapper Script
Bridges TypeScript SimplifiedAutomationService with Python unified automation engine
"""

import sys
import os
import json
import asyncio
import traceback
from pathlib import Path

# Add automation engine to path
engine_path = Path(__file__).parent.parent
sys.path.insert(0, str(engine_path))

from src.integrations.desktop_integration import execute_desktop_automation


async def main():
    """
    Main entry point for desktop automation
    Reads data from environment variables or data file, executes automation, outputs JSON result
    """

    try:
        # Check if data file is provided
        data_file = os.getenv('JOBSWIPE_DATA_FILE')

        if data_file and os.path.exists(data_file):
            # Read from data file (legacy compatibility)
            with open(data_file, 'r') as f:
                data = json.load(f)

            user_profile = data.get('user_profile', {})
            job_data = data.get('job_data', {})
            automation_config = data.get('automation_config', {})
            browser_profile_path = user_profile.get('browser_profile_path')

        else:
            # Read from environment variables (new method)
            user_id = os.getenv('USER_ID')
            job_id = os.getenv('JOB_ID')
            application_id = os.getenv('APPLICATION_ID')

            if not all([user_id, job_id, application_id]):
                raise ValueError("Missing required environment variables: USER_ID, JOB_ID, APPLICATION_ID")

            # Read user profile
            user_profile = {
                "first_name": os.getenv('USER_FIRST_NAME'),
                "last_name": os.getenv('USER_LAST_NAME'),
                "email": os.getenv('USER_EMAIL'),
                "phone": os.getenv('USER_PHONE'),
              #  "resume_local_path": os.getenv('USER_RESUME_LOCAL_PATH'),
               # "resume_url": os.getenv('USER_RESUME_URL'),
                "current_title": os.getenv('USER_CURRENT_TITLE'),
                "years_experience": int(os.getenv('USER_YEARS_EXPERIENCE', '0')) or None,
                "skills": json.loads(os.getenv('USER_SKILLS', '[]')),
                "current_location": os.getenv('USER_CURRENT_LOCATION'),
                "linkedin_url": os.getenv('USER_LINKEDIN_URL'),
                "work_authorization": os.getenv('USER_WORK_AUTHORIZATION'),
                "cover_letter": os.getenv('USER_COVER_LETTER')
            }

            # Read job data
            job_data = {
                "job_id": job_id,
                "title": os.getenv('JOB_TITLE'),
                "company": os.getenv('JOB_COMPANY'),
                "apply_url": os.getenv('JOB_APPLY_URL'),
                "location": os.getenv('JOB_LOCATION'),
                "description": os.getenv('JOB_DESCRIPTION')
            }

            # Browser profile path (optional)
            browser_profile_path = os.getenv('BROWSER_PROFILE_PATH')
            application_id = os.getenv('APPLICATION_ID', 'unknown')

        # Execute automation using unified engine (DESKTOP mode)
        print(f"🚀 Starting desktop automation for {job_data['title']} at {job_data['company']}", file=sys.stderr)

        if browser_profile_path:
            print(f"✅ Using browser profile: {browser_profile_path}", file=sys.stderr)
        else:
            print(f"ℹ️ No browser profile specified - using default", file=sys.stderr)

        result = await execute_desktop_automation(
            user_profile=user_profile,
            job_data=job_data,
            browser_profile_path=browser_profile_path
        )

        # Convert result to JSON format expected by TypeScript service
        output = {
            "success": result.success,
            "application_id": result.application_id or application_id,
            "confirmation_number": result.confirmation_number,
            "execution_time_ms": result.total_duration_ms or 0,
            "company_automation": result.company_automation,
            "status": result.status.value,
            "error_message": result.error_message,
            "steps": [
                {
                    "step_name": step.step_name,
                    "action": step.action,
                    "success": step.success,
                    "timestamp": step.timestamp.isoformat(),
                    "duration_ms": step.duration_ms,
                    "error_message": step.error_message
                }
                for step in result.steps
            ],
            "screenshots": result.screenshots,
            "captcha_events": [
                {
                    "captcha_type": event.captcha_type.value,
                    "detected_at": event.detected_at.isoformat(),
                    "resolved": event.resolved,
                    "resolution_method": event.resolution_method
                }
                for event in result.captcha_events
            ],
            "steps_completed": result.steps_completed,
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "execution_mode": "desktop"
        }

        # Output JSON result to stdout (TypeScript service reads this)
        print(json.dumps(output))

        # Exit with appropriate code
        sys.exit(0 if result.success else 1)

    except Exception as e:
        error_output = {
            "success": False,
            "application_id": os.getenv('APPLICATION_ID', 'unknown'),
            "execution_time_ms": 0,
            "company_automation": "unknown",
            "status": "failed",
            "error_message": str(e),
            "steps": [],
            "screenshots": [],
            "captcha_events": [],
            "steps_completed": 0,
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "execution_mode": "desktop"
        }

        print(f"❌ Automation failed: {e}", file=sys.stderr)
        print(f"Traceback:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

        # Output error result
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
