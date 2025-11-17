# Headful Browser Mode Fix

## Problem
The automation engine was configured to run with `headless = False` in `execution_context.py`, but **the browser was still running in headless mode** (invisible) when executing automation scripts.

## Root Cause
The `headless` configuration from `ExecutionContext` was **not being passed to the `browser-use` library's `Agent`**.

### Issue Details
1. `execution_context.py` correctly set `headless = False` for both SERVER and DESKTOP modes (lines 108, 119)
2. `base_automation.py` retrieved these settings via `get_browser_launch_options()` (line 177)
3. **BUT**: The `BrowserSession` was created as an empty placeholder without any configuration (line 193)
4. The `Agent` received this empty `BrowserSession`, which defaulted to `headless = None`
5. `browser-use` library defaults to headless mode when `headless` is not explicitly set to `False`

## Solution
Modified `base_automation.py` to properly create a `BrowserSession` with a `BrowserProfile` that includes the `headless` configuration.

### Changes Made

#### 1. Updated `packages/automation-engine/src/companies/base/base_automation.py`
**Changed the `_create_browser_session()` method** to:
- Import `BrowserProfile` from `browser_use.browser`
- Create a `BrowserProfile` with `headless` setting from execution context
- Add browser args, proxy, and user_data_dir to the profile
- Create `BrowserSession` with the configured profile

**Before:**
```python
def _create_browser_session(self) -> BrowserSession:
    browser_options = self.context.get_browser_launch_options()
    # ... logging ...
    return BrowserSession()  # Empty placeholder!
```

**After:**
```python
def _create_browser_session(self) -> BrowserSession:
    browser_options = self.context.get_browser_launch_options()

    # Create BrowserProfile with headless setting from execution context
    from browser_use.browser import BrowserProfile

    browser_profile = BrowserProfile(
        headless=browser_options.get('headless', False),
        args=browser_options.get('args', []),
    )

    # Add user_data_dir if present (desktop mode)
    if 'user_data_dir' in browser_options and browser_options['user_data_dir']:
        browser_profile.user_data_dir = browser_options['user_data_dir']

    # Add proxy if present (server mode)
    if 'proxy' in browser_options and browser_options['proxy']:
        browser_profile.proxy = browser_options['proxy']

    # Create BrowserSession with the configured profile
    browser_session = BrowserSession(browser_profile=browser_profile)
    return browser_session
```

#### 2. Updated comments in `packages/automation-engine/src/core/execution_context.py`
- Fixed misleading comment on line 107 from "headless, with proxy" to "visible browser (headful), with proxy"
- Fixed log message on line 114 to say "visible browser" instead of "headless"

## Verification
Tested with both execution modes:
```
SERVER mode headless: False ✅
DESKTOP mode headless: False ✅
```

Both modes now correctly configure the browser to run in **visible (headful) mode**.

## Expected Behavior After Fix
When you run automation scripts:
1. A **browser window will appear** on your screen
2. You will **see the automation in action** (forms being filled, pages navigating, etc.)
3. For captcha challenges, the visible window allows **manual intervention**
4. Logging will show: `Browser session created with headless=False`

## Files Modified
- `packages/automation-engine/src/companies/base/base_automation.py` - Fixed browser session creation
- `packages/automation-engine/src/core/execution_context.py` - Updated comments for accuracy

## Technical Details
The `browser-use` library uses this hierarchy:
- `Agent` (accepts `browser_session`)
  - `BrowserSession` (accepts `browser_profile`)
    - `BrowserProfile` (inherits from `BrowserLaunchArgs`)
      - `BrowserLaunchArgs` (has `headless: bool | None` parameter)

The `headless` parameter must be set in the `BrowserProfile`, which is then passed to `BrowserSession`, which is then passed to `Agent`.

## Date Fixed
November 17, 2025
