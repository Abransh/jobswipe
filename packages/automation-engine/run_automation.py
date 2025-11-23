#!/usr/bin/env python3
"""
JobSwipe Automation - Universal Entry Point
Works for both DESKTOP and SERVER modes

Usage:
  Set environment variables and run this script.
  It will execute the appropriate automation based on job URL.

Environment Variables:
  USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL, USER_PHONE
  USER_RESUME_LOCAL_PATH or USER_RESUME_PATH
  JOB_TITLE, JOB_COMPANY, JOB_APPLY_URL
  EXECUTION_MODE (desktop or server)
  AUTOMATION_HEADLESS (true or false)
  GOOGLE_API_KEY (for Gemini LLM)
"""
import sys
import os
import json
import asyncio
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from greenhouse_automation import GreenhouseAutomation
except ImportError as e:
    logger.error(f"Failed to import GreenhouseAutomation: {e}")
    logger.error("Make sure greenhouse_automation.py is in the same directory")
    print(json.dumps({
        'success': False,
        'message': f'Import error: {str(e)}'
    }))
    sys.exit(1)


def get_env_var(name: str, required: bool = True, default: str = '') -> str:
    """Get environment variable with validation"""
    value = os.getenv(name, default)
    if required and not value:
        logger.error(f"Missing required environment variable: {name}")
        raise ValueError(f"Missing required environment variable: {name}")
    return value


async def main():
    """Main entry point"""
    try:
        logger.info("🚀 JobSwipe Automation Starting...")
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Working directory: {os.getcwd()}")

        # Read user data from environment
        user_first_name = get_env_var('USER_FIRST_NAME')
        user_last_name = get_env_var('USER_LAST_NAME')
        user_email = get_env_var('USER_EMAIL')
        user_phone = get_env_var('USER_PHONE')
        user_resume_path = get_env_var('USER_RESUME_LOCAL_PATH', required=False) or \
                          get_env_var('USER_RESUME_PATH', required=False)

        # Read job data from environment
        job_title = get_env_var('JOB_TITLE')
        job_company = get_env_var('JOB_COMPANY')
        job_apply_url = get_env_var('JOB_APPLY_URL')

        # Read execution settings
        execution_mode = get_env_var('EXECUTION_MODE', required=False, default='desktop')
        headless = get_env_var('AUTOMATION_HEADLESS', required=False, default='false').lower() == 'true'

        # Validate API key
        google_api_key = os.getenv('GOOGLE_API_KEY')
        if not google_api_key:
            logger.warning("⚠️  GOOGLE_API_KEY not set - automation may fail!")

        logger.info(f"📋 Execution mode: {execution_mode}")
        logger.info(f"📋 Headless: {headless}")
        logger.info(f"👤 User: {user_first_name} {user_last_name}")
        logger.info(f"💼 Job: {job_title} at {job_company}")
        logger.info(f"🔗 URL: {job_apply_url}")

        if user_resume_path:
            logger.info(f"📄 Resume: {user_resume_path}")
            if not Path(user_resume_path).exists():
                logger.warning(f"⚠️  Resume file not found: {user_resume_path}")
        else:
            logger.warning("⚠️  No resume path provided")

        # Prepare data structures
        user_data = {
            'first_name': user_first_name,
            'last_name': user_last_name,
            'email': user_email,
            'phone': user_phone,
            'resume_path': user_resume_path
        }

        job_data = {
            'title': job_title,
            'company': job_company,
            'apply_url': job_apply_url
        }

        # Detect company type from URL
        url_lower = job_apply_url.lower()
        if 'greenhouse' in url_lower:
            logger.info("🏢 Detected: Greenhouse ATS")
            automation = GreenhouseAutomation(headless=headless)
        else:
            logger.info("🏢 Using: Greenhouse automation (default)")
            automation = GreenhouseAutomation(headless=headless)

        # Run automation
        logger.info("▶️  Starting automation...")
        result = await automation.apply(user_data, job_data)

        logger.info(f"✅ Automation completed: {result.get('success', False)}")

        # Output JSON to stdout (TypeScript reads this)
        print(json.dumps(result))

        # Exit with appropriate code
        sys.exit(0 if result.get('success', False) else 1)

    except ValueError as e:
        # Validation errors
        error_msg = str(e)
        logger.error(f"❌ Validation error: {error_msg}")
        print(json.dumps({
            'success': False,
            'message': error_msg
        }))
        sys.exit(1)

    except Exception as e:
        # Unexpected errors
        error_msg = str(e)
        logger.error(f"❌ Unexpected error: {error_msg}", exc_info=True)
        print(json.dumps({
            'success': False,
            'message': f'Unexpected error: {error_msg}'
        }))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
