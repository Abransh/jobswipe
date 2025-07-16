'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Camera, User } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'principal']).optional(),
  skills: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      bio: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      currentTitle: '',
      currentCompany: '',
      experienceLevel: 'mid',
      skills: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Photo */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {user?.image ? (
              <img
                className="h-20 w-20 rounded-full object-cover"
                src={user.image}
                alt="Profile"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <button
              type="button"
              className="absolute bottom-0 right-0 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Upload a professional photo. This will be visible to recruiters and hiring managers.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        
        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Profile updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error updating profile
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              id="name"
              label="Full Name"
              type="text"
              required
              {...register('name')}
              error={errors.name?.message}
            />

            <FormInput
              id="email"
              label="Email Address"
              type="email"
              required
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              id="phone"
              label="Phone Number"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />

            <FormInput
              id="location"
              label="Location"
              type="text"
              placeholder="e.g., San Francisco, CA"
              {...register('location')}
              error={errors.location?.message}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Tell us about yourself..."
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              id="currentTitle"
              label="Current Job Title"
              type="text"
              placeholder="e.g., Software Engineer"
              {...register('currentTitle')}
              error={errors.currentTitle?.message}
            />

            <FormInput
              id="currentCompany"
              label="Current Company"
              type="text"
              placeholder="e.g., Google"
              {...register('currentCompany')}
              error={errors.currentCompany?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...register('experienceLevel')}
              >
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="principal">Principal</option>
              </select>
            </div>

            <FormInput
              id="skills"
              label="Skills"
              type="text"
              placeholder="e.g., React, Node.js, Python"
              {...register('skills')}
              error={errors.skills?.message}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FormInput
              id="website"
              label="Website"
              type="url"
              placeholder="https://yourwebsite.com"
              {...register('website')}
              error={errors.website?.message}
            />

            <FormInput
              id="linkedin"
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              {...register('linkedin')}
              error={errors.linkedin?.message}
            />

            <FormInput
              id="github"
              label="GitHub"
              type="url"
              placeholder="https://github.com/yourusername"
              {...register('github')}
              error={errors.github?.message}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}