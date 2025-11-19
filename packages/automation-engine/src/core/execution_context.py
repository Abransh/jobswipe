"""
Execution Context for JobSwipe Automation Engine
Handles different execution modes (SERVER vs DESKTOP) with proper configuration
"""

import logging
import os
from enum import Enum
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

from pydantic import BaseModel


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
    headless: bool = True
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

    def __post_init__(self):
        """Setup logger if not provided"""
        if self.logger is None:
            self.logger = self._setup_logger()

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

    def _configure_for_server(self):
        """Configure context for server execution"""
        # Server mode: visible browser (headful), with proxy
        self.browser_config.headless = False

        # Ensure proxy is configured for server mode
        if self.proxy_config is None:
            self.logger.warning("Server mode without proxy configuration - this may cause rate limiting")

        self.logger.info("ExecutionContext configured for SERVER mode (visible browser, with proxy)")

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
