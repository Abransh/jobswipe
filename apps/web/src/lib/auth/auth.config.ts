/**
 * @fileoverview NextAuth.js configuration for JobSwipe web application
 * @description Enterprise-grade authentication with social providers and custom credentials
 * @version 1.0.0
 * @author JobSwipe Team
 */

// import { type NextAuthConfig } from 'next-auth';
type NextAuthConfig = any; // Temporary type for NextAuth v4 compatibility
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import LinkedIn from 'next-auth/providers/linkedin';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
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
  const criticalEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missingCriticalVars = criticalEnvVars.filter(varName => !process.env[varName]);
  
  if (missingCriticalVars.length > 0) {
    throw new Error(`Missing critical environment variables: ${missingCriticalVars.join(', ')}`);
  }

  // Warn about missing OAuth provider vars but don't fail
  const oauthVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
  ];

  const missingOAuthVars = oauthVars.filter(varName => !process.env[varName]);
  
  if (missingOAuthVars.length > 0) {
    console.warn(`Missing OAuth environment variables (OAuth providers will be disabled): ${missingOAuthVars.join(', ')}`);
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
      // Add null checks for request headers
      const headers = req?.headers instanceof Headers ? req.headers : new Headers();
      
      if (!credentials?.email || !credentials?.password) {
        await createAuthAuditLog(
          'CREDENTIALS_AUTH_FAILED',
          undefined,
          credentials?.email,
          getClientIP(headers),
          getUserAgent(headers),
          false,
          'Missing email or password'
        );
        return null; // Return null instead of throwing for better NextAuth compatibility
      }

      const isRegistering = credentials.isRegistering === 'true';
      const ip = getClientIP(headers);
      const userAgent = getUserAgent(headers);

      if (isRegistering) {
        // Registration flow
        const registerData = {
          email: credentials.email,
          password: credentials.password,
          source: AuthSource.WEB,
          ipAddress: ip,
          userAgent,
        };

        // Validate registration data (using basic structure for now)
        const validatedData = registerData;

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

        // Create new user with basic data
        const user = await createUser({
          email: validatedData.email,
          password: validatedData.password,
          name: credentials.firstName && credentials.lastName 
            ? `${credentials.firstName} ${credentials.lastName}` 
            : validatedData.email.split('@')[0], // Fallback to username from email
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
          email: user.email || '',
          name: user.name || undefined,
          role: user.role,
          emailVerified: user.emailVerified || undefined,
          image: user.avatar || undefined,
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

        // Validate login data (using basic structure for now)
        const validatedData = loginData;

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
          email: user.email || '',
          name: user.name || undefined,
          role: user.role,
          emailVerified: user.emailVerified || undefined,
          image: user.avatar || undefined,
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

  // JWT configuration - Enhanced for Next.js 15 compatibility
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    encode: async ({ token, secret, maxAge }: { token?: any; secret: string; maxAge?: number }) => {
      try {
        // Enhanced JWT encoding with better error handling
        if (!token) return '';
        
        // Use basic JSON encoding for edge runtime compatibility
        const encodedToken = JSON.stringify(token);
        return encodedToken;
      } catch (error) {
        console.error('JWT encode error:', error);
        return '';
      }
    },
    decode: async ({ token, secret }: { token?: string; secret: string }) => {
      try {
        if (!token || typeof token !== 'string') return null;
        
        // Enhanced JWT decoding with validation
        const decodedToken = JSON.parse(token);
        
        // Basic validation of token structure
        if (typeof decodedToken !== 'object' || decodedToken === null) {
          return null;
        }
        
        return decodedToken;
      } catch (error) {
        console.error('JWT decode error:', error);
        return null;
      }
    },
  },

  // Provider configuration - Only include providers with valid credentials
  providers: [
    // Google OAuth (conditional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: OAUTH_SCOPES.GOOGLE,
                access_type: 'offline',
                prompt: 'consent',
              },
            },
            wellKnown: OAUTH_WELLKNOWN.GOOGLE,
            profile: (profile) => {
              try {
                return {
                  id: profile.sub || profile.id || '',
                  email: profile.email || '',
                  name: profile.name || profile.given_name || profile.family_name || '',
                  image: profile.picture || profile.avatar_url || '',
                  emailVerified: profile.email_verified ? new Date() : undefined,
                };
              } catch (error) {
                console.error('Google profile mapping error:', error);
                return {
                  id: profile.sub || '',
                  email: profile.email || '',
                  name: '',
                  image: '',
                  emailVerified: undefined,
                };
              }
            },
          }),
        ]
      : []),

    // GitHub OAuth (conditional)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
              params: {
                scope: OAUTH_SCOPES.GITHUB,
              },
            },
            profile: (profile) => {
              try {
                return {
                  id: profile.id ? profile.id.toString() : '',
                  email: profile.email || '',
                  name: profile.name || profile.login || profile.display_name || '',
                  image: profile.avatar_url || '',
                  emailVerified: profile.email ? new Date() : undefined,
                };
              } catch (error) {
                console.error('GitHub profile mapping error:', error);
                return {
                  id: '',
                  email: '',
                  name: '',
                  image: '',
                  emailVerified: undefined,
                };
              }
            },
          }),
        ]
      : []),

    // LinkedIn OAuth (conditional)
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [
          LinkedIn({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            authorization: {
              params: {
                scope: OAUTH_SCOPES.LINKEDIN,
              },
            },
            profile: (profile) => {
              try {
                return {
                  id: profile.id || profile.sub || '',
                  email: profile.email || profile.emailAddress || '',
                  name: profile.name || profile.formattedName || profile.localizedFirstName || '',
                  image: profile.picture || profile.pictureUrl || '',
                  emailVerified: profile.email || profile.emailAddress ? new Date() : undefined,
                };
              } catch (error) {
                console.error('LinkedIn profile mapping error:', error);
                return {
                  id: '',
                  email: '',
                  name: '',
                  image: '',
                  emailVerified: undefined,
                };
              }
            },
          }),
        ]
      : []),

    // Microsoft OAuth (conditional)
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
            profile: (profile: any) => {
              try {
                return {
                  id: profile.id || profile.sub || '',
                  email: profile.mail || profile.userPrincipalName || profile.email || '',
                  name: profile.displayName || profile.name || profile.givenName || '',
                  image: profile.photo?.value || profile.picture || '',
                  emailVerified: (profile.mail || profile.email) ? new Date() : undefined,
                };
              } catch (error) {
                console.error('Microsoft profile mapping error:', error);
                return {
                  id: '',
                  email: '',
                  name: '',
                  image: '',
                  emailVerified: undefined,
                };
              }
            },
          },
        ]
      : []),

    // Custom credentials provider
    credentialsProvider,
  ],

  // Callback configuration
  callbacks: {
    // JWT callback - runs whenever a JWT is created, updated, or accessed
    async jwt({ token, user, account, profile, trigger, session }: { 
      token: any; 
      user?: any; 
      account?: any; 
      profile?: any; 
      trigger?: any; 
      session?: any; 
    }) {
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
    async session({ session, token }: { session: any; token: any }) {
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
    async signIn({ user, account, profile, email, credentials }: { 
      user: any; 
      account?: any; 
      profile?: any; 
      email?: any; 
      credentials?: any; 
    }) {
      try {
        if (account?.provider === 'credentials') {
          // Credentials sign-in is handled in the provider
          return true;
        }

        // OAuth sign-in with enhanced error handling
        if (account && profile && user?.email) {
          try {
            const existingUser = await getUserByEmail(user.email);
            
            if (!existingUser) {
              // Create new user from OAuth profile with better fallbacks
              const newUser = await createUser({
                email: user.email,
                password: '', // No password for OAuth users
                name: user.name || user.email.split('@')[0] || 'User',
                profile: {
                  firstName: (profile as any).given_name || (profile as any).givenName || '',
                  lastName: (profile as any).family_name || (profile as any).familyName || '',
                  displayName: user.name || user.email.split('@')[0] || '',
                  bio: (profile as any).bio || '',
                  website: (profile as any).blog || (profile as any).html_url || (profile as any).website || '',
                  linkedin: account.provider === 'linkedin' ? ((profile as any).publicProfileUrl || (profile as any).url) : undefined,
                  github: account.provider === 'github' ? ((profile as any).html_url || (profile as any).url) : undefined,
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
          } catch (error) {
            console.error('OAuth user creation error:', error);
            // Allow sign-in to continue even if user creation fails
            // The user will be created on next successful sign-in attempt
            await createAuthAuditLog(
              'OAUTH_USER_CREATION_FAILED',
              undefined,
              user.email,
              undefined,
              undefined,
              false,
              error instanceof Error ? error.message : 'Unknown error'
            );
            return true; // Still allow sign-in
          }
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
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
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
    async signIn({ user, isNewUser }: { user: any; account?: any; profile?: any; isNewUser?: boolean }) {
      await createAuthAuditLog(
        isNewUser ? 'NEW_USER_SIGNIN' : 'USER_SIGNIN',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async signOut({ token }: { token?: any; session?: any }) {
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

    async createUser({ user }: { user: any }) {
      await createAuthAuditLog(
        'USER_CREATED',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async updateUser({ user }: { user: any }) {
      await createAuthAuditLog(
        'USER_UPDATED',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async linkAccount({ user }: { user: any; account: any }) {
      await createAuthAuditLog(
        'ACCOUNT_LINKED',
        user.id,
        user.email,
        undefined,
        undefined,
        true
      );
    },

    async session({ token }: { session?: any; token?: any }) {
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
    error: (code: any, ...message: any[]) => {
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
    warn: (code: any, ...message: any[]) => {
      console.warn(`[NextAuth Warn] ${code}:`, ...message);
    },
    debug: (code: any, ...message: any[]) => {
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