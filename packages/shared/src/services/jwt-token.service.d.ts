/**
 * Type declarations for jwt-token.service.js
 */

export interface JwtTokenConfig {
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  expiresIn?: string | number;
  algorithm?: string;
  issuer?: string;
  audience?: string;
  [key: string]: any; // Allow additional properties
}

export interface JwtTokenService {
  generateAccessToken(payload: any): string;
  generateRefreshToken(payload: any): string;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
  createToken(payload: any, options?: any): string;
  [key: string]: any; // Allow additional methods
}

export function createDesktopTokenConfig(...args: any[]): JwtTokenConfig;
export function createJwtTokenService(config?: Partial<JwtTokenConfig>): JwtTokenService;
