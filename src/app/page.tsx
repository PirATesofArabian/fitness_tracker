'use client';

import { DailyDashboard } from '@/components/dashboard';
import { OnboardingGate } from '@/components/onboarding-gate';

export default function Home() {
  return (
    <OnboardingGate>
      <DailyDashboard />
    </OnboardingGate>
  );
}