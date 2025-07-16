/**
 * @fileoverview NextAuth.js configuration for JobSwipe web application
 * @description Enterprise-grade authentication with social providers and custom credentials
 * @version 1.0.0
 * @author JobSwipe Team
 */

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import LinkedIn from 'next-auth/providers/linkedin';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@jobswipe/database';
import { 
  LoginRequestSchema, 
  RegisterRequestSchema, 
  AuthSource, 
  AuthProvider,
  AuthErrorCode,
  createAuthError 
} from '@jobswipe/shared';
import { authenticateUser, createUser, getUserByEmail } from '@jobswipe/database';
import { verifyPassword } from '@jobswipe/shared';
import { defaultRedisSessionService } from '@jobswipe/shared';

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

const OAUTH_SCOPES = {
  GOOGLE: 'openid email profile',
  GITHUB: 'user:email',
  LINKEDIN: 'r_liteprofile r_emailaddress',
  MICROSOFT: 'openid email profile User.Read',
};

const OAUTH_WELLKNOWN = {
  GOOGLE: 'https://accounts.google.com/.well-known/openid_configuration',
  MICROSOFT: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid_configuration',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get user IP address from request
 */
function getClientIP(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    undefined
  );
}

/**
 * Get user agent from request
 */
function getUserAgent(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined;
}

/**
 * Generate device fingerprint
 */
function generateDeviceFingerprint(ip?: string, userAgent?: string): string {
  const data = `${ip || 'unknown'}:${userAgent || 'unknown'}`;
  return Buffer.from(data).toString('base64');
}

/**
 * Validate environment variables
 */
