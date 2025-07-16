import { Metadata } from 'next';
import { SettingsForm } from '@/components/settings/SettingsForm';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account settings, notification preferences, and security options.
        </p>
      </div>
      
      <SettingsForm />
    </div>
  );
}