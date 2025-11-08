/**
 * @fileoverview Proxy Manager for Server-Side Job Application Automation
 * @description Manages proxy rotation to prevent IP blocking during automation
 * @version 1.0.0
 * @author JobSwipe Team
 */

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  type: 'http' | 'https' | 'socks5';
}

export interface ProxyManagerConfig {
  enabled: boolean;
  mode: 'custom' | 'scraperapi';
  customProxies?: string[]; // Format: "host:port:username:password"
  scraperApiKey?: string;
  rotationStrategy: 'round-robin' | 'random';
}

// =============================================================================
// PROXY MANAGER
// =============================================================================

export class ProxyManager {
  private proxies: ProxyConfig[] = [];
  private currentIndex: number = 0;
  private config: ProxyManagerConfig;

  constructor(config?: Partial<ProxyManagerConfig>) {
    // Default configuration
    this.config = {
      enabled: process.env.PROXY_ENABLED === 'true' || false,
      mode: process.env.PROXY_MODE as 'custom' | 'scraperapi' || 'custom',
      customProxies: process.env.PROXY_LIST?.split(',') || [],
      scraperApiKey: process.env.SCRAPER_API_KEY,
      rotationStrategy: (process.env.PROXY_ROTATION_STRATEGY as 'round-robin' | 'random') || 'round-robin',
      ...config
    };

    // Initialize proxies
    this.initialize();
  }

  /**
   * Initialize proxy list based on configuration
   */
  private initialize(): void {
    if (!this.config.enabled) {
      console.log('ℹ️ Proxy manager initialized but DISABLED');
      return;
    }

    if (this.config.mode === 'scraperapi') {
      if (!this.config.scraperApiKey) {
        console.warn('⚠️ ScraperAPI mode enabled but no API key provided. Proxies will be disabled.');
        this.config.enabled = false;
        return;
      }

      // ScraperAPI proxy configuration
      this.proxies = [{
        host: 'proxy-server.scraperapi.com',
        port: 8001,
        username: 'scraperapi',
        password: this.config.scraperApiKey,
        type: 'http'
      }];

      console.log('✅ Proxy manager initialized with ScraperAPI');

    } else {
      // Custom proxy list
      if (!this.config.customProxies || this.config.customProxies.length === 0) {
        console.warn('⚠️ Custom proxy mode enabled but no proxies provided. Proxies will be disabled.');
        this.config.enabled = false;
        return;
      }

      this.proxies = this.config.customProxies.map(proxyString => this.parseProxyString(proxyString));
      console.log(`✅ Proxy manager initialized with ${this.proxies.length} custom proxies`);
    }
  }

  /**
   * Parse proxy string format: "host:port:username:password" or "host:port"
   */
  private parseProxyString(proxyString: string): ProxyConfig {
    const parts = proxyString.trim().split(':');

    if (parts.length < 2) {
      throw new Error(`Invalid proxy format: ${proxyString}. Expected format: host:port or host:port:username:password`);
    }

    return {
      host: parts[0],
      port: parseInt(parts[1], 10),
      username: parts[2] || undefined,
      password: parts[3] || undefined,
      type: 'http'
    };
  }

  /**
   * Get next proxy from the pool
   * Returns null if proxies are disabled or no proxies available
   */
  getNext(): ProxyConfig | null {
    if (!this.config.enabled || this.proxies.length === 0) {
      return null;
    }

    if (this.config.rotationStrategy === 'random') {
      // Random selection
      const randomIndex = Math.floor(Math.random() * this.proxies.length);
      return this.proxies[randomIndex];

    } else {
      // Round-robin selection
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
      return proxy;
    }
  }

  /**
   * Get proxy configuration as Python-compatible JSON
   */
  getProxyForPython(): any | null {
    const proxy = this.getNext();

    if (!proxy) {
      return null;
    }

    return {
      enabled: true,
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: proxy.password,
      type: proxy.type
    };
  }

  /**
   * Check if proxies are enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && this.proxies.length > 0;
  }

  /**
   * Get proxy statistics
   */
  getStats() {
    return {
      enabled: this.config.enabled,
      mode: this.config.mode,
      totalProxies: this.proxies.length,
      currentIndex: this.currentIndex,
      rotationStrategy: this.config.rotationStrategy
    };
  }
}

export default ProxyManager;
