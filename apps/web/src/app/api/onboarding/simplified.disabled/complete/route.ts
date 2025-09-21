// import { NextRequest, NextResponse } from 'next/server';
// import { authenticateRequest, AuthError } from '@/lib/api/auth';
// import { db as prisma } from '@jobswipe/database';
// import { 
//   simplifiedOnboardingSchema,
//   type SimplifiedOnboardingData 
// } from '@jobswipe/shared/schemas';

// // POST - Complete simplified onboarding
// export async function POST(request: NextRequest) {
//   try {
//     const authenticatedUser = await authenticateRequest(request);
//     const body = await request.json();
//     const { data: onboardingData, completedSteps } = body;

//     // Find user
//     const user = await prisma.user.findUnique({
//       where: { id: authenticatedUser.id },
//       include: {
//         profile: true
//       }
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }

//     // Validate onboarding data
//     const validationResult = simplifiedOnboardingSchema.safeParse(onboardingData);
    
//     if (!validationResult.success) {
//       return NextResponse.json(
//         { 
//           error: 'Invalid onboarding data',
//           details: validationResult.error.flatten()
//         },
//         { status: 400 }
//       );
//     }

//     const validatedData = validationResult.data;

//     // Use a transaction to ensure data consistency
//     const result = await prisma.$transaction(async (tx) => {
//       // Update or create user profile
//       const profileData = {
//         displayName: validatedData.essentialProfile.fullName,
//         phone: validatedData.essentialProfile.phone,
//         currentTitle: validatedData.essentialProfile.roleType,
//         desiredSalaryMin: validatedData.essentialProfile.salaryMin,
//         desiredSalaryMax: validatedData.essentialProfile.salaryMax,
//         preferredCurrency: validatedData.essentialProfile.salaryCurrency || 'USD',
//         country: validatedData.workAuthorization.currentCountry,
//         location: validatedData.workAuthorization.currentLocation
//       };

//       const profile = await tx.userProfile.upsert({
//         where: { userId: user.id },
//         create: {
//           userId: user.id,
//           ...profileData
//         },
//         update: profileData
//       });

//       // Handle resume file if provided
//       if (validatedData.essentialProfile.resumeFile) {
//         // TODO: In a real implementation, you would:
//         // 1. Upload the file to S3 or your file storage
//         // 2. Parse the resume content
//         // 3. Extract skills, experience, etc.
//         // 4. Store the file URL in the database
        
//         // For now, we'll just create a placeholder resume record
//         await tx.resume.create({
//           data: {
//             userId: user.id,
//             name: 'Primary Resume', // Resume name
//             title: validatedData.essentialProfile.roleType,
//             content: {}, // Empty content for now
//             sections: {} // Empty sections for now
//           }
//         });
//       }

//       // Update user's onboarding status
//       await tx.user.update({
//         where: { id: user.id },
//         data: {
//           onboardingCompleted: true,
//           onboardingCompletedAt: new Date(),
//           onboardingProgress: 100,
//           onboardingStep: 2,
//           updatedAt: new Date()
//         }
//       });

//       return profile;
//     });

//     // TODO: In a real implementation, you might want to:
//     // 1. Send a welcome email
//     // 2. Create initial job recommendations
//     // 3. Set up user preferences
//     // 4. Log analytics event
//     // 5. Send notification to admin for new completed onboarding

//     return NextResponse.json({
//       message: 'Onboarding completed successfully!',
//       profile: result
//     });

//   } catch (error) {
//     console.error('Failed to complete onboarding:', error);
    
//     if (error instanceof AuthError) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: error.statusCode }
//       );
//     }
    
//     // Handle specific error types
//     if ((error as any)?.code === 'P2002') { // Prisma unique constraint error
//       return NextResponse.json(
//         { error: 'A profile with this information already exists' },
//         { status: 409 }
//       );
//     }

//     return NextResponse.json(
//       { error: 'Failed to complete onboarding. Please try again.' },
//       { status: 500 }
//     );
//   }
// }