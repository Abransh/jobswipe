/**
 * @fileoverview Security Plugin for Fastify API
 * @description Integrates enterprise security middleware with Fastify
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { 
  generateSecureToken, 
  extractIpFromHeaders, 
  isSuspiciousRequest,
  generateSecurityHeaders,
  RATE_LIMITS 
} from '@jobswipe/shared';

// =============================================================================
// INTERFACES
// =============================================================================

interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  securityHeaders: {
    enabled: boolean;
    hsts: boolean;
    contentTypeOptions: boolean;
    frameOptions: boolean;
    xssProtection: boolean;
  };
  ipBlocking: {
    enabled: boolean;
    maxAttempts: number;
    blockDuration: number;
  };
  suspiciousActivity: {
    enabled: boolean;
    threshold: number;
  };
}

interface RateLimitEntry {
  count: number;
  resetTime: Date;
}

interface BlockedIp {
  ip: string;
  reason: string;
  blockedAt: Date;
  expiresAt: Date;
  attempts: number;
}

// =============================================================================
// SECURITY PLUGIN
// =============================================================================

class SecurityService {
  private rateLimitStore = new Map<string, RateLimitEntry>();
  private blockedIps = new Map<string, BlockedIp>();
  private suspiciousActivity = new Map<string, number>();
  
  constructor(private config: SecurityConfig) {
    this.startCleanupTimer();
  }

  /**
   * Check if IP is blocked
   */
  isIpBlocked(ip: string): boolean {
    const blockInfo = this.blockedIps.get(ip);
    if (!blockInfo) return false;

    // Check if block has expired
    if (blockInfo.expiresAt <= new Date()) {
      this.blockedIps.delete(ip);
      return false;
    }

    return true;
  }

  /**
   * Block IP address
   */
  blockIp(ip: string, reason: string): void {
    if (!this.config.ipBlocking.enabled) return;

    const blockInfo: BlockedIp = {
      ip,
      reason,
      blockedAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.ipBlocking.blockDuration),
      attempts: 1,
    };

    this.blockedIps.set(ip, blockInfo);
    console.warn(`IP blocked: ${ip} - ${reason}`);
  }

  /**
   * Check rate limit
   */
  checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: Date } {
    if (!this.config.rateLimiting.enabled) {
      return { allowed: true, remaining: this.config.rateLimiting.maxRequests, resetTime: new Date() };
    }

    const now = new Date();
    const entry = this.rateLimitStore.get(key);
    
    let count = 1;
    let resetTime = new Date(now.getTime() + this.config.rateLimiting.windowMs);

    if (entry) {
      if (now <= entry.resetTime) {
        count = entry.count + 1;
        resetTime = entry.resetTime;
      } else {
        count = 1;
        resetTime = new Date(now.getTime() + this.config.rateLimiting.windowMs);
      }
    }

    this.rateLimitStore.set(key, { count, resetTime });

    const allowed = count <= this.config.rateLimiting.maxRequests;
    const remaining = Math.max(0, this.config.rateLimiting.maxRequests - count);

    return { allowed, remaining, resetTime };
  }

  /**
   * Check for suspicious activity
   */
  checkSuspiciousActivity(ip: string, userAgent: string, referer?: string): boolean {
    if (!this.config.suspiciousActivity.enabled) return false;

    const isSuspicious = isSuspiciousRequest(ip, userAgent, referer);
    if (!isSuspicious) return false;

    const key = `suspicious:${ip}`;
    const count = this.suspiciousActivity.get(key) || 0;
    this.suspiciousActivity.set(key, count + 1);

    if (count >= this.config.suspiciousActivity.threshold) {
      this.blockIp(ip, 'Suspicious activity detected');
      return true;
    }

    return false;
  }

  /**
   * Generate security headers
   */
  generateHeaders(nonce?: string): Record<string, string> {
    if (!this.config.securityHeaders.enabled) return {};

    const headers: Record<string, string> = {};

    if (this.config.securityHeaders.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (this.config.securityHeaders.frameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    if (this.config.securityHeaders.xssProtection) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (this.config.securityHeaders.hsts && process.env.NODE_ENV === 'production') {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    // Add additional security headers
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';
    headers['X-Powered-By'] = 'JobSwipe';
    headers['X-Request-ID'] = generateSecureToken(16);

    if (nonce) {
      headers['Content-Security-Policy'] = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self';
        connect-src 'self';
        media-src 'self';
        object-src 'none';
        child-src 'none';
        frame-src 'none';
        worker-src 'none';
        frame-ancestors 'none';
        form-action 'self';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim();
    }

    return headers;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();
    
    // Clean rate limit entries
    for (const [key, entry] of Array.from(this.rateLimitStore.entries())) {
      if (entry.resetTime <= now) {
        this.rateLimitStore.delete(key);
      }
    }

    // Clean blocked IPs
    for (const [ip, blockInfo] of Array.from(this.blockedIps.entries())) {
      if (blockInfo.expiresAt <= now) {
        this.blockedIps.delete(ip);
      }
    }

    // Clean suspicious activity (keep only recent entries)
    if (this.suspiciousActivity.size > 10000) {
      this.suspiciousActivity.clear();
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      rateLimitEntries: this.rateLimitStore.size,
      blockedIps: this.blockedIps.size,
      suspiciousActivity: this.suspiciousActivity.size,
      blockedIpsList: Array.from(this.blockedIps.values()),
    };
  }
}

// =============================================================================
// FASTIFY PLUGIN
// =============================================================================

async function securityPlugin(fastify: FastifyInstance) {
  const config: SecurityConfig = {
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      skipSuccessfulRequests: false,
    },
    securityHeaders: {
      enabled: true,
      hsts: true,
      contentTypeOptions: true,
      frameOptions: true,
      xssProtection: true,
    },
    ipBlocking: {
      enabled: true,
      maxAttempts: 10,
      blockDuration: 60 * 60 * 1000, // 1 hour
    },
    suspiciousActivity: {
      enabled: true,
      threshold: 5,
    },
  };

  const securityService = new SecurityService(config);

  // Register security service with Fastify
  fastify.decorate('security', securityService);

  // Add pre-handler hook for all routes
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = extractIpFromHeaders(request.headers as Record<string, string>);
    const userAgent = request.headers['user-agent'] || '';
    const referer = request.headers.referer;

    // Check if IP is blocked
    if (securityService.isIpBlocked(ip)) {
      return reply.code(403).send({
        error: 'IP blocked due to suspicious activity',
        code: 'IP_BLOCKED',
        timestamp: new Date().toISOString(),
      });
    }

    // Check for suspicious activity
    if (securityService.checkSuspiciousActivity(ip, userAgent, referer)) {
      return reply.code(403).send({
        error: 'Suspicious activity detected',
        code: 'SUSPICIOUS_ACTIVITY',
        timestamp: new Date().toISOString(),
      });
    }

    // Check rate limiting
    const rateLimitKey = `${ip}:${request.method}:${request.url}`;
    const rateLimit = securityService.checkRateLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
      reply.headers({
        'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
        'Retry-After': Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000).toString(),
      });

      return reply.code(429).send({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000),
      });
    }

    // Add rate limit headers
    reply.headers({
      'X-RateLimit-Limit': config.rateLimiting.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime.getTime() / 1000).toString(),
    });

    // Add security headers
    const securityHeaders = securityService.generateHeaders();
    reply.headers(securityHeaders);
  });

  // Add security stats endpoint
  fastify.get('/security/stats', {
    schema: {
      summary: 'Get security statistics',
      tags: ['Security'],
      response: {
        200: {
          type: 'object',
          properties: {
            stats: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const stats = securityService.getStats();
    return reply.send({ stats });
  });
}

// Export as Fastify plugin
export default fastifyPlugin(securityPlugin as any, {
  name: 'security',
  fastify: '4.x',
});

// Type declaration for TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    security: SecurityService;
  }
}