'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Scale,
  Ruler,
  Target,
  Settings,
  ChevronRight,
  Save,
  Dumbbell,
  Utensils,
  Droplets,
  TrendingUp,
  Activity,
  Calculator,
  Pencil,
  Sparkles
} from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';
import { calculateBMRKatch, calculateLeanMass, calculateTDEE as calcTDEE, suggestActivityLevel } from '@/lib/calculations';
import { BodyCompForm } from '@/components/body-comp-form';
import { QuickWeightEntry } from '@/components/quick-weight-entry';
import { WeightHistory } from '@/components/weight-history';
import { GoalSelector } from '@/components/goal-selector';
import { ChangelogDialog, ChangelogBadge } from '@/components/changelog-dialog';
import { calculateGoalTargets } from '@/lib/goal-calculator';
import type { FitnessGoal } from '@/lib/types';
import type { ActivityLevel } from '@/lib/calculations';

interface SmartProfileFormProps {
  latestWeight?: any;
  latestBodyComp?: any;
  currentGoal?: FitnessGoal;
  currentActivityLevel?: ActivityLevel;
  onSaveGoal: (goal: FitnessGoal, activityLevel: ActivityLevel) => void;
  onCancel: () => void;
}

function SmartProfileForm({
  latestWeight,
  latestBodyComp,
  currentGoal = 'athletic',
  currentActivityLevel = 'moderate',
  onSaveGoal,
  onCancel
}: SmartProfileFormProps) {
  // Extract data from latest logs
  const weight = latestWeight?.weight || latestBodyComp?.weight || 79;
  const bodyFat = latestBodyComp?.bodyFat || 14;
  const height = latestBodyComp?.height || 175;
  const age = latestBodyComp?.age || 25;
  const gender = latestBodyComp?.gender || 'male';
  const muscleMass = latestBodyComp?.muscleMass || 60;

  const leanMass = calculateLeanMass(weight, bodyFat);
  const bmrKatch = calculateBMRKatch(leanMass);
  const tdee = calcTDEE(bmrKatch, currentActivityLevel);

  // Calculate goal-based recommendations
  let recommendation = null;
  if (height && age && gender) {
    try {
      recommendation = calculateGoalTargets({
        weight,
        height,
        age,
        gender,
        bodyFat,
        muscleMass,
        fitnessGoal: currentGoal,
        activityLevel: currentActivityLevel,
      });
    } catch (error) {
      console.error('Error calculating goal targets:', error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Read-only Profile Data */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Current Profile</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="text-lg font-bold">{weight} kg</p>
            <p className="text-xs text-muted-foreground">From daily log</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Body Fat</p>
            <p className="text-lg font-bold">{bodyFat}%</p>
            <p className="text-xs text-muted-foreground">From body comp</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="text-lg font-bold">{height} cm</p>
            <p className="text-xs text-muted-foreground">From body comp</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="text-lg font-bold">{age} years</p>
            <p className="text-xs text-muted-foreground">From body comp</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Update weight via Daily Weight log, other metrics via Body Composition scan
        </p>
      </div>

      {/* Calculated Stats */}
      <div className="p-3 rounded-lg bg-muted space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Calculated Stats
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Lean Mass:</span>{' '}
            <span className="font-medium">{leanMass.toFixed(1)} kg</span>
          </div>
          <div>
            <span className="text-muted-foreground">BMR:</span>{' '}
            <span className="font-medium">{recommendation?.bmr || bmrKatch} kcal</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">TDEE:</span>{' '}
            <span className="font-medium">{recommendation?.tdee || tdee} kcal/day</span>
          </div>
        </div>
      </div>

      {/* Goal Selection */}
      {height && age && gender ? (
        <GoalSelector
          currentGoal={currentGoal}
          currentActivityLevel={currentActivityLevel}
          weight={weight}
          height={height}
          age={age}
          gender={gender}
          bodyFat={bodyFat}
          muscleMass={muscleMass}
          onSave={onSaveGoal}
        />
      ) : (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Please log a body composition scan with height, age, and gender to enable smart goal recommendations
          </p>
        </div>
      )}

      <Button type="button" variant="outline" onClick={onCancel} className="w-full">
        Close
      </Button>
    </div>
  );
}

// BodyCompForm is now imported from body-comp-form.tsx

export function ProfileSettings() {
  const {
    data,
    setUser,
    addBodyComp,
    getBodyCompHistory,
    getLatestBodyComp,
    setGoals,
    getTDEE,
    deleteBodyComp,
    updateBodyComp,
    estimateTDEEFromData,
    weeklyAutoRecal,
    addDailyWeight,
    updateDailyWeight,
    deleteDailyWeight,
    getDailyWeights,
    getLatestWeight
  } = useLocalStorage();
  
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showBodyCompDialog, setShowBodyCompDialog] = useState(false);
  const [showBodyCompListDialog, setShowBodyCompListDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const [showWeightHistoryDialog, setShowWeightHistoryDialog] = useState(false);
  const [showChangelogDialog, setShowChangelogDialog] = useState(false);
  const [editingBodyComp, setEditingBodyComp] = useState<any>(null);
  const [goalsTab, setGoalsTab] = useState<'nutrition' | 'workout'>('nutrition');

  const user = data.user;
  const latestBodyComp = getLatestBodyComp();
  const bodyCompHistory = getBodyCompHistory();
  const latestWeight = getLatestWeight();
  const dailyWeights = getDailyWeights(30); // Last 30 entries
  const tdee = getTDEE();
  const tdeeEst = estimateTDEEFromData();
  const weeklyRec = weeklyAutoRecal();
  const { goals } = data;

  const [editCalories, setEditCalories] = useState(goals.dailyCalories);
  const [editProtein, setEditProtein] = useState(goals.dailyProtein);
  const [editFat, setEditFat] = useState(goals.dailyFat);

  const openGoalsDialog = () => {
    setEditCalories(goals.dailyCalories);
    setEditProtein(goals.dailyProtein);
    setEditFat(goals.dailyFat);
    setShowGoalsDialog(true);
  };

  // Auto-calculate goals when goal or activity level changes
  const handleGoalChange = (goal: FitnessGoal, activityLevel: ActivityLevel) => {
    const weight = latestWeight?.weight || latestBodyComp?.weight || 79;
    const bodyFat = latestBodyComp?.bodyFat || 14;
    const height = latestBodyComp?.height || 175;
    const age = latestBodyComp?.age || 25;
    const gender = latestBodyComp?.gender || 'male';
    const muscleMass = latestBodyComp?.muscleMass || 60;

    if (height && age && gender) {
      try {
        const recommendation = calculateGoalTargets({
          weight,
          height,
          age,
          gender,
          bodyFat,
          muscleMass,
          fitnessGoal: goal,
          activityLevel,
        });

        setGoals({
          fitnessGoal: goal,
          activityLevel,
          dailyCalories: recommendation.macros.calories,
          dailyProtein: recommendation.macros.protein,
          dailyCarbs: recommendation.macros.carbs,
          dailyFat: recommendation.macros.fat,
          dailyWater: 3000,
          workoutDaysPerWeek: 4,
          restDayCalorieAdjustment: -200,
        });
      } catch (error) {
        console.error('Error calculating goal targets:', error);
      }
    }
  };

  const handleSaveBodyComp = (bodyComp: any) => {
    const isFirstTime = !latestBodyComp && !editingBodyComp;
    
    if (editingBodyComp) {
      updateBodyComp(bodyComp.id, bodyComp);
      setEditingBodyComp(null);
    } else {
      addBodyComp(bodyComp);
    }
    
    // Close body comp dialog
    setShowBodyCompDialog(false);
    
    // If first-time user, automatically open goal selector after saving
    if (isFirstTime && bodyComp.height && bodyComp.age && bodyComp.gender) {
      setTimeout(() => {
        setShowUserDialog(true);
      }, 300); // Small delay for smooth transition
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {latestBodyComp && latestBodyComp.height && latestBodyComp.age && latestBodyComp.gender ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Profile</p>
                  <p className="text-sm text-muted-foreground">
                    {latestWeight?.weight || latestBodyComp.weight}kg · {latestBodyComp.height}cm · {latestBodyComp.bodyFat}% BF
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowUserDialog(true)}>
                  Edit Goals
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Lean Mass</p>
                  <p className="font-medium">{calculateLeanMass(latestWeight?.weight || latestBodyComp.weight, latestBodyComp.bodyFat).toFixed(1)} kg</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">BMR</p>
                  <p className="font-medium">{calculateBMRKatch(calculateLeanMass(latestWeight?.weight || latestBodyComp.weight, latestBodyComp.bodyFat))} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">TDEE</p>
                  <p className="font-medium">{tdee} kcal</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">Set up your profile for accurate calculations</p>
              <Button onClick={() => {
                // Check if this is truly first-time setup (no body comp data at all)
                const hasBodyCompData = latestBodyComp && latestBodyComp.height && latestBodyComp.age && latestBodyComp.gender;
                
                console.log('Setup Profile clicked:', {
                  hasBodyCompData,
                  latestBodyComp,
                  willShow: hasBodyCompData ? 'Goal Selector' : 'Body Composition Form'
                });
                
                if (!hasBodyCompData) {
                  // First-time user: redirect to body composition form
                  setShowBodyCompDialog(true);
                } else {
                  // Has data: show goal selector
                  setShowUserDialog(true);
                }
              }}>
                <User className="h-4 w-4 mr-1" />
                Set Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Daily Weight
          </CardTitle>
          <Button size="sm" onClick={() => setShowWeightDialog(true)}>
            Log
          </Button>
        </CardHeader>
        <CardContent>
          {latestWeight ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground">{latestWeight.date}</span>
                  <div className="text-2xl font-bold">{latestWeight.weight} kg</div>
                  {latestWeight.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{latestWeight.notes}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowWeightHistoryDialog(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {dailyWeights.length > 1 && (
                <div className="pt-2">
                  <button
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={() => setShowWeightHistoryDialog(true)}
                  >
                    {dailyWeights.length} entries · View history
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Track your daily weight to monitor progress
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Body Composition
          </CardTitle>
          <Button size="sm" onClick={() => setShowBodyCompDialog(true)}>
            Log
          </Button>
        </CardHeader>
        <CardContent>
          {latestBodyComp ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex-1">
                  <span className="text-muted-foreground">{latestBodyComp.date}</span>
                  <div className="font-medium mt-1">{latestBodyComp.weight}kg · {latestBodyComp.bodyFat}% BF</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingBodyComp(latestBodyComp);
                    setShowBodyCompDialog(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {latestBodyComp.waist > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Waist</p>
                    <p className="font-medium">{latestBodyComp.waist}cm</p>
                  </div>
                )}
                {latestBodyComp.chest > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Chest</p>
                    <p className="font-medium">{latestBodyComp.chest}cm</p>
                  </div>
                )}
                {latestBodyComp.arms > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Arms</p>
                    <p className="font-medium">{latestBodyComp.arms}cm</p>
                  </div>
                )}
                {latestBodyComp.thighs > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Thighs</p>
                    <p className="font-medium">{latestBodyComp.thighs}cm</p>
                  </div>
                )}
              </div>
              {bodyCompHistory.length > 1 && (
                <div className="pt-2">
                  <button 
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={() => setShowBodyCompListDialog(true)}
                  >
                    {bodyCompHistory.length} records · Last updated {bodyCompHistory[0]?.date}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Log body composition monthly to track progress
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals
          </CardTitle>
<Button size="sm" variant="outline" onClick={() => setShowGoalsDialog(true)}>
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={goalsTab} onValueChange={(v) => setGoalsTab(v as typeof goalsTab)}>
              <TabsList className="w-full">
                <TabsTrigger value="nutrition" className="flex-1">
                  <Utensils className="h-4 w-4 mr-1" />
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="workout" className="flex-1">
                  <Dumbbell className="h-4 w-4 mr-1" />
                  Workout
                </TabsTrigger>
              </TabsList>
              <TabsContent value="nutrition" className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Calories</span>
                  <span className="font-medium">{goals.dailyCalories}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span className="font-medium">{goals.dailyProtein}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Carbs</span>
                  <span className="font-medium">{goals.dailyCarbs}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fat</span>
                  <span className="font-medium">{goals.dailyFat}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Water</span>
                  <span className="font-medium">{goals.dailyWater}ml</span>
                </div>
                {latestBodyComp?.height && latestBodyComp?.age && latestBodyComp?.gender && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      const currentGoal = goals.fitnessGoal || 'athletic';
                      const currentActivity = goals.activityLevel || 'moderate';
                      handleGoalChange(currentGoal, currentActivity);
                    }}
                  >
                    Recalc from Profile
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="workout" className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Workout Days/Week</span>
                  <span className="font-medium">{goals.workoutDaysPerWeek}</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {tdeeEst && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                TDEE Estimator
              </CardTitle>
              <span className={`text-xs px-2 py-1 rounded ${tdeeEst.confidence === 'high' ? 'bg-green-100 text-green-700' : tdeeEst.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                {tdeeEst.confidence}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Estimated TDEE</p>
                  <p className="font-medium">{tdeeEst.estimatedTDEE} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Formula TDEE</p>
                  <p className="font-medium">{tdee} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Avg Calories In</p>
                  <p className="font-medium">{tdeeEst.avgCaloriesIn} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Weight Change</p>
                  <p className={`font-medium ${tdeeEst.weightChangePerWeek > 0 ? 'text-green-600' : tdeeEst.weightChangePerWeek < 0 ? 'text-red-600' : ''}`}>
                    {tdeeEst.weightChangePerWeek > 0 ? '+' : ''}{tdeeEst.weightChangePerWeek}kg/wk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {weeklyRec && (
          <Card className="border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Weekly Recal
              </CardTitle>
              <Button size="sm" onClick={() => setGoals({
                ...goals,
                dailyCalories: weeklyRec.newCalories,
                dailyProtein: weeklyRec.protein,
                dailyCarbs: weeklyRec.carbs,
                dailyFat: weeklyRec.fat,
              })}>
                Apply
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Old Target</p>
                  <p className="font-medium">{weeklyRec.oldCalories} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">New Target</p>
                  <p className="font-medium text-blue-600">{weeklyRec.newCalories} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Est. TDEE</p>
                  <p className="font-medium">{weeklyRec.estimatedTDEE} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Deficit</p>
                  <p className="font-medium">{weeklyRec.deficit} kcal</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Newtargets:</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">P</p>
                    <p className="font-medium">{weeklyRec.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">C</p>
                    <p className="font-medium">{weeklyRec.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">F</p>
                    <p className="font-medium">{weeklyRec.fat}g</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* What's New Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What's New
          </CardTitle>
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowChangelogDialog(true)}
            >
              View Changelog
            </Button>
            <ChangelogBadge />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check out the latest features and improvements in version 1.1.0
          </p>
        </CardContent>
      </Card>

      {/* Auto-show changelog on first launch after update */}
      <ChangelogDialog />

      {/* Manual changelog dialog */}
      <ChangelogDialog
        open={showChangelogDialog}
        onOpenChange={setShowChangelogDialog}
      />

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <SmartProfileForm
            latestWeight={latestWeight}
            latestBodyComp={latestBodyComp}
            currentGoal={goals.fitnessGoal}
            currentActivityLevel={goals.activityLevel}
            onSaveGoal={(goal, activityLevel) => {
              handleGoalChange(goal, activityLevel);
              setShowUserDialog(false);
            }}
            onCancel={() => setShowUserDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBodyCompDialog} onOpenChange={setShowBodyCompDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBodyComp ? 'Edit' : 'Log'} Body Composition</DialogTitle>
          </DialogHeader>
          {!latestBodyComp && !editingBodyComp && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                👋 Welcome! Let's set up your profile
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Enter your body composition data to enable smart goal recommendations and accurate calorie calculations.
              </p>
            </div>
          )}
          <BodyCompForm
            onSave={handleSaveBodyComp}
            onCancel={() => {
              setShowBodyCompDialog(false);
              setEditingBodyComp(null);
            }}
            initial={editingBodyComp}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBodyCompListDialog} onOpenChange={setShowBodyCompListDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Body Composition History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {getBodyCompHistory().map((bc) => (
              <div key={bc.id} className="flex justify-between items-center p-2 rounded bg-muted">
                <div className="flex-1">
                  <p className="text-sm font-medium">{bc.date} {bc.createdAt ? new Date(bc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                  <p className="text-xs text-muted-foreground">
                    {bc.weight}kg · {bc.bodyFat}% BF
                    {bc.waist > 0 && ` · Waist: ${bc.waist}cm`}
                    {bc.thighs > 0 && ` · Thighs: ${bc.thighs}cm`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setEditingBodyComp(bc);
                      setShowBodyCompDialog(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      deleteBodyComp(bc.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goals</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const water = parseInt((form.elements.namedItem('water') as HTMLInputElement).value);
              const workoutDays = parseInt((form.elements.namedItem('workoutDays') as HTMLInputElement).value);
              const carbs = Math.round((editCalories - (editProtein * 4) - (editFat * 9)) / 4);
              setGoals({
                dailyCalories: editCalories,
                dailyProtein: editProtein,
                dailyCarbs: carbs,
                dailyFat: editFat,
                dailyWater: water,
                workoutDaysPerWeek: workoutDays,
              });
              setShowGoalsDialog(false);
            }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">Carbs = (Calories - Protein×4 - Fat×9) / 4</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Calories</label>
                <Input name="calories" type="number" value={editCalories} onChange={(e) => setEditCalories(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm">Protein (g)</label>
                <Input name="protein" type="number" value={editProtein} onChange={(e) => setEditProtein(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm">Fat (g)</label>
                <Input name="fat" type="number" value={editFat} onChange={(e) => setEditFat(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm">Carbs (g) - Auto</label>
                <Input value={Math.max(0, Math.round((editCalories - (editProtein * 4) - (editFat * 9)) / 4))} disabled className="bg-muted" />
              </div>
            </div>
            <div>
              <label className="text-sm">Water (ml)</label>
              <Input name="water" type="number" defaultValue={goals.dailyWater} />
            </div>
            <div>
              <label className="text-sm">Workout Days/Week</label>
              <Input name="workoutDays" type="number" defaultValue={goals.workoutDaysPerWeek} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowGoalsDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <QuickWeightEntry
        open={showWeightDialog}
        onOpenChange={setShowWeightDialog}
        onSave={addDailyWeight}
        initialWeight={latestWeight?.weight}
      />

      <WeightHistory
        open={showWeightHistoryDialog}
        onOpenChange={setShowWeightHistoryDialog}
        weights={dailyWeights}
        onUpdate={updateDailyWeight}
        onDelete={deleteDailyWeight}
      />
    </div>
  );
}