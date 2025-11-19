"""
Core automation engine components
"""

from .execution_context import ExecutionContext, ExecutionMode, ProxyConfig, BrowserConfig
from .proxy_manager import ProxyManager

# Lazy import to avoid circular dependency
# AutomationEngine imports from companies.base which imports from core
def __getattr__(name):
    if name == 'AutomationEngine':
        from .automation_engine import AutomationEngine
        return AutomationEngine
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

__all__ = [
    'ExecutionContext',
    'ExecutionMode',
    'ProxyConfig',
    'BrowserConfig',
    'AutomationEngine',
    'ProxyManager',
]
