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
          description: 'Looking for a senior software engineer with 5+ years of experience...',
          requirements: 'Bachelor degree in Computer Science, 5+ years experience',
          benefits: 'Health insurance, retirement plan, flexible hours',
          type: 'FULL_TIME',
          level: 'SENIOR',
          department: 'Engineering',
          category: 'TECHNOLOGY',
          remote: true,
          remoteType: 'HYBRID',
          location: 'Milan, Italy',
          timeZone: 'Europe/Rome',
          city: 'Milan',
          state: 'Lombardy',
          country: 'Italy',
          salaryMin: 50000,
          salaryMax: 80000,
          currency: 'EUR',
          salaryType: 'ANNUAL',
          equity: '0.1-0.5%',
          bonus: 'Performance bonus',
          experienceYears: 5,
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          education: 'Bachelor degree',
          languages: ['English', 'Italian'],
          companyId: 'company-1',
          company: {
            id: 'company-1',
            name: 'Tech Corp',
            slug: 'tech-corp',
            description: 'Leading technology company',
            website: 'https://techcorp.com',
            logo: 'https://via.placeholder.com/64x64/0066cc/ffffff?text=TC',
            industry: 'Technology',
            size: 'LARGE',
            isVerified: true,
            qualityScore: 92,
            headquarters: 'Milan, Italy',
            country: 'Italy',
            foundedYear: 2010,
            employeeCount: 500
          },
          sourceUrl: 'https://jobs.techcorp.com/senior-engineer',
          applyUrl: 'https://jobs.techcorp.com/apply/senior-engineer',
          qualityScore: 88,
          isVerified: true,
          isActive: true,
          isFeatured: true,
          isUrgent: false,
          postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          viewCount: 245,
          applicationCount: 12,
          rightSwipeCount: 18,
          leftSwipeCount: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Frontend Developer',
          description: 'Frontend developer with React experience and passion for UX...',
          requirements: 'Bachelor degree, 3+ years React experience',
          benefits: 'Health insurance, remote work, learning budget',
          type: 'FULL_TIME',
          level: 'MID_LEVEL',
          department: 'Engineering',
          category: 'TECHNOLOGY',
          remote: true,
          remoteType: 'REMOTE',
          location: 'Rome, Italy',
          timeZone: 'Europe/Rome',
          city: 'Rome',
          state: 'Lazio',
          country: 'Italy',
          salaryMin: 40000,
          salaryMax: 60000,
          currency: 'EUR',
          salaryType: 'ANNUAL',
          equity: '0.05-0.2%',
          bonus: 'Annual bonus',
          experienceYears: 3,
          skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
          education: 'Bachelor degree',
          languages: ['English', 'Italian'],
          companyId: 'company-2',
          company: {
            id: 'company-2',
            name: 'Startup Inc',
            slug: 'startup-inc',
            description: 'Innovative startup disrupting the market',
            website: 'https://startup-inc.com',
            logo: 'https://via.placeholder.com/64x64/ff6600/ffffff?text=SI',
            industry: 'Technology',
            size: 'SMALL',
            isVerified: false,
            qualityScore: 75,
            headquarters: 'Rome, Italy',
            country: 'Italy',
            foundedYear: 2020,
            employeeCount: 25
          },
          sourceUrl: 'https://startup-inc.com/careers/frontend',
          applyUrl: 'https://startup-inc.com/apply/frontend',
          qualityScore: 82,
          isVerified: false,
          isActive: true,
          isFeatured: false,
          isUrgent: true,
          postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          viewCount: 89,
          applicationCount: 5,
          rightSwipeCount: 7,
          leftSwipeCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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