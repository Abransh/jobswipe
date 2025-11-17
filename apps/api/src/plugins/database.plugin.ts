/**
 * @fileoverview Database Plugin for Fastify
 * @description Prisma database connection and transaction management
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-grade database connection with proper error handling
 */

import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { getEnvironmentConfig } from '../utils/env-validation';

// SECURITY FIX: Database imports with strict production validation
// In production, database package MUST be available - no fallbacks
let db: any = null;
let getUserById: any = null;
let createUser: any = null;
let updateUser: any = null;
let deleteUser: any = null;

// Check if we're in production mode at import time
const isProduction = process.env.NODE_ENV === 'production';

try {
  const databaseModule = require('@jobswipe/database');
  db = databaseModule.db;
  getUserById = databaseModule.getUserById;
  createUser = databaseModule.createUser;
  updateUser = databaseModule.updateUser;
  deleteUser = databaseModule.deleteUser;
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  // CRITICAL: In production, database package is required - fail immediately
  if (isProduction) {
    const criticalError = `CRITICAL ERROR: Database package (@jobswipe/database) is required in production but could not be loaded: ${errorMessage}`;
    console.error('❌', criticalError);
    throw new Error(criticalError);
  }

  // In development, log warning but allow server to start (useful for testing non-DB features)
  console.warn('⚠️  Database package not available in development mode:', errorMessage);
  console.warn('⚠️  Server will start but database operations will fail. Install @jobswipe/database to fix this.');
}

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface DatabasePluginOptions extends FastifyPluginOptions {
  connectionString?: string;
  poolSize?: number;
  timeout?: number;
  enableLogging?: boolean;
}

interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: {
    connected: boolean;
    connectionCount?: number;
    lastQuery?: Date;
    error?: string;
  };
}

// =============================================================================
// DATABASE CONNECTION MANAGER
// =============================================================================

