/**
 * @fileoverview Security Middleware Service for JobSwipe
 * @description Enterprise-grade security middleware with rate limiting, CSRF, and headers
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { 
  createAuthError, 
  AuthErrorCode, 
  RATE_LIMITS, 
  SECURITY_CONFIG 
} from '../types/auth';
import { 
  generateSecureToken, 
  generateCsrfToken, 
  generateSecurityHeaders, 
  generateRateLimitKey, 
  isRateLimitExceeded, 
  calculateRateLimitReset, 
  isSuspiciousRequest,
  sanitizeHtml,
  isValidIpAddress
} from '../utils/security';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: SecurityRequest) => string;
  onLimitReached?: (req: SecurityRequest) => void;
  customMessage?: string;
}

/**
 * CSRF configuration
 */
interface CsrfConfig {
  secret: string;
  cookieName: string;
  headerName: string;
  tokenLength: number;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  httpOnly: boolean;
  maxAge: number;
}

/**
 * Security headers configuration
 */
interface SecurityHeadersConfig {
  contentSecurityPolicy: boolean;
  strictTransportSecurity: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  xXSSProtection: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * Security request interface
 */
interface SecurityRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  ip: string;
  userAgent: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
}

/**
 * Security response interface
 */
interface SecurityResponse {
  headers: Record<string, string>;
  statusCode?: number;
  body?: any;
}

/**
 * Rate limit info
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

/**
 * Security middleware result
 */
interface SecurityMiddlewareResult {
  allowed: boolean;
  rateLimitInfo?: RateLimitInfo;
  csrfToken?: string;
  securityHeaders: Record<string, string>;
  error?: string;
  errorCode?: AuthErrorCode;
}

/**
 * Security metrics
 */
interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  rateLimitViolations: number;
  csrfViolations: number;
  suspiciousRequests: number;
  ipBlocks: number;
  userAgentBlocks: number;
  lastUpdate: Date;
}

/**
 * IP block info
 */
interface IpBlockInfo {
  ip: string;
  reason: string;
  blockedAt: Date;
  expiresAt: Date;
  attempts: number;
}

// =============================================================================
// SECURITY MIDDLEWARE SERVICE
// =============================================================================

export class SecurityMiddlewareService {
  private rateLimitStore: Map<string, { count: number; resetTime: Date }> = new Map();
  private blockedIps: Map<string, IpBlockInfo> = new Map();
  private csrfTokens: Map<string, { token: string; expiresAt: Date }> = new Map();
  private suspiciousActivity: Map<string, number> = new Map();
  private metrics: SecurityMetrics;

  constructor(
    private readonly rateLimitConfig: RateLimitConfig,
    private readonly csrfConfig: CsrfConfig,
    private readonly securityHeadersConfig: SecurityHeadersConfig
  ) {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      suspiciousRequests: 0,
      ipBlocks: 0,
      userAgentBlocks: 0,
      lastUpdate: new Date(),
    };

