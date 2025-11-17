/**
 * @fileoverview JWT Token Helper Functions
 * @description Helper functions for JWT token configuration
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { JwtTokenConfig } from './jwt-token.service.d';

/**
 * Create desktop token configuration
 */
export function createDesktopTokenConfig(
  userId: string,
  email: string,
  name?: string,
  role?: string,
  deviceId?: string,
  deviceName?: string,
  permissions?: string[],
  features?: string[],
  expiresIn?: number
): JwtTokenConfig {
  return {
    expiresIn: expiresIn || 90 * 24 * 60 * 60, // 90 days default
    issuer: 'jobswipe-api',
    audience: 'jobswipe-desktop',
    userId,
    email,
    name,
    role: role || 'user',
    deviceId,
    deviceName,
    permissions,
    features,
    tokenType: 'desktop',
  };
}

/**
 * JWT Token Service interface (for compatibility)
 */
export interface JwtTokenService {
  generateAccessToken(payload: any): string;
  generateRefreshToken(payload: any): string;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
  createToken(payload: any, options?: any): string;
  [key: string]: any;
}
