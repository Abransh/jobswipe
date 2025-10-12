/**
 * @fileoverview Jobs Swipe Integration Tests
 * @description End-to-end tests for job swiping with automation integration
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Mock test setup
const setupTestServer = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });

  // Mock authentication middleware
  app.decorateRequest('user', null);
  app.addHook('preHandler', async (request, reply) => {
    (request as any).user = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'user',
      status: 'active'
    };
  });

  return app;
};

describe('/api/v1/jobs/:id/swipe - Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await setupTestServer();
    // Register routes, plugins, etc.
  });

  afterAll(async () => {
    await app.close();
  });

  describe('RIGHT Swipe - Server Automation', () => {
    it('should trigger server automation for free user under limit', async () => {
      const jobId = 'job-123';
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          resumeId: 'resume-456',
          coverLetter: 'I am interested in this position',
          priority: 5,
          metadata: {
            source: 'web',
            deviceId: 'device-789'
          }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('automated_immediately');
      expect(data.data.executionMode).toBe('server');
      expect(data.data.automation).toBeDefined();
      expect(data.data.automation.applicationId).toBeDefined();
    });

    it('should use proxy for free tier server automation', async () => {
      const jobId = 'job-proxy-test';
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer free-tier-token'
        }
      });

      const data = JSON.parse(response.body);

      // Should have proxy information in response
      expect(data.data.automation?.proxyUsed).toBeDefined();
      expect(data.data.automation?.proxyUsed).toMatch(/\d+\.\d+\.\d+\.\d+:\d+/);
    });

    it('should queue for desktop after free tier limit (15 apps)', async () => {
      // Simulate user with 15 applications already used
      const userId = 'maxed-out-user';
      const jobId = 'job-456';

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer maxed-out-user-token'
        }
      });

      expect(response.statusCode).toBe(201); // 201 for queued

      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('queued_for_desktop');
      expect(data.data.executionMode).toBe('desktop');
      expect(data.data.serverAutomation.eligible).toBe(false);
      expect(data.data.serverAutomation.reason).toContain('limit reached');
      expect(data.data.serverAutomation.suggestedAction).toBe('download_desktop_app');
    });
  });

  describe('LEFT Swipe - No Automation', () => {
    it('should only record swipe without automation', async () => {
      const jobId = 'job-left-swipe';
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'LEFT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(200);

      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.direction).toBe('LEFT');
      expect(data.data.action).toBe('recorded');
      expect(data.data.automation).toBeUndefined(); // No automation for left swipe
    });
  });

  describe('Paid Tier - Unlimited Server Automation', () => {
    it('should allow unlimited server automation for pro users', async () => {
      const jobId = 'job-pro-user';
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer pro-user-token'
        }
      });

      const data = JSON.parse(response.body);

      expect(data.success).toBe(true);
      expect(data.data.executionMode).toBe('server');
      expect(data.data.serverAutomation.eligible).toBe(true);
      expect(data.data.serverAutomation.upgradeRequired).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/jobs/non-existent-job/swipe',
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(404);

      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Job not found');
    });

    it('should return 409 for duplicate application', async () => {
      const jobId = 'job-already-applied';

      // First application
      await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      // Second application (should fail)
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(response.statusCode).toBe(409);

      const data = JSON.parse(response.body);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Already applied to this job');
    });

    it('should handle proxy unavailability gracefully', async () => {
      // Mock scenario where no proxies are available
      const jobId = 'job-no-proxy';

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer free-tier-token'
        }
      });

      // Should fallback to desktop queue if proxy unavailable
      const data = JSON.parse(response.body);

      if (response.statusCode === 503) {
        // Service unavailable - expected when no proxies
        expect(data.error).toContain('Proxy service unavailable');
      } else {
        // Gracefully queued for desktop
        expect(data.data.executionMode).toBe('desktop');
      }
    });
  });

  describe('WebSocket Integration', () => {
    it('should emit real-time updates on job queue', async () => {
      const jobId = 'job-websocket-test';
      const emittedEvents: any[] = [];

      // Mock WebSocket emission
      const mockWebSocket = {
        emitToUser: (userId: string, event: string, data: any) => {
          emittedEvents.push({ userId, event, data });
        },
        emitApplicationStatusUpdate: (data: any) => {
          emittedEvents.push({ event: 'application-status', data });
        },
        emitNotification: (userId: string, notification: any) => {
          emittedEvents.push({ userId, event: 'notification', data: notification });
        }
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: { source: 'web' }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      expect(emittedEvents.length).toBeGreaterThan(0);
      expect(emittedEvents.some(e => e.event === 'job-queued-from-swipe')).toBe(true);
    });
  });

  describe('Analytics & Tracking', () => {
    it('should track swipe analytics', async () => {
      const jobId = 'job-analytics';
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/jobs/${jobId}/swipe`,
        payload: {
          direction: 'RIGHT',
          metadata: {
            source: 'web',
            deviceId: 'device-123',
            userAgent: 'Mozilla/5.0...',
            ipAddress: '192.168.1.1'
          }
        },
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      const data = JSON.parse(response.body);

      // Should have correlation ID for tracking
      expect(data.correlationId).toBeDefined();
      expect(data.data.processingTime).toBeDefined();
    });
  });
});
