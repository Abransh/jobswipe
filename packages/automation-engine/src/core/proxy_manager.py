"""
Proxy Manager for Server Mode
Handles proxy rotation to avoid rate limiting
"""

import random
from typing import List, Optional
from dataclasses import dataclass

from .execution_context import ProxyConfig


@dataclass
class ProxyServer:
    """Proxy server information"""
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    type: str = "http"
    country: Optional[str] = None
    success_rate: float = 1.0
    last_used: Optional[float] = None


class ProxyManager:
    """
    Manages proxy rotation for server-side automation
    Implements round-robin and health-based selection
    """

    def __init__(self, proxy_list: Optional[List[dict]] = None):
        self.proxies: List[ProxyServer] = []
        self.current_index = 0

        if proxy_list:
            for proxy_dict in proxy_list:
                self.add_proxy(**proxy_dict)

    def add_proxy(
        self,
        host: str,
        port: int,
        username: Optional[str] = None,
        password: Optional[str] = None,
        type: str = "http",
        country: Optional[str] = None
    ):
        """Add a proxy to the rotation pool"""
        proxy = ProxyServer(
            host=host,
            port=port,
            username=username,
            password=password,
            type=type,
            country=country
        )
        self.proxies.append(proxy)

    def get_next_proxy(self) -> Optional[ProxyConfig]:
        """
        Get next proxy in rotation

        Returns:
            ProxyConfig or None if no proxies available
        """
        if not self.proxies:
            return None

        # Round-robin selection
        proxy_server = self.proxies[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.proxies)

        return ProxyConfig(
            enabled=True,
            host=proxy_server.host,
            port=proxy_server.port,
            username=proxy_server.username,
            password=proxy_server.password,
            type=proxy_server.type
        )

    def get_random_proxy(self) -> Optional[ProxyConfig]:
        """
        Get random proxy from pool

        Returns:
            ProxyConfig or None if no proxies available
        """
        if not self.proxies:
            return None

        proxy_server = random.choice(self.proxies)

        return ProxyConfig(
            enabled=True,
            host=proxy_server.host,
            port=proxy_server.port,
            username=proxy_server.username,
            password=proxy_server.password,
            type=proxy_server.type
        )

    def get_proxy_by_country(self, country: str) -> Optional[ProxyConfig]:
        """
        Get proxy from specific country

        Args:
            country: Country code (e.g., 'US', 'UK', 'CA')

        Returns:
            ProxyConfig or None if no matching proxy
        """
        matching_proxies = [p for p in self.proxies if p.country == country]

        if not matching_proxies:
            return None

        proxy_server = random.choice(matching_proxies)

        return ProxyConfig(
            enabled=True,
            host=proxy_server.host,
            port=proxy_server.port,
            username=proxy_server.username,
            password=proxy_server.password,
            type=proxy_server.type
        )

    def mark_proxy_failed(self, host: str, port: int):
        """Mark a proxy as failed (reduce success rate)"""
        for proxy in self.proxies:
            if proxy.host == host and proxy.port == port:
                proxy.success_rate = max(0.0, proxy.success_rate - 0.1)
                break

    def mark_proxy_success(self, host: str, port: int):
        """Mark a proxy as successful (increase success rate)"""
        for proxy in self.proxies:
            if proxy.host == host and proxy.port == port:
                proxy.success_rate = min(1.0, proxy.success_rate + 0.05)
                break

    def get_proxy_count(self) -> int:
        """Get number of proxies in pool"""
        return len(self.proxies)

    def remove_proxy(self, host: str, port: int):
        """Remove proxy from pool"""
        self.proxies = [
            p for p in self.proxies
            if not (p.host == host and p.port == port)
        ]

    def clear_proxies(self):
        """Remove all proxies from pool"""
        self.proxies.clear()
        self.current_index = 0
