import { Metadata } from 'next';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export const metadata: Metadata = {
  title: 'Welcome to JobSwipe - Complete Your Profile',
  description: 'Complete your JobSwipe profile to get personalized job recommendations and improve your application success rate.',
};

export default function OnboardingPage() {
  return (
    <div>
      <OnboardingWizard />
    </div>
  );
}