    this.startCleanupJob();
  }

  /**
   * Process security middleware for incoming request
   */
  async processRequest(request: SecurityRequest): Promise<SecurityMiddlewareResult> {
    try {
      this.metrics.totalRequests++;
      this.metrics.lastUpdate = new Date();

      // 1. Check IP blocking
      const ipBlockResult = this.checkIpBlocking(request);
      if (!ipBlockResult.allowed) {
        this.metrics.blockedRequests++;
        return ipBlockResult;
      }

      // 2. Check for suspicious activity
      const suspiciousResult = this.checkSuspiciousActivity(request);
      if (!suspiciousResult.allowed) {
        this.metrics.suspiciousRequests++;
        this.metrics.blockedRequests++;
        return suspiciousResult;
      }

      // 3. Check rate limiting
      const rateLimitResult = this.checkRateLimit(request);
      if (!rateLimitResult.allowed) {
        this.metrics.rateLimitViolations++;
        this.metrics.blockedRequests++;
        return rateLimitResult;
      }

      // 4. Check CSRF protection (for state-changing requests)
      if (this.isStateChangingRequest(request)) {
        const csrfResult = this.checkCsrfProtection(request);
        if (!csrfResult.allowed) {
          this.metrics.csrfViolations++;
          this.metrics.blockedRequests++;
          return csrfResult;
        }
      }

      // 5. Generate security headers
      const securityHeaders = this.generateSecurityHeaders(request);

      // 6. Generate CSRF token for safe methods
      let csrfToken: string | undefined;
      if (this.isSafeMethod(request.method)) {
        csrfToken = this.generateCsrfToken(request);
      }

      return {
        allowed: true,
        rateLimitInfo: rateLimitResult.rateLimitInfo,
        csrfToken,
        securityHeaders,
      };
    } catch (error) {
      console.error('Security middleware error:', error);
      return {
        allowed: false,
        error: 'Security middleware failed',
        errorCode: AuthErrorCode.INTERNAL_ERROR,
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }
  }

  /**
   * Check IP blocking
   */
  private checkIpBlocking(request: SecurityRequest): SecurityMiddlewareResult {
    const blockInfo = this.blockedIps.get(request.ip);
    
    if (blockInfo) {
      // Check if block has expired
      if (blockInfo.expiresAt <= new Date()) {
        this.blockedIps.delete(request.ip);
      } else {
        return {
          allowed: false,
          error: `IP blocked: ${blockInfo.reason}`,
          errorCode: AuthErrorCode.RATE_LIMIT_EXCEEDED,
          securityHeaders: this.generateSecurityHeaders(request),
        };
      }
    }

    // Check if IP is valid
    if (!isValidIpAddress(request.ip)) {
      this.blockIp(request.ip, 'Invalid IP address', 24 * 60 * 60 * 1000); // 24 hours
      return {
        allowed: false,
        error: 'Invalid IP address',
        errorCode: AuthErrorCode.INVALID_REQUEST,
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }

    return {
      allowed: true,
      securityHeaders: this.generateSecurityHeaders(request),
    };
  }

  /**
   * Check for suspicious activity
   */
  private checkSuspiciousActivity(request: SecurityRequest): SecurityMiddlewareResult {
    const isSuspicious = isSuspiciousRequest(
      request.ip,
      request.userAgent,
      request.headers.referer
    );

    if (isSuspicious) {
      const key = `suspicious:${request.ip}`;
      const count = this.suspiciousActivity.get(key) || 0;
      this.suspiciousActivity.set(key, count + 1);

      // Block IP after threshold
      if (count >= SECURITY_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD) {
        this.blockIp(request.ip, 'Suspicious activity detected', 60 * 60 * 1000); // 1 hour
        return {
          allowed: false,
          error: 'Suspicious activity detected',
          errorCode: AuthErrorCode.SUSPICIOUS_ACTIVITY,
          securityHeaders: this.generateSecurityHeaders(request),
        };
      }
    }

    return {
      allowed: true,
      securityHeaders: this.generateSecurityHeaders(request),
    };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(request: SecurityRequest): SecurityMiddlewareResult {
    const key = this.rateLimitConfig.keyGenerator(request);
    const now = new Date();
    const current = this.rateLimitStore.get(key);

    let count = 0;
    let resetTime = calculateRateLimitReset(this.rateLimitConfig.windowMs);

    if (current) {
      // Check if window has expired
      if (now > current.resetTime) {
        count = 1;
        resetTime = calculateRateLimitReset(this.rateLimitConfig.windowMs);
      } else {
        count = current.count + 1;
        resetTime = current.resetTime;
      }
    } else {
      count = 1;
    }

    // Update store
    this.rateLimitStore.set(key, { count, resetTime });

    // Check if limit exceeded
    if (count > this.rateLimitConfig.maxRequests) {
      const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      
      if (this.rateLimitConfig.onLimitReached) {
        this.rateLimitConfig.onLimitReached(request);
      }

      return {
        allowed: false,
        error: this.rateLimitConfig.customMessage || 'Rate limit exceeded',
        errorCode: AuthErrorCode.RATE_LIMIT_EXCEEDED,
        rateLimitInfo: {
          limit: this.rateLimitConfig.maxRequests,
          remaining: 0,
          reset: resetTime,
          retryAfter,
        },
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }

    return {
      allowed: true,
      rateLimitInfo: {
        limit: this.rateLimitConfig.maxRequests,
        remaining: this.rateLimitConfig.maxRequests - count,
        reset: resetTime,
      },
      securityHeaders: this.generateSecurityHeaders(request),
    };
  }

  /**
   * Check CSRF protection
   */
  private checkCsrfProtection(request: SecurityRequest): SecurityMiddlewareResult {
    const token = request.headers[this.csrfConfig.headerName.toLowerCase()];
    
    if (!token) {
      return {
        allowed: false,
        error: 'CSRF token missing',
        errorCode: AuthErrorCode.INVALID_REQUEST,
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }

    // Validate token
    const sessionKey = request.sessionId || request.ip;
    const storedToken = this.csrfTokens.get(sessionKey);

    if (!storedToken) {
      return {
        allowed: false,
        error: 'CSRF token not found',
        errorCode: AuthErrorCode.TOKEN_INVALID,
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }

    if (storedToken.expiresAt <= new Date()) {
      this.csrfTokens.delete(sessionKey);
      return {
        allowed: false,
        error: 'CSRF token expired',
        errorCode: AuthErrorCode.TOKEN_EXPIRED,
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }

    if (storedToken.token !== token) {
      return {
        allowed: false,
        error: 'Invalid CSRF token',
        errorCode: AuthErrorCode.TOKEN_INVALID,
        securityHeaders: this.generateSecurityHeaders(request),
      };
    }

    return {
      allowed: true,
      securityHeaders: this.generateSecurityHeaders(request),
    };
  }

  /**
   * Generate CSRF token
   */
  private generateCsrfToken(request: SecurityRequest): string {
    const token = generateCsrfToken();
    const sessionKey = request.sessionId || request.ip;
    const expiresAt = new Date(Date.now() + this.csrfConfig.maxAge);

    this.csrfTokens.set(sessionKey, { token, expiresAt });

    return token;
  }

  /**
   * Generate security headers
   */
  private generateSecurityHeaders(request: SecurityRequest): Record<string, string> {
    const nonce = generateSecureToken(16);
    const headers = generateSecurityHeaders(nonce);

    // Add custom headers
    if (this.securityHeadersConfig.customHeaders) {
      Object.assign(headers, this.securityHeadersConfig.customHeaders);
    }

    // Add rate limit headers
    headers['X-RateLimit-Limit'] = this.rateLimitConfig.maxRequests.toString();
    headers['X-RateLimit-Window'] = this.rateLimitConfig.windowMs.toString();

    // Add security-related headers
    headers['X-Request-ID'] = generateSecureToken(16);
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-Download-Options'] = 'noopen';
    headers['X-Permitted-Cross-Domain-Policies'] = 'none';

    return headers;
  }

  /**
   * Block IP address
   */
  private blockIp(ip: string, reason: string, durationMs: number): void {
    const blockInfo: IpBlockInfo = {
      ip,
      reason,
      blockedAt: new Date(),
      expiresAt: new Date(Date.now() + durationMs),
      attempts: 1,
    };

    this.blockedIps.set(ip, blockInfo);
    this.metrics.ipBlocks++;
  }

  /**
   * Unblock IP address
   */
  unblockIp(ip: string): boolean {
    const deleted = this.blockedIps.delete(ip);
    if (deleted) {
      this.metrics.ipBlocks = Math.max(0, this.metrics.ipBlocks - 1);
    }
    return deleted;
  }

  /**
   * Get blocked IPs
   */
  getBlockedIps(): IpBlockInfo[] {
    return Array.from(this.blockedIps.values());
  }

  /**
   * Check if request method is safe
   */
  private isSafeMethod(method: string): boolean {
    return ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  }

  /**
   * Check if request is state-changing
   */
  private isStateChangingRequest(request: SecurityRequest): boolean {
    return !this.isSafeMethod(request.method);
  }

  /**
   * Sanitize request data
   */
  sanitizeRequest(request: SecurityRequest): SecurityRequest {
    const sanitized: SecurityRequest = {
      ...request,
      headers: { ...request.headers },
    };

    // Sanitize headers
    for (const [key, value] of Object.entries(sanitized.headers)) {
      if (typeof value === 'string') {
        sanitized.headers[key] = sanitizeHtml(value);
      }
    }

    // Sanitize body if present
    if (sanitized.body && typeof sanitized.body === 'object') {
      sanitized.body = this.sanitizeObject(sanitized.body);
    }

    return sanitized;
  }

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Get security metrics
   */
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset security metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      suspiciousRequests: 0,
      ipBlocks: 0,
      userAgentBlocks: 0,
      lastUpdate: new Date(),
    };
  }

  /**
   * Get service health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - this.metrics.lastUpdate.getTime();
    const blockRate = this.metrics.blockedRequests / Math.max(this.metrics.totalRequests, 1);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (timeSinceLastUpdate > 5 * 60 * 1000) { // 5 minutes
      status = 'degraded';
    }
    
    if (blockRate > 0.5 || this.blockedIps.size > 1000) {
      status = 'unhealthy';
    }
    
    return {
      status,
      details: {
        metrics: this.metrics,
        blockedIpsCount: this.blockedIps.size,
        rateLimitEntriesCount: this.rateLimitStore.size,
        csrfTokensCount: this.csrfTokens.size,
        blockRate,
        timeSinceLastUpdate,
      },
    };
  }

  /**
   * Clean up expired data
   */
  private cleanupExpiredData(): void {
    const now = new Date();
    let cleanedCount = 0;

    // Clean up expired IP blocks
    for (const [ip, blockInfo] of this.blockedIps.entries()) {
      if (blockInfo.expiresAt <= now) {
        this.blockedIps.delete(ip);
        cleanedCount++;
      }
    }

    // Clean up expired rate limit entries
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        this.rateLimitStore.delete(key);
        cleanedCount++;
      }
    }

    // Clean up expired CSRF tokens
    for (const [sessionKey, tokenInfo] of this.csrfTokens.entries()) {
      if (tokenInfo.expiresAt <= now) {
        this.csrfTokens.delete(sessionKey);
        cleanedCount++;
      }
    }

    // Clean up old suspicious activity entries
    if (this.suspiciousActivity.size > 10000) {
      this.suspiciousActivity.clear();
      cleanedCount++;
    }

    if (cleanedCount > 0) {
      console.log(`Security middleware cleanup: removed ${cleanedCount} expired entries`);
    }
  }

  /**
   * Start cleanup job
   */
  private startCleanupJob(): void {
    // In a real implementation, you'd set up a proper interval
    // For now, we'll just log that cleanup would be scheduled
    console.log('Security middleware cleanup job would be scheduled to run every 5 minutes');
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create default rate limit configuration
 */
export function createDefaultRateLimitConfig(): RateLimitConfig {
  return {
    windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
    maxRequests: RATE_LIMITS.LOGIN.MAX_ATTEMPTS,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => `${req.ip}:${req.method}:${req.url}`,
    customMessage: 'Too many requests, please try again later',
  };
}

/**
 * Create default CSRF configuration
 */
export function createDefaultCsrfConfig(): CsrfConfig {
  return {
    secret: generateSecureToken(32),
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token',
    tokenLength: 32,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  };
}

/**
 * Create default security headers configuration
 */
export function createDefaultSecurityHeadersConfig(): SecurityHeadersConfig {
  return {
    contentSecurityPolicy: true,
    strictTransportSecurity: true,
    xFrameOptions: true,
    xContentTypeOptions: true,
    xXSSProtection: true,
    referrerPolicy: true,
    permissionsPolicy: true,
    customHeaders: {
      'X-Powered-By': 'JobSwipe',
      'X-API-Version': '1.0.0',
    },
  };
}

/**
 * Create security middleware service
 */
export function createSecurityMiddlewareService(
  rateLimitConfig?: Partial<RateLimitConfig>,
  csrfConfig?: Partial<CsrfConfig>,
  securityHeadersConfig?: Partial<SecurityHeadersConfig>
): SecurityMiddlewareService {
  const defaultRateLimit = createDefaultRateLimitConfig();
  const defaultCsrf = createDefaultCsrfConfig();
  const defaultHeaders = createDefaultSecurityHeadersConfig();

  return new SecurityMiddlewareService(
    { ...defaultRateLimit, ...rateLimitConfig },
    { ...defaultCsrf, ...csrfConfig },
    { ...defaultHeaders, ...securityHeadersConfig }
  );
}

/**
 * Create login rate limit configuration
 */
export function createLoginRateLimitConfig(): RateLimitConfig {
  return {
    windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
    maxRequests: RATE_LIMITS.LOGIN.MAX_ATTEMPTS,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => `login:${req.ip}`,
    customMessage: 'Too many login attempts, please try again later',
  };
}

/**
 * Create registration rate limit configuration
 */
export function createRegistrationRateLimitConfig(): RateLimitConfig {
  return {
    windowMs: RATE_LIMITS.REGISTER.WINDOW_MS,
    maxRequests: RATE_LIMITS.REGISTER.MAX_ATTEMPTS,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => `register:${req.ip}`,
    customMessage: 'Too many registration attempts, please try again later',
  };
}

/**
 * Create password reset rate limit configuration
 */
export function createPasswordResetRateLimitConfig(): RateLimitConfig {
  return {
    windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
    maxRequests: RATE_LIMITS.PASSWORD_RESET.MAX_ATTEMPTS,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => `password_reset:${req.ip}`,
    customMessage: 'Too many password reset attempts, please try again later',
  };
}

/**
 * Create token refresh rate limit configuration
 */
export function createTokenRefreshRateLimitConfig(): RateLimitConfig {
  return {
    windowMs: RATE_LIMITS.TOKEN_REFRESH.WINDOW_MS,
    maxRequests: RATE_LIMITS.TOKEN_REFRESH.MAX_ATTEMPTS,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => `token_refresh:${req.userId || req.ip}`,
    customMessage: 'Too many token refresh attempts, please try again later',
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create security request from HTTP request
 */
export function createSecurityRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: any,
  ip?: string,
  sessionId?: string,
  userId?: string
): SecurityRequest {
  return {
    method,
    url,
    headers,
    body,
    ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
    userAgent: headers['user-agent'] || 'unknown',
    sessionId,
    userId,
    timestamp: new Date(),
  };
}

/**
 * Check if request is from trusted source
 */
export function isTrustedSource(request: SecurityRequest): boolean {
  // Check for internal service requests
  const internalHeaders = [
    'x-internal-service',
    'x-service-token',
    'x-admin-token',
  ];

  return internalHeaders.some(header => request.headers[header]);
}

/**
 * Get rate limit key for user
 */
export function getUserRateLimitKey(userId: string, action: string): string {
  return `user:${userId}:${action}`;
}

/**
 * Get rate limit key for IP
 */
export function getIpRateLimitKey(ip: string, action: string): string {
  return `ip:${ip}:${action}`;
}

/**
 * Check if IP is in whitelist
 */
export function isWhitelistedIp(ip: string): boolean {
  const whitelist = [
    '127.0.0.1',
    '::1',
    'localhost',
  ];

  return whitelist.includes(ip);
}

/**
 * Check if user agent is whitelisted
 */
export function isWhitelistedUserAgent(userAgent: string): boolean {
  const whitelist = [
    /^JobSwipe-Desktop/,
    /^JobSwipe-Mobile/,
    /^JobSwipe-API/,
  ];

  return whitelist.some(pattern => pattern.test(userAgent));
}

/**
 * Format security error response
 */
export function formatSecurityErrorResponse(
  error: string,
  errorCode: AuthErrorCode,
  rateLimitInfo?: RateLimitInfo
): SecurityResponse {
  const response: SecurityResponse = {
    statusCode: 429,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      error,
      code: errorCode,
      timestamp: new Date().toISOString(),
    },
  };

  if (rateLimitInfo) {
    response.headers['X-RateLimit-Limit'] = rateLimitInfo.limit.toString();
    response.headers['X-RateLimit-Remaining'] = rateLimitInfo.remaining.toString();
    response.headers['X-RateLimit-Reset'] = rateLimitInfo.reset.toISOString();
    
    if (rateLimitInfo.retryAfter) {
      response.headers['Retry-After'] = rateLimitInfo.retryAfter.toString();
    }
  }

  return response;
}

/**
 * Extract IP from request headers
 */
export function extractIpFromHeaders(headers: Record<string, string>): string {
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['x-real-ip'] ||
    headers['x-client-ip'] ||
    headers['cf-connecting-ip'] ||
    'unknown'
  );
}

/**
 * Check if request is API request
 */
export function isApiRequest(request: SecurityRequest): boolean {
  return request.url.startsWith('/api/');
}

/**
 * Check if request is authentication request
 */
export function isAuthRequest(request: SecurityRequest): boolean {
  return request.url.startsWith('/api/auth/');
}

/**
 * Get security level for request
 */
export function getSecurityLevel(request: SecurityRequest): 'low' | 'medium' | 'high' | 'critical' {
  if (isAuthRequest(request)) {
    return 'critical';
  }
  
  if (isApiRequest(request)) {
    return 'high';
  }
  
  if (request.method !== 'GET') {
    return 'medium';
  }
  
  return 'low';
}