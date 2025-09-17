/**
 * @fileoverview Fastify Type Declarations
 * @description Type declarations for Fastify plugins and decorations
 * @version 1.0.0
 * @author JobSwipe Team
 */

import type { PrismaClient } from '@jobswipe/database';
import type { Redis } from 'ioredis';
import type { AuthService } from '../services/AuthService';
import type { ProxyRotator } from '../services/ProxyRotator';
import type { AutomationService } from '../services/AutomationService';
import type { ServerAutomationService } from '../services/ServerAutomationService';
import type { AutomationLimits } from '../services/AutomationLimits';

declare module 'fastify' {
  interface FastifyInstance {
    // Database
    db: PrismaClient;

    // Authentication & Security
    jwtService: any;
    security: {
      checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean>;
      blockIp(ip: string, reason: string): Promise<void>;
      isIpBlocked(ip: string): Promise<boolean>;
      getStats(): any;
    };

    // Redis
    redis: Redis;

    // Automation Services
    automationService: AutomationService;
    serverAutomationService: ServerAutomationService;
    automationLimits: AutomationLimits;
    proxyRotator: ProxyRotator;

    // Queue System
    applicationQueue: any;
    queueWorker: any;

    // WebSocket
    wsService: any;

    // Advanced Security
    advancedSecurity: {
      validateRequest(request: any): Promise<boolean>;
      generateCSRFToken(): string;
      validateCSRFToken(token: string, session: string): boolean;
      detectAttack(request: any): Promise<boolean>;
    };

    // Health Checks
    getDefaultRoute(): any;
    setDefaultRoute(handler: any): void;
  }

  interface FastifyRequest {
    // User context
    user?: {
      id: string;
      email: string;
      role: string;
      status: string;
    };

    // Session context
    session?: {
      id: string;
      deviceId?: string;
      deviceType?: string;
    };

    // JWT context
    jwtPayload?: {
      sub: string;
      userId: string;
      email: string;
      role: string;
      status: string;
      iat: number;
      exp: number;
      jti?: string;
      sessionId?: string;
      deviceId?: string;
      deviceType?: string;
    };

    // Rate limiting
    rateLimitInfo?: {
      totalRequests: number;
      timeWindow: number;
      remaining: number;
      resetTime: Date;
    };

    // IP information
    realIp?: string;
    ipInfo?: {
      blocked: boolean;
      attempts: number;
      lastAttempt?: Date;
    };
  }

  interface FastifyReply {
    // Enhanced response methods
    sendSuccess(data?: any, message?: string): FastifyReply;
    sendError(message: string, code?: string, statusCode?: number): FastifyReply;
    sendValidationError(errors: any[]): FastifyReply;
    sendUnauthorized(message?: string): FastifyReply;
    sendForbidden(message?: string): FastifyReply;
    sendNotFound(message?: string): FastifyReply;
    sendTooManyRequests(message?: string): FastifyReply;
    sendInternalError(message?: string): FastifyReply;
  }
}

// =============================================================================
// PLUGIN OPTIONS
// =============================================================================

export interface DatabasePluginOptions {
  connectionString?: string;
  poolSize?: number;
  timeout?: number;
}

export interface AuthPluginOptions {
  jwtSecret: string;
  jwtRefreshSecret?: string;
  defaultExpiresIn?: string;
  refreshExpiresIn?: string;
  saltRounds?: number;
}

export interface SecurityPluginOptions {
  rateLimiting?: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
  ipBlocking?: {
    enabled: boolean;
    maxAttempts: number;
    blockDuration: number;
  };
  headers?: {
    enabled: boolean;
    csp?: boolean;
    hsts?: boolean;
  };
}

export interface QueuePluginOptions {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  concurrency?: number;
  defaultJobOptions?: any;
}

export interface WebSocketPluginOptions {
  path?: string;
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  transports?: string[];
}

// =============================================================================
// SERVICE TYPES
// =============================================================================

export interface ServiceRegistry {
  register<T>(name: string, service: T, healthCheck?: () => Promise<any>): void;
  get<T>(name: string): T;
  has(name: string): boolean;
  getHealth(): Promise<Record<string, any>>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details?: Record<string, any>;
  timestamp?: Date;
}

// =============================================================================
// ROUTE HANDLER TYPES
// =============================================================================

export interface AuthenticatedRouteHandler<T = any> {
  (request: FastifyRequest & { user: NonNullable<FastifyRequest['user']> }, reply: FastifyReply): Promise<T>;
}

export interface AdminRouteHandler<T = any> {
  (request: FastifyRequest & { user: { role: 'admin' } }, reply: FastifyReply): Promise<T>;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}