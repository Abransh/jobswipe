/**
 * Jobs Routes
 * Handles job-related API endpoints
 */

import { FastifyPluginAsync } from 'fastify';

const jobsRoutes: FastifyPluginAsync = async function (fastify) {
  // GET /v1/jobs - Fetch jobs with filtering and pagination
  fastify.get('/jobs', async (request, reply) => {
    try {
      const query = request.query as any;
      
      fastify.log.info(`📋 Fetching jobs with query: ${JSON.stringify(query)}`);
      
      // Mock response for now - replace with actual job fetching logic
      const mockJobs = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'Milan, Italy',
          description: 'Looking for a senior software engineer...',
          salary: { min: 50000, max: 80000, currency: 'EUR' },
          remote: 'hybrid',
          jobType: 'full-time',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Frontend Developer',
          company: 'Startup Inc',
          location: 'Rome, Italy',
          description: 'Frontend developer with React experience...',
          salary: { min: 40000, max: 60000, currency: 'EUR' },
          remote: 'remote_only',
          jobType: 'full-time',
          createdAt: new Date().toISOString(),
        },
      ];
      
      reply.send({
        success: true,
        data: {
          jobs: mockJobs,
          totalCount: mockJobs.length,
          hasMore: false,
          page: query.page || 1,
          limit: query.limit || 50,
          filters: query,
        },
      });
    } catch (error) {
      fastify.log.error('❌ Error fetching jobs:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch jobs',
      });
    }
  });

  // POST /v1/jobs - Job sync and management
  fastify.post('/jobs', async (request, reply) => {
    try {
      const { action, params } = request.body as any;
      
      fastify.log.info(`📋 Job management action: ${action}`);
      
      if (action === 'sync') {
        const {
          location = 'Italy',
          keywords = 'software engineer',
          sources = ['external'],
          limit = 100,
        } = params || {};

        fastify.log.info('📥 Manual job sync requested:', { location, keywords, sources, limit });

        // Mock sync response - replace with actual job fetching and storing logic
        reply.send({
          success: true,
          data: {
            fetched: 10,
            stored: 8,
            updated: 2,
            skipped: 0,
            cleanedUp: 5,
          },
        });
      } else if (action === 'stats') {
        // Mock stats response - replace with actual database stats
        reply.send({
          success: true,
          data: {
            totalJobs: 150,
            activeJobs: 120,
            expiredJobs: 30,
            recentJobs: 25,
            companies: 45,
          },
        });
      } else {
        reply.status(400).send({
          success: false,
          error: 'Invalid action',
        });
      }
    } catch (error) {
      fastify.log.error('❌ Error in job management:', error);
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
      });
    }
  });
};

export default jobsRoutes;