'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Home, Settings, Zap, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import {
  workPreferencesSchema,
  REMOTE_PREFERENCES,
  JOB_TYPES,
  type WorkPreferencesData
} from '@jobswipe/shared/schemas';

interface WorkPreferencesStepProps {
  data?: WorkPreferencesData;
  onDataChange: (data: WorkPreferencesData) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const REMOTE_PREFERENCE_LABELS = {
  REMOTE_ONLY: 'Remote Only',
  HYBRID: 'Hybrid (Mix of remote and office)',
  ONSITE_ONLY: 'On-site Only',
  NO_PREFERENCE: 'No Preference'
};

const REMOTE_PREFERENCE_DESCRIPTIONS = {
  REMOTE_ONLY: 'I only want to work remotely from home or anywhere',
  HYBRID: 'I prefer a mix of remote work and office time',
  ONSITE_ONLY: 'I prefer to work in an office environment',
  NO_PREFERENCE: 'I\'m open to any work arrangement'
};

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary'
};

export function WorkPreferencesStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false
}: WorkPreferencesStepProps) {
  const [selectedAutoApplyJobTypes, setSelectedAutoApplyJobTypes] = useState<string[]>(
    data?.autoApplyJobTypes || []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<WorkPreferencesData>({
    resolver: zodResolver(workPreferencesSchema),
    mode: 'onChange',
    defaultValues: {
      remotePref: data?.remotePref || 'NO_PREFERENCE',
      willingToRelocate: data?.willingToRelocate || false,
      city: data?.city || '',
      state: data?.state || '',
      country: data?.country || '',
      autoApplyEnabled: data?.autoApplyEnabled || false,
      autoApplyMaxPerDay: data?.autoApplyMaxPerDay || 5,
      autoApplyRequireMatch: data?.autoApplyRequireMatch || true,
      autoApplyJobTypes: data?.autoApplyJobTypes || []
    }
  });

  const watchedData = watch();
  const autoApplyEnabled = watch('autoApplyEnabled');

  // Update parent component when form data changes
  useEffect(() => {
    const updatedData = {
      ...watchedData,
      autoApplyJobTypes: selectedAutoApplyJobTypes as any
    };
    onDataChange(updatedData);
  }, [watchedData, selectedAutoApplyJobTypes, onDataChange]);

  // Update form value when selection changes
  useEffect(() => {
    setValue('autoApplyJobTypes', selectedAutoApplyJobTypes as any);
  }, [selectedAutoApplyJobTypes, setValue]);

  const toggleJobTypeSelection = (jobType: string) => {
    if (selectedAutoApplyJobTypes.includes(jobType)) {
      setSelectedAutoApplyJobTypes(selectedAutoApplyJobTypes.filter(t => t !== jobType));
    } else {
      setSelectedAutoApplyJobTypes([...selectedAutoApplyJobTypes, jobType]);
    }
  };

  const onSubmit = (formData: WorkPreferencesData) => {
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Remote Work Preferences */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Home className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Work Arrangement</h3>
        </div>

        <div className="space-y-4">
          {REMOTE_PREFERENCES.map(preference => (
            <label
              key={preference}
              className={`
                relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${watchedData.remotePref === preference
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="radio"
                value={preference}
                {...register('remotePref')}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-medium text-gray-900">
                    {REMOTE_PREFERENCE_LABELS[preference]}
                  </span>
                  {watchedData.remotePref === preference && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {REMOTE_PREFERENCE_DESCRIPTIONS[preference]}
                </p>
              </div>
            </label>
          ))}
        </div>

        {errors.remotePref && (
          <p className="text-sm text-red-600">{errors.remotePref.message}</p>
        )}
      </div>

      {/* Location Preferences */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Location Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            id="city"
            label="Preferred City"
            type="text"
            placeholder="e.g., San Francisco"
            {...register('city')}
            error={errors.city?.message}
          />

          <FormInput
            id="state"
            label="State/Province"
            type="text"
            placeholder="e.g., California"
            {...register('state')}
            error={errors.state?.message}
          />

          <FormInput
            id="country"
            label="Country"
            type="text"
            placeholder="e.g., United States"
            {...register('country')}
            error={errors.country?.message}
          />
        </div>

        <div className="flex items-start space-x-3">
          <input
            id="willingToRelocate"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            {...register('willingToRelocate')}
          />
          <div>
            <label htmlFor="willingToRelocate" className="block text-sm font-medium text-gray-900">
              I'm willing to relocate for the right opportunity
            </label>
            <p className="text-sm text-gray-600 mt-1">
              This helps us show you opportunities in other locations that might be worth considering.
            </p>
          </div>
        </div>
      </div>

      {/* Job Application Automation */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Application Automation</h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Smart Auto-Apply Feature</p>
              <p className="text-blue-700 mt-1">
                Our AI can automatically apply to jobs that match your preferences, saving you time and ensuring you don't miss opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <input
            id="autoApplyEnabled"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            {...register('autoApplyEnabled')}
          />
          <div>
            <label htmlFor="autoApplyEnabled" className="block text-sm font-medium text-gray-900">
              Enable automatic job applications
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Let our system automatically apply to jobs that match your criteria. You'll always receive notifications about applications made on your behalf.
            </p>
          </div>
        </div>

        {autoApplyEnabled && (
          <div className="ml-7 space-y-6 border-l-2 border-blue-200 pl-6">
            {/* Auto-apply Limits */}
            <div className="space-y-4">
              <FormInput
                id="autoApplyMaxPerDay"
                label="Maximum applications per day"
                type="number"
                min="1"
                max="50"
                {...register('autoApplyMaxPerDay', { valueAsNumber: true })}
                error={errors.autoApplyMaxPerDay?.message}
              />
              
              <p className="text-sm text-gray-600">
                We recommend starting with 5-10 applications per day to maintain quality and avoid overwhelming potential employers.
              </p>
            </div>

            {/* Match Requirements */}
            <div className="flex items-start space-x-3">
              <input
                id="autoApplyRequireMatch"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                {...register('autoApplyRequireMatch')}
              />
              <div>
                <label htmlFor="autoApplyRequireMatch" className="block text-sm font-medium text-gray-900">
                  Only apply to high-match jobs
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  We'll only auto-apply to jobs with a high compatibility score based on your profile and preferences.
                </p>
              </div>
            </div>

            {/* Job Types for Auto-Apply */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Auto-apply to these job types
                </label>
                <span className="text-sm text-gray-500">
                  {selectedAutoApplyJobTypes.length} selected
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {JOB_TYPES.map(jobType => (
                  <button
                    key={jobType}
                    type="button"
                    onClick={() => toggleJobTypeSelection(jobType)}
                    className={`
                      relative p-3 rounded-lg border text-left transition-all duration-200
                      ${selectedAutoApplyJobTypes.includes(jobType)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {JOB_TYPE_LABELS[jobType]}
                      </span>
                      {selectedAutoApplyJobTypes.includes(jobType) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-600">
                Select which job types you want us to automatically apply to. Leave unselected to apply to all job types.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-900">Work Preference Tips</p>
            <ul className="text-yellow-700 mt-2 space-y-1">
              <li>• Your work preferences help us filter jobs more accurately</li>
              <li>• Auto-apply feature uses your resume and preferences to apply intelligently</li>
              <li>• You can always pause or disable auto-apply at any time</li>
              <li>• All auto-applications are logged and you'll receive notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}