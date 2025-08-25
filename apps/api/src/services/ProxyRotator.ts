/**
 * @fileoverview Proxy Rotation Service
 * @description Smart proxy management for server-side automation
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface ProxyConfig {
  id: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  proxyType: 'residential' | 'datacenter' | 'mobile' | 'static' | 'rotating';
  provider?: string;
  country?: string;
  region?: string;
  isActive: boolean;
  failureCount: number;
  successRate: number;
  lastUsedAt?: Date;
  lastCheckedAt?: Date;
  requestsPerHour: number;
  dailyLimit: number;
  currentHourlyUsage: number;
  currentDailyUsage: number;
  avgResponseTime?: number;
  uptime?: number;
  costPerRequest?: number;
  monthlyLimit?: number;
  notes?: string;
  tags: string[];
}

export interface ProxyHealthCheck {
  proxyId: string;
  success: boolean;
  responseTime?: number;
  error?: string;
  timestamp: Date;
}

export interface ProxyUsageStats {
  totalProxies: number;
  activeProxies: number;
  averageSuccessRate: number;
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  costToday: number;
  topPerformers: ProxyConfig[];
  recentFailures: ProxyHealthCheck[];
}

// =============================================================================
// PROXY ROTATOR SERVICE
// =============================================================================

export class ProxyRotator extends EventEmitter {
  private proxies: Map<string, ProxyConfig> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private usageResetInterval: NodeJS.Timeout | null = null;
  private stats = {
    totalRequests: 0,
    failedRequests: 0,
    totalCost: 0
  };

  constructor(private fastify: any) {
    super();
    this.startHealthChecking();
    this.startUsageReset();
    this.loadProxiesFromDatabase();
  }

  // =============================================================================
  // PROXY MANAGEMENT
  // =============================================================================

  /**
   * Load proxies from database
   */
  private async loadProxiesFromDatabase(): Promise<void> {
    try {
      // In a real implementation, this would use Prisma or database connection
      // For now, we'll simulate with environment variables and default configs
      
      this.fastify.log.info('Loading proxies from database...');

      // Load from environment if available
      const proxyList = process.env.PROXY_LIST;
      if (proxyList) {
        try {
          const proxies = JSON.parse(proxyList);
          for (const proxy of proxies) {
            this.addProxy(proxy);
          }
        } catch (error) {
          this.fastify.log.warn('Failed to parse PROXY_LIST from environment');
        }
      }

      // Add default development proxy if none configured
      if (this.proxies.size === 0) {
        this.addDefaultProxies();
      }

      this.fastify.log.info(`Loaded ${this.proxies.size} proxies`);
      this.emit('proxies-loaded', this.proxies.size);

    } catch (error) {
      this.fastify.log.error('Failed to load proxies from database:', error);
      this.addDefaultProxies();
    }
  }

  /**
   * Add default proxies for development/testing
   */
  private addDefaultProxies(): void {
    const defaultProxies: Partial<ProxyConfig>[] = [
      {
        host: '127.0.0.1',
        port: 8080,
        proxyType: 'datacenter',
        provider: 'development',
        country: 'US',
        requestsPerHour: 100,
        dailyLimit: 1000
      },
      // Add more default proxies as needed
    ];

    for (const proxyData of defaultProxies) {
      this.addProxy(proxyData);
    }
  }

  /**
   * Add a new proxy to the rotation pool
   */
  public addProxy(proxyData: Partial<ProxyConfig>): string {
    const proxyId = proxyData.id || this.generateProxyId();
    
    const proxy: ProxyConfig = {
      id: proxyId,
      host: proxyData.host || 'localhost',
      port: proxyData.port || 8080,
      username: proxyData.username,
      password: proxyData.password,
      proxyType: proxyData.proxyType || 'datacenter',
      provider: proxyData.provider,
      country: proxyData.country,
      region: proxyData.region,
      isActive: proxyData.isActive ?? true,
      failureCount: proxyData.failureCount || 0,
      successRate: proxyData.successRate || 100.0,
      lastUsedAt: proxyData.lastUsedAt,
      lastCheckedAt: proxyData.lastCheckedAt,
      requestsPerHour: proxyData.requestsPerHour || 100,
      dailyLimit: proxyData.dailyLimit || 1000,
      currentHourlyUsage: 0,
      currentDailyUsage: 0,
      avgResponseTime: proxyData.avgResponseTime,
      uptime: proxyData.uptime || 100.0,
      costPerRequest: proxyData.costPerRequest,
      monthlyLimit: proxyData.monthlyLimit,
      notes: proxyData.notes,
      tags: proxyData.tags || []
    };

    this.proxies.set(proxyId, proxy);
    this.fastify.log.info(`Added proxy: ${proxy.host}:${proxy.port} (${proxyId})`);
    this.emit('proxy-added', proxy);

    return proxyId;
  }

  /**
   * Get the next available proxy using smart selection algorithm
   */
  public async getNextProxy(): Promise<ProxyConfig | null> {
    const availableProxies = Array.from(this.proxies.values()).filter(proxy => 
      proxy.isActive && 
      proxy.currentHourlyUsage < proxy.requestsPerHour &&
      proxy.currentDailyUsage < proxy.dailyLimit &&
      proxy.failureCount < 10 // Max 10 failures before temp disable
    );

    if (availableProxies.length === 0) {
      this.fastify.log.warn('No available proxies found');
      this.emit('no-proxies-available');
      return null;
    }

    // Smart selection algorithm:
    // 1. Prioritize by success rate
    // 2. Then by lowest usage
    // 3. Then by last used time (oldest first)
    const selectedProxy = availableProxies.sort((a, b) => {
      // Primary: Success rate (higher is better)
      if (Math.abs(a.successRate - b.successRate) > 5) {
        return b.successRate - a.successRate;
      }

      // Secondary: Current usage (lower is better)
      const aUsagePercent = a.currentHourlyUsage / a.requestsPerHour;
      const bUsagePercent = b.currentHourlyUsage / b.requestsPerHour;
      if (Math.abs(aUsagePercent - bUsagePercent) > 0.1) {
        return aUsagePercent - bUsagePercent;
      }

      // Tertiary: Last used time (older is better)
      if (!a.lastUsedAt) return -1;
      if (!b.lastUsedAt) return 1;
      return a.lastUsedAt.getTime() - b.lastUsedAt.getTime();
    })[0];

    // Update usage tracking
    selectedProxy.currentHourlyUsage++;
    selectedProxy.currentDailyUsage++;
    selectedProxy.lastUsedAt = new Date();

    this.fastify.log.debug(`Selected proxy: ${selectedProxy.host}:${selectedProxy.port}`);
    this.emit('proxy-selected', selectedProxy);

    return selectedProxy;
  }

  /**
   * Report the result of using a proxy
   */
  public async reportProxyHealth(proxyId: string, success: boolean, responseTime?: number, error?: string): Promise<void> {
    const proxy = this.proxies.get(proxyId);
    if (!proxy) {
      this.fastify.log.warn(`Proxy not found for health report: ${proxyId}`);
      return;
    }

    const healthCheck: ProxyHealthCheck = {
      proxyId,
      success,
      responseTime,
      error,
      timestamp: new Date()
    };

    // Update proxy statistics
    if (success) {
      // Reset failure count on success
      proxy.failureCount = Math.max(0, proxy.failureCount - 1);
      
      // Update success rate (rolling average)
      proxy.successRate = (proxy.successRate * 0.9) + (100 * 0.1);
      
      // Update response time
      if (responseTime) {
        proxy.avgResponseTime = proxy.avgResponseTime 
          ? (proxy.avgResponseTime * 0.8) + (responseTime * 0.2)
          : responseTime;
      }
    } else {
      // Increment failure count
      proxy.failureCount++;
      
      // Decrease success rate
      proxy.successRate = (proxy.successRate * 0.9) + (0 * 0.1);
      
      // Disable proxy if too many failures
      if (proxy.failureCount >= 10) {
        proxy.isActive = false;
        this.fastify.log.warn(`Disabled proxy due to failures: ${proxy.host}:${proxy.port}`);
        this.emit('proxy-disabled', proxy);
      }
    }

    proxy.lastCheckedAt = new Date();

    // Update statistics
    this.stats.totalRequests++;
    if (!success) {
      this.stats.failedRequests++;
    }

    // Track cost if applicable
    if (proxy.costPerRequest) {
      this.stats.totalCost += proxy.costPerRequest;
    }

    this.fastify.log.debug(`Proxy health reported: ${proxyId} - ${success ? 'SUCCESS' : 'FAILURE'}`);
    this.emit('proxy-health-reported', healthCheck);

    // Save to database in production
    await this.saveProxyHealth(healthCheck);
  }

  // =============================================================================
  // HEALTH MONITORING
  // =============================================================================

  /**
   * Start periodic health checks
   */
  private startHealthChecking(): void {
    // Check proxy health every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 5 * 60 * 1000);

    this.fastify.log.info('Started proxy health checking (5min intervals)');
  }

  /**
   * Perform health checks on all proxies
   */
  private async performHealthChecks(): Promise<void> {
    const proxies = Array.from(this.proxies.values());
    this.fastify.log.debug(`Performing health checks on ${proxies.length} proxies`);

    const healthChecks = proxies.map(proxy => this.checkProxyHealth(proxy));
    await Promise.allSettled(healthChecks);
  }

  /**
   * Check individual proxy health
   */
  private async checkProxyHealth(proxy: ProxyConfig): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Simple HTTP test through proxy
      // In production, this would use the actual proxy for a test request
      const testResult = await this.testProxyConnection(proxy);
      
      const responseTime = Date.now() - startTime;
      
      await this.reportProxyHealth(proxy.id, testResult.success, responseTime, testResult.error);
      
    } catch (error) {
      await this.reportProxyHealth(proxy.id, false, undefined, error instanceof Error ? error.message : 'Health check failed');
    }
  }

  /**
   * Test proxy connection
   */
  private async testProxyConnection(proxy: ProxyConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would test the proxy connection
      // For now, simulate based on proxy health
      
      // Simulate occasional failures for testing
      const simulatedSuccess = Math.random() > 0.1; // 90% success rate
      
      return {
        success: simulatedSuccess,
        error: simulatedSuccess ? undefined : 'Simulated connection failure'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  // =============================================================================
  // USAGE TRACKING & RESET
  // =============================================================================

  /**
   * Start usage reset intervals
   */
  private startUsageReset(): void {
    // Reset hourly usage every hour
    this.usageResetInterval = setInterval(() => {
      this.resetHourlyUsage();
    }, 60 * 60 * 1000);

    // Reset daily usage at midnight (simplified)
    const msUntilMidnight = this.getMillisecondsUntilMidnight();
    setTimeout(() => {
      this.resetDailyUsage();
      
      // Then reset daily usage every 24 hours
      setInterval(() => {
        this.resetDailyUsage();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    this.fastify.log.info('Started usage tracking and reset intervals');
  }

  /**
   * Reset hourly usage counters
   */
  private resetHourlyUsage(): void {
    for (const proxy of this.proxies.values()) {
      proxy.currentHourlyUsage = 0;
    }
    this.fastify.log.debug('Reset hourly usage counters');
  }

  /**
   * Reset daily usage counters
   */
  private resetDailyUsage(): void {
    for (const proxy of this.proxies.values()) {
      proxy.currentDailyUsage = 0;
    }
    this.fastify.log.info('Reset daily usage counters');
  }

  /**
   * Get milliseconds until next midnight
   */
  private getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  // =============================================================================
  // STATISTICS & REPORTING
  // =============================================================================

  /**
   * Get usage statistics
   */
  public getUsageStats(): ProxyUsageStats {
    const proxies = Array.from(this.proxies.values());
    const activeProxies = proxies.filter(p => p.isActive);
    
    const totalSuccessRate = activeProxies.length > 0
      ? activeProxies.reduce((sum, p) => sum + p.successRate, 0) / activeProxies.length
      : 0;
    
    const totalResponseTime = activeProxies.filter(p => p.avgResponseTime).length > 0
      ? activeProxies.filter(p => p.avgResponseTime).reduce((sum, p) => sum + (p.avgResponseTime || 0), 0) / activeProxies.filter(p => p.avgResponseTime).length
      : 0;

    const topPerformers = activeProxies
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    return {
      totalProxies: proxies.length,
      activeProxies: activeProxies.length,
      averageSuccessRate: Math.round(totalSuccessRate * 100) / 100,
      totalRequests: this.stats.totalRequests,
      failedRequests: this.stats.failedRequests,
      averageResponseTime: Math.round(totalResponseTime),
      costToday: Math.round(this.stats.totalCost * 100) / 100,
      topPerformers,
      recentFailures: [] // Would be populated from database
    };
  }

  /**
   * Get proxy by ID
   */
  public getProxy(proxyId: string): ProxyConfig | null {
    return this.proxies.get(proxyId) || null;
  }

  /**
   * Get all proxies
   */
  public getAllProxies(): ProxyConfig[] {
    return Array.from(this.proxies.values());
  }

  /**
   * Update proxy configuration
   */
  public updateProxy(proxyId: string, updates: Partial<ProxyConfig>): boolean {
    const proxy = this.proxies.get(proxyId);
    if (!proxy) return false;

    Object.assign(proxy, updates);
    this.emit('proxy-updated', proxy);
    return true;
  }

  /**
   * Remove proxy from rotation
   */
  public removeProxy(proxyId: string): boolean {
    const proxy = this.proxies.get(proxyId);
    if (!proxy) return false;

    this.proxies.delete(proxyId);
    this.emit('proxy-removed', proxy);
    return true;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate unique proxy ID
   */
  private generateProxyId(): string {
    return `proxy_${randomBytes(8).toString('hex')}`;
  }

  /**
   * Save proxy health to database
   */
  private async saveProxyHealth(healthCheck: ProxyHealthCheck): Promise<void> {
    try {
      // In production, save to database
      // await this.fastify.db.automationProxy.update({
      //   where: { id: healthCheck.proxyId },
      //   data: {
      //     lastCheckedAt: healthCheck.timestamp,
      //     successRate: this.proxies.get(healthCheck.proxyId)?.successRate,
      //     failureCount: this.proxies.get(healthCheck.proxyId)?.failureCount
      //   }
      // });
    } catch (error) {
      this.fastify.log.error('Failed to save proxy health to database:', error);
    }
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  /**
   * Cleanup intervals and resources
   */
  public cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.usageResetInterval) {
      clearInterval(this.usageResetInterval);
      this.usageResetInterval = null;
    }

    this.fastify.log.info('ProxyRotator cleanup completed');
    this.emit('cleanup-completed');
  }
}