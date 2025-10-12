/**
 * @fileoverview AutomationLimits Service Tests
 * @description Unit tests for automation limits enforcement and free tier management
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { AutomationLimits, UserLimits, LimitCheckResult } from '../../src/services/AutomationLimits';

// Mock Fastify instance
const createMockFastify = () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  },
  db: {
    subscription: {
      findUnique: vi.fn()
    },
    jobApplication: {
      count: vi.fn()
    }
  }
});

describe('AutomationLimits', () => {
  let automationLimits: AutomationLimits;
  let mockFastify: ReturnType<typeof createMockFastify>;

  beforeEach(() => {
    mockFastify = createMockFastify();
    automationLimits = new AutomationLimits(mockFastify as any);
  });

  describe('Free Tier Limits', () => {
    it('should have 15 server applications limit for free tier', () => {
      const limits = (automationLimits as any).DEFAULT_LIMITS.free;
      expect(limits.serverApplicationsLimit).toBe(15);
    });

    it('should allow server automation when under limit', async () => {
      const userId = 'test-user-1';

      // Mock user as free tier with 0 applications used
      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 0,
        totalApplicationsUsed: 0,
        dailyApplicationsUsed: 0
      });

      const result: LimitCheckResult = await automationLimits.checkServerEligibility(userId);

      expect(result.allowed).toBe(true);
      expect(result.remainingServerApplications).toBe(15);
      expect(result.upgradeRequired).toBe(false);
    });

    it('should block server automation at limit (15 apps)', async () => {
      const userId = 'test-user-2';

      // Mock user as free tier with 15 applications used
      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 15,
        totalApplicationsUsed: 15,
        dailyApplicationsUsed: 3
      });

      const result: LimitCheckResult = await automationLimits.checkServerEligibility(userId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Server automation limit reached');
      expect(result.reason).toContain('Download desktop app');
      expect(result.suggestedAction).toBe('download_desktop_app');
      expect(result.remainingServerApplications).toBe(0);
      expect(result.upgradeRequired).toBe(false);
    });

    it('should calculate remaining applications correctly', async () => {
      const userId = 'test-user-3';

      // Mock user with 10 applications used (5 remaining)
      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 10,
        totalApplicationsUsed: 10,
        dailyApplicationsUsed: 2
      });

      const result: LimitCheckResult = await automationLimits.checkServerEligibility(userId);

      expect(result.allowed).toBe(true);
      expect(result.remainingServerApplications).toBe(5);
    });
  });

  describe('Daily Limits', () => {
    it('should enforce daily limit even if server limit not reached', async () => {
      const userId = 'test-user-daily';

      // Mock user with daily limit reached but server limit not reached
      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 5,
        totalApplicationsUsed: 5,
        dailyApplicationsUsed: 3 // Daily limit for free is 3
      });

      const result: LimitCheckResult = await automationLimits.checkServerEligibility(userId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Daily application limit reached');
      expect(result.suggestedAction).toBe('wait_until_tomorrow');
    });
  });

  describe('Usage Recording', () => {
    it('should record server application usage', async () => {
      const userId = 'test-user-record';

      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 0,
        totalApplicationsUsed: 0,
        dailyApplicationsUsed: 0
      });

      // Record an application
      await automationLimits.recordServerApplication(userId);

      const stats = automationLimits.getUserStats(userId);
      expect(stats).toBeDefined();
      expect(stats?.serverApplicationsUsed).toBe(1);
      expect(stats?.totalApplicationsUsed).toBe(1);
      expect(stats?.dailyApplicationsUsed).toBe(1);
    });

    it('should emit warning when approaching limit (2 remaining)', async () => {
      const userId = 'test-user-warning';

      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 13, // 2 remaining
        totalApplicationsUsed: 13,
        dailyApplicationsUsed: 2
      });

      const emitSpy = vi.spyOn(automationLimits, 'emit');

      await automationLimits.recordServerApplication(userId);

      expect(emitSpy).toHaveBeenCalledWith('limit-approaching', expect.objectContaining({
        userId,
        type: 'server',
        remaining: 1,
        suggestedAction: 'download_desktop_app'
      }));
    });
  });

  describe('Paid Tier', () => {
    it('should allow unlimited server automation for enterprise tier', async () => {
      const userId = 'enterprise-user';

      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('enterprise');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 500,
        totalApplicationsUsed: 500,
        dailyApplicationsUsed: 50
      });

      const result: LimitCheckResult = await automationLimits.checkServerEligibility(userId);

      expect(result.allowed).toBe(true);
      expect(result.remainingServerApplications).toBeGreaterThan(100000); // Effectively unlimited
    });

    it('should have higher limits for pro tier', async () => {
      const userId = 'pro-user';

      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('pro');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 0,
        totalApplicationsUsed: 0,
        dailyApplicationsUsed: 0
      });

      const result: LimitCheckResult = await automationLimits.checkServerEligibility(userId);

      expect(result.allowed).toBe(true);
      expect(result.remainingServerApplications).toBe(50); // Pro tier limit
    });
  });

  describe('Desktop Automation Recording', () => {
    it('should record desktop applications separately', async () => {
      const userId = 'desktop-user';

      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 0,
        totalApplicationsUsed: 0,
        dailyApplicationsUsed: 0
      });

      await automationLimits.recordDesktopApplication(userId);

      const stats = automationLimits.getUserStats(userId);
      expect(stats?.serverApplicationsUsed).toBe(0); // Desktop doesn't count toward server limit
      expect(stats?.totalApplicationsUsed).toBe(1);
      expect(stats?.dailyApplicationsUsed).toBe(1);
    });
  });

  describe('Plan Updates', () => {
    it('should update user plan and reset limits', async () => {
      const userId = 'upgrade-user';

      vi.spyOn(automationLimits as any, 'getUserPlan').mockResolvedValue('free');
      vi.spyOn(automationLimits as any, 'getUserUsage').mockResolvedValue({
        serverApplicationsUsed: 15,
        totalApplicationsUsed: 15,
        dailyApplicationsUsed: 3
      });

      // Initially at limit
      let result = await automationLimits.checkServerEligibility(userId);
      expect(result.allowed).toBe(false);

      // Upgrade to pro
      await automationLimits.updateUserPlan(userId, 'pro');

      // Should now have more quota
      const stats = automationLimits.getUserStats(userId);
      expect(stats?.plan).toBe('pro');
      expect(stats?.serverApplicationsLimit).toBe(50);
    });
  });
});
