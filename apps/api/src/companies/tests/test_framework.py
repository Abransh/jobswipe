"""
JobSwipe Automation Testing Framework
Comprehensive testing utilities for company automation scripts
"""

import asyncio
import json
import logging
import tempfile
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from unittest.mock import Mock, AsyncMock

# Add base to path
import sys
sys.path.append(str(Path(__file__).parent.parent / "base"))

from user_profile import UserProfile, JobData, validate_automation_data
from result_handler import ApplicationResult, ApplicationStatus, ResultProcessor
from base_automation import BaseJobAutomation


class MockBrowserProfile:
    """Mock browser profile for testing"""
    def __init__(self):
        self.downloads_path = None
        self.id = "mock_profile_id"
        self.headless = True
        self.viewport = {'width': 1280, 'height': 720}
        self.user_agent = None


class MockBrowserSession:
    """Mock browser session for testing"""
    
    def __init__(self, mock_responses: Dict[str, Any] = None):
        self.mock_responses = mock_responses or {}
        self.actions_performed = []
        self.current_url = ""
        # Add the attributes that browser-use Agent expects
        self._owns_browser_resources = True
        self.browser_profile = MockBrowserProfile()
        self.id = "mock_session_1234"
        self.agent_current_page = MockPage(self.mock_responses, self.actions_performed)
        
    async def start(self):
        self.actions_performed.append("browser_started")
    
    async def stop(self):
        self.actions_performed.append("browser_stopped")
    
    async def get_current_page(self):
        return MockPage(self.mock_responses, self.actions_performed)
    
    def model_copy(self, **kwargs):
        """Create a copy of this mock browser session"""
        copy = MockBrowserSession(self.mock_responses.copy())
        copy.actions_performed = self.actions_performed.copy()
        copy.current_url = self.current_url
        copy._owns_browser_resources = False  # Copies don't own resources
        copy.browser_profile = self.browser_profile  # Share the same profile
        return copy


class MockPage:
    """Mock page for testing browser interactions"""
    
    def __init__(self, mock_responses: Dict[str, Any], actions_log: List[str]):
        self.mock_responses = mock_responses
        self.actions_log = actions_log
        
    async def goto(self, url: str):
        self.actions_log.append(f"navigate_to:{url}")
        return True
    
    async def inner_text(self, selector: str) -> str:
        self.actions_log.append(f"get_text:{selector}")
        return self.mock_responses.get('page_text', 'Mock page content')
    
    async def screenshot(self, path: str, full_page: bool = False):
        self.actions_log.append(f"screenshot:{path}")
        # Create a mock screenshot file
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text("mock screenshot data")
        return True
    
    def locator(self, selector: str):
        return MockLocator(selector, self.mock_responses, self.actions_log)


class MockLocator:
    """Mock locator for element interactions"""
    
    def __init__(self, selector: str, mock_responses: Dict[str, Any], actions_log: List[str]):
        self.selector = selector
        self.mock_responses = mock_responses
        self.actions_log = actions_log
    
    async def count(self) -> int:
        self.actions_log.append(f"count_elements:{self.selector}")
        return self.mock_responses.get(f"count_{self.selector}", 1)
    
    async def is_visible(self) -> bool:
        self.actions_log.append(f"check_visible:{self.selector}")
        return self.mock_responses.get(f"visible_{self.selector}", True)
    
    async def click(self):
        self.actions_log.append(f"click:{self.selector}")
    
    async def fill(self, text: str):
        self.actions_log.append(f"fill:{self.selector}={text}")
    
    @property
    def first(self):
        return MockElement(self.selector, self.mock_responses, self.actions_log)


class MockElement:
    """Mock element for direct interactions"""
    
    def __init__(self, selector: str, mock_responses: Dict[str, Any], actions_log: List[str]):
        self.selector = selector
        self.mock_responses = mock_responses
        self.actions_log = actions_log
    
    async def set_input_files(self, file_path: str):
        self.actions_log.append(f"upload_file:{self.selector}={file_path}")


class TestAutomation(BaseJobAutomation):
    """Test automation class for framework testing"""
    
    def __init__(self, mock_responses: Dict[str, Any] = None):
        super().__init__("test")
        self.mock_responses = mock_responses or {}
        self.mock_browser_session = None
    
    def get_url_patterns(self) -> List[str]:
        return ["test.com", "example.com"]
    
    def get_company_specific_task(self, user_profile: UserProfile, job_data: JobData) -> str:
        return f"Test automation for {job_data.title} at {job_data.company}"
    
    def _create_browser_session(self):
        """Override to return mock browser session"""
        self.mock_browser_session = MockBrowserSession(self.mock_responses)
        return self.mock_browser_session


