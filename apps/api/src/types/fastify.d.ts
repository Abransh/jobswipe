/**
 * @fileoverview Fastify Type Augmentations
 * @description Global type declarations for Fastify plugins
 */

import '@fastify/cookie';
import '@fastify/swagger';

declare module 'fastify' {
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
