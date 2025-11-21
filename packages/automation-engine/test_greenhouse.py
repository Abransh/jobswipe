#!/usr/bin/env python3
"""
Test Greenhouse Automation with Optimized Settings
Compares performance between old and new configuration
"""

import asyncio
import os
import sys
from pathlib import Path

# Add automation engine to path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from src.core.execution_context import ExecutionContext, ExecutionMode
from src.companies.greenhouse.greenhouse_automation import GreenhouseAutomation
from src.companies.base.user_profile import UserProfile, JobData

load_dotenv()

async def test_greenhouse_automation():
    """Test greenhouse automation with real job application"""

    print("=" * 80)
    print("🧪 TESTING GREENHOUSE AUTOMATION (OPTIMIZED)")
    print("=" * 80)

    # Sample user profile (using your example.py data)
    user_profile = UserProfile(
        first_name="aarav",
        last_name="singh",
        email="abransh05@gmail.com",
        phone="+91 987654321",
        resume_local_path="cv_04_24.pdf",  # Make sure this file exists
        current_title="Student",
        years_experience=3,
        skills=["Python", "JavaScript", "React"],
        current_location="New delhi",
        linkedin_url="https://www.linkedin.com/in/aarav-singh-05/",
        work_authorization="allowed"
    )

    # Sample job data (Anthropic job from example.py)
    job_data = JobData(
        job_id="test_greenhouse_001",
        title="Cloud GTM Partnerships Lead",
        company="Anthropic",
        apply_url="https://job-boards.greenhouse.io/anthropic/jobs/4962959008",
        location="Remote",
        job_type="full-time"
    )

    print(f"\n📋 Test Configuration:")
    print(f"  User: {user_profile.get_full_name()}")
    print(f"  Job: {job_data.title} at {job_data.company}")
    print(f"  URL: {job_data.apply_url}")
    print(f"  Resume: {user_profile.resume_local_path}")

    # Check if resume exists
    if not Path(user_profile.resume_local_path).exists():
        print(f"\n⚠️  WARNING: Resume file not found at {user_profile.resume_local_path}")
        print("The automation will continue but may fail at file upload step.")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            print("Test cancelled.")
            return

    # Create execution context (DESKTOP mode)
    print("\n🔧 Creating Execution Context...")
    context = ExecutionContext(
        mode=ExecutionMode.DESKTOP,
        user_profile={"name": user_profile.get_full_name()}
    )

    print(f"  ✅ Mode: {context.mode.value}")
    print(f"  ✅ LLM: {type(context.llm).__name__}")
    print(f"  ✅ Browser Profile configured")

    # Create greenhouse automation
    print("\n🏭 Creating Greenhouse Automation...")
    automation = GreenhouseAutomation(context)
    print(f"  ✅ Automation initialized")

    # Run the automation
    print("\n🚀 Starting Automation...")
    print("=" * 80)

    try:
        import time
        start_time = time.time()

        result = await automation.apply_to_job(user_profile, job_data)

        end_time = time.time()
        duration = end_time - start_time

        print("=" * 80)
        print("\n📊 AUTOMATION RESULT")
        print("=" * 80)
        print(f"Status: {result.status}")
        print(f"Success: {result.success}")
        print(f"Duration: {duration:.2f}s ({result.total_duration_ms}ms)")
        print(f"Steps completed: {result.steps_completed}/{result.total_steps}")

        if result.success:
            print(f"\n✅ APPLICATION SUBMITTED SUCCESSFULLY!")
            if result.confirmation_number:
                print(f"Confirmation Number: {result.confirmation_number}")
        else:
            print(f"\n❌ APPLICATION FAILED")
            print(f"Error: {result.error_message}")
            print(f"Error Type: {result.error_type}")

        print(f"\nScreenshots: {len(result.screenshots)}")
        if result.screenshots:
            for screenshot in result.screenshots:
                print(f"  - {screenshot}")

        print(f"\nCaptchas encountered: {len(result.captcha_events)}")
        if result.captcha_events:
            for event in result.captcha_events:
                print(f"  - {event.captcha_type}: Resolved={event.resolved}")

        # Print detailed steps
        print("\n📝 Automation Steps:")
        for i, step in enumerate(result.steps, 1):
            status = "✅" if step.success else "❌"
            print(f"{i}. {status} {step.step_name}: {step.action}")
            if step.duration_ms:
                print(f"   Duration: {step.duration_ms}ms")
            if step.error_message:
                print(f"   Error: {step.error_message}")

        print("\n" + "=" * 80)

        # Save result to file
        result_file = f"test_result_{job_data.job_id}.json"
        with open(result_file, 'w') as f:
            f.write(result.to_json())
        print(f"\n💾 Full result saved to: {result_file}")

    except Exception as e:
        print("=" * 80)
        print(f"\n❌ AUTOMATION FAILED WITH EXCEPTION")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("\n🔍 Checking GOOGLE_API_KEY...")
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ ERROR: GOOGLE_API_KEY environment variable not set!")
        print("Please set it in your .env file or export it:")
        print("  export GOOGLE_API_KEY='your-api-key-here'")
        sys.exit(1)
    print("✅ GOOGLE_API_KEY found\n")

    asyncio.run(test_greenhouse_automation())