class AutomationTestRunner:
    """Test runner for automation scripts"""
    
    def __init__(self):
        self.setup_logging()
        self.test_results = []
    
    def setup_logging(self):
        """Setup test logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('automation_test')
    
    async def run_test_suite(self, automation_class: type, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Run a complete test suite for an automation class
        
        Args:
            automation_class: The automation class to test
            test_cases: List of test case configurations
            
        Returns:
            Test results summary
        """
        suite_results = {
            "automation_class": automation_class.__name__,
            "total_tests": len(test_cases),
            "passed": 0,
            "failed": 0,
            "errors": [],
            "test_details": []
        }
        
        for i, test_case in enumerate(test_cases, 1):
            self.logger.info(f"Running test case {i}/{len(test_cases)}: {test_case.get('name', f'Test {i}')}")
            
            try:
                result = await self.run_single_test(automation_class, test_case)
                suite_results["test_details"].append(result)
                
                if result["passed"]:
                    suite_results["passed"] += 1
                else:
                    suite_results["failed"] += 1
                    
            except Exception as e:
                error_result = {
                    "name": test_case.get("name", f"Test {i}"),
                    "passed": False,
                    "error": str(e),
                    "execution_time": 0
                }
                suite_results["test_details"].append(error_result)
                suite_results["failed"] += 1
                suite_results["errors"].append(str(e))
                self.logger.error(f"Test {i} failed with exception: {e}")
        
        suite_results["success_rate"] = (suite_results["passed"] / suite_results["total_tests"]) * 100
        
        return suite_results
    
    async def run_single_test(self, automation_class: type, test_case: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run a single test case
        
        Args:
            automation_class: The automation class to test
            test_case: Test case configuration
            
        Returns:
            Test result details
        """
        start_time = time.time()
        test_name = test_case.get("name", "Unnamed Test")
        
        try:
            # Create test data
            user_profile = UserProfile(**test_case["user_profile"])
            job_data = JobData(**test_case["job_data"])
            
            # Setup mock responses if provided
            mock_responses = test_case.get("mock_responses", {})
            
            # Create automation instance
            if hasattr(automation_class, '__init__') and 'mock_responses' in automation_class.__init__.__code__.co_varnames:
                automation = automation_class(mock_responses)
            else:
                automation = automation_class()
            
            # Run the automation
            result = await automation.apply_to_job(user_profile, job_data)
            
            # Validate result
            validation_errors = ResultProcessor.validate_result(result)
            
            # Check expected outcomes
            expected = test_case.get("expected", {})
            test_passed = self.validate_expected_outcomes(result, expected, validation_errors)
            
            execution_time = time.time() - start_time
            
            return {
                "name": test_name,
                "passed": test_passed,
                "execution_time": execution_time,
                "result_status": result.status.value if result else "no_result",
                "validation_errors": validation_errors,
                "expected_vs_actual": self.compare_expected_actual(expected, result),
                "steps_completed": result.steps_completed if result else 0,
                "captcha_events": len(result.captcha_events) if result else 0
            }
            
        except Exception as e:
            execution_time = time.time() - start_time
            return {
                "name": test_name,
                "passed": False,
                "execution_time": execution_time,
                "error": str(e),
                "exception_type": type(e).__name__
            }
    
    def validate_expected_outcomes(self, result: ApplicationResult, expected: Dict[str, Any], validation_errors: List[str]) -> bool:
        """Validate that result matches expected outcomes"""
        if validation_errors:
            return False
        
        # Check expected success/failure
        if "success" in expected and result.success != expected["success"]:
            return False
        
        # Check expected status
        if "status" in expected and result.status.value != expected["status"]:
            return False
        
        # Check minimum steps completed
        if "min_steps" in expected and result.steps_completed < expected["min_steps"]:
            return False
        
        # Check that confirmation number exists for successful applications
        if result.success and "requires_confirmation" in expected and expected["requires_confirmation"]:
            if not result.confirmation_number:
                return False
        
        return True
    
    def compare_expected_actual(self, expected: Dict[str, Any], result: ApplicationResult) -> Dict[str, Any]:
        """Compare expected vs actual results"""
        return {
            "success": {
                "expected": expected.get("success"),
                "actual": result.success if result else None
            },
            "status": {
                "expected": expected.get("status"),
                "actual": result.status.value if result else None
            },
            "has_confirmation": {
                "expected": expected.get("requires_confirmation", False),
                "actual": bool(result.confirmation_number) if result else False
            }
        }


def create_test_user_profile(**overrides) -> Dict[str, Any]:
    """Create a standard test user profile with optional overrides"""
    base_profile = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com", 
        "phone": "123-456-7890",
        "resume_local_path": "/tmp/test_resume.pdf",
        "current_title": "Software Engineer",
        "years_experience": 5,
        "skills": ["Python", "JavaScript", "React"],
        "current_location": "San Francisco, CA",
        "work_authorization": "citizen"
    }
    
    base_profile.update(overrides)
    return base_profile


def create_test_job_data(company: str = "Test Company", **overrides) -> Dict[str, Any]:
    """Create a standard test job data with optional overrides"""
    base_job = {
        "job_id": f"test_{company.lower().replace(' ', '_')}_123",
        "title": "Senior Software Engineer",
        "company": company,
        "apply_url": f"https://test.com/jobs/123",
        "location": "San Francisco, CA",
        "job_type": "full-time"
    }
    
    base_job.update(overrides)
    return base_job


# Example test cases
GREENHOUSE_TEST_CASES = [
    {
        "name": "Successful Greenhouse Application",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            company="Greenhouse Test Company",
            apply_url="https://job-boards.greenhouse.io/test/jobs/123"
        ),
        "mock_responses": {
            "page_text": "Thank you for your application. Your confirmation number is CONF123456.",
            "count_input[type=\"file\"]": 1,
            "visible_input[type=\"file\"]": True
        },
        "expected": {
            "success": True,
            "status": "success",
            "min_steps": 3,
            "requires_confirmation": True
        }
    },
    {
        "name": "Failed Greenhouse Application - Form Error",
        "user_profile": create_test_user_profile(email="invalid-email"),  # Invalid email
        "job_data": create_test_job_data(
            company="Greenhouse Test Company", 
            apply_url="https://job-boards.greenhouse.io/test/jobs/456"
        ),
        "mock_responses": {
            "page_text": "Please correct the errors below and try again.",
            "count_input[type=\"file\"]": 0
        },
        "expected": {
            "success": False,
            "status": "failed",
            "min_steps": 1
        }
    }
]

LINKEDIN_TEST_CASES = [
    {
        "name": "Successful LinkedIn Easy Apply",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            company="LinkedIn Test Company",
            apply_url="https://www.linkedin.com/jobs/view/123456789"
        ),
        "mock_responses": {
            "page_text": "Your application was sent to LinkedIn Test Company.",
            "count_.jobs-apply-button": 1,
            "visible_.jobs-apply-button": True
        },
        "expected": {
            "success": True,
            "status": "success",
            "min_steps": 2,
            "requires_confirmation": False  # LinkedIn doesn't always provide confirmation numbers
        }
    },
    {
        "name": "LinkedIn Login Required",
        "user_profile": create_test_user_profile(),
        "job_data": create_test_job_data(
            company="LinkedIn Test Company",
            apply_url="https://www.linkedin.com/jobs/view/987654321"
        ),
        "mock_responses": {
            "page_text": "Sign in to apply for this job",
            "count_.jobs-apply-button": 0
        },
        "expected": {
            "success": False,
            "status": "failed",
            "min_steps": 1
        }
    }
]


async def main():
    """Run example tests"""
    runner = AutomationTestRunner()
    
    print("🧪 JobSwipe Automation Testing Framework")
    print("=" * 50)
    
    # Test the test framework itself
    print("\n📋 Testing Framework with Mock Automation...")
    
    test_cases = [
        {
            "name": "Mock Success Test",
            "user_profile": create_test_user_profile(),
            "job_data": create_test_job_data(apply_url="https://test.com/jobs/123"),
            "mock_responses": {
                "page_text": "Application submitted successfully"
            },
            "expected": {
                "success": True,
                "min_steps": 1
            }
        }
    ]
    
    results = await runner.run_test_suite(TestAutomation, test_cases)
    
    print(f"✅ Test Results: {results['passed']}/{results['total_tests']} passed")
    print(f"📊 Success Rate: {results['success_rate']:.1f}%")
    
    for test_detail in results['test_details']:
        status = "✅" if test_detail['passed'] else "❌"
        print(f"{status} {test_detail['name']} ({test_detail['execution_time']:.2f}s)")
        if not test_detail['passed'] and 'error' in test_detail:
            print(f"   Error: {test_detail['error']}")


if __name__ == "__main__":
    asyncio.run(main())