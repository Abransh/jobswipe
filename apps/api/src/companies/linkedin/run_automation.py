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
current_dir = Path(__file__).parent
base_dir = current_dir.parent / "base"
sys.path.append(str(base_dir))

from user_profile import UserProfile, JobData, validate_automation_data
from result_handler import ApplicationResult
from linkedin import LinkedInAutomation


async def main():
    """Main execution function"""
    try:
        # Get data file path from environment variable
        data_file_path = os.getenv('JOBSWIPE_DATA_FILE')
        
        if not data_file_path or not Path(data_file_path).exists():
            raise FileNotFoundError(f"Data file not found: {data_file_path}")
        
        # Load automation data
        with open(data_file_path, 'r') as f:
            data = json.load(f)
        
        # Validate and create data objects
        user_profile, job_data = validate_automation_data(
            data['user_profile'], 
            data['job_data']
        )
        
        # Create automation instance
        automation = LinkedInAutomation()
        
        # Run the automation
        result = await automation.apply_to_job(user_profile, job_data)
        
        # Convert result to output format expected by TypeScript
        output = {
            "success": result.success,
            "application_id": result.application_id,
            "confirmation_number": result.confirmation_number,
            "execution_time_ms": result.total_duration_ms,
            "error_message": result.error_message,
            "steps_completed": result.steps_completed,
            "status": result.status.value,
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
            "performance_metrics": result.performance_metrics,
            "timestamp": datetime.now().isoformat()
        }
        
        # Output JSON result (this will be parsed by TypeScript)
        print(json.dumps(output, indent=2))
        
        # Exit with appropriate code
        sys.exit(0 if result.success else 1)
        
    except Exception as e:
        # Output error in JSON format
        error_output = {
            "success": False,
            "error_message": str(e),
            "timestamp": datetime.now().isoformat(),
            "execution_time_ms": 0,
            "steps_completed": 0,
            "status": "failed",
            "steps": [],
            "screenshots": [],
            "captcha_events": [],
            "performance_metrics": {}
        }
        
        print(json.dumps(error_output, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())