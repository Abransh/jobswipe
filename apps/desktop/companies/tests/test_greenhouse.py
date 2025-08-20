"""
Greenhouse Automation Tests
Comprehensive tests for the Greenhouse job application automation
"""

import asyncio
import sys
import tempfile
from pathlib import Path

# Add paths
sys.path.append(str(Path(__file__).parent.parent / "base"))
sys.path.append(str(Path(__file__).parent.parent / "greenhouse"))
sys.path.append(str(Path(__file__).parent))

from test_framework import AutomationTestRunner, create_test_user_profile, create_test_job_data
from greenhouse import GreenhouseAutomation


class TestableGreenhouseAutomation(GreenhouseAutomation):
    """Testable version of GreenhouseAutomation with mocked browser"""
    
    def __init__(self, mock_responses=None):
        super().__init__()
        self.mock_responses = mock_responses or {}
        self.mock_browser_session = None
        
    def _create_browser_session(self):
        """Override to return mock browser session for testing"""
        from test_framework import MockBrowserSession
        self.mock_browser_session = MockBrowserSession(self.mock_responses)
        return self.mock_browser_session


# Test cases for Greenhouse automation
GREENHOUSE_TEST_CASES = [
    {
        "name": "Successful Application with All Fields",
        "user_profile": create_test_user_profile(
            resume_local_path="/tmp/test_resume.pdf",
            linkedin_url="https://linkedin.com/in/johndoe",
            work_authorization="citizen"
        ),
        "job_data": create_test_job_data(
            company="TechCorp",
            apply_url="https://job-boards.greenhouse.io/techcorp/jobs/1234567",
            location="San Francisco, CA"
        ),
        "mock_responses": {
            "page_text": "Thank you for applying! We have received your application. Your confirmation number is CONF789012.",
            "count_input[type=\"file\"]": 1,
            "visible_input[type=\"file\"]": True,
            "count_.btn-primary": 1,  # Apply button
            "visible_.btn-primary": True
        },
        "expected": {
            "success": True,
            "status": "success",
            "min_steps": 3,
            "requires_confirmation": True
        }
    },
    
    {
        "name": "Application with Missing Resume",
        "user_profile": create_test_user_profile(
            resume_local_path=None,  # No resume
            resume_url=None
        ),
        "job_data": create_test_job_data(
            apply_url="https://job-boards.greenhouse.io/example/jobs/9876543"
        ),
        "expected": {
            "success": False,
            "status": "failed"
        }
    },
    
    {
        "name": "Form Submission Error",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            apply_url="https://boards.greenhouse.io/company/jobs/error-test"
        ),
        "mock_responses": {
            "page_text": "There was an error submitting your application. Please try again.",
            "count_input[type=\"file\"]": 1,
            "visible_input[type=\"file\"]": True,
            "count_.error": 1  # Error message present
        },
        "expected": {
            "success": False,
            "status": "failed",
            "min_steps": 2
        }
    },
    
    {
        "name": "Captcha Detection Test",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            apply_url="https://job-boards.greenhouse.io/captcha-test/jobs/123"
        ),
        "mock_responses": {
            "page_text": "Please complete the captcha to continue.",
            "count_iframe[src*=\"recaptcha\"]": 1,  # reCAPTCHA detected
            "visible_iframe[src*=\"recaptcha\"]": True
        },
        "expected": {
            "success": False,
            "status": "captcha_required",
            "min_steps": 1
        }
    },
    
    {
        "name": "Invalid Greenhouse URL",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            apply_url="https://not-greenhouse.com/jobs/123"  # Wrong domain
        ),
        "expected": {
            "success": False,
            "status": "failed"
        }
    },
    
    {
        "name": "Successful Application with Minimal Profile",
        "user_profile": create_test_user_profile(
            current_title=None,
            years_experience=None,
            linkedin_url=None,
            skills=[]
        ),
        "job_data": create_test_job_data(
            apply_url="https://grnh.se/abc123"  # Short URL format
        ),
        "mock_responses": {
            "page_text": "Application submitted successfully. Reference ID: REF456789",
            "count_input[type=\"file\"]": 1,
            "visible_input[type=\"file\"]": True
        },
        "expected": {
            "success": True,
            "status": "success",
            "min_steps": 3
        }
    },
    
    {
        "name": "Long Company Application Form",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            company="Very Long Company Name With Many Departments And Complex Structure Inc.",
            apply_url="https://job-boards.greenhouse.io/verylongcompanyname/jobs/complex123"
        ),
        "mock_responses": {
            "page_text": "Your application has been received. Thank you for your interest in our position.",
            "count_input[type=\"file\"]": 2,  # Multiple file uploads
            "visible_input[type=\"file\"]": True,
            "count_textarea": 3  # Multiple text areas for essays
        },
        "expected": {
            "success": True,
            "status": "success",
            "min_steps": 4  # More steps due to complexity
        }
    }
]


async def run_greenhouse_tests():
    """Run all Greenhouse automation tests"""
    print("🌱 Running Greenhouse Automation Tests")
    print("=" * 50)
    
    # Create temporary resume file for tests
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_resume:
        temp_resume.write(b"Mock resume content for testing")
        temp_resume_path = temp_resume.name
    
    # Update test cases to use the temporary resume
    for test_case in GREENHOUSE_TEST_CASES:
        if test_case["user_profile"].get("resume_local_path") == "/tmp/test_resume.pdf":
            test_case["user_profile"]["resume_local_path"] = temp_resume_path
    
    try:
        runner = AutomationTestRunner()
        results = await runner.run_test_suite(TestableGreenhouseAutomation, GREENHOUSE_TEST_CASES)
        
        print(f"\n📊 Test Results Summary:")
        print(f"   Total Tests: {results['total_tests']}")
        print(f"   Passed: {results['passed']}")
        print(f"   Failed: {results['failed']}")
        print(f"   Success Rate: {results['success_rate']:.1f}%")
        
        print(f"\n📋 Individual Test Results:")
        for test_detail in results['test_details']:
            status = "✅" if test_detail['passed'] else "❌"
            duration = f"{test_detail['execution_time']:.2f}s"
            print(f"   {status} {test_detail['name']} ({duration})")
            
            if not test_detail['passed']:
                if 'error' in test_detail:
                    print(f"      Error: {test_detail['error']}")
                if 'validation_errors' in test_detail and test_detail['validation_errors']:
                    print(f"      Validation: {', '.join(test_detail['validation_errors'])}")
        
        if results['errors']:
            print(f"\n⚠️ Framework Errors:")
            for error in results['errors']:
                print(f"   - {error}")
        
        return results
    
    finally:
        # Clean up temporary file
        try:
            Path(temp_resume_path).unlink()
        except:
            pass


async def main():
    """Main test execution"""
    results = await run_greenhouse_tests()
    
    print(f"\n🎯 Final Results:")
    print(f"   Greenhouse Tests: {results['passed']}/{results['total_tests']} passed")
    
    if results['success_rate'] >= 80:
        print("   ✅ Test suite PASSED (>= 80% success rate)")
        return 0
    else:
        print("   ❌ Test suite FAILED (< 80% success rate)")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)