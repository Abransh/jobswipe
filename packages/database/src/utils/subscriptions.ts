import { db } from '../index';
import { SubscriptionPlan, SubscriptionStatus, UsageFeature, Subscription } from '../generated';

export interface CreateSubscriptionInput {
  userId: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  trialEnd?: Date;
}

export interface UpdateSubscriptionInput {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface UsageInput {
  userId: string;
  feature: UsageFeature;
  count?: number;
  metadata?: any;
}

/**
 * Create or update user subscription
 */
export async function upsertSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  const { userId, ...subscriptionData } = input;

  return db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      ...subscriptionData,
      status: SubscriptionStatus.ACTIVE,
    },
    update: subscriptionData,
  });
}

/**
 * Update subscription
 */
export async function updateSubscription(
  userId: string,
  input: UpdateSubscriptionInput
): Promise<Subscription> {
  return db.subscription.update({
    where: { userId },
    data: input,
  });
}

/**
 * Get user subscription with usage data
 */
export async function getUserSubscription(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!subscription) {
    // Create free subscription if none exists
    return db.subscription.create({
      data: {
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string, immediately = false): Promise<Subscription> {
  const updateData = immediately
    ? {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: false,
      }
    : {
        cancelAtPeriodEnd: true,
      };

  return db.subscription.update({
    where: { userId },
    data: updateData,
  });
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(userId: string): Promise<Subscription> {
  return db.subscription.update({
    where: { userId },
    data: {
      status: SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Record usage for a feature
 */
export async function recordUsage(input: UsageInput): Promise<void> {
  const { userId, feature, count = 1, metadata } = input;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.usageRecord.upsert({
    where: {
      userId_feature_date: {
        userId,
        feature,
        date: today,
      },
    },
    create: {
      userId,
      feature,
      count,
      metadata,
      date: today,
    },
    update: {
      count: {
        increment: count,
      },
      metadata,
    },
  });
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsage(
  userId: string,
  feature?: UsageFeature,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const where = {
    userId,
    date: {
      gte: startDate,
    },
    ...(feature && { feature }),
  };

  const [records, totalUsage, dailyUsage] = await Promise.all([
    // Get all usage records
    db.usageRecord.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    }),

    // Get total usage by feature
    db.usageRecord.groupBy({
      by: ['feature'],
      where,
      _sum: {
        count: true,
      },
    }),

    // Get daily usage for the period
    db.usageRecord.findMany({
      where,
      select: {
        feature: true,
        count: true,
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    }),
  ]);

  return {
    records,
    totalUsage: totalUsage.reduce((acc, curr) => {
      acc[curr.feature] = curr._sum.count || 0;
      return acc;
    }, {} as Record<UsageFeature, number>),
    dailyUsage,
  };
}

/**
 * Check if user has reached usage limit for a feature
 */
export async function checkUsageLimit(
  userId: string,
  feature: UsageFeature
): Promise<{
  allowed: boolean;
  currentUsage: number;
  limit: number;
  plan: SubscriptionPlan;
}> {
  const subscription = await getUserSubscription(userId);
  const plan = subscription.plan;

  // Define usage limits per plan
  const limits: Record<SubscriptionPlan, Record<UsageFeature, number>> = {
    [SubscriptionPlan.FREE]: {
      [UsageFeature.APPLICATION_AUTOMATION]: 5,
      [UsageFeature.RESUME_GENERATION]: 3,
      [UsageFeature.COVER_LETTER_GENERATION]: 5,
      [UsageFeature.JOB_SEARCH]: 10,
      [UsageFeature.API_CALLS]: 100,
      [UsageFeature.PDF_EXPORTS]: 5,
      [UsageFeature.DOCUMENT_UPLOADS]: 3,
    },
    [SubscriptionPlan.BASIC]: {
      [UsageFeature.APPLICATION_AUTOMATION]: 50,
      [UsageFeature.RESUME_GENERATION]: 10,
      [UsageFeature.COVER_LETTER_GENERATION]: 50,
      [UsageFeature.JOB_SEARCH]: 100,
      [UsageFeature.API_CALLS]: 1000,
      [UsageFeature.PDF_EXPORTS]: 50,
      [UsageFeature.DOCUMENT_UPLOADS]: 20,
    },
    [SubscriptionPlan.PRO]: {
      [UsageFeature.APPLICATION_AUTOMATION]: 200,
      [UsageFeature.RESUME_GENERATION]: 50,
      [UsageFeature.COVER_LETTER_GENERATION]: 200,
      [UsageFeature.JOB_SEARCH]: 500,
      [UsageFeature.API_CALLS]: 5000,
      [UsageFeature.PDF_EXPORTS]: 200,
      [UsageFeature.DOCUMENT_UPLOADS]: 100,
    },
    [SubscriptionPlan.ENTERPRISE]: {
      [UsageFeature.APPLICATION_AUTOMATION]: Infinity,
      [UsageFeature.RESUME_GENERATION]: Infinity,
      [UsageFeature.COVER_LETTER_GENERATION]: Infinity,
      [UsageFeature.JOB_SEARCH]: Infinity,
      [UsageFeature.API_CALLS]: Infinity,
      [UsageFeature.PDF_EXPORTS]: Infinity,
      [UsageFeature.DOCUMENT_UPLOADS]: Infinity,
    },
  };

  const limit = limits[plan][feature];
  
  // Get current month usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const currentUsage = await db.usageRecord.aggregate({
    where: {
      userId,
      feature,
      date: {
        gte: startOfMonth,
      },
    },
    _sum: {
      count: true,
    },
  });

  const usage = currentUsage._sum.count || 0;

  return {
    allowed: usage < limit,
    currentUsage: usage,
    limit,
    plan,
  };
}

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics() {
  const [planDistribution, revenueStats, churnRate] = await Promise.all([
    // Plan distribution
    db.subscription.groupBy({
      by: ['plan'],
      _count: {
        plan: true,
      },
    }),

    // Revenue stats (active subscriptions)
    db.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        plan: { not: SubscriptionPlan.FREE },
      },
      select: {
        plan: true,
        createdAt: true,
      },
    }),

    // Churn rate (canceled in last 30 days vs active)
    Promise.all([
      db.subscription.count({
        where: {
          status: SubscriptionStatus.CANCELED,
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.subscription.count({
        where: {
          status: SubscriptionStatus.ACTIVE,
        },
      }),
    ]).then(([canceled, active]) => ({
      canceled,
      active,
      rate: active > 0 ? (canceled / (canceled + active)) * 100 : 0,
    })),
  ]);

  return {
    planDistribution: planDistribution.reduce((acc, curr) => {
      acc[curr.plan] = curr._count.plan;
      return acc;
    }, {} as Record<SubscriptionPlan, number>),
    revenueStats,
    churnRate,
  };
}

/**
 * Handle subscription period end
 */
export async function handleSubscriptionPeriodEnd(userId: string): Promise<void> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return;

  if (subscription.cancelAtPeriodEnd) {
    await db.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });
  }
}