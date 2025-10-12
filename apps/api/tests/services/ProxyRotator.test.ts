/**
 * @fileoverview ProxyRotator Service Tests
 * @description Unit tests for proxy rotation, health checking, and smart selection
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProxyRotator, ProxyConfig } from '../../src/services/ProxyRotator';

// Mock Fastify instance
const createMockFastify = () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
});

describe('ProxyRotator', () => {
  let proxyRotator: ProxyRotator;
  let mockFastify: ReturnType<typeof createMockFastify>;

  beforeEach(() => {
    mockFastify = createMockFastify();
    proxyRotator = new ProxyRotator(mockFastify as any);
  });

  afterEach(() => {
    proxyRotator.cleanup();
  });

  describe('Proxy Management', () => {
    it('should add proxy to rotation pool', () => {
      const proxyData = {
        host: '192.168.1.100',
        port: 8080,
        username: 'user1',
        password: 'pass1',
        proxyType: 'residential' as const,
        provider: 'test-provider'
      };

      const proxyId = proxyRotator.addProxy(proxyData);

      expect(proxyId).toBeDefined();
      expect(proxyId).toMatch(/^proxy_/);

      const proxy = proxyRotator.getProxy(proxyId);
      expect(proxy).toBeDefined();
      expect(proxy?.host).toBe('192.168.1.100');
      expect(proxy?.port).toBe(8080);
      expect(proxy?.isActive).toBe(true);
    });

    it('should initialize with default proxies when no providers configured', async () => {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      const proxies = proxyRotator.getAllProxies();
      expect(proxies.length).toBeGreaterThan(0);
    });
  });

  describe('Smart Proxy Selection', () => {
    beforeEach(() => {
      // Add multiple proxies with different characteristics
      proxyRotator.addProxy({
        host: 'proxy1.example.com',
        port: 8080,
        proxyType: 'residential',
        successRate: 95,
        currentHourlyUsage: 10,
        requestsPerHour: 100,
        dailyLimit: 1000
      } as any);

      proxyRotator.addProxy({
        host: 'proxy2.example.com',
        port: 8080,
        proxyType: 'datacenter',
        successRate: 85,
        currentHourlyUsage: 50,
        requestsPerHour: 100,
        dailyLimit: 1000
      } as any);

      proxyRotator.addProxy({
        host: 'proxy3.example.com',
        port: 8080,
        proxyType: 'residential',
        successRate: 98,
        currentHourlyUsage: 5,
        requestsPerHour: 100,
        dailyLimit: 1000
      } as any);
    });

    it('should select proxy with highest success rate', async () => {
      const proxy = await proxyRotator.getNextProxy();

      expect(proxy).toBeDefined();
      // Should prioritize proxy3 with 98% success rate
      expect(proxy?.host).toBe('proxy3.example.com');
    });

    it('should update usage tracking after selection', async () => {
      const proxy = await proxyRotator.getNextProxy();

      expect(proxy).toBeDefined();
      expect(proxy?.currentHourlyUsage).toBeGreaterThan(0);
      expect(proxy?.lastUsedAt).toBeDefined();
    });

    it('should skip proxies that exceeded hourly limit', async () => {
      // Add a proxy that's at limit
      proxyRotator.addProxy({
        host: 'maxed-proxy.example.com',
        port: 8080,
        proxyType: 'datacenter',
        currentHourlyUsage: 100,
        requestsPerHour: 100,
        dailyLimit: 1000
      } as any);

      const proxy = await proxyRotator.getNextProxy();

      expect(proxy).toBeDefined();
      expect(proxy?.host).not.toBe('maxed-proxy.example.com');
    });

    it('should return null when no proxies available', async () => {
      // Remove all proxies
      const proxies = proxyRotator.getAllProxies();
      proxies.forEach(p => proxyRotator.removeProxy(p.id));

      const proxy = await proxyRotator.getNextProxy();

      expect(proxy).toBeNull();
    });
  });

  describe('Health Reporting', () => {
    let testProxyId: string;

    beforeEach(() => {
      testProxyId = proxyRotator.addProxy({
        host: 'health-test.example.com',
        port: 8080,
        proxyType: 'residential',
        failureCount: 0,
        successRate: 100
      } as any);
    });

    it('should update success rate on successful use', async () => {
      await proxyRotator.reportProxyHealth(testProxyId, true, 1500);

      const proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy).toBeDefined();
      expect(proxy?.successRate).toBeGreaterThan(90);
      expect(proxy?.avgResponseTime).toBe(1500);
      expect(proxy?.failureCount).toBe(0);
    });

    it('should decrease success rate on failure', async () => {
      await proxyRotator.reportProxyHealth(testProxyId, false, undefined, 'Connection timeout');

      const proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy).toBeDefined();
      expect(proxy?.successRate).toBeLessThan(100);
      expect(proxy?.failureCount).toBe(1);
    });

    it('should disable proxy after 10 failures', async () => {
      // Report 10 failures
      for (let i = 0; i < 10; i++) {
        await proxyRotator.reportProxyHealth(testProxyId, false, undefined, 'Failed');
      }

      const proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy).toBeDefined();
      expect(proxy?.isActive).toBe(false);
      expect(proxy?.failureCount).toBe(10);
    });

    it('should reset failure count on success after failures', async () => {
      // Report some failures
      await proxyRotator.reportProxyHealth(testProxyId, false);
      await proxyRotator.reportProxyHealth(testProxyId, false);

      let proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy?.failureCount).toBe(2);

      // Report success
      await proxyRotator.reportProxyHealth(testProxyId, true, 1000);

      proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy?.failureCount).toBe(1); // Decreased by 1
    });
  });

  describe('Usage Statistics', () => {
    beforeEach(() => {
      // Add test proxies
      proxyRotator.addProxy({
        host: 'stats-proxy-1.example.com',
        port: 8080,
        proxyType: 'residential',
        successRate: 95,
        costPerRequest: 0.001
      } as any);

      proxyRotator.addProxy({
        host: 'stats-proxy-2.example.com',
        port: 8080,
        proxyType: 'datacenter',
        successRate: 85,
        isActive: true
      } as any);

      proxyRotator.addProxy({
        host: 'inactive-proxy.example.com',
        port: 8080,
        proxyType: 'residential',
        isActive: false
      } as any);
    });

    it('should return accurate usage statistics', () => {
      const stats = proxyRotator.getUsageStats();

      expect(stats.totalProxies).toBeGreaterThan(0);
      expect(stats.activeProxies).toBeGreaterThan(0);
      expect(stats.activeProxies).toBeLessThanOrEqual(stats.totalProxies);
      expect(stats.averageSuccessRate).toBeGreaterThan(0);
    });

    it('should track cost accumulation', async () => {
      const proxyId = proxyRotator.addProxy({
        host: 'cost-proxy.example.com',
        port: 8080,
        proxyType: 'residential',
        costPerRequest: 0.01
      } as any);

      // Simulate successful request
      await proxyRotator.reportProxyHealth(proxyId, true, 1000);

      const stats = proxyRotator.getUsageStats();
      expect(stats.costToday).toBeGreaterThan(0);
    });

    it('should identify top performing proxies', () => {
      const stats = proxyRotator.getUsageStats();

      expect(stats.topPerformers).toBeDefined();
      expect(Array.isArray(stats.topPerformers)).toBe(true);

      if (stats.topPerformers.length > 0) {
        const topProxy = stats.topPerformers[0];
        expect(topProxy.successRate).toBeDefined();
        expect(topProxy.isActive).toBe(true);
      }
    });
  });

  describe('Proxy Provider Integration', () => {
    it('should load proxies from environment variables', async () => {
      // Mock environment variables
      process.env.BRIGHTDATA_ENDPOINT = 'proxy.brightdata.com:22225';
      process.env.BRIGHTDATA_USERNAME = 'test-user';
      process.env.BRIGHTDATA_PASSWORD = 'test-pass';

      const newRotator = new ProxyRotator(mockFastify as any);

      // Wait for proxy loading
      await new Promise(resolve => setTimeout(resolve, 500));

      const proxies = newRotator.getAllProxies();
      const brightDataProxy = proxies.find(p => p.provider === 'brightdata');

      expect(brightDataProxy).toBeDefined();
      if (brightDataProxy) {
        expect(brightDataProxy.host).toBe('proxy.brightdata.com');
        expect(brightDataProxy.port).toBe(22225);
        expect(brightDataProxy.username).toBe('test-user');
      }

      newRotator.cleanup();

      // Cleanup
      delete process.env.BRIGHTDATA_ENDPOINT;
      delete process.env.BRIGHTDATA_USERNAME;
      delete process.env.BRIGHTDATA_PASSWORD;
    });
  });

  describe('Proxy Update and Removal', () => {
    let testProxyId: string;

    beforeEach(() => {
      testProxyId = proxyRotator.addProxy({
        host: 'update-test.example.com',
        port: 8080,
        proxyType: 'residential'
      } as any);
    });

    it('should update proxy configuration', () => {
      const updated = proxyRotator.updateProxy(testProxyId, {
        port: 9090,
        username: 'new-user',
        password: 'new-pass'
      });

      expect(updated).toBe(true);

      const proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy?.port).toBe(9090);
      expect(proxy?.username).toBe('new-user');
    });

    it('should remove proxy from pool', () => {
      const removed = proxyRotator.removeProxy(testProxyId);

      expect(removed).toBe(true);

      const proxy = proxyRotator.getProxy(testProxyId);
      expect(proxy).toBeNull();
    });

    it('should return false when updating non-existent proxy', () => {
      const updated = proxyRotator.updateProxy('non-existent-id', { port: 9090 });

      expect(updated).toBe(false);
    });
  });

  describe('Usage Reset', () => {
    it('should reset hourly usage counters', async () => {
      const proxyId = proxyRotator.addProxy({
        host: 'reset-test.example.com',
        port: 8080,
        proxyType: 'residential',
        currentHourlyUsage: 50
      } as any);

      // Manually trigger hourly reset (access private method via any)
      (proxyRotator as any).resetHourlyUsage();

      const proxy = proxyRotator.getProxy(proxyId);
      expect(proxy?.currentHourlyUsage).toBe(0);
    });

    it('should reset daily usage counters', async () => {
      const proxyId = proxyRotator.addProxy({
        host: 'daily-reset-test.example.com',
        port: 8080,
        proxyType: 'residential',
        currentDailyUsage: 500
      } as any);

      // Manually trigger daily reset
      (proxyRotator as any).resetDailyUsage();

      const proxy = proxyRotator.getProxy(proxyId);
      expect(proxy?.currentDailyUsage).toBe(0);
    });
  });
});
