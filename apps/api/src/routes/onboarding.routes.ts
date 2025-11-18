import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UserId } from '@jobswipe/shared';

interface AuthRequest extends FastifyRequest {
  user?: {
    id: UserId;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: any;
  };
}

async function authMiddleware(request: AuthRequest, reply: FastifyReply): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];
    const tokenResult = await request.server.jwtService.verifyToken(token);

    if (!tokenResult.valid || !tokenResult.payload) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token',
      });
    }

    request.user = {
      id: (tokenResult.payload.sub || (tokenResult.payload as any).userId) as UserId,
      email: tokenResult.payload.email,
      role: tokenResult.payload.role,
      status: (tokenResult.payload as any).status,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...tokenResult.payload,
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}

const progressSchema = z.object({
  currentStep: z.number().min(1).max(5),
  completedSteps: z.array(z.number()),
  progress: z.number().min(0).max(100),
  data: z.object({
    essentialProfile: z.object({
      fullName: z.string().optional(),
      phone: z.string().optional(),
      roleType: z.string().optional(),
      desiredSalaryMin: z.number().optional(),
      desiredSalaryMax: z.number().optional(),
      resumeFile: z.any().optional(),
    }).optional(),
    workAuthorization: z.object({
      currentCountry: z.string().optional(),
      currentLocation: z.string().optional(),
      canWorkInCurrentCountry: z.boolean().optional(),
      currentCountryWorkAuth: z.string().optional(),
      interestedInInternational: z.boolean().optional(),
      targetRegions: z.array(z.string()).optional(),
      workAuthByRegion: z.record(z.string(), z.string()).optional(),
    }).optional(),
  })
});

const completeSchema = z.object({
  data: z.object({
    essentialProfile: z.object({
      fullName: z.string(),
      phone: z.string(),
      roleType: z.string(),
      desiredSalaryMin: z.number(),
      desiredSalaryMax: z.number(),
    }),
    workAuthorization: z.object({
      currentCountry: z.string(),
      currentLocation: z.string(),
      canWorkInCurrentCountry: z.boolean(),
      currentCountryWorkAuth: z.string().optional(),
      interestedInInternational: z.boolean(),
      targetRegions: z.array(z.string()).optional(),
      workAuthByRegion: z.record(z.string(), z.string()).optional(),
    }),
  })
});

