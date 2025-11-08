"""
Core automation engine components
"""

from .execution_context import ExecutionContext, ExecutionMode
from .automation_engine import AutomationEngine
from .proxy_manager import ProxyManager

__all__ = [
    'ExecutionContext',
    'ExecutionMode',
    'AutomationEngine',
    'ProxyManager',
]
