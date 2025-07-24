/**
 * @fileoverview Advanced Authentication Security Utilities
 * @description Enterprise-grade security hardening for authentication system
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { JwtPayload } from '../types/auth';

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

/**
 * Security configuration constants
 */
export const AUTH_SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Token validation
  TOKEN_LEEWAY_SECONDS: 30, // Allow 30 seconds clock skew
  MAX_TOKEN_AGE_HOURS: 24,
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 12,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  
  // Session security
  SESSION_TIMEOUT_MINUTES: 30,
  ABSOLUTE_SESSION_TIMEOUT_HOURS: 8,
  
  // Device trust
  MAX_TRUSTED_DEVICES: 5,
  DEVICE_TRUST_DURATION_DAYS: 30,
} as const;

// =============================================================================
// SECURITY VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate JWT payload for security compliance
 */
export function validateJwtPayloadSecurity(payload: JwtPayload): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // Check required fields
  if (!payload.sub) violations.push('Missing subject (user ID)');
  if (!payload.email) violations.push('Missing email');
  if (!payload.iat) violations.push('Missing issued at time');
  if (!payload.exp) violations.push('Missing expiration time');
  if (!payload.jti) violations.push('Missing token ID');
  
  // Check token age
  const now = Math.floor(Date.now() / 1000);
  const tokenAge = now - payload.iat;
  const maxAge = AUTH_SECURITY_CONFIG.MAX_TOKEN_AGE_HOURS * 3600;
  
  if (tokenAge > maxAge) {
    violations.push(`Token too old: ${Math.floor(tokenAge / 3600)} hours (max: ${AUTH_SECURITY_CONFIG.MAX_TOKEN_AGE_HOURS})`);
  }
  
  // Check expiration with leeway
  const leeway = AUTH_SECURITY_CONFIG.TOKEN_LEEWAY_SECONDS;
  if (payload.exp < (now - leeway)) {
    violations.push('Token expired beyond allowed leeway');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    violations.push('Invalid email format');
  }
  
  // Check for suspicious patterns
  if (payload.email.includes('..') || payload.email.includes('++')) {
    violations.push('Suspicious email pattern detected');
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Validate password strength according to enterprise requirements
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number; // 0-100
  violations: string[];
  suggestions: string[];
} {
  const violations: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < AUTH_SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    violations.push(`Password must be at least ${AUTH_SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`);
  } else {
    score += 20;
  }
  
  // Character requirements
  if (AUTH_SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    violations.push('Password must contain lowercase letters');
  } else {
    score += 15;
  }
  
  if (AUTH_SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    violations.push('Password must contain uppercase letters');
  } else {
    score += 15;
  }
  
  if (AUTH_SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
    violations.push('Password must contain numbers');
  } else {
    score += 15;
  }
  
  if (AUTH_SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    violations.push('Password must contain special characters');
  } else {
    score += 15;
  }
  
  // Additional security checks
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'welcome', 'login', 'user'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    violations.push('Password contains common patterns');
    score -= 20;
  }
  
  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    violations.push('Password contains too many repeated characters');
    score -= 10;
  }
  
  // Sequential characters
  if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password.toLowerCase())) {
    violations.push('Password contains sequential characters');
    score -= 10;
  }
  
  // Bonus points for length
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;
  
  // Generate suggestions
  if (violations.length > 0) {
    suggestions.push('Use a mix of uppercase and lowercase letters');
    suggestions.push('Include numbers and special characters');
    suggestions.push('Avoid common words and patterns');
    suggestions.push('Consider using a passphrase or password manager');
  }
  
  return {
    valid: violations.length === 0,
    score: Math.max(0, Math.min(100, score)),
    violations,
    suggestions
  };
}

/**
 * Detect suspicious login patterns
 */
export function detectSuspiciousActivity(loginAttempts: {
  timestamp: Date;
  success: boolean;
  ip: string;
  userAgent: string;
}[]): {
  suspicious: boolean;
  reasons: string[];
  riskScore: number; // 0-100
} {
  const reasons: string[] = [];
  let riskScore = 0;
  
  // Check for too many failed attempts
  const recentFailed = loginAttempts
    .filter(attempt => !attempt.success && 
             Date.now() - attempt.timestamp.getTime() < 3600000) // Last hour
    .length;
  
  if (recentFailed >= AUTH_SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    reasons.push(`Too many failed attempts: ${recentFailed}`);
    riskScore += 40;
  }
  
  // Check for multiple IPs
  const uniqueIPs = new Set(loginAttempts.slice(-10).map(a => a.ip));
  if (uniqueIPs.size >= 3) {
    reasons.push(`Multiple IP addresses: ${uniqueIPs.size}`);
    riskScore += 25;
  }
  
  // Check for rapid-fire attempts
  const rapidAttempts = loginAttempts
    .slice(-5)
    .reduce((count, attempt, index, arr) => {
      if (index === 0) return 0;
      const timeDiff = attempt.timestamp.getTime() - arr[index - 1].timestamp.getTime();
      return timeDiff < 1000 ? count + 1 : count; // Less than 1 second apart
    }, 0);
  
  if (rapidAttempts >= 3) {
    reasons.push('Rapid-fire login attempts detected');
    riskScore += 30;
  }
  
  // Check for suspicious user agents
  const suspiciousUserAgents = ['bot', 'crawler', 'spider', 'wget', 'curl'];
  const hasSuspiciousUA = loginAttempts.some(attempt => 
    suspiciousUserAgents.some(sus => 
      attempt.userAgent.toLowerCase().includes(sus)
    )
  );
  
  if (hasSuspiciousUA) {
    reasons.push('Suspicious user agent detected');
    riskScore += 20;
  }
  
  return {
    suspicious: riskScore >= 50,
    reasons,
    riskScore: Math.min(100, riskScore)
  };
}

/**
 * Generate secure random token for CSRF protection
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  
  // Use crypto.getRandomValues in browser, fallback for other environments
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for server environments (should use proper crypto module)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate session token format and structure
 */
export function validateSessionToken(token: string): {
  valid: boolean;
  reason?: string;
} {
  // Basic format validation
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Invalid token format' };
  }
  
  // Check minimum length
  if (token.length < 20) {
    return { valid: false, reason: 'Token too short' };
  }
  
  // Check for suspicious patterns
  if (token.includes('..') || token.includes('//')) {
    return { valid: false, reason: 'Suspicious token pattern' };
  }
  
  // Check character set (base64url)
  if (!/^[A-Za-z0-9_-]+$/.test(token.replace(/\./g, ''))) {
    return { valid: false, reason: 'Invalid token characters' };
  }
  
  return { valid: true };
}

// =============================================================================
// EXPORTS
// =============================================================================

export type AuthSecurityConfig = typeof AUTH_SECURITY_CONFIG;

export {
  AUTH_SECURITY_CONFIG as SecurityConfig
};