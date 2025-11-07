"""
Integration wrappers for server and desktop modes
"""

from .server_integration import ServerAutomationIntegration
from .desktop_integration import DesktopAutomationIntegration

__all__ = [
    'ServerAutomationIntegration',
    'DesktopAutomationIntegration',
]
