'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Target, 
  Flame, 
  Dumbbell, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  Activity,
  ChevronRight,
  Check
} from 'lucide-react';
import { FitnessGoal } from '@/lib/types';
import { 
  calculateGoalTargets, 
  getGoalDescription, 
  getGoalIcon,
  GoalRecommendation,
  GoalCalculationInput 
} from '@/lib/goal-calculator';
import { ActivityLevel, ACTIVITY_LABELS } from '@/lib/calculations';

interface GoalSelectorProps {
  currentGoal?: FitnessGoal;
  currentActivityLevel?: ActivityLevel;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  bodyFat: number;
  muscleMass: number;
  onSave: (goal: FitnessGoal, activityLevel: ActivityLevel) => void;
}

export function GoalSelector({
  currentGoal = 'athletic',
  currentActivityLevel = 'moderate',
  weight,
  height,
  age,
  gender,
  bodyFat,
  muscleMass,
  onSave,
}: GoalSelectorProps) {
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal>(currentGoal);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>(currentActivityLevel);
  const [showDetails, setShowDetails] = useState(false);
  const [recommendation, setRecommendation] = useState<GoalRecommendation | null>(null);

  const goals: Array<{ id: FitnessGoal; name: string; icon: any; color: string }> = [
    { id: 'abs', name: 'Visible Abs', icon: Flame, color: 'text-orange-500' },
    { id: 'muscle', name: 'Muscle Gain', icon: Dumbbell, color: 'text-blue-500' },
    { id: 'athletic', name: 'Athletic', icon: Zap, color: 'text-purple-500' },
  ];

  const activityLevels: Array<{ id: ActivityLevel; label: string; description: string }> = [
    { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { id: 'light', label: 'Light', description: '1-3 days/week' },
    { id: 'moderate', label: 'Moderate', description: '3-5 days/week' },
    { id: 'active', label: 'Active', description: '6-7 days/week' },
    { id: 'veryactive', label: 'Very Active', description: 'Athlete level' },
  ];

  const handleViewDetails = () => {
    const input: GoalCalculationInput = {
      weight,
      height,
      age,
      gender,
      bodyFat,
      muscleMass,
      fitnessGoal: selectedGoal,
      activityLevel: selectedActivity,
    };
    
    const rec = calculateGoalTargets(input);
    setRecommendation(rec);
    setShowDetails(true);
  };

  const handleSave = () => {
    onSave(selectedGoal, selectedActivity);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Goal Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Fitness Goal</h3>
          <div className="grid grid-cols-3 gap-2">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-1 ${goal.color}`} />
                  <p className="text-xs font-medium">{goal.name}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {getGoalDescription(selectedGoal)}
          </p>
        </div>

        {/* Activity Level */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Activity Level</h3>
          <div className="space-y-2">
            {activityLevels.map((level) => {
              const isSelected = selectedActivity === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setSelectedActivity(level.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Save Goal
          </Button>
        </div>
      </div>

      {/* Recommendation Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {recommendation?.title}
            </DialogTitle>
          </DialogHeader>

          {recommendation && (
            <div className="space-y-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {recommendation.description}
              </p>

              {/* Calorie & Macro Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">BMR</p>
                      <p className="text-lg font-bold">{recommendation.bmr} kcal</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">TDEE</p>
                      <p className="text-lg font-bold">{recommendation.tdee} kcal</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border-2 border-primary">
                    <p className="text-xs text-muted-foreground mb-1">Target Calories</p>
                    <p className="text-2xl font-bold">{recommendation.macros.calories} kcal</p>
                    {recommendation.deficit > 0 && (
                      <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                        <TrendingDown className="h-3 w-3" />
                        {recommendation.deficit} deficit
                      </p>
                    )}
                    {recommendation.surplus > 0 && (
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        {recommendation.surplus} surplus
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-muted text-center">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-sm font-bold">{recommendation.macros.protein}g</p>
                      <p className="text-xs text-muted-foreground">{recommendation.macros.proteinPercent}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted text-center">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-sm font-bold">{recommendation.macros.carbs}g</p>
                      <p className="text-xs text-muted-foreground">{recommendation.macros.carbsPercent}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted text-center">
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="text-sm font-bold">{recommendation.macros.fat}g</p>
                      <p className="text-xs text-muted-foreground">{recommendation.macros.fatPercent}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendation.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Training Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Training Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendation.trainingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Dumbbell className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Nutrition Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nutrition Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendation.nutritionTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Flame className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Progress Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Track These Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendation.progressMetrics.map((metric, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Activity className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Expected Results */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary">
                <p className="text-sm font-medium mb-2">Expected Results</p>
                <p className="text-sm text-muted-foreground">{recommendation.expectedResults}</p>
              </div>

              <Button onClick={() => setShowDetails(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

