/**
 * @fileoverview Database Plugin for Fastify
 * @description Prisma database connection and transaction management
 * @version 1.0.0
 * @author JobSwipe Team
 * @security Production-grade database connection with proper error handling
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { getEnvironmentConfig } from '../utils/env-validation';

// Database imports with fallbacks
let db: any = null;
let getUserById: any = null;
let createUser: any = null;
let updateUser: any = null;
let deleteUser: any = null;

try {
  const databaseModule = require('@jobswipe/database');
  db = databaseModule.db;
  getUserById = databaseModule.getUserById;
  createUser = databaseModule.createUser;
  updateUser = databaseModule.updateUser;
  deleteUser = databaseModule.deleteUser;
} catch (error) {
  console.warn('⚠️  Database package not available:', error instanceof Error ? error.message : 'Unknown error');
}

// =============================================================================
// INTERFACES & TYPES
// =============================================================================

interface DatabasePluginOptions {
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
   */
  async initialize(): Promise<void> {
    if (!db) {
      this.fastify.log.warn('Database not available - running without database connectivity');
      return;
    }

    try {
      // Test database connection
      await this.testConnection();
      this.connectionChecked = true;

      this.fastify.log.info('✅ Database connection established successfully');

      // Setup cleanup on app close
      this.fastify.addHook('onClose', this.cleanup.bind(this));

    } catch (error) {
      this.fastify.log.error('❌ Failed to establish database connection:', error);
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
      this.fastify.log.error('Database connection test failed:', error);
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
      this.fastify.log.error('Database transaction failed:', error);
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
        this.fastify.log.error('Error closing database connections:', error);
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
      this.fastify.log.error('Error retrieving user:', error);
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
      this.fastify.log.error('Query execution failed:', error);
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

  try {
    await manager.initialize();
  } catch (error) {
    if (envConfig.nodeEnv === 'production') {
      // In production, database is required
      throw error;
    } else {
      // In development, continue without database
      fastify.log.warn('Continuing without database in development mode');
    }
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

export default fastifyPlugin(databasePlugin, {
  name: 'database',
  fastify: '4.x'
});