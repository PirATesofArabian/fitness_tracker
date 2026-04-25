'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, TrendingUp, Target, Sparkles, ArrowRight, Eye, AlertCircle, X } from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';
import { BodyCompForm } from '@/components/body-comp-form';
import { PreviewModeProvider, usePreviewMode } from '@/lib/preview-mode-context';

interface OnboardingGateProps {
  children: React.ReactNode;
}

function OnboardingGateContent({ children }: OnboardingGateProps) {
  const { getLatestBodyComp, addBodyComp } = useLocalStorage();
  const { isPreviewMode, setPreviewMode } = usePreviewMode();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBodyCompDialog, setShowBodyCompDialog] = useState(false);
  const latestBodyComp = getLatestBodyComp();

  // Check if user has required body composition data
  const hasRequiredData = latestBodyComp &&
    latestBodyComp.height &&
    latestBodyComp.age &&
    latestBodyComp.gender;

  useEffect(() => {
    // Show onboarding if no required data and not in preview mode
    if (!hasRequiredData && !isPreviewMode) {
      setShowOnboarding(true);
    }
  }, [hasRequiredData, isPreviewMode]);

  const handleSaveBodyComp = (bodyComp: any) => {
    addBodyComp(bodyComp);
    setShowBodyCompDialog(false);
    setShowOnboarding(false);
    setPreviewMode(false);
  };

  const handleSkip = () => {
    setPreviewMode(true);
    setShowOnboarding(false);
  };

  // If user has data or is in preview mode, show the app
  if (hasRequiredData || isPreviewMode) {
    return (
      <>
        {isPreviewMode && !hasRequiredData && (
          <div className="sticky top-0 z-50 bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-600">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-900" />
                <p className="text-sm font-medium text-yellow-900">
                  Preview Mode: You can explore the app, but cannot save any data until you complete your profile setup.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowBodyCompDialog(true)}
                className="bg-yellow-900 text-yellow-50 hover:bg-yellow-800"
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Show onboarding screen
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to Fitness Tracker!</CardTitle>
          <p className="text-muted-foreground">
            Let's set up your profile to get started with personalized fitness tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Why this data is required */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Why this data is required:</h3>
            <div className="grid gap-3">
              <div className="flex gap-3 p-3 rounded-lg bg-muted">
                <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Accurate Calorie Calculations</p>
                  <p className="text-sm text-muted-foreground">
                    Calculate your BMR and TDEE based on your body composition
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted">
                <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Smart Goal Recommendations</p>
                  <p className="text-sm text-muted-foreground">
                    Get personalized macro targets for fat loss, muscle gain, or maintenance
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-muted">
                <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Track Your Progress</p>
                  <p className="text-sm text-muted-foreground">
                    Monitor changes in body composition over time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={() => setShowBodyCompDialog(true)}
              className="w-full"
              size="lg"
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Skip for now (Preview Mode)
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Takes less than 2 minutes • All data stored locally on your device
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Body Composition Dialog */}
      <Dialog open={showBodyCompDialog} onOpenChange={setShowBodyCompDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Up Your Profile</DialogTitle>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
              👋 Welcome! Let's set up your profile
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Enter your body composition data to enable smart goal recommendations and accurate calorie calculations.
            </p>
          </div>
          <BodyCompForm
            onSave={handleSaveBodyComp}
            onCancel={() => setShowBodyCompDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrapper component with PreviewModeProvider
export function OnboardingGate({ children }: OnboardingGateProps) {
  return (
    <PreviewModeProvider>
      <OnboardingGateContent>{children}</OnboardingGateContent>
    </PreviewModeProvider>
  );
}