class DatabaseManager {
  private fastify: FastifyInstance;
  private connectionChecked = false;
  private lastHealthCheck: DatabaseHealth | null = null;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Initialize database connection
   * SECURITY FIX: Fail fast if database is not available in production
   */
  async initialize(): Promise<void> {
    const envConfig = getEnvironmentConfig();

    if (!db) {
      const errorMessage = 'Database client not available - package import failed';

      // CRITICAL: In production, database is REQUIRED
      if (envConfig.nodeEnv === 'production') {
        this.fastify.log.fatal(errorMessage);
        throw new Error(`CRITICAL: ${errorMessage}. Production deployment requires @jobswipe/database package.`);
      }

      // In development, warn but allow to continue (useful for testing non-DB features)
      this.fastify.log.warn(`⚠️  ${errorMessage} - running without database connectivity in development mode`);
      this.fastify.log.warn('⚠️  Database operations will fail. Install and configure @jobswipe/database to fix this.');
      return;
    }

    try {
      // Test database connection
      await this.testConnection();
      this.connectionChecked = true;

      this.fastify.log.info({
        environment: envConfig.nodeEnv,
        databaseUrl: process.env.DATABASE_URL ? '***configured***' : 'not set'
      }, '✅ Database connection established successfully');

      // Setup cleanup on app close
      this.fastify.addHook('onClose', this.cleanup.bind(this));

    } catch (error) {
      this.fastify.log.error({err: error, msg: '❌ Failed to establish database connection:'});

      // CRITICAL: In production, database connection failure is fatal
      if (envConfig.nodeEnv === 'production') {
        throw new Error(`CRITICAL: Database connection failed in production: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // In development, throw error (can be caught by plugin initialization)
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<void> {
    if (!db) {
      throw new Error('Database client not available');
    }

    try {
      // Simple query to test connection
      await db.$queryRaw`SELECT 1 as test`;
      this.fastify.log.debug('Database connection test successful');
    } catch (error) {
      this.fastify.log.error({err: error, msg: 'Database connection test failed:'});
      throw error;
    }
  }

  /**
   * Get database health status
   */
  async getHealth(): Promise<DatabaseHealth> {
    if (!db) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: 'Database client not available'
        }
      };
    }

    try {
      const startTime = Date.now();
      await db.$queryRaw`SELECT 1 as health_check`;
      const responseTime = Date.now() - startTime;

      this.lastHealthCheck = {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        details: {
          connected: true,
          lastQuery: new Date(),
          connectionCount: 1, // Simplified for now
        }
      };

      return this.lastHealthCheck;

    } catch (error) {
      this.lastHealthCheck = {
        status: 'unhealthy',
        details: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };

      return this.lastHealthCheck;
    }
  }

  /**
   * Execute a database transaction
   */
  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (!db) {
      throw new Error('Database not available for transactions');
    }

    try {
      return await db.$transaction(callback);
    } catch (error) {
      this.fastify.log.error({err: error, msg:'Database transaction failed:'});
      throw error;
    }
  }

  /**
   * Cleanup database connections
   */
  async cleanup(): Promise<void> {
    if (db) {
      try {
        await db.$disconnect();
        this.fastify.log.info('Database connections closed');
      } catch (error) {
        this.fastify.log.error({err: error, msg:'Error closing database connections:'});
      }
    }
  }
}

// =============================================================================
// ENHANCED DATABASE METHODS
// =============================================================================

class DatabaseService {
  private fastify: FastifyInstance;
  private manager: DatabaseManager;

  constructor(fastify: FastifyInstance, manager: DatabaseManager) {
    this.fastify = fastify;
    this.manager = manager;
  }

  /**
   * Get user by ID with error handling
   */
  async getUserById(id: string): Promise<any> {
    if (!db || !getUserById) {
      throw new Error('Database or user service not available');
    }

    try {
      const user = await getUserById(id);

      if (!user) {
        this.fastify.log.debug(`User not found: ${id}`);
        return null;
      }

      this.fastify.log.debug(`User retrieved: ${user.email}`);
      return user;

    } catch (error) {
      this.fastify.log.error({err: error, msg:'Error retrieving user:'});
      throw new Error(`Failed to retrieve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute raw query with logging
   */
  async executeQuery(query: string, params?: any[]): Promise<any> {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      this.fastify.log.debug(`Executing query: ${query}`);
      const result = params ? await db.$queryRawUnsafe(query, ...params) : await db.$queryRawUnsafe(query);
      return result;

    } catch (error) {
      this.fastify.log.error({err: error, msg:'Query execution failed:'});
      throw error;
    }
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): any {
    return {
      available: !!db,
      checked: this.manager['connectionChecked'],
      lastHealth: this.manager['lastHealthCheck'],
    };
  }
}

// =============================================================================
// PLUGIN IMPLEMENTATION
// =============================================================================

const databasePlugin: FastifyPluginAsync<DatabasePluginOptions> = async (
  fastify: FastifyInstance,
  options: DatabasePluginOptions
) => {
  // Load environment configuration
  const envConfig = getEnvironmentConfig();

  // Initialize database manager
  const manager = new DatabaseManager(fastify);

  // SECURITY FIX: Fail-fast database initialization
  // Production mode will throw an error if database is unavailable (handled in initialize())
  // Development mode will log warnings but continue (allows testing non-DB features)
  try {
    await manager.initialize();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // In production, initialize() will already throw - this catch won't be reached
    // unless there's an unexpected error. Re-throw to prevent server startup.
    if (envConfig.nodeEnv === 'production') {
      fastify.log.fatal({ error: errorMessage }, 'CRITICAL: Database initialization failed in production');
      throw error;
    }

    // In development, log the error and continue without database
    fastify.log.warn({
      error: errorMessage,
      warning: 'Database operations will fail until database is properly configured'
    }, '⚠️  Database initialization failed in development mode - continuing without database');
  }

  // Create database service
  const databaseService = new DatabaseService(fastify, manager);

  // Decorate Fastify instance with database
  if (db) {
    fastify.decorate('db', db);
    fastify.decorate('dbService', databaseService);
    fastify.decorate('dbHealth', manager.getHealth.bind(manager));
    fastify.decorate('dbTransaction', manager.executeTransaction.bind(manager));
  } else {
    // Add mock database for development
    fastify.decorate('db', null);
    fastify.decorate('dbService', null);
    fastify.decorate('dbHealth', async () => ({
      status: 'unhealthy' as const,
      details: { connected: false, error: 'Database not available' }
    }));
    fastify.decorate('dbTransaction', async () => {
      throw new Error('Database not available');
    });
  }

  // Add database health check endpoint
  fastify.get('/health/database', {
    schema: {
      description: 'Database health check',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            details: {
              type: 'object',
              properties: {
                connected: { type: 'boolean' },
                connectionCount: { type: 'number' },
                lastQuery: { type: 'string', format: 'date-time' },
                error: { type: 'string' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const health = await manager.getHealth();

    reply.code(health.status === 'healthy' ? 200 : 503).send({
      ...health,
      timestamp: new Date().toISOString()
    });
  });

  // Add database info endpoint
  fastify.get('/health/database/info', {
    schema: {
      description: 'Database connection info',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            checked: { type: 'boolean' },
            version: { type: 'string' },
            features: {
              type: 'object',
              properties: {
                transactions: { type: 'boolean' },
                rawQueries: { type: 'boolean' },
                migrations: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const info = databaseService.getConnectionInfo();

    reply.send({
      ...info,
      version: db ? 'Prisma Client' : 'Not Available',
      features: {
        transactions: !!db,
        rawQueries: !!db,
        migrations: !!db
      }
    });
  });

  fastify.log.info('Database plugin registered successfully');
};

export default fastifyPlugin(databasePlugin as any, {
  name: 'database',
  fastify: '5.x'
});