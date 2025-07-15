import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import { authenticateUser, updateLastLogin } from '@jobswipe/database';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError,
  validateMethod 
} from '@/lib/api/response';
import { validateRequestBody, schemas } from '@/lib/api/validation';

export async function POST(request: NextRequest) {
  try {
    // Validate method
    const methodError = validateMethod(request, ['POST']);
    if (methodError) return methodError;

    // Validate request body
    const { email, password } = await validateRequestBody(
      request,
      schemas.userLogin
    );

    // Authenticate user
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return createErrorResponse({
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          profile: user.profile,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    return handleApiError(error);
  }
}