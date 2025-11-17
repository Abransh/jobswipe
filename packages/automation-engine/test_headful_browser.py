"""
Test script to verify browser opens in headful (visible) mode
Run this to confirm the browser window appears
"""
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Import only what we need to avoid circular imports
from core.execution_context import ExecutionContext, ExecutionMode

def test_browser_config():
    """Test that browser configuration is set to headful mode"""

    # Test SERVER mode
    print("=" * 60)
    print("Testing SERVER mode configuration")
    print("=" * 60)

    server_context = ExecutionContext(
        mode=ExecutionMode.SERVER,
        user_profile={"name": "Test User"}
    )

    server_options = server_context.get_browser_launch_options()
    print(f"✓ Mode: {server_context.mode.value}")
    print(f"✓ Headless: {server_options.get('headless', 'NOT SET')}")
    print(f"✓ Browser config headless: {server_context.browser_config.headless}")

    assert server_options.get('headless') == False, "SERVER mode should be headful (False)"
    print("✅ SERVER mode is correctly configured as HEADFUL\n")

    # Test DESKTOP mode
    print("=" * 60)
    print("Testing DESKTOP mode configuration")
    print("=" * 60)

    desktop_context = ExecutionContext(
        mode=ExecutionMode.DESKTOP,
        user_profile={"name": "Test User"}
    )

    desktop_options = desktop_context.get_browser_launch_options()
    print(f"✓ Mode: {desktop_context.mode.value}")
    print(f"✓ Headless: {desktop_options.get('headless', 'NOT SET')}")
    print(f"✓ Browser config headless: {desktop_context.browser_config.headless}")

    assert desktop_options.get('headless') == False, "DESKTOP mode should be headful (False)"
    print("✅ DESKTOP mode is correctly configured as HEADFUL\n")

    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("✅ Both SERVER and DESKTOP modes are configured to show a visible browser window")
    print("✅ The browser will NOT run in headless mode")
    print("✅ You should see a browser window when running automation scripts")
    print()
    print("To test with an actual browser window, run one of the automation scripts")
    print("in the examples/ directory.")

if __name__ == "__main__":
    test_browser_config()