function validateEnvironmentVariables(): void {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Create audit log entry for authentication events
 */
async function createAuthAuditLog(
  event: string,
  userId?: string,
  email?: string,
  ip?: string,
  userAgent?: string,
  success: boolean = true,
  error?: string
): Promise<void> {
  try {
    // In a real implementation, you'd use an audit logging service
    console.log('Auth Audit Log:', {
      event,
      userId,
      email,
      ip,
      userAgent,
      success,
      error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

// =============================================================================
// CUSTOM CREDENTIAL AUTHENTICATION
// =============================================================================

/**
 * Custom credentials provider for email/password authentication
 */
const credentialsProvider = Credentials({
  id: 'credentials',
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
    isRegistering: { label: 'Is Registering', type: 'text' },
    firstName: { label: 'First Name', type: 'text' },
    lastName: { label: 'Last Name', type: 'text' },
    termsAccepted: { label: 'Terms Accepted', type: 'text' },
    privacyAccepted: { label: 'Privacy Accepted', type: 'text' },
    marketingConsent: { label: 'Marketing Consent', type: 'text' },
  },
  async authorize(credentials, req) {
    try {
      if (!credentials?.email || !credentials?.password) {
        await createAuthAuditLog(
          'CREDENTIALS_AUTH_FAILED',
          undefined,
          credentials?.email,
          getClientIP(req.headers),
          getUserAgent(req.headers),
          false,
          'Missing email or password'
        );
        throw createAuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Email and password are required');
      }

      const isRegistering = credentials.isRegistering === 'true';
      const ip = getClientIP(req.headers);
      const userAgent = getUserAgent(req.headers);

      if (isRegistering) {
        // Registration flow
        const registerData = {
          email: credentials.email,
          password: credentials.password,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          termsAccepted: credentials.termsAccepted === 'true',
          privacyAccepted: credentials.privacyAccepted === 'true',
          marketingConsent: credentials.marketingConsent === 'true',
          source: AuthSource.WEB,
          ipAddress: ip,
          userAgent,
        };

        // Validate registration data
        const validatedData = LoginRequestSchema.parse(registerData);

        // Check if user already exists
        const existingUser = await getUserByEmail(validatedData.email);
        if (existingUser) {
          await createAuthAuditLog(
            'REGISTRATION_FAILED',
            undefined,
            validatedData.email,
            ip,
            userAgent,
            false,
            'User already exists'
          );
          throw createAuthError(AuthErrorCode.CONFLICT, 'User already exists');
        }

        // Create new user
        const user = await createUser({
          email: validatedData.email,
          password: validatedData.password,
          name: validatedData.firstName && validatedData.lastName 
            ? `${validatedData.firstName} ${validatedData.lastName}` 
            : undefined,
          profile: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            displayName: validatedData.firstName && validatedData.lastName 
              ? `${validatedData.firstName} ${validatedData.lastName}` 
              : undefined,
          },
        });

        await createAuthAuditLog(
          'REGISTRATION_SUCCESS',
          user.id,
          user.email,
          ip,
          userAgent,
          true
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          image: user.avatar,
        };
      } else {
        // Login flow
        const loginData = {
          email: credentials.email,
          password: credentials.password,
          source: AuthSource.WEB,
          ipAddress: ip,
          userAgent,
        };

        // Validate login data
        const validatedData = LoginRequestSchema.parse(loginData);

        // Authenticate user
        const user = await authenticateUser(validatedData.email, validatedData.password);
        
        if (!user) {
          await createAuthAuditLog(
            'LOGIN_FAILED',
            undefined,
            validatedData.email,
            ip,
            userAgent,
            false,
            'Invalid credentials'
          );
          throw createAuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
        }

        // Check if user is locked
        if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
          await createAuthAuditLog(
            'LOGIN_FAILED',
            user.id,
            user.email,
            ip,
            userAgent,
            false,
            `Account ${user.status.toLowerCase()}`
          );
          throw createAuthError(AuthErrorCode.ACCOUNT_LOCKED, `Account is ${user.status.toLowerCase()}`);
        }

        // Check if email is verified (if required)
        if (!user.emailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
          await createAuthAuditLog(
            'LOGIN_FAILED',
            user.id,
            user.email,
            ip,
            userAgent,
            false,
            'Email not verified'
          );
          throw createAuthError(AuthErrorCode.EMAIL_NOT_VERIFIED, 'Please verify your email address');
        }

        await createAuthAuditLog(
          'LOGIN_SUCCESS',
          user.id,
          user.email,
          ip,
          userAgent,
          true
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          image: user.avatar,
        };
      }
    } catch (error) {
      console.error('Credentials authentication error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('User already exists')) {
          throw error;
        }
        if (error.message.includes('Invalid email or password')) {
          throw error;
        }
        if (error.message.includes('Account')) {
          throw error;
        }
        if (error.message.includes('verify your email')) {
          throw error;
        }
      }
      
      throw createAuthError(AuthErrorCode.INTERNAL_ERROR, 'Authentication failed');
    }
  },
});

// =============================================================================
// NEXTAUTH CONFIGURATION
// =============================================================================

/**
 * NextAuth.js configuration
 */
export const authConfig: NextAuthConfig = {
  // Validate environment variables
  ...(validateEnvironmentVariables(), {}),

  // Adapter configuration
  adapter: PrismaAdapter(db),

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    encode: async ({ token, secret, maxAge }) => {
      // Use custom JWT service for consistency
      // In production, you'd use the JWT service from shared package
      return token ? JSON.stringify(token) : '';
    },
    decode: async ({ token, secret }) => {
      try {
        return token ? JSON.parse(token) : null;
      } catch {
        return null;
      }
    },
  },

  // Provider configuration
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: OAUTH_SCOPES.GOOGLE,
          access_type: 'offline',
          prompt: 'consent',
        },
      },
      wellKnown: OAUTH_WELLKNOWN.GOOGLE,
      profile: (profile) => ({
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        emailVerified: profile.email_verified ? new Date() : null,
      }),
    }),

    // GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: OAUTH_SCOPES.GITHUB,
        },
      },
      profile: (profile) => ({
        id: profile.id.toString(),
        email: profile.email,
        name: profile.name || profile.login,
        image: profile.avatar_url,
        emailVerified: profile.email ? new Date() : null,
      }),
    }),

    // LinkedIn OAuth
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: OAUTH_SCOPES.LINKEDIN,
        },
      },
      profile: (profile) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
        emailVerified: profile.email ? new Date() : null,
      }),
    }),

    // Microsoft OAuth (optional)
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? [
          {
            id: 'microsoft',
            name: 'Microsoft',
            type: 'oauth' as const,
            authorization: {
              url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
              params: {
                scope: OAUTH_SCOPES.MICROSOFT,
                response_type: 'code',
                response_mode: 'query',
              },
            },
            token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            userinfo: 'https://graph.microsoft.com/v1.0/me',
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            wellKnown: OAUTH_WELLKNOWN.MICROSOFT,
            profile: (profile: any) => ({
              id: profile.id,
              email: profile.mail || profile.userPrincipalName,
              name: profile.displayName,
              image: profile.photo?.value,
              emailVerified: profile.mail ? new Date() : null,
            }),
          },
        ]
      : []),

    // Custom credentials provider
    credentialsProvider,
  ],

  // Callback configuration
  callbacks: {
    // JWT callback - runs whenever a JWT is created, updated, or accessed
    async jwt({ token, user, account, profile, trigger, session }) {
      try {
        // Initial sign in
        if (user && account) {
          token.userId = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role || 'user';
          token.source = AuthSource.WEB;
          token.provider = account.provider as AuthProvider;
          token.emailVerified = user.emailVerified;
          token.image = user.image;

          // Create session in Redis
          await defaultRedisSessionService.createSession({
            userId: user.id as any,
            source: AuthSource.WEB,
            provider: account.provider as AuthProvider,
            ipAddress: undefined, // Will be set by middleware
            userAgent: undefined, // Will be set by middleware
            metadata: {
              email: user.email,
              name: user.name,
              role: user.role || 'user',
              provider: account.provider,
            },
          });

          await createAuthAuditLog(
            'OAUTH_LOGIN_SUCCESS',
            user.id,
            user.email,
            undefined,
            undefined,
            true
          );
        }

        // Session update
        if (trigger === 'update' && session) {
          token.name = session.name || token.name;
          token.email = session.email || token.email;
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },

    // Session callback - runs whenever a session is checked
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.userId as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.role = token.role as string;
          session.user.source = token.source as AuthSource;
          session.user.provider = token.provider as AuthProvider;
          session.user.emailVerified = token.emailVerified as Date;
          session.user.image = token.image as string;

          // Update session activity in Redis
          if (token.sessionId) {
            await defaultRedisSessionService.updateSession(token.sessionId as any, {
              lastUsedAt: new Date(),
            });
          }
        }

        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },

    // Sign-in callback - controls whether user is allowed to sign in
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (account?.provider === 'credentials') {
          // Credentials sign-in is handled in the provider
          return true;
        }

        // OAuth sign-in
        if (account && profile) {
          const existingUser = await getUserByEmail(user.email || '');
          
          if (!existingUser) {
            // Create new user from OAuth profile
            const newUser = await createUser({
              email: user.email || '',
              password: '', // No password for OAuth users
              name: user.name || '',
              profile: {
                firstName: profile.given_name || '',
                lastName: profile.family_name || '',
                displayName: user.name || '',
                bio: profile.bio || '',
                website: profile.blog || profile.html_url || '',
                linkedin: account.provider === 'linkedin' ? profile.publicProfileUrl : undefined,
                github: account.provider === 'github' ? profile.html_url : undefined,
              },
            });

            await createAuthAuditLog(
              'OAUTH_REGISTRATION_SUCCESS',
              newUser.id,
              newUser.email,
              undefined,
              undefined,
              true
            );
          }

          return true;
        }

        return false;
      } catch (error) {
        console.error('Sign-in callback error:', error);
        await createAuthAuditLog(
          'SIGNIN_ERROR',
          user?.id,
          user?.email,
          undefined,
          undefined,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
        return false;
      }
    },

    // Redirect callback - controls where user is redirected after sign-in
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Default redirect
      return `${baseUrl}/dashboard`;
    },
  },

  // Page configuration
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // Event configuration
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      await createAuthAuditLog(
        isNewUser ? 'NEW_USER_SIGNIN' : 'USER_SIGNIN',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async signOut({ token, session }) {
      if (token?.sessionId) {
        await defaultRedisSessionService.revokeSession(token.sessionId as any);
      }
      
      await createAuthAuditLog(
        'USER_SIGNOUT',
        token?.userId as string,
        token?.email as string,
        undefined,
        undefined,
        true
      );
    },

    async createUser({ user }) {
      await createAuthAuditLog(
        'USER_CREATED',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async updateUser({ user }) {
      await createAuthAuditLog(
        'USER_UPDATED',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async linkAccount({ user, account }) {
      await createAuthAuditLog(
        'ACCOUNT_LINKED',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async session({ session, token }) {
      // Update session activity
      if (token?.sessionId) {
        await defaultRedisSessionService.updateSession(token.sessionId as any, {
          lastUsedAt: new Date(),
        });
      }
    },
  },

  // Security configuration
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60, // 15 minutes
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60, // 15 minutes
      },
    },
  },

  // Debug configuration
  debug: process.env.NODE_ENV === 'development',
  
  // Logger configuration
  logger: {
    error: (code, ...message) => {
      console.error(`[NextAuth Error] ${code}:`, ...message);
      createAuthAuditLog(
        'NEXTAUTH_ERROR',
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        `${code}: ${message.join(' ')}`
      );
    },
    warn: (code, ...message) => {
      console.warn(`[NextAuth Warn] ${code}:`, ...message);
    },
    debug: (code, ...message) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[NextAuth Debug] ${code}:`, ...message);
      }
    },
  },

  // Experimental features
  experimental: {
    enableWebAuthn: false, // Enable when WebAuthn is implemented
  },
};

// =============================================================================
// TYPE EXTENSIONS
// =============================================================================

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    emailVerified?: Date;
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
      source: AuthSource;
      provider: AuthProvider;
      emailVerified?: Date;
      image?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    email: string;
    name?: string;
    role: string;
    source: AuthSource;
    provider: AuthProvider;
    emailVerified?: Date;
    image?: string;
    sessionId?: string;
  }
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { validateEnvironmentVariables, createAuthAuditLog, getClientIP, getUserAgent };
export type { NextAuthConfig };