export async function registerOnboardingRoutes(server: FastifyInstance) {
  server.get('/onboarding/progress', {
    preHandler: [authMiddleware]
  }, async (request: AuthRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;

      const userData = await server.db.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true
        }
      });

      if (!userData) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      const savedData = {
        currentStep: userData.onboardingStep || 1,
        completedSteps: [],
        progress: userData.onboardingProgress || 0,
        data: {
          essentialProfile: {
            fullName: userData.profile?.fullName || '',
            phone: userData.profile?.phone || '',
            roleType: userData.profile?.currentTitle || '',
            desiredSalaryMin: userData.profile?.desiredSalaryMin || 0,
            desiredSalaryMax: userData.profile?.desiredSalaryMax || 0,
          },
          workAuthorization: {
            currentCountry: userData.profile?.currentCountry || '',
            currentLocation: userData.profile?.currentLocation || '',
            canWorkInCurrentCountry: userData.profile?.canWorkInCurrentCountry || false,
            currentCountryWorkAuth: userData.profile?.workAuthorizationStatus || '',
            interestedInInternational: userData.profile?.interestedInInternational || false,
            targetRegions: userData.profile?.targetRegions || [],
            workAuthByRegion: userData.profile?.workAuthByRegion || {},
          }
        }
      };

      return reply.send({
        success: true,
        data: savedData
      });

    } catch (error) {
      server.log.error(error, 'Error fetching onboarding progress');
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch onboarding progress'
      });
    }
  });

  server.post('/onboarding/progress', {
    preHandler: [authMiddleware]
  }, async (request: AuthRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const validation = progressSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request data',
          details: validation.error.issues
        });
      }

      const { currentStep, completedSteps, progress, data } = validation.data;

      await server.db.user.update({
        where: { id: user.id },
        data: {
          onboardingStep: currentStep,
          onboardingProgress: progress,
          onboardingStartedAt: {
            set: new Date()
          }
        }
      });

      if (data.essentialProfile) {
        const profileData: any = {};

        if (data.essentialProfile.fullName) {
          const nameParts = data.essentialProfile.fullName.split(' ');
          profileData.firstName = nameParts[0];
          profileData.lastName = nameParts.slice(1).join(' ') || nameParts[0];
          profileData.fullName = data.essentialProfile.fullName;
        }

        if (data.essentialProfile.phone) {
          profileData.phone = data.essentialProfile.phone;
        }

        if (data.essentialProfile.roleType) {
          profileData.currentTitle = data.essentialProfile.roleType;
        }

        if (data.essentialProfile.desiredSalaryMin !== undefined) {
          profileData.desiredSalaryMin = data.essentialProfile.desiredSalaryMin;
        }

        if (data.essentialProfile.desiredSalaryMax !== undefined) {
          profileData.desiredSalaryMax = data.essentialProfile.desiredSalaryMax;
        }

        await server.db.userProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...profileData
          },
          update: profileData
        });
      }

      if (data.workAuthorization) {
        const workAuthData: any = {};

        if (data.workAuthorization.currentCountry) {
          workAuthData.currentCountry = data.workAuthorization.currentCountry;
        }

        if (data.workAuthorization.currentLocation) {
          workAuthData.currentLocation = data.workAuthorization.currentLocation;
        }

        if (data.workAuthorization.canWorkInCurrentCountry !== undefined) {
          workAuthData.canWorkInCurrentCountry = data.workAuthorization.canWorkInCurrentCountry;
        }

        if (data.workAuthorization.currentCountryWorkAuth) {
          workAuthData.workAuthorizationStatus = data.workAuthorization.currentCountryWorkAuth;
        }

        if (data.workAuthorization.interestedInInternational !== undefined) {
          workAuthData.interestedInInternational = data.workAuthorization.interestedInInternational;
        }

        if (data.workAuthorization.targetRegions) {
          workAuthData.targetRegions = data.workAuthorization.targetRegions;
        }

        if (data.workAuthorization.workAuthByRegion) {
          workAuthData.workAuthByRegion = data.workAuthorization.workAuthByRegion;
        }

        await server.db.userProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...workAuthData
          },
          update: workAuthData
        });
      }

      return reply.send({
        success: true,
        message: 'Progress saved successfully'
      });

    } catch (error) {
      server.log.error(error, 'Error saving onboarding progress');
      return reply.status(500).send({
        success: false,
        error: 'Failed to save progress'
      });
    }
  });

  server.post('/onboarding/complete', {
    preHandler: [authMiddleware]
  }, async (request: AuthRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      const validation = completeSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request data',
          details: validation.error.issues
        });
      }

      const { data } = validation.data;

      await server.db.user.update({
        where: { id: user.id },
        data: {
          onboardingCompleted: true,
          onboardingProgress: 100,
          onboardingCompletedAt: new Date()
        }
      });

      const nameParts = data.essentialProfile.fullName.split(' ');
      const profileData = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        fullName: data.essentialProfile.fullName,
        phone: data.essentialProfile.phone,
        currentTitle: data.essentialProfile.roleType,
        desiredSalaryMin: data.essentialProfile.desiredSalaryMin,
        desiredSalaryMax: data.essentialProfile.desiredSalaryMax,
        currentCountry: data.workAuthorization.currentCountry,
        currentLocation: data.workAuthorization.currentLocation,
        canWorkInCurrentCountry: data.workAuthorization.canWorkInCurrentCountry,
        workAuthorizationStatus: data.workAuthorization.currentCountryWorkAuth,
        interestedInInternational: data.workAuthorization.interestedInInternational,
        targetRegions: data.workAuthorization.targetRegions || [],
        workAuthByRegion: data.workAuthorization.workAuthByRegion || {},
      };

      await server.db.userProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...profileData
        },
        update: profileData
      });

      return reply.send({
        success: true,
        message: 'Onboarding completed successfully'
      });

    } catch (error) {
      server.log.error(error, 'Error completing onboarding');
      return reply.status(500).send({
        success: false,
        error: 'Failed to complete onboarding'
      });
    }
  });

  server.post('/onboarding/skip', {
    preHandler: [authMiddleware]
  }, async (request: AuthRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;

      await server.db.user.update({
        where: { id: user.id },
        data: {
          onboardingCompleted: true,
          onboardingProgress: 0,
        }
      });

      return reply.send({
        success: true,
        message: 'Onboarding skipped'
      });

    } catch (error) {
      server.log.error(error, 'Error skipping onboarding');
      return reply.status(500).send({
        success: false,
        error: 'Failed to skip onboarding'
      });
    }
  });
}
