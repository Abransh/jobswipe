import { Metadata } from 'next';
import { ProfileForm } from '@/components/profile/ProfileForm';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your profile information',
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your profile information and manage your account settings.
        </p>
      </div>
      
      <ProfileForm />
    </div>
  );
}