/**
 * @fileoverview Authentication Security Middleware
 * @description Enterprise-grade security middleware for authentication flows
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { 
  validateJwtPayloadSecurity, 
  detectSuspiciousActivity, 
  generateSecureToken,
  sanitizeUserInput,
  AUTH_SECURITY_CONFIG
} from '../utils/auth-security';
import { JwtPayload } from '../types/auth';

// =============================================================================
// TYPES
// =============================================================================

export interface SecurityContext {
  ip: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId: string;
  csrfToken?: string;
}

export interface LoginAttempt {
  timestamp: Date;
  success: boolean;
  ip: string;
  userAgent: string;
  email?: string;
  failureReason?: string;
  riskScore: number;
}

export interface SecurityMiddlewareConfig {
  enableRateLimiting: boolean;
  enableSuspiciousActivityDetection: boolean;
  enableCSRFProtection: boolean;
  enableInputSanitization: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

// =============================================================================
// SECURITY MIDDLEWARE CLASS
// =============================================================================

export class AuthSecurityMiddleware {
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private blockedIPs: Map<string, Date> = new Map();
  private csrfTokens: Map<string, Date> = new Map();
  private config: SecurityMiddlewareConfig;

  constructor(config?: Partial<SecurityMiddlewareConfig>) {
    this.config = {
      enableRateLimiting: true,
      enableSuspiciousActivityDetection: true,
      enableCSRFProtection: true,
      enableInputSanitization: true,
      maxLoginAttempts: AUTH_SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      lockoutDuration: AUTH_SECURITY_CONFIG.LOGIN_LOCKOUT_DURATION,
      ...config
    };

    // Clean up old data periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Validate incoming authentication request
   */
  validateAuthRequest(context: SecurityContext, requestData: any): {
    allowed: boolean;
    reason?: string;
    riskScore: number;
    sanitizedData?: any;
  } {
    let riskScore = 0;
    const violations: string[] = [];

    // Check if IP is blocked
    if (this.isIPBlocked(context.ip)) {
      return {
        allowed: false,
        reason: 'IP address is temporarily blocked due to suspicious activity',
        riskScore: 100
      };
    }

    // Rate limiting check
    if (this.config.enableRateLimiting) {
      const rateLimitResult = this.checkRateLimit(context);
      if (!rateLimitResult.allowed) {
        return {
          allowed: false,
          reason: rateLimitResult.reason,
          riskScore: rateLimitResult.riskScore
        };
      }
      riskScore += rateLimitResult.riskScore;
    }

    // Suspicious activity detection
    if (this.config.enableSuspiciousActivityDetection) {
      const suspiciousResult = this.checkSuspiciousActivity(context);
      if (suspiciousResult.suspicious) {
        riskScore += suspiciousResult.riskScore;
        violations.push(...suspiciousResult.reasons);
      }
    }

    // Sanitize input data
    let sanitizedData = requestData;
    if (this.config.enableInputSanitization && requestData) {
      sanitizedData = this.sanitizeRequestData(requestData);
    }

    // Final risk assessment
    const finalRiskScore = Math.min(100, riskScore);
    const allowed = finalRiskScore < 70; // Block high-risk requests

    return {
      allowed,
      reason: !allowed ? `High risk score: ${finalRiskScore}. Violations: ${violations.join(', ')}` : undefined,
      riskScore: finalRiskScore,
      sanitizedData
    };
  }

  /**
   * Record login attempt for analytics and security
   */
  recordLoginAttempt(context: SecurityContext, success: boolean, email?: string, failureReason?: string): void {
    const key = `${context.ip}_${email || 'unknown'}`;
    
    if (!this.loginAttempts.has(key)) {
      this.loginAttempts.set(key, []);
    }

    const attempts = this.loginAttempts.get(key)!;
    const attempt: LoginAttempt = {
      timestamp: context.timestamp,
      success,
      ip: context.ip,
      userAgent: context.userAgent,
      email,
      failureReason,
      riskScore: 0 // Will be calculated
    };

    // Calculate risk score for this attempt
    attempt.riskScore = this.calculateAttemptRiskScore(attempt, attempts);

    attempts.push(attempt);

    // Keep only recent attempts (last 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = attempts.filter(a => a.timestamp > cutoff);
    this.loginAttempts.set(key, recentAttempts);

    // Block IP if too many failed attempts
    if (!success && this.shouldBlockIP(recentAttempts)) {
      this.blockIP(context.ip, 'Too many failed login attempts');
    }
  }

  /**
   * Validate JWT payload with security checks
   */
  validateJwtPayload(payload: JwtPayload): {
    valid: boolean;
    securityViolations: string[];
  } {
    const result = validateJwtPayloadSecurity(payload);
    return {
      valid: result.valid,
      securityViolations: result.violations
    };
  }

  /**
   * Generate CSRF token for form protection
   */
  generateCSRFToken(sessionId: string): string {
    const token = generateSecureToken(32);
    this.csrfTokens.set(token, new Date());
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionId: string): boolean {
    if (!this.config.enableCSRFProtection) return true;
    
    const tokenDate = this.csrfTokens.get(token);
    if (!tokenDate) return false;

    // Check if token is expired (1 hour)
    const expired = Date.now() - tokenDate.getTime() > 3600000;
    if (expired) {
      this.csrfTokens.delete(token);
      return false;
    }

    // One-time use: delete after validation
    this.csrfTokens.delete(token);
    return true;
  }

  /**
   * Get security metrics for monitoring
   */
  getSecurityMetrics(): {
    totalLoginAttempts: number;
    failedAttempts: number;
    blockedIPs: number;
    activeSessions: number;
    highRiskAttempts: number;
  } {
    const allAttempts = Array.from(this.loginAttempts.values()).flat();
    const failed = allAttempts.filter(a => !a.success);
    const highRisk = allAttempts.filter(a => a.riskScore >= 70);

    return {
      totalLoginAttempts: allAttempts.length,
      failedAttempts: failed.length,
      blockedIPs: this.blockedIPs.size,
      activeSessions: this.csrfTokens.size,
      highRiskAttempts: highRisk.length
    };
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private checkRateLimit(context: SecurityContext): {
    allowed: boolean;
    reason?: string;
    riskScore: number;
  } {
    const key = context.ip;
    const attempts = this.loginAttempts.get(key) || [];
    
    // Count attempts in the last lockout duration
    const cutoff = new Date(Date.now() - this.config.lockoutDuration);
    const recentAttempts = attempts.filter(a => a.timestamp > cutoff);

    if (recentAttempts.length >= this.config.maxLoginAttempts) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${recentAttempts.length} attempts in ${this.config.lockoutDuration / 60000} minutes`,
        riskScore: 100
      };
    }

    // Calculate risk score based on attempt frequency
    const riskScore = Math.min(50, (recentAttempts.length / this.config.maxLoginAttempts) * 50);

    return {
      allowed: true,
      riskScore
    };
  }

  private checkSuspiciousActivity(context: SecurityContext): {
    suspicious: boolean;
    reasons: string[];
    riskScore: number;
  } {
    const attempts = Array.from(this.loginAttempts.values())
      .flat()
      .filter(a => a.ip === context.ip)
      .slice(-20); // Last 20 attempts from this IP

    return detectSuspiciousActivity(attempts);
  }

  private sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return sanitizeUserInput(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeRequestData(value);
      }
      return sanitized;
    }

    return data;
  }

  private calculateAttemptRiskScore(attempt: LoginAttempt, previousAttempts: LoginAttempt[]): number {
    let score = 0;

    // Failed attempt increases risk
    if (!attempt.success) score += 20;

    // Rapid attempts increase risk
    const lastAttempt = previousAttempts[previousAttempts.length - 1];
    if (lastAttempt) {
      const timeDiff = attempt.timestamp.getTime() - lastAttempt.timestamp.getTime();
      if (timeDiff < 5000) score += 15; // Less than 5 seconds
    }

    // Multiple failures increase risk
    const recentFailures = previousAttempts
      .filter(a => !a.success && 
               attempt.timestamp.getTime() - a.timestamp.getTime() < 3600000)
      .length;
    
    score += Math.min(30, recentFailures * 5);

    return Math.min(100, score);
  }

  private shouldBlockIP(attempts: LoginAttempt[]): boolean {
    const failedAttempts = attempts.filter(a => !a.success);
    const highRiskAttempts = attempts.filter(a => a.riskScore >= 70);

    return failedAttempts.length >= this.config.maxLoginAttempts ||
           highRiskAttempts.length >= 3;
  }

  private isIPBlocked(ip: string): boolean {
    const blockedUntil = this.blockedIPs.get(ip);
    if (!blockedUntil) return false;

    if (Date.now() > blockedUntil.getTime()) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  private blockIP(ip: string, reason: string): void {
    const blockedUntil = new Date(Date.now() + this.config.lockoutDuration);
    this.blockedIPs.set(ip, blockedUntil);
    
    console.warn(`IP ${ip} blocked until ${blockedUntil.toISOString()}. Reason: ${reason}`);
  }

  private cleanup(): void {
    const now = Date.now();

    // Clean up old login attempts (older than 24 hours)
    const cutoff = now - 24 * 60 * 60 * 1000;
    for (const [key, attempts] of this.loginAttempts.entries()) {
      const recent = attempts.filter(a => a.timestamp.getTime() > cutoff);
      if (recent.length === 0) {
        this.loginAttempts.delete(key);
      } else {
        this.loginAttempts.set(key, recent);
      }
    }

    // Clean up expired IP blocks
    for (const [ip, blockedUntil] of this.blockedIPs.entries()) {
      if (now > blockedUntil.getTime()) {
        this.blockedIPs.delete(ip);
      }
    }

    // Clean up expired CSRF tokens (older than 1 hour)
    const csrfCutoff = now - 3600000;
    for (const [token, date] of this.csrfTokens.entries()) {
      if (date.getTime() < csrfCutoff) {
        this.csrfTokens.delete(token);
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let securityMiddlewareInstance: AuthSecurityMiddleware | null = null;

export function getAuthSecurityMiddleware(config?: Partial<SecurityMiddlewareConfig>): AuthSecurityMiddleware {
  if (!securityMiddlewareInstance) {
    securityMiddlewareInstance = new AuthSecurityMiddleware(config);
  }
  return securityMiddlewareInstance;
}

export function resetAuthSecurityMiddleware(): void {
  securityMiddlewareInstance = null;
}