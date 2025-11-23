"""
Simple entry point for automation
"""
import asyncio
import sys
import json
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path(__file__).parent))

from companies.greenhouse.simple_greenhouse import GreenhouseAutomation


async def run_automation(user_data: dict, job_data: dict):
    """Run automation with simple data"""
    
    # Detect company type
    url = job_data['apply_url'].lower()
    
    if 'greenhouse' in url:
        automation = GreenhouseAutomation()
    else:
        # Add more as needed
        automation = GreenhouseAutomation()  # Default
    
    # Run it
    result = await automation.apply(user_data, job_data)
    
    return result


if __name__ == "__main__":
    # Example usage
    user = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john@example.com',
        'phone': '123-456-7890',
        'resume_path': 'path/to/resume.pdf'
    }
    
    job = {
        'title': 'Software Engineer',
        'company': 'Example Corp',
        'apply_url': 'https://job-boards.greenhouse.io/example/jobs/123'
    }
    
    result = asyncio.run(run_automation(user, job))
    print(json.dumps(result, indent=2))