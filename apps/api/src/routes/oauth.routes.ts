/**
 * @fileoverview OAuth Routes - HTTP API endpoints for OAuth authentication
 * @description Enterprise OAuth API routes with comprehensive validation and security
 * @version 1.0.0
 * @author JobSwipe Team
 */

import type {} from '@fastify/cookie';
import type {} from '@fastify/swagger';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  OAuthProvider,
  OAuthSource,
  OAuthProviderSchema,
  OAuthSourceSchema,
  isSupportedProvider,
} from '@jobswipe/shared';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * OAuth initiation query parameters
 */
const OAuthInitiationSchema = z.object({
  source: OAuthSourceSchema.optional().default(OAuthSource.WEB),
  redirect: z.string().url().optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

/**
 * OAuth callback query parameters
 */
const OAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State token is required'),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

/**
 * Unlink OAuth provider request
 */
const UnlinkProviderSchema = z.object({
  provider: OAuthProviderSchema,
  currentPassword: z.string().optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Set HTTP-only cookies for JWT tokens
 */
function setAuthCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN;

  // Access token cookie (15 minutes)
  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // Allow OAuth redirects
    maxAge: 15 * 60, // 15 minutes
    domain,
    path: '/',
  });

  // Refresh token cookie (30 days)
  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    domain,
    path: '/',
  });
}

/**
 * Get OAuth redirect URL based on source
 */
function getOAuthRedirectUrl(
  source: OAuthSource,
  success: boolean,
  error?: string
): string {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const desktopUrl = process.env.DESKTOP_CALLBACK_URL || 'jobswipe://auth/callback';

  const baseUrl = source === OAuthSource.DESKTOP ? desktopUrl : `${frontendUrl}/auth/callback`;

  if (success) {
    return `${baseUrl}?success=true`;
  } else {
    return `${baseUrl}?error=${encodeURIComponent(error || 'unknown')}`;
  }
}

// =============================================================================
// OAUTH ROUTES
// =============================================================================

