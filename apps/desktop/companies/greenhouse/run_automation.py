#!/usr/bin/env python3
"""
Greenhouse Automation Runner
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
from greenhouse import GreenhouseAutomation


async def main():
    """Main execution function"""
    start_time = datetime.now()
    user_profile = None
    job_data = None
    automation = None
    
    try:
        print("🚀 Starting automation main function...")
        
        # Detect execution mode
        data_source = os.getenv('DATA_SOURCE', 'file')  # database | file | bridge
        print(f"📊 Data source detected: {data_source}")
        
        # Create automation instance
        print("🏗️ Creating GreenhouseAutomation instance...")
        automation = GreenhouseAutomation()
        print("✅ GreenhouseAutomation instance created successfully")
        
        if data_source == 'database':
            print("💾 Using database mode...")
            # Database mode - get user and job data from database
            user_profile, job_data = await automation.get_automation_data()
            
            if not user_profile or not job_data:
                raise ValueError("Failed to load user profile or job data from database")
                
        else:
            print(f"📁 Using file mode (data_source: {data_source})...")
            # File mode - existing behavior and bridge mode (from PythonBridge)
            data_file_path = os.getenv('JOB_DATA_FILE') or os.getenv('JOBSWIPE_DATA_FILE')
            print(f"📂 Data file path: {data_file_path}")
            
            # Enhanced debugging for bridge mode
            if not data_file_path:
                print("❌ ERROR: No data file path found in environment variables")
                print("🔍 Available environment variables:")
                for key, value in os.environ.items():
                    if 'DATA' in key or 'JOB' in key or 'FILE' in key:
                        print(f"   {key}={value}")
                raise FileNotFoundError("No data file path specified in environment variables")
            
            print(f"🔍 Checking if data file exists: {data_file_path}")
            data_path = Path(data_file_path)
            
            if not data_path.exists():
                print(f"❌ ERROR: Data file does not exist: {data_file_path}")
                print(f"📁 Parent directory exists: {data_path.parent.exists()}")
                print(f"📁 Parent directory contents: {list(data_path.parent.iterdir()) if data_path.parent.exists() else 'N/A'}")
                raise FileNotFoundError(f"Data file not found: {data_file_path}")
            
            print(f"✅ Data file found, size: {data_path.stat().st_size} bytes")
            print("📖 Loading automation data from file...")
            
            try:
                # Load automation data
                with open(data_file_path, 'r') as f:
                    data = json.load(f)
                print(f"✅ JSON data loaded successfully, keys: {list(data.keys())}")
            except Exception as e:
                print(f"❌ ERROR: Failed to load/parse JSON data: {e}")
                print("📄 File contents preview:")
                try:
                    with open(data_file_path, 'r') as f:
                        content = f.read(500)  # First 500 chars
                        print(content)
                except Exception as read_error:
                    print(f"❌ Could not read file: {read_error}")
                raise
            
            print("🔍 Validating and creating data objects...")
            try:
                # Validate and create data objects
                user_profile, job_data = validate_automation_data(
                    data['user_profile'], 
                    data['job_data']
                )
                print(f"✅ Data validation successful - User: {user_profile.get_full_name()}, Job: {job_data.title}")
            except Exception as e:
                print(f"❌ ERROR: Data validation failed: {e}")
                print(f"📊 Available data keys: {list(data.keys())}")
                if 'user_profile' in data:
                    print(f"👤 User profile keys: {list(data['user_profile'].keys())}")
                if 'job_data' in data:
                    print(f"💼 Job data keys: {list(data['job_data'].keys())}")
                raise
        
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
        # Calculate execution time
        execution_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Enhanced error information
        print(f"❌ EXCEPTION OCCURRED: {type(e).__name__}: {str(e)}")
        if hasattr(e, '__traceback__'):
            import traceback
            print("🔍 Full traceback:")
            traceback.print_exc()
        
        # Gather context information
        context_info = {
            "data_source": os.getenv('DATA_SOURCE', 'unknown'),
            "data_file_path": os.getenv('JOB_DATA_FILE'),
            "user_profile_loaded": user_profile is not None,
            "job_data_loaded": job_data is not None,
            "automation_created": automation is not None,
            "working_directory": os.getcwd(),
            "python_version": sys.version,
        }
        
        print(f"🔍 Context: {json.dumps(context_info, indent=2)}")
        
        # Output error in JSON format
        error_output = {
            "success": False,
            "error_message": f"{type(e).__name__}: {str(e)}",
            "timestamp": datetime.now().isoformat(),
            "execution_time_ms": execution_time_ms,
            "steps_completed": 0,
            "status": "failed",
            "steps": [],
            "screenshots": [],
            "captcha_events": [],
            "performance_metrics": context_info
        }
        
        print("📤 Final JSON output:")
        print(json.dumps(error_output, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())