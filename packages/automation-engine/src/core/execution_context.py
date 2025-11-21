"""
Execution Context for JobSwipe Automation Engine
Handles different execution modes (SERVER vs DESKTOP) with proper configuration
"""

import logging
import os
import sys
from enum import Enum
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

from pydantic import BaseModel

# Add browser-use library to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / 'browser-use'))

# Import browser-use components
from browser_use import BrowserProfile
from browser_use.browser.profile import ProxySettings
from browser_use.llm import ChatGoogle


class ExecutionMode(str, Enum):
    """
    Execution mode for automation

    SERVER: Runs on JobSwipe servers with proxy rotation
    DESKTOP: Runs on user's local machine with their browser
    """
    SERVER = "SERVER"
    DESKTOP = "DESKTOP"


class ProxyConfig(BaseModel):
    """Proxy configuration for server mode"""
    enabled: bool = False
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    type: str = "http"  # http, https, socks5
    rotation_enabled: bool = False

    def to_playwright_proxy(self) -> Optional[Dict[str, Any]]:
        """Convert to Playwright proxy format"""
        if not self.enabled or not self.host:
            return None

        proxy_dict = {
            "server": f"{self.type}://{self.host}:{self.port}"
        }

        if self.username and self.password:
            proxy_dict["username"] = self.username
            proxy_dict["password"] = self.password

        return proxy_dict


class BrowserConfig(BaseModel):
    """Browser configuration"""
    headless: bool = False
    disable_bfcache: bool = True
    user_data_dir: Optional[str] = None
    timeout: int = 60000  # 60 seconds
    viewport_width: int = 1920
    viewport_height: int = 1080
    user_agent: Optional[str] = None


@dataclass
class ExecutionContext:
    """
    Execution context for automation
    Contains all configuration needed for running automation in different modes
    """

    mode: ExecutionMode
    user_profile: Dict[str, Any]
    proxy_config: Optional[ProxyConfig] = None
    browser_config: BrowserConfig = field(default_factory=BrowserConfig)
    session_id: Optional[str] = None
    logger: Optional[logging.Logger] = None

    # browser-use Agent components (initialized in __post_init__)
    llm: Optional[Any] = None
    browser_profile: Optional[BrowserProfile] = None

    def __post_init__(self):
        """Setup logger, LLM, and BrowserProfile"""
        if self.logger is None:
            self.logger = self._setup_logger()

        # Initialize LLM for AI-powered automation
        self.llm = self._initialize_llm()

        # Initialize BrowserProfile with proxy support
        self.browser_profile = self._initialize_browser_profile()

        # Configure browser based on execution mode
        if self.mode == ExecutionMode.SERVER:
            self._configure_for_server()
        else:
            self._configure_for_desktop()

    def _setup_logger(self) -> logging.Logger:
        """Setup context logger"""
        logger_name = f"jobswipe.automation.{self.mode.value.lower()}"
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)

        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    def _initialize_llm(self):
        """
        Initialize LLM for AI-powered automation
        Uses Google Gemini (ChatGoogle) as recommended
        """
        google_api_key = os.getenv("GOOGLE_API_KEY")

        if not google_api_key:
            error_msg = "GOOGLE_API_KEY environment variable not found! Cannot initialize LLM for automation."
            if self.logger:
                self.logger.error(error_msg)
            raise ValueError(error_msg)

        try:
            # Initialize Google Gemini LLM
            # Using flash-latest for faster, more reliable automation
            llm = ChatGoogle(model='gemini-flash-latest')

            if self.logger:
                self.logger.info("✅ LLM initialized successfully: Google Gemini Flash (latest)")

            return llm

        except Exception as e:
            error_msg = f"Failed to initialize LLM: {str(e)}"
            if self.logger:
                self.logger.error(error_msg, exc_info=True)
            raise RuntimeError(error_msg) from e

    def _initialize_browser_profile(self) -> BrowserProfile:
        """
        Initialize BrowserProfile with proxy support for browser-use Agent
        """
        try:
            # Build proxy settings if proxy config exists
            # Build proxy settings if proxy config exists
            proxy_settings = None
            # PROXY DISABLED BY USER REQUEST
            # if self.proxy_config and self.proxy_config.enabled and self.proxy_config.host:
            #     # Sanitize host: remove scheme if present to avoid double scheme (e.g. http://http://...)
            #     host = self.proxy_config.host.replace("http://", "").replace("https://", "")
            #     server_url = f"{self.proxy_config.type}://{host}:{self.proxy_config.port}"
            #
            #     proxy_settings = ProxySettings(
            #         server=server_url,
            #         username=self.proxy_config.username,
            #         password=self.proxy_config.password
            #     )
            #
            #     if self.logger:
            #         self.logger.info(f"✅ Proxy configured: {server_url}")

            # Create BrowserProfile
            # Always use headful mode (headless=False) as per user requirement
            browser_profile = BrowserProfile(
                headless=False,  # Always headful mode
                proxy=proxy_settings,
                keep_alive=False,  # Always cleanup after job
                wait_between_actions=0.3,  # Slight delay to avoid rate limits (reduced from 0.5)
                disable_security=False,  # Keep security enabled
                use_vision=False,  # Disable vision for faster processing (flash model is sufficient)
                # max_actions_per_step removed - let agent decide how many actions needed
            )

            if self.logger:
                #mode_str = "headless" if is_headless else "headful"
                mode_str = "headful"
                self.logger.info(f"✅ BrowserProfile initialized ({mode_str} mode)")

            return browser_profile

        except Exception as e:
            error_msg = f"Failed to initialize BrowserProfile: {str(e)}"
            if self.logger:
                self.logger.error(error_msg, exc_info=True)
            raise RuntimeError(error_msg) from e

    def _configure_for_server(self):
        """Configure context for server execution"""
        # Server mode: headful browser (for debugging), with proxy
        self.browser_config.headless = False

        # Ensure proxy is configured for server mode
        if self.proxy_config is None:
            self.logger.warning("Server mode without proxy configuration - this may cause rate limiting")

        self.logger.info("ExecutionContext configured for SERVER mode (headless browser, with proxy)")

    def _configure_for_desktop(self):
        """Configure context for desktop execution"""
        # Desktop mode: visible browser, use user's profile
        self.browser_config.headless = False

        # Try to use user's browser profile for pre-filled data
        if "browser_profile_path" in self.user_profile:
            self.browser_config.user_data_dir = self.user_profile["browser_profile_path"]

        # No proxy needed for desktop
        self.proxy_config = None

        self.logger.info("ExecutionContext configured for DESKTOP mode (visible browser, local)")

    def get_browser_launch_options(self) -> Dict[str, Any]:
        """
        Get Playwright browser launch options based on context

        Returns:
            Dict with Playwright launch options
        """
        # Enhanced browser arguments for anti-detection and performance
        browser_args = [
            # Window and cache settings
            "--disable-bfcache",
            f"--window-size={self.browser_config.viewport_width},{self.browser_config.viewport_height}",

            # Anti-detection: Remove automation indicators
            "--disable-blink-features=AutomationControlled",

            # Performance optimizations
            "--disable-dev-shm-usage",  # Overcome limited resource problems
            "--disable-gpu",  # Applicable to windows os only
            "--no-sandbox",  # Required for Docker/containerized environments

            # Stability improvements
            "--disable-setuid-sandbox",
            "--disable-infobars",
            "--disable-notifications",

            # Additional anti-detection
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
        ]

        options = {
            "headless": self.browser_config.headless,
            "args": browser_args,
        }

        # Add proxy if configured (server mode)
        if self.proxy_config:
            proxy_dict = self.proxy_config.to_playwright_proxy()
            if proxy_dict:
                options["proxy"] = proxy_dict
                self.logger.info(f"Using proxy: {proxy_dict['server']}")

        # Add user data dir if configured (desktop mode)
        if self.browser_config.user_data_dir:
            options["user_data_dir"] = self.browser_config.user_data_dir
            self.logger.info(f"Using browser profile: {self.browser_config.user_data_dir}")

        # Add user agent if specified
        if self.browser_config.user_agent:
            options["args"].append(f"--user-agent={self.browser_config.user_agent}")

        return options

    def is_server_mode(self) -> bool:
        """Check if running in server mode"""
        return self.mode == ExecutionMode.SERVER

    def is_desktop_mode(self) -> bool:
        """Check if running in desktop mode"""
        return self.mode == ExecutionMode.DESKTOP

    def log_info(self, message: str, **kwargs):
        """Log info message with context"""
        self.logger.info(f"[{self.mode.value}] {message}", extra=kwargs)

    def log_warning(self, message: str, **kwargs):
        """Log warning message with context"""
        self.logger.warning(f"[{self.mode.value}] {message}", extra=kwargs)

    def log_error(self, message: str, **kwargs):
        """Log error message with context"""
        # Extract exc_info if present (it's a logging parameter, not an extra field)
        exc_info = kwargs.pop('exc_info', False)
        self.logger.error(f"[{self.mode.value}] {message}", exc_info=exc_info, extra=kwargs)
