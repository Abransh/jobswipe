/**
 * Jobs Routes
 * Handles job-related API endpoints
 */

import { FastifyPluginAsync } from 'fastify';
import { JobService } from '../services/JobService';

const jobsRoutes: FastifyPluginAsync = async function (fastify) {
  const jobService = new JobService(fastify);

  // GET /v1/jobs - Fetch jobs with filtering and pagination
  fastify.get('/jobs', async (request, reply) => {
    try {
      const query = request.query as any;
      
      fastify.log.info(`📋 Fetching jobs with query: ${JSON.stringify(query)}`);

      // Parse query parameters
      const options = {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 20,
        sortBy: query.sortBy || 'relevance',
        q: query.q,
        userLocation: query.userLat && query.userLng ? {
          lat: parseFloat(query.userLat),
          lng: parseFloat(query.userLng)
        } : undefined,
        userId: request.headers['x-user-id'] as string, // Get from auth header
        filters: {
          location: query.location,
          remote: query.remote,
          jobType: query.jobType ? query.jobType.split(',') : [],
          jobLevel: query.jobLevel ? query.jobLevel.split(',') : [],
          salaryMin: query.salaryMin ? parseInt(query.salaryMin) : undefined,
          salaryMax: query.salaryMax ? parseInt(query.salaryMax) : undefined,
          skills: query.skills ? query.skills.split(',') : [],
          companySize: query.companySize ? query.companySize.split(',') : [],
          category: query.category ? query.category.split(',') : [],
          experience: query.experience ? parseInt(query.experience) : undefined
        }
      };

      // Fetch jobs from database
      const result = await jobService.searchJobs(options);

      reply.send({
        success: true,
        data: result
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching jobs:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      });
    }
  });

  // GET /v1/jobs/proximity - Get location-based job suggestions
  fastify.get('/jobs/proximity', async (request, reply) => {
    try {
      const query = request.query as any;
      
      fastify.log.info(`🌍 Fetching proximity jobs for location: ${query.location}`);

      const params = {
        location: query.location || '',
        jobType: query.jobType ? query.jobType.split(',') : [],
        level: query.level ? query.level.split(',') : [],
        remote: query.remote || 'any',
        limit: parseInt(query.limit) || 20
      };

      const result = await jobService.getProximityJobs(params);

      reply.send({
        success: true,
        data: result
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching proximity jobs:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch proximity jobs',
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

        // TODO: Implement actual job scraping and syncing logic
        // For now, return success response
        reply.send({
          success: true,
          data: {
            fetched: 10,
            stored: 8,
            updated: 2,
            skipped: 0,
            cleanedUp: 5,
            message: 'Job sync functionality will be implemented with scraping services'
          },
        });
        
      } else if (action === 'stats') {
        // Get real database statistics
        const stats = await jobService.getJobStats();
        
        reply.send({
          success: true,
          data: stats,
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
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  });

  // POST /v1/jobs/advanced-search - Advanced job search with faceted filtering
  fastify.post('/jobs/advanced-search', async (request, reply) => {
    try {
      const searchParams = request.body as any;
      const userId = request.headers['x-user-id'] as string;
      
      fastify.log.info('🔍 Advanced job search requested:', searchParams);

      // Enhanced search parameters
      const searchOptions = {
        query: searchParams.query,
        skills: searchParams.skills,
        location: searchParams.location,
        salaryMin: searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined,
        salaryMax: searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined,
        experienceMin: searchParams.experienceMin ? parseInt(searchParams.experienceMin) : undefined,
        experienceMax: searchParams.experienceMax ? parseInt(searchParams.experienceMax) : undefined,
        remote: searchParams.remote || 'any',
        companySize: searchParams.companySize,
        posted: searchParams.posted || 'any',
        page: parseInt(searchParams.page) || 1,
        limit: parseInt(searchParams.limit) || 20,
        userId
      };

      // Use existing search method with enhanced filtering
      const result = await jobService.searchJobs({
        q: searchOptions.query,
        page: searchOptions.page,
        limit: searchOptions.limit,
        sortBy: 'relevance',
        userId: searchOptions.userId,
        filters: {
          skills: searchOptions.skills,
          location: searchOptions.location,
          salaryMin: searchOptions.salaryMin,
          salaryMax: searchOptions.salaryMax,
          experience: searchOptions.experienceMin,
          remote: searchOptions.remote === 'only' ? 'remote_only' : 
                  searchOptions.remote === 'excluded' ? 'onsite' : 'any',
          jobType: [],
          jobLevel: [],
          companySize: searchOptions.companySize,
          category: []
        }
      });

      reply.send({
        success: true,
        data: {
          ...result,
          searchParams: searchOptions,
          enhancedSearch: true
        }
      });

    } catch (error) {
      fastify.log.error('❌ Error in advanced search:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Advanced search failed',
      });
    }
  });

  // GET /v1/jobs/:id - Get single job details
  fastify.get('/jobs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = request.headers['x-user-id'] as string;

      fastify.log.info(`📋 Fetching job details for: ${id}`);

      // Get job from database
      const job = await jobService.getJobById(id);
      
      if (!job) {
        reply.status(404).send({
          success: false,
          error: 'Job not found',
        });
        return;
      }

      // Record job view
      if (userId) {
        await jobService.recordJobView(id, userId);
      }

      reply.send({
        success: true,
        data: job
      });

    } catch (error) {
      fastify.log.error('❌ Error fetching job details:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job details',
      });
    }
  });
};

export default jobsRoutes;