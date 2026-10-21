import { router } from 'expo-router';

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingScreen() {
  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  return <OnboardingWizard onComplete={handleComplete} />;
}
