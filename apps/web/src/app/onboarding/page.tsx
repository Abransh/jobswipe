import { Metadata } from 'next';
import { SimplifiedOnboardingWizard } from '@/components/onboarding/SimplifiedOnboardingWizard';

export const metadata: Metadata = {
  title: 'Welcome to JobSwipe - Let\'s Get Started! ✨',
  description: 'Complete your JobSwipe profile in under 2 minutes to get personalized job recommendations and start your job search.',
};

export default function OnboardingPage() {
  return (
    <SimplifiedOnboardingWizard />
  );
}