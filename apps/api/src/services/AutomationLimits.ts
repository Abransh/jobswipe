/**
 * @fileoverview Automation Limits Service
 * @description Track and enforce user limits for server-side automation
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { EventEmitter } from 'events';

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

export interface UserLimits {
  userId: string;
  plan: 'free' | 'basic' | 'pro' | 'premium' | 'enterprise';
  serverApplicationsUsed: number;
  serverApplicationsLimit: number;
  totalApplicationsUsed: number;
  monthlyApplicationsLimit: number;
  dailyApplicationsUsed: number;
  dailyApplicationsLimit: number;
  canUseServerAutomation: boolean;
  resetDate: Date;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  suggestedAction?: string;
  remainingServerApplications: number;
  upgradeRequired: boolean;
}

// =============================================================================
// AUTOMATION LIMITS SERVICE
// =============================================================================

export class AutomationLimits extends EventEmitter {
  private userLimits = new Map<string, UserLimits>();
  private resetInterval: NodeJS.Timeout | null = null;

  // Default limits by plan
  private readonly DEFAULT_LIMITS = {
    free: {
      serverApplicationsLimit: 5,
      monthlyApplicationsLimit: 20,
      dailyApplicationsLimit: 3
    },
    basic: {
      serverApplicationsLimit: 15,
      monthlyApplicationsLimit: 100,
      dailyApplicationsLimit: 10
    },
    pro: {
      serverApplicationsLimit: 50,
      monthlyApplicationsLimit: 500,
      dailyApplicationsLimit: 25
    },
    premium: {
      serverApplicationsLimit: 200,
      monthlyApplicationsLimit: 2000,
      dailyApplicationsLimit: 100
    },
    enterprise: {
      serverApplicationsLimit: -1, // Unlimited
      monthlyApplicationsLimit: -1, // Unlimited
      dailyApplicationsLimit: -1  // Unlimited
    }
  };

  constructor(private fastify: any) {
    super();
    this.startDailyReset();
    this.fastify.log.info('AutomationLimits service initialized');
  }

  // =============================================================================
  // LIMIT CHECKING
  // =============================================================================

  /**
   * Check if user can use server automation
   */
  async checkServerEligibility(userId: string): Promise<LimitCheckResult> {
    const limits = await this.getUserLimits(userId);
    
    // Check if server automation is available for this plan
    if (!limits.canUseServerAutomation) {
      return {
        allowed: false,
        reason: 'Server automation not available for your plan',
        suggestedAction: 'upgrade_required',
        remainingServerApplications: 0,
        upgradeRequired: true
      };
    }

    // Check daily limits first
    if (limits.dailyApplicationsLimit > 0 && limits.dailyApplicationsUsed >= limits.dailyApplicationsLimit) {
      return {
        allowed: false,
        reason: 'Daily application limit reached',
        suggestedAction: 'wait_until_tomorrow',
        remainingServerApplications: 0,
        upgradeRequired: false
      };
    }

    // Check server-specific limits
    if (limits.serverApplicationsLimit > 0 && limits.serverApplicationsUsed >= limits.serverApplicationsLimit) {
      return {
        allowed: false,
        reason: 'Server automation limit reached. Download desktop app for unlimited applications.',
        suggestedAction: 'download_desktop_app',
        remainingServerApplications: 0,
        upgradeRequired: false
      };
    }

    // Check monthly limits
    if (limits.monthlyApplicationsLimit > 0 && limits.totalApplicationsUsed >= limits.monthlyApplicationsLimit) {
      return {
        allowed: false,
        reason: 'Monthly application limit reached',
        suggestedAction: 'upgrade_required',
        remainingServerApplications: 0,
        upgradeRequired: true
      };
    }

    // Calculate remaining applications
    let remainingServer = limits.serverApplicationsLimit > 0 
      ? limits.serverApplicationsLimit - limits.serverApplicationsUsed
      : 999999;

    const remainingDaily = limits.dailyApplicationsLimit > 0
      ? limits.dailyApplicationsLimit - limits.dailyApplicationsUsed
      : 999999;

    const remainingMonthly = limits.monthlyApplicationsLimit > 0
      ? limits.monthlyApplicationsLimit - limits.totalApplicationsUsed
      : 999999;

    remainingServer = Math.min(remainingServer, remainingDaily, remainingMonthly);

    return {
      allowed: true,
      remainingServerApplications: remainingServer,
      upgradeRequired: false
    };
  }

  /**
   * Record a server automation usage
   */
  async recordServerApplication(userId: string): Promise<void> {
    const limits = await this.getUserLimits(userId);
    
    limits.serverApplicationsUsed++;
    limits.totalApplicationsUsed++;
    limits.dailyApplicationsUsed++;

    // Save to persistent storage
    await this.saveUserLimits(limits);

    // Emit events for tracking
    this.emit('application-recorded', {
      userId,
      type: 'server',
      remaining: Math.max(0, limits.serverApplicationsLimit - limits.serverApplicationsUsed)
    });

    // Check if user is approaching limits
    if (limits.serverApplicationsLimit > 0) {
      const remaining = limits.serverApplicationsLimit - limits.serverApplicationsUsed;
      if (remaining <= 2) {
        this.emit('limit-approaching', {
          userId,
          type: 'server',
          remaining,
          suggestedAction: 'download_desktop_app'
        });
      }
    }

    this.fastify.log.info(`Recorded server application for user ${userId}: ${limits.serverApplicationsUsed}/${limits.serverApplicationsLimit}`);
  }

  /**
   * Record a desktop automation usage
   */
  async recordDesktopApplication(userId: string): Promise<void> {
    const limits = await this.getUserLimits(userId);
    
    limits.totalApplicationsUsed++;
    limits.dailyApplicationsUsed++;

    await this.saveUserLimits(limits);

    this.emit('application-recorded', {
      userId,
      type: 'desktop',
      unlimited: true
    });

    this.fastify.log.debug(`Recorded desktop application for user ${userId}: ${limits.totalApplicationsUsed} total`);
  }

  // =============================================================================
  // USER LIMIT MANAGEMENT
  // =============================================================================

  /**
   * Get user limits (from cache or database)
   */
  private async getUserLimits(userId: string): Promise<UserLimits> {
    // Check cache first
    if (this.userLimits.has(userId)) {
      return this.userLimits.get(userId)!;
    }

    // Load from database
    const limits = await this.loadUserLimitsFromDatabase(userId);
    this.userLimits.set(userId, limits);
    return limits;
  }

  /**
   * Load user limits from database
   */
  private async loadUserLimitsFromDatabase(userId: string): Promise<UserLimits> {
    try {
      // In production, this would query the database
      // For now, we'll simulate based on user ID and environment
      
      // Determine user plan (this would come from database)
      const plan = await this.getUserPlan(userId);
      const planLimits = this.DEFAULT_LIMITS[plan];

      // Get current usage (this would come from database)
      const usage = await this.getUserUsage(userId);

      const limits: UserLimits = {
        userId,
        plan,
        serverApplicationsUsed: usage.serverApplicationsUsed,
        serverApplicationsLimit: planLimits.serverApplicationsLimit,
        totalApplicationsUsed: usage.totalApplicationsUsed,
        monthlyApplicationsLimit: planLimits.monthlyApplicationsLimit,
        dailyApplicationsUsed: usage.dailyApplicationsUsed,
        dailyApplicationsLimit: planLimits.dailyApplicationsLimit,
        canUseServerAutomation: plan !== 'free' || usage.serverApplicationsUsed < planLimits.serverApplicationsLimit,
        resetDate: this.getNextResetDate()
      };

      return limits;

    } catch (error) {
      this.fastify.log.error(`Failed to load user limits for ${userId}:`, error);
      
      // Return free plan limits as fallback
      return {
        userId,
        plan: 'free',
        serverApplicationsUsed: 0,
        serverApplicationsLimit: this.DEFAULT_LIMITS.free.serverApplicationsLimit,
        totalApplicationsUsed: 0,
        monthlyApplicationsLimit: this.DEFAULT_LIMITS.free.monthlyApplicationsLimit,
        dailyApplicationsUsed: 0,
        dailyApplicationsLimit: this.DEFAULT_LIMITS.free.dailyApplicationsLimit,
        canUseServerAutomation: true,
        resetDate: this.getNextResetDate()
      };
    }
  }

  /**
   * Get user plan from database
   */
  private async getUserPlan(userId: string): Promise<UserLimits['plan']> {
    try {
      // In production, query subscription table
      // const subscription = await this.fastify.db.subscription.findUnique({
      //   where: { userId }
      // });
      // return subscription?.plan || 'free';

      // For development, use environment variable or default to free
      const defaultPlan = process.env.NODE_ENV === 'development' ? 'pro' : 'free';
      return defaultPlan as UserLimits['plan'];

    } catch (error) {
      this.fastify.log.warn(`Failed to get user plan for ${userId}, defaulting to free`);
      return 'free';
    }
  }

  /**
   * Get user usage from database
   */
  private async getUserUsage(userId: string): Promise<{
    serverApplicationsUsed: number;
    totalApplicationsUsed: number;
    dailyApplicationsUsed: number;
  }> {
    try {
      // In production, query usage records and job applications
      // const today = new Date();
      // today.setHours(0, 0, 0, 0);
      
      // const [serverUsage, totalUsage, dailyUsage] = await Promise.all([
      //   this.fastify.db.jobApplication.count({
      //     where: {
      //       userId,
      //       executionMode: 'SERVER',
      //       createdAt: { gte: this.getMonthStart() }
      //     }
      //   }),
      //   this.fastify.db.jobApplication.count({
      //     where: {
      //       userId,
      //       createdAt: { gte: this.getMonthStart() }
      //     }
      //   }),
      //   this.fastify.db.jobApplication.count({
      //     where: {
      //       userId,
      //       createdAt: { gte: today }
      //     }
      //   })
      // ]);

      // For development, return zero usage
      return {
        serverApplicationsUsed: 0,
        totalApplicationsUsed: 0,
        dailyApplicationsUsed: 0
      };

    } catch (error) {
      this.fastify.log.warn(`Failed to get user usage for ${userId}:`, error);
      return {
        serverApplicationsUsed: 0,
        totalApplicationsUsed: 0,
        dailyApplicationsUsed: 0
      };
    }
  }

  /**
   * Save user limits to database
   */
  private async saveUserLimits(limits: UserLimits): Promise<void> {
    try {
      // Update cache
      this.userLimits.set(limits.userId, limits);

      // In production, save to database
      // await this.fastify.db.usageRecord.upsert({
      //   where: {
      //     userId_feature_date: {
      //       userId: limits.userId,
      //       feature: 'APPLICATION_SERVER',
      //       date: new Date()
      //     }
      //   },
      //   create: {
      //     userId: limits.userId,
      //     feature: 'APPLICATION_SERVER',
      //     count: limits.serverApplicationsUsed,
      //     date: new Date()
      //   },
      //   update: {
      //     count: limits.serverApplicationsUsed
      //   }
      // });

    } catch (error) {
      this.fastify.log.error(`Failed to save user limits for ${limits.userId}:`, error);
    }
  }

  // =============================================================================
  // RESET & MAINTENANCE
  // =============================================================================

  /**
   * Start daily reset interval
   */
  private startDailyReset(): void {
    // Reset daily counters at midnight
    const msUntilMidnight = this.getMillisecondsUntilMidnight();
    
    setTimeout(() => {
      this.resetDailyCounts();
      
      // Then reset daily every 24 hours
      this.resetInterval = setInterval(() => {
        this.resetDailyCounts();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    this.fastify.log.info('Daily reset interval started');
  }

  /**
   * Reset daily usage counters
   */
  private resetDailyCounts(): void {
    for (const limits of this.userLimits.values()) {
      limits.dailyApplicationsUsed = 0;
    }
    
    this.fastify.log.info('Daily usage counters reset');
    this.emit('daily-reset');
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

  /**
   * Get next reset date (first day of next month)
   */
  private getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  /**
   * Get start of current month
   */
  private getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // =============================================================================
  // ADMIN & REPORTING
  // =============================================================================

  /**
   * Get usage statistics
   */
  public getUserStats(userId: string): UserLimits | null {
    return this.userLimits.get(userId) || null;
  }

  /**
   * Get system usage statistics
   */
  public getSystemStats(): {
    totalUsers: number;
    activeUsers: number;
    serverApplicationsToday: number;
    averageUsageByPlan: Record<string, number>;
  } {
    const users = Array.from(this.userLimits.values());
    const activeUsers = users.filter(u => u.dailyApplicationsUsed > 0);
    const serverApplicationsToday = users.reduce((sum, u) => sum + u.dailyApplicationsUsed, 0);

    const usageByPlan = users.reduce((acc, user) => {
      if (!acc[user.plan]) acc[user.plan] = [];
      acc[user.plan].push(user.serverApplicationsUsed);
      return acc;
    }, {} as Record<string, number[]>);

    const averageUsageByPlan = Object.entries(usageByPlan).reduce((acc, [plan, usages]) => {
      acc[plan] = usages.length > 0 ? usages.reduce((a, b) => a + b, 0) / usages.length : 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      serverApplicationsToday,
      averageUsageByPlan
    };
  }

  /**
   * Update user plan (for admin use)
   */
  public async updateUserPlan(userId: string, newPlan: UserLimits['plan']): Promise<void> {
    const limits = await this.getUserLimits(userId);
    limits.plan = newPlan;
    
    const planLimits = this.DEFAULT_LIMITS[newPlan];
    limits.serverApplicationsLimit = planLimits.serverApplicationsLimit;
    limits.monthlyApplicationsLimit = planLimits.monthlyApplicationsLimit;
    limits.dailyApplicationsLimit = planLimits.dailyApplicationsLimit;
    limits.canUseServerAutomation = true;

    await this.saveUserLimits(limits);

    this.emit('plan-updated', { userId, oldPlan: limits.plan, newPlan });
    this.fastify.log.info(`Updated user plan: ${userId} -> ${newPlan}`);
  }

  /**
   * Reset user limits (for admin use)
   */
  public async resetUserLimits(userId: string): Promise<void> {
    const limits = await this.getUserLimits(userId);
    limits.serverApplicationsUsed = 0;
    limits.totalApplicationsUsed = 0;
    limits.dailyApplicationsUsed = 0;

    await this.saveUserLimits(limits);

    this.emit('limits-reset', { userId });
    this.fastify.log.info(`Reset limits for user: ${userId}`);
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  /**
   * Cleanup intervals
   */
  public cleanup(): void {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
      this.resetInterval = null;
    }

    this.fastify.log.info('AutomationLimits cleanup completed');
    this.emit('cleanup-completed');
  }
}