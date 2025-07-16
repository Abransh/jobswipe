'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, Shield, Bell, Globe, Trash2 } from 'lucide-react';

import { FormInput } from '@/components/auth/FormInput';
import { Button } from '@/components/ui/button';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  jobMatches: z.boolean(),
  applicationUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  promotionalEmails: z.boolean(),
});

const preferenceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  currency: z.string(),
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;
type PreferenceFormData = z.infer<typeof preferenceSchema>;

export function SettingsForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [preferenceSuccess, setPreferenceSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      jobMatches: true,
      applicationUpdates: true,
      weeklyDigest: true,
      promotionalEmails: false,
    },
  });

  const preferenceForm = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      theme: 'system',
      language: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
    },
  });

  const onPasswordSubmit = async (data: PasswordChangeFormData) => {
    setIsPasswordLoading(true);
    setError(null);
    setPasswordSuccess(false);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordSuccess(true);
        passwordForm.reset();
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    setIsNotificationLoading(true);
    setError(null);
    setNotificationSuccess(false);

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setNotificationSuccess(true);
        setTimeout(() => setNotificationSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update notifications');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const onPreferenceSubmit = async (data: PreferenceFormData) => {
    setIsPreferenceLoading(true);
    setError(null);
    setPreferenceSuccess(false);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setPreferenceSuccess(true);
        setTimeout(() => setPreferenceSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update preferences');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsPreferenceLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete account');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
        </div>

        {passwordSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Password changed successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
          <div className="relative">
            <FormInput
              id="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              required
              {...passwordForm.register('currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="relative">
            <FormInput
              id="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              required
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="relative">
            <FormInput
              id="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              {...passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isPasswordLoading}
            className="w-full sm:w-auto"
          >
            {isPasswordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>

        {notificationSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Notification preferences updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <input
                id="emailNotifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...notificationForm.register('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-900">
                  Push Notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive push notifications in your browser
                </p>
              </div>
              <input
                id="pushNotifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...notificationForm.register('pushNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="jobMatches" className="text-sm font-medium text-gray-900">
                  Job Matches
                </label>
                <p className="text-sm text-gray-500">
                  Get notified when new jobs match your preferences
                </p>
              </div>
              <input
                id="jobMatches"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...notificationForm.register('jobMatches')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="applicationUpdates" className="text-sm font-medium text-gray-900">
                  Application Updates
                </label>
                <p className="text-sm text-gray-500">
                  Get notified about status changes in your applications
                </p>
              </div>
              <input
                id="applicationUpdates"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...notificationForm.register('applicationUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="weeklyDigest" className="text-sm font-medium text-gray-900">
                  Weekly Digest
                </label>
                <p className="text-sm text-gray-500">
                  Receive a weekly summary of your job search activity
                </p>
              </div>
              <input
                id="weeklyDigest"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...notificationForm.register('weeklyDigest')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="promotionalEmails" className="text-sm font-medium text-gray-900">
                  Promotional Emails
                </label>
                <p className="text-sm text-gray-500">
                  Receive promotional emails and product updates
                </p>
              </div>
              <input
                id="promotionalEmails"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                {...notificationForm.register('promotionalEmails')}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isNotificationLoading}
            className="w-full sm:w-auto"
          >
            {isNotificationLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Notifications'
            )}
          </Button>
        </form>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Globe className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
        </div>

        {preferenceSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Preferences updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={preferenceForm.handleSubmit(onPreferenceSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                id="theme"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...preferenceForm.register('theme')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...preferenceForm.register('language')}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                id="timezone"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...preferenceForm.register('timezone')}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                {...preferenceForm.register('currency')}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPreferenceLoading}
            className="w-full sm:w-auto"
          >
            {isPreferenceLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Preferences'
            )}
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-400">
        <div className="flex items-center mb-4">
          <Trash2 className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteAccount}
          className="w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}