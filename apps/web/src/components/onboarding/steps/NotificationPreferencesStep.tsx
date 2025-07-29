'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Shield, Eye, Mail, MessageSquare, Smartphone, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  notificationPreferencesSchema,
  type NotificationPreferencesData
} from '@jobswipe/shared/schemas';

interface NotificationPreferencesStepProps {
  data?: NotificationPreferencesData;
  onDataChange: (data: NotificationPreferencesData) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const PROFILE_VISIBILITY_OPTIONS = [
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Only you can see your profile information'
  },
  {
    value: 'RECRUITERS_ONLY',
    label: 'Recruiters Only',
    description: 'Only verified recruiters can view your profile'
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    description: 'Anyone can view your basic profile information'
  }
];

export function NotificationPreferencesStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false
}: NotificationPreferencesStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<NotificationPreferencesData>({
    resolver: zodResolver(notificationPreferencesSchema),
    mode: 'onChange',
    defaultValues: {
      // Communication preferences
      emailNotifications: data?.emailNotifications ?? true,
      pushNotifications: data?.pushNotifications ?? true,
      smsNotifications: data?.smsNotifications ?? false,
      
      // Specific notification types
      newJobMatches: data?.newJobMatches ?? true,
      applicationUpdates: data?.applicationUpdates ?? true,
      interviewReminders: data?.interviewReminders ?? true,
      weeklyDigest: data?.weeklyDigest ?? true,
      promotionalEmails: data?.promotionalEmails ?? false,
      
      // Privacy preferences
      dataProcessingConsent: data?.dataProcessingConsent ?? false,
      marketingConsent: data?.marketingConsent ?? false,
      analyticsConsent: data?.analyticsConsent ?? true,
      thirdPartySharing: data?.thirdPartySharing ?? false,
      
      // Profile visibility
      profileVisibility: data?.profileVisibility ?? 'PRIVATE',
      showEmail: data?.showEmail ?? false,
      showPhone: data?.showPhone ?? false
    }
  });

  const watchedData = watch();

  // Update parent component when form data changes
  useEffect(() => {
    onDataChange(watchedData);
  }, [watchedData, onDataChange]);

  const onSubmit = (formData: NotificationPreferencesData) => {
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Communication Preferences */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Communication Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive job matches, application updates, and important account information via email
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Bell className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Get instant alerts about new job matches and application updates
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  SMS Notifications
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive critical updates via text message (interview reminders, urgent updates)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('smsNotifications')}
            />
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                New Job Matches
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Be notified when new jobs match your preferences
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('newJobMatches')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Application Updates
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Get notified about changes in your application status
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('applicationUpdates')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Interview Reminders
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Receive reminders about upcoming interviews and deadlines
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('interviewReminders')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Weekly Digest
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Weekly summary of your job search activity and new opportunities
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('weeklyDigest')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Promotional Emails
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Receive information about new features, tips, and special offers
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('promotionalEmails')}
            />
          </div>
        </div>
      </div>

      {/* Privacy Preferences */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Privacy & Data</h3>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900">Important Privacy Information</p>
              <p className="text-yellow-700 mt-1">
                These settings control how your data is used and shared. You can change these preferences at any time in your account settings.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('dataProcessingConsent')}
            />
            <div>
              <label className="block text-sm font-medium text-red-900">
                Data Processing Consent (Required)
              </label>
              <p className="text-sm text-red-700 mt-1">
                I consent to the processing of my personal data as described in the Privacy Policy. This is required to use JobSwipe services.
              </p>
            </div>
          </div>
          {errors.dataProcessingConsent && (
            <p className="text-sm text-red-600">{errors.dataProcessingConsent.message}</p>
          )}

          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('marketingConsent')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Marketing Communications
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to receiving marketing communications about new features, career tips, and industry insights
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('analyticsConsent')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Analytics & Performance
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Allow us to analyze how you use JobSwipe to improve our services and your experience
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('thirdPartySharing')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Third-Party Data Sharing
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Allow sharing of anonymized data with trusted partners for job matching and market research
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Profile Visibility</h3>
        </div>

        <div className="space-y-4">
          {PROFILE_VISIBILITY_OPTIONS.map(option => (
            <label
              key={option.value}
              className={`
                relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${watchedData.profileVisibility === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="radio"
                value={option.value}
                {...register('profileVisibility')}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-medium text-gray-900">
                    {option.label}
                  </span>
                  {watchedData.profileVisibility === option.value && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('showEmail')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Show email address on profile
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Allow recruiters to see your email address for direct contact
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              {...register('showPhone')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Show phone number on profile
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Allow recruiters to see your phone number for direct contact
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Your Privacy Matters</p>
            <ul className="text-blue-700 mt-2 space-y-1">
              <li>• You can change these settings anytime in your account preferences</li>
              <li>• We never share your personal information without your consent</li>
              <li>• All data is encrypted and stored securely</li>
              <li>• You can request data export or deletion at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}