export async function registerOAuthRoutes(fastify: FastifyInstance): Promise<void> {
  // Ensure OAuthService is available
  if (!fastify.oauthService) {
    throw new Error('OAuthService is required for OAuth routes');
  }

  const oauthService = fastify.oauthService;

  // =============================================================================
  // GET /api/auth/oauth/:provider - Initiate OAuth Flow
  // =============================================================================

  fastify.get<{
    Params: { provider: string };
    Querystring: z.infer<typeof OAuthInitiationSchema>;
  }>(
    '/oauth/:provider',
    {
      schema: {
        tags: ['OAuth'],
        params: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['google', 'github', 'linkedin'],
              description: 'OAuth provider',
            },
          },
          required: ['provider'],
        },
        querystring: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['web', 'desktop', 'mobile'],
              description: 'Authentication source',
            },
            redirect: {
              type: 'string',
              description: 'Post-authentication redirect URL',
            },
            deviceId: { type: 'string' },
            deviceName: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { provider } = request.params;
        const query = OAuthInitiationSchema.parse(request.query);

        // Validate provider
        if (!isSupportedProvider(provider)) {
          return reply.code(400).send({
            success: false,
            error: `Unsupported OAuth provider: ${provider}`,
            errorCode: 'INVALID_PROVIDER',
          });
        }

        fastify.log.info({
          provider,
          source: query.source,
        }, 'OAuth flow initiated');

        // Generate authorization URL
        const authResponse = await oauthService.initiateOAuthFlow({
          provider: provider as OAuthProvider,
          source: query.source,
          redirectUri: query.redirect,
          deviceId: query.deviceId,
          deviceName: query.deviceName,
        });

        // Store state in cookie for verification (additional security)
        reply.setCookie('oauth_state', authResponse.state, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 600, // 10 minutes
          path: '/',
        });

        // Redirect to OAuth provider
        return reply.redirect(authResponse.authorizationUrl, 302);
      } catch (error: any) {
        fastify.log.error({err: error, msg: 'OAuth initiation failed:'});

        const source = (request.query as any).source || OAuthSource.WEB;
        const redirectUrl = getOAuthRedirectUrl(
          source,
          false,
          error.code || 'INITIATION_FAILED'
        );

        return reply.redirect(redirectUrl, 302);
      }
    }
  );

  // =============================================================================
  // GET /api/auth/oauth/:provider/callback - OAuth Callback Handler
  // =============================================================================

  fastify.get<{
    Params: { provider: string };
    Querystring: z.infer<typeof OAuthCallbackSchema>;
  }>(
    '/oauth/:provider/callback',
    {
      schema: {
        tags: ['OAuth'],
        params: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['google', 'github', 'linkedin'],
            },
          },
          required: ['provider'],
        },
        querystring: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            state: { type: 'string' },
            error: { type: 'string' },
            error_description: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { provider } = request.params;
        const query = OAuthCallbackSchema.parse(request.query);

        // Validate provider
        if (!isSupportedProvider(provider)) {
          return reply.code(400).send({
            success: false,
            error: `Unsupported OAuth provider: ${provider}`,
          });
        }

        fastify.log.info( {
          provider,
          hasCode: !!query.code,
          hasError: !!query.error,
        }, 'OAuth callback received',);

        // Handle OAuth callback
        const result = await oauthService.handleOAuthCallback({
          provider: provider as OAuthProvider,
          code: query.code,
          state: query.state,
          error: query.error,
          errorDescription: query.error_description,
        });

        // Clear OAuth state cookie
        reply.clearCookie('oauth_state', { path: '/' });

        if (!result.success) {
          // OAuth failed - redirect to frontend with error
          const redirectUrl = getOAuthRedirectUrl(
            OAuthSource.WEB, // Default to web
            false,
            result.errorCode || 'OAUTH_FAILED'
          );

          return reply.redirect(302, redirectUrl);
        }

        // OAuth successful - set auth cookies
        if (result.tokens) {
          setAuthCookies(reply, result.tokens.accessToken, result.tokens.refreshToken);
        }

        // Redirect to frontend with success
        const redirectUrl = getOAuthRedirectUrl(OAuthSource.WEB, true);
        return reply.redirect(redirectUrl, 302);
      } catch (error: any) {
        fastify.log.error({err: error, msg: 'OAuth callback failed:'});

        const redirectUrl = getOAuthRedirectUrl(
          OAuthSource.WEB,
          false,
          'CALLBACK_FAILED'
        );

        return reply.redirect(redirectUrl, 302);
      }
    }
  );

  // =============================================================================
  // POST /api/auth/oauth/link - Link OAuth Provider to Account
  // =============================================================================

  fastify.post<{
    Body: { provider: string; currentPassword?: string };
  }>(
    '/oauth/link',
    {
      schema: {
        tags: ['OAuth'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['provider'],
          properties: {
            provider: {
              type: 'string',
              enum: ['google', 'github', 'linkedin'],
            },
            currentPassword: {
              type: 'string',
              description: 'Current password for verification',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              provider: { type: 'string' },
            },
          },
           500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              provider: { type: 'string' },
            },
          },
        },
      },
      // @ts-ignore - Add auth middleware
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      try {
        // Note: Actual linking happens during OAuth callback
        // This endpoint is for initiating the linking flow
        return reply.code(501).send({
          success: false,
          message: 'Account linking via OAuth callback flow - use /oauth/:provider with authenticated session',
        });
      } catch (error) {
        fastify.log.error({err: error, msg: 'OAuth link failed:'});
        return reply.code(500).send({
          success: false,
          error: 'Failed to link OAuth provider',
        });
      }
    }
  );

  // =============================================================================
  // POST /api/auth/oauth/unlink - Unlink OAuth Provider
  // =============================================================================

  fastify.post<{
    Body: z.infer<typeof UnlinkProviderSchema>;
  }>(
    '/oauth/unlink',
    {
      schema: {
        tags: ['OAuth'],
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['provider'],
          properties: {
            provider: {
              type: 'string',
              enum: ['google', 'github', 'linkedin'],
            },
            currentPassword: {
              type: 'string',
              description: 'Current password for verification (optional)',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              provider: { type: 'string' },
            },
          },
        },
      },
      // @ts-ignore - Add auth middleware
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      try {
        const body = UnlinkProviderSchema.parse(request.body);
        // @ts-ignore - user from auth middleware
        const userId = request.user.id;

        // Unlink OAuth provider
        await oauthService.unlinkOAuthProvider(userId, body.provider);

        fastify.log.info( {
          userId,
          provider: body.provider,
        }, 'OAuth provider unlinked');

        return reply.send({
          success: true,
          message: `${body.provider} account unlinked successfully`,
          provider: body.provider,
        });
      } catch (error: any) {
        fastify.log.error({err: error, msg:'OAuth unlink failed:'});

        return reply.code(error.statusCode || 500).send({
          success: false,
          error: error.message || 'Failed to unlink OAuth provider',
          errorCode: error.code || 'UNLINK_FAILED',
        });
      }
    }
  );

  // =============================================================================
  // GET /api/auth/oauth/accounts - List Linked OAuth Accounts
  // =============================================================================

  fastify.get(
    '/oauth/accounts',
    {
      schema: {
        tags: ['OAuth'],
        security: [{ Bearer: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    provider: { type: 'string' },
                    providerAccountId: { type: 'string' },
                    linkedAt: { type: 'string', format: 'date-time' },
                    isPrimary: { type: 'boolean' },
                  },
                },
              },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              accounts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    provider: { type: 'string' },
                    providerAccountId: { type: 'string' },
                    linkedAt: { type: 'string', format: 'date-time' },
                    isPrimary: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
      // @ts-ignore - Add auth middleware
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      try {
        // @ts-ignore - user from auth middleware
        const userId = request.user.id;

        const accounts = await oauthService.getLinkedAccounts(userId);

        return reply.send({
          success: true,
          accounts,
        });
      } catch (error) {
        fastify.log.error( {err: error, msg: 'Failed to fetch linked accounts:'});

        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch linked accounts',
        });
      }
    }
  );

  // =============================================================================
  // GET /api/auth/oauth/providers - List Enabled OAuth Providers
  // =============================================================================

  fastify.get(
    '/oauth/providers',
    {
      schema: {
        tags: ['OAuth'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              providers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    displayName: { type: 'string' },
                    icon: { type: 'string' },
                    enabled: { type: 'boolean' },
                  },
                },
              },
            },
          },

          
        },
      },
    },
    async (request, reply) => {
      try {
        const enabledProviders = oauthService.getEnabledProviders();

        const providers = enabledProviders.map((provider) => ({
          name: provider,
          displayName: getProviderDisplayName(provider),
          icon: getProviderIcon(provider),
          enabled: true,
        }));

        return reply.send({
          success: true,
          providers,
        });
      } catch (error) {
        fastify.log.error( {err: error, msg: 'Failed to fetch OAuth providers:'});

        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch OAuth providers',
        });
      }
    }
  );

  fastify.log.info('✅ OAuth routes registered successfully');
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get provider display name
 */
function getProviderDisplayName(provider: OAuthProvider): string {
  const names: Record<OAuthProvider, string> = {
    [OAuthProvider.GOOGLE]: 'Google',
    [OAuthProvider.GITHUB]: 'GitHub',
    [OAuthProvider.LINKEDIN]: 'LinkedIn',
  };
  return names[provider];
}

/**
 * Get provider icon name
 */
function getProviderIcon(provider: OAuthProvider): string {
  const icons: Record<OAuthProvider, string> = {
    [OAuthProvider.GOOGLE]: 'google',
    [OAuthProvider.GITHUB]: 'github',
    [OAuthProvider.LINKEDIN]: 'linkedin',
  };
  return icons[provider];
}

export default registerOAuthRoutes;
