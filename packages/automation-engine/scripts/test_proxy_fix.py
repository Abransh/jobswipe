
import os
import sys
import json
import asyncio
from pathlib import Path

# Add the package root to sys.path
current_dir = Path(__file__).parent
package_root = current_dir.parent
sys.path.insert(0, str(package_root / "src"))
sys.path.insert(0, str(package_root / "browser-use" / "src"))

from core.execution_context import ExecutionContext, ProxyConfig, ExecutionMode

async def test_proxy_sanitization():
    print("Testing proxy sanitization...")
    
    # Mock data with a host that includes scheme (the bug)
    mock_job_data = {
        "job_id": "test-job",
        "application_url": "https://example.com",
        "company_name": "Test Corp",
        "job_title": "Engineer",
        "proxy_config": {
            "enabled": True,
            "type": "http",
            "host": "http://proxy.example.com", # This caused the double scheme
            "port": 8080,
            "username": "user",
            "password": "pass"
        }
    }
    
    # Create a temporary job data file
    job_data_path = package_root / "temp_job_data.json"
    with open(job_data_path, "w") as f:
        json.dump(mock_job_data, f)
    
    os.environ["JOB_DATA_FILE"] = str(job_data_path)
    os.environ["GOOGLE_API_KEY"] = "dummy-key" # Not actually used for this test part
    
    try:
        # Create ProxyConfig from mock data
        proxy_data = mock_job_data["proxy_config"]
        proxy_config = ProxyConfig(
            enabled=proxy_data["enabled"],
            type=proxy_data["type"],
            host=proxy_data["host"],
            port=proxy_data["port"],
            username=proxy_data["username"],
            password=proxy_data["password"]
        )

        # Initialize ExecutionContext with proxy_config
        context = ExecutionContext(
            mode=ExecutionMode.SERVER,
            user_profile={"id": "test-user"},
            proxy_config=proxy_config
        )
        
        # Check the browser profile proxy settings
        profile = context.browser_profile
        
        if profile.proxy:
            print(f"Proxy Server URL: {profile.proxy.server}")
            
            if profile.proxy.server == "http://proxy.example.com:8080":
                print("SUCCESS: Proxy URL is correctly sanitized!")
            else:
                print(f"FAILURE: Proxy URL is incorrect: {profile.proxy.server}")
        else:
            print("FAILURE: No proxy settings found in profile")
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if job_data_path.exists():
            job_data_path.unlink()

if __name__ == "__main__":
    asyncio.run(test_proxy_sanitization())
