/**
 * @fileoverview Fastify Type Augmentations
 * @description Global type declarations for Fastify plugins
 */

import '@fastify/cookie';
import '@fastify/swagger';
import { Queue } from 'bullmq';
import type { PrismaClient } from '@prisma/client';
import type { JWTService } from '../services/JWTService';
import type { AutomationService } from '../services/AutomationService';
import type { ServerAutomationService } from '../services/ServerAutomationService';
import type { AutomationLimits } from '../services/AutomationLimits';

declare module 'fastify' {
  interface FastifyInstance {
    // Database
    db: PrismaClient;

    // Queue
    jobQueue?: Queue;
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Services
    // Note: websocket type is declared in websocket.plugin.ts
    jwtService?: JWTService;
    automationService: AutomationService;
    serverAutomationService?: ServerAutomationService;
    automationLimits: AutomationLimits;
  }

  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: import('@fastify/cookie').CookieSerializeOptions
    ): this;
    clearCookie(
      name: string,
      options?: import('@fastify/cookie').CookieSerializeOptions
    ): this;
  }

  interface FastifySchema {
    tags?: readonly string[];
    summary?: string;
    description?: string;
    deprecated?: boolean;
    hide?: boolean;
    consumes?: readonly string[];
    produces?: readonly string[];
    security?: ReadonlyArray<{ [securityLabel: string]: readonly string[] }>;
    operationId?: string;
  }
}
