#!/usr/bin/env python3
"""
Real JobSwipe Automation Test
Test the system with actual job posting and API key
"""

import asyncio
import os
import tempfile
from pathlib import Path

# Add paths
import sys
sys.path.append(str(Path(__file__).parent / "base"))
sys.path.append(str(Path(__file__).parent / "greenhouse"))

from user_profile import UserProfile, JobData, AutomationConfig
from greenhouse import GreenhouseAutomation

async def test_real_automation():
    """Test real automation with actual job posting"""
    
    # Set API key
    os.environ['GOOGLE_API_KEY'] = "AIzaSyDXKwpBg5ReYC3JqWR7f5y7-qWuW_ahPnY"
    
    print("🚀 Starting Real JobSwipe Automation Test")
    print("=" * 60)
    print(f"🎯 Target: Airbnb Job Application")
    print(f"🌐 URL: https://job-boards.greenhouse.io/doordashusa/jobs/7118562")
    print(f"🤖 AI Model: Google Gemini 1.5 Pro")
    print(f"🖥️  Mode: Headful (you'll see the browser)")
    print("=" * 60)
    
    # Create a test resume file
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_resume:
        resume_content = """This is a test resume file for automation testing.
        
John Doe
Software Engineer
Email: john.doe@example.com
Phone: 123-456-7890

Experience:
- 5 years in software development
- Python, JavaScript, React
- Full-stack development

Education:
- Computer Science Degree
        """
        temp_resume.write(resume_content.encode())
        resume_path = temp_resume.name
    
    # Create user profile
    user_profile = UserProfile(
        first_name="John",
        last_name="Doe", 
        email="john.doe@example.com",
        phone="123-456-7890",
        resume_local_path=resume_path,
        current_title="Software Engineer",
        years_experience=5,
        skills=["Python", "JavaScript", "React", "Node.js", "AWS"],
        current_location="San Francisco, CA",
        work_authorization="citizen",
        linkedin_url="https://linkedin.com/in/johndoe"
    )
    
    # Create job data  
    job_data = JobData(
        job_id="airbnb_7113677",
        title="Software Engineer",
        company="DoorDash",
        apply_url="https://job-boards.greenhouse.io/doordashusa/jobs/7118562",
        location="San Francisco, CA"
    )
    
    print(f"👤 Candidate: {user_profile.first_name} {user_profile.last_name}")
    print(f"📧 Email: {user_profile.email}")
    print(f"📱 Phone: {user_profile.phone}")
    print(f"📄 Resume: {resume_path}")
    print(f"💼 Current Title: {user_profile.current_title}")
    print(f"⏱️  Experience: {user_profile.years_experience} years")
    print()
    
    try:
        # Create headful configuration
        config = AutomationConfig(
            headless=False,  # Headful mode - you'll see the browser
            timeout=300000,  # 5 minutes
            screenshot_enabled=True,
            max_retries=2
        )
        
        # Initialize Greenhouse automation with headful config
        automation = GreenhouseAutomation(config=config)
        
        print("🔧 Initializing AI-powered automation...")
        print("⏳ This may take a moment to load the browser and connect to AI...")
        print()
        
        # Run the automation
        result = await automation.apply_to_job(user_profile, job_data)
        
        print("=" * 60)
        print("📊 AUTOMATION RESULTS")
        print("=" * 60)
        print(f"✅ Success: {result.success}")
        print(f"📋 Status: {result.status.value}")
        print(f"🎫 Confirmation: {result.confirmation_number or 'None'}")
        print(f"⏱️  Duration: {result.total_duration_ms}ms")
        print(f"📝 Steps Completed: {result.steps_completed}")
        print(f"🔒 Captcha Events: {len(result.captcha_events)}")
        
        if result.screenshots:
            print(f"📸 Screenshots: {len(result.screenshots)} saved")
            for screenshot in result.screenshots:
                print(f"   - {screenshot}")
        
        if result.error_message:
            print(f"❌ Error: {result.error_message}")
            
        if result.steps:
            print(f"\n📋 Automation Steps:")
            for i, step in enumerate(result.steps, 1):
                status = "✅" if step.success else "❌"
                print(f"   {i}. {status} {step.step_name}: {step.action}")
                if step.error_message:
                    print(f"      Error: {step.error_message}")
        
        print("\n" + "=" * 60)
        if result.success:
            print("🎉 JOB APPLICATION COMPLETED SUCCESSFULLY!")
            print("🎯 The AI successfully applied to the Airbnb position!")
        else:
            print("⚠️  Job application encountered issues")
            print("🔍 Review the steps above for details")
            
    except Exception as e:
        print(f"❌ Automation failed with error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Clean up temp file
        try:
            os.unlink(resume_path)
            print(f"🗑️  Cleaned up temporary resume file")
        except:
            pass

if __name__ == "__main__":
    asyncio.run(test_real_automation())