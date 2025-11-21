#!/usr/bin/env python3
"""
Server Automation Wrapper Script
Bridges TypeScript ServerAutomationService with Python unified automation engine
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

# Try to import with better error handling
try:
    from src.integrations.server_integration import execute_server_automation
    from src.core.proxy_manager import ProxyServer, ProxyManager
    import browser_use
    from browser_use.logging_config import setup_logging
except ImportError as e:
    # Log the import error to stderr
    print(f"❌ IMPORT ERROR: {str(e)}", file=sys.stderr)
    print(f"Traceback:", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)

    # Return error JSON to stdout
    error_output = {
        "success": False,
        "application_id": os.getenv('APPLICATION_ID', 'unknown'),
        "execution_time_ms": 0,
        "company_automation": "unknown",
        "status": "failed",
        "error_message": f"Import error: {str(e)}. Run: pip install -r requirements.txt",
        "steps": [],
        "screenshots": [],
        "captcha_events": [],
        "steps_completed": 0,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }
    print(json.dumps(error_output))
    sys.exit(1)


async def main():
    """
    Main entry point for server automation
    Reads data from environment variables OR data file, executes automation, outputs JSON result
    """
    # Configure browser-use logging to stderr to avoid polluting stdout (which is used for JSON result)
    setup_logging(stream=sys.stderr)
    print(f"🔍 Browser-Use Location: {os.path.dirname(browser_use.__file__)}", file=sys.stderr)

    try:
        # Read configuration from environment variables
        user_id = os.getenv('USER_ID')
        job_id = os.getenv('JOB_ID')
        application_id = os.getenv('APPLICATION_ID')

        if not all([user_id, job_id, application_id]):
            raise ValueError("Missing required environment variables: USER_ID, JOB_ID, APPLICATION_ID")

        # Try to read from JOB_DATA_FILE first (contains complete structured data)
        job_data_file = os.getenv('JOB_DATA_FILE')
        user_profile = None
        job_data = None
        proxy_config = None

        if job_data_file and os.path.exists(job_data_file):
            print(f"📄 Reading data from file: {job_data_file}", file=sys.stderr)
            try:
                with open(job_data_file, 'r') as f:
                    data_payload = json.load(f)
                    user_profile = data_payload.get('user_profile', {})
                    job_data = data_payload.get('job_data', {})
                    proxy_config_data = data_payload.get('proxy_config')
                    if proxy_config_data:
                        proxy_config = {
                            "enabled": True,
                            "host": proxy_config_data.get('host'),
                            "port": proxy_config_data.get('port'),
                            "username": proxy_config_data.get('username'),
                            "password": proxy_config_data.get('password'),
                            "type": proxy_config_data.get('type', 'http')
                        }
                print(f"✅ Data loaded from file successfully", file=sys.stderr)
            except Exception as e:
                print(f"⚠️ Failed to read data file, falling back to environment variables: {e}", file=sys.stderr)

        # Fallback: Read from environment variables if file not available or parsing failed
        if not user_profile:
            print(f"📋 Reading user profile from environment variables", file=sys.stderr)
            user_profile = {
                "first_name": os.getenv('USER_FIRST_NAME'),
                "last_name": os.getenv('USER_LAST_NAME'),
                "email": os.getenv('USER_EMAIL'),
                "phone": os.getenv('USER_PHONE'),
                "resume_url": os.getenv('USER_RESUME_URL'),
                "resume_local_path": os.getenv('USER_RESUME_LOCAL_PATH'),
                "current_title": os.getenv('USER_CURRENT_TITLE'),
                "years_experience": int(os.getenv('USER_YEARS_EXPERIENCE', '0')) or None,
                "skills": json.loads(os.getenv('USER_SKILLS', '[]')),
                "current_location": os.getenv('USER_CURRENT_LOCATION'),
                "linkedin_url": os.getenv('USER_LINKEDIN_URL'),
                "work_authorization": os.getenv('USER_WORK_AUTHORIZATION'),
                "cover_letter": os.getenv('USER_COVER_LETTER')
            }

        if not job_data:
            print(f"📋 Reading job data from environment variables", file=sys.stderr)
            job_data = {
                "job_id": job_id,
                "title": os.getenv('JOB_TITLE'),
                "company": os.getenv('JOB_COMPANY'),
                "apply_url": os.getenv('JOB_APPLY_URL'),
                "location": os.getenv('JOB_LOCATION'),
                "description": os.getenv('JOB_DESCRIPTION')
            }

        # Read proxy configuration from environment if not loaded from file
        if not proxy_config:
            proxy_config_str = os.getenv('PROXY_CONFIG')
            if proxy_config_str:
                try:
                    proxy_data = json.loads(proxy_config_str)
                    proxy_config = {
                        "enabled": True,
                        "host": proxy_data.get('host'),
                        "port": proxy_data.get('port'),
                        "username": proxy_data.get('username'),
                        "password": proxy_data.get('password'),
                        "type": proxy_data.get('type', 'http')
                    }
                except json.JSONDecodeError:
                    print(f"⚠️ Failed to parse proxy configuration from environment", file=sys.stderr)

        # Validate required user profile fields
        required_user_fields = ['first_name', 'last_name', 'email', 'phone']
        missing_user_fields = [field for field in required_user_fields if not user_profile.get(field)]
        if missing_user_fields:
            raise ValueError(f"Missing required user profile fields: {', '.join(missing_user_fields)}")

        # Validate required job data fields
        required_job_fields = ['title', 'company', 'apply_url']
        missing_job_fields = [field for field in required_job_fields if not job_data.get(field)]
        if missing_job_fields:
            raise ValueError(f"Missing required job data fields: {', '.join(missing_job_fields)}")

        if proxy_config:
            print(f"✅ Using proxy: {proxy_config.get('host')}:{proxy_config.get('port')}", file=sys.stderr)

        # Execute automation using unified engine
        print(f"🚀 Starting server automation for {job_data['title']} at {job_data['company']}", file=sys.stderr)

        result = await execute_server_automation(
            user_profile=user_profile,
            job_data=job_data,
            proxy_config=proxy_config
        )

        # Convert result to JSON format expected by TypeScript service
        output = {
            "success": result.success,
            "application_id": application_id,
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
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
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
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        }

        print(f"❌ Automation failed: {e}", file=sys.stderr)
        print(f"Traceback:", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

        # Output error result
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
