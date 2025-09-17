#!/usr/bin/env python3
"""
LinkedIn Easy Apply Automation Runner
Standalone script that can be executed by the Electron app
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Add parent directories to path
current_dir = Path(__file__).parent.resolve()
base_dir = current_dir.parent / "base"

# Ensure the base directory exists and add it to Python path
if base_dir.exists():
    sys.path.insert(0, str(base_dir))
else:
    # Fallback: try to find base directory relative to script location
    fallback_base = Path(__file__).parent.parent / "base"
    if fallback_base.exists():
        sys.path.insert(0, str(fallback_base.resolve()))
    else:
        # Final fallback: add companies directory to path
        companies_dir = Path(__file__).parent.parent
        sys.path.insert(0, str(companies_dir.resolve()))
        sys.path.insert(0, str((companies_dir / "base").resolve()))

from user_profile import UserProfile, JobData, validate_automation_data
from result_handler import ApplicationResult
from linkedin import LinkedInAutomation


async def main():
    """Main execution function"""
    try:
        # Get data file path from environment variable (set by TypeScript PythonBridge)
        data_file_path = os.getenv('JOB_DATA_FILE')

        if not data_file_path or not Path(data_file_path).exists():
            # Fallback for backward compatibility
            data_file_path = os.getenv('JOBSWIPE_DATA_FILE')
            if not data_file_path or not Path(data_file_path).exists():
                raise FileNotFoundError(f"Data file not found. Checked both JOB_DATA_FILE and JOBSWIPE_DATA_FILE environment variables.")

        # Load automation data
        with open(data_file_path, 'r') as f:
            data = json.load(f)

        # Extract data based on TypeScript PythonBridge format
        user_profile_data = data.get('user_profile', {})
        job_data_raw = data.get('job_data', {})
        metadata = data.get('metadata', {})

        # Convert TypeScript format to Python format
        # TypeScript uses snake_case, Python UserProfile expects consistent naming
        python_user_profile = {
            'first_name': user_profile_data.get('first_name'),
            'last_name': user_profile_data.get('last_name'),
            'email': user_profile_data.get('email'),
            'phone': user_profile_data.get('phone', '000-000-0000'),
            'resume_url': user_profile_data.get('resume_url'),
            'resume_local_path': user_profile_data.get('resume_local_path'),
            'current_title': user_profile_data.get('current_title'),
            'years_experience': user_profile_data.get('years_experience', 2),
            'skills': user_profile_data.get('skills', []),
            'linkedin_url': user_profile_data.get('linkedin_url'),
            'current_location': user_profile_data.get('current_location'),
            'work_authorization': user_profile_data.get('work_authorization'),
            'cover_letter': user_profile_data.get('cover_letter'),
            'custom_fields': user_profile_data.get('custom_fields', {})
        }

        python_job_data = {
            'job_id': job_data_raw.get('job_id'),
            'title': job_data_raw.get('title'),
            'company': job_data_raw.get('company'),
            'apply_url': job_data_raw.get('apply_url'),
            'location': job_data_raw.get('location'),
            'description': job_data_raw.get('description'),
            'requirements': job_data_raw.get('requirements', [])
        }

        # Validate and create data objects
        user_profile, job_data = validate_automation_data(
            python_user_profile,
            python_job_data
        )
        
        # Create automation instance
        automation = LinkedInAutomation()
        
        # Run the automation
        result = await automation.apply_to_job(user_profile, job_data)
        
        # Convert result to output format expected by TypeScript PythonBridge
        # This matches the PythonExecutionResult interface in PythonBridge.ts
        output = {
            "success": result.success,
            "applicationId": metadata.get('applicationId', result.application_id),
            "correlationId": metadata.get('correlationId', ''),
            "executionTimeMs": result.total_duration_ms,
            "confirmationNumber": result.confirmation_number,
            "error": result.error_message,
            "steps": [
                {
                    "stepName": step.step_name,
                    "action": step.action,
                    "success": step.success,
                    "timestamp": step.timestamp.isoformat(),
                    "durationMs": step.duration_ms,
                    "errorMessage": step.error_message
                }
                for step in result.steps
            ],
            "screenshots": result.screenshots,
            "captchaEvents": [
                {
                    "captchaType": event.captcha_type.value if hasattr(event.captcha_type, 'value') else str(event.captcha_type),
                    "detectedAt": event.detected_at.isoformat(),
                    "resolved": event.resolved,
                    "resolutionMethod": event.resolution_method
                }
                for event in result.captcha_events
            ],
            "metadata": {
                "pythonVersion": sys.version,
                "aiModel": "anthropic-claude",  # Default AI model
                "browserVersion": "playwright-latest",
                "proxyUsed": os.getenv('PROXY_HOST', None),
                "serverInfo": {
                    "executionMode": "server",
                    "automationType": "linkedin",
                    "timestamp": datetime.now().isoformat(),
                    **result.performance_metrics
                }
            }
        }
        
        # Output JSON result (this will be parsed by TypeScript)
        print(json.dumps(output, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result.success else 1)
        
    except Exception as e:
        # Output error in JSON format matching TypeScript PythonExecutionResult interface
        error_output = {
            "success": False,
            "applicationId": os.getenv('APPLICATION_ID', ''),
            "correlationId": os.getenv('CORRELATION_ID', ''),
            "executionTimeMs": 0,
            "confirmationNumber": None,
            "error": str(e),
            "steps": [],
            "screenshots": [],
            "captchaEvents": [],
            "metadata": {
                "pythonVersion": sys.version,
                "aiModel": "anthropic-claude",
                "browserVersion": "playwright-latest",
                "proxyUsed": os.getenv('PROXY_HOST', None),
                "serverInfo": {
                    "executionMode": "server",
                    "automationType": "linkedin",
                    "timestamp": datetime.now().isoformat(),
                    "errorType": "execution_failed",
                    "errorDetails": str(e)
                }
            }
        }
        
        print(json.dumps(error_output, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())