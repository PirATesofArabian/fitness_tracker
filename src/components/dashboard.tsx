'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProgressRing, ProgressBar, StatCard } from '@/components/progress';
import { WorkoutLogger } from '@/components/workout-logger';
import { NutritionTracker } from '@/components/nutrition';
import { ProfileSettings } from '@/components/profile';
import { WorkoutHistory } from '@/components/workout-history';
import { ProgressCharts } from '@/components/charts';
import { CardioTracker } from '@/components/cardio';
import { DataManager } from '@/components/data-manager';
import { WeeklyRecap } from '@/components/weekly-recap';
import { SmartNotifications } from '@/components/smart-notifications';
import { NotificationCenter } from '@/components/notification-center';
import { MacroPriority } from '@/components/macro-priority';
import { PostWorkoutMealDialog } from '@/components/post-workout-meal-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Dumbbell,
  Utensils,
  Droplets,
  Footprints,
  TrendingUp,
  Plus,
  Zap,
  Calendar,
  Settings
} from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';

function QuickAddCard({
  icon,
  label,
  value,
  suffix = '',
  onAdd,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  onAdd?: (value: number) => void;
  onClick?: () => void;
}) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleQuickAdd = (amount: number) => {
    if (onAdd) {
      onAdd(amount);
    }
  };

  const handleSubmit = () => {
    const num = parseFloat(inputValue);
    if (!onAdd || isNaN(num) || num < 0) return;
    
    // For custom input, set the total (calculate difference from current value)
    const diff = num - value;
    onAdd(diff);
    setInputValue('');
    setShowCustomInput(false);
  };

  // Special layout for Water card with inline buttons
  if (label === 'Water' && onAdd) {
    return (
      <div className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center gap-1 mb-2">
          {icon}
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-bold">
            {Math.round(value)}
            <span className="text-sm font-normal ml-1">{suffix}</span>
          </p>
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-xs text-muted-foreground underline"
          >
            {showCustomInput ? 'cancel' : 'custom'}
          </button>
        </div>

        {showCustomInput ? (
          <div className="space-y-2">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Set total amount"
              className="h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <Button size="sm" onClick={handleSubmit} className="w-full">
              Set
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAdd(100)}
              className="flex-1"
            >
              +100
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickAdd(-100)}
              className="flex-1"
            >
              -100
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default layout for other cards
  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">
            {value}
            {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
          </p>
        </div>
        {onClick && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="text-xs text-muted-foreground underline"
          >
            view
          </button>
        )}
      </div>
    </div>
  );
}

export function DailyDashboard() {
  const { getTodayLog, updateTodayLog, data, getWeeklyLogs, getWorkoutsThisWeek, getTodayMeals, deleteMeal, getAdjustedCalorieTarget, getAdjustedMacros } = useLocalStorage();
  const [activeTab, setActiveTab] = useState<'today' | 'nutrition' | 'workout' | 'body' | 'profile'>('today');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [resumeWorkoutId, setResumeWorkoutId] = useState<string | null>(null);
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<any>(null);

  // Recalculate todayLog whenever meals or workouts change
  const todayLog = getTodayLog();
  const todayMeals = getTodayMeals();
  const weeklyLogs = getWeeklyLogs();
  const workoutsThisWeek = getWorkoutsThisWeek();
  const { goals } = data;

  // Get adjusted targets based on day type
  const dayType = todayLog.dayType || 'workout';
  const adjustedMacros = getAdjustedMacros(dayType);
  const adjustedCalories = adjustedMacros.calories;

  const caloriesRemaining = adjustedCalories - todayLog.caloriesIn + todayLog.caloriesOut;
  const waterProgress = todayLog.water / goals.dailyWater;
  const proteinProgress = todayLog.protein / adjustedMacros.protein;
  const calorieProgress = todayLog.caloriesIn / adjustedCalories;

  const toggleDayType = () => {
    const newDayType = dayType === 'workout' ? 'rest' : 'workout';
    updateTodayLog({ dayType: newDayType });
  };

  if (activeWorkout || resumeWorkoutId) {
    return (
      <WorkoutLogger
        existingWorkoutId={resumeWorkoutId}
        onComplete={(workout) => {
          setLastCompletedWorkout(workout);
          setActiveWorkout(false);
          setResumeWorkoutId(null);
        }}
        onCancel={() => {
          setActiveWorkout(false);
          setResumeWorkoutId(null);
        }}
      />
    );
  }

  const tabs = [
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'nutrition', label: 'Food', icon: Utensils },
    { id: 'workout', label: 'Gym', icon: Dumbbell },
    { id: 'body', label: 'Trends', icon: TrendingUp },
    { id: 'profile', label: 'More', icon: Settings },
  ] as const;

  type TabId = 'today' | 'nutrition' | 'workout' | 'body' | 'profile';

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{activeTab === 'today' ? 'Today' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="text-muted-foreground text-sm" suppressHydrationWarning>
              {activeTab === 'today' ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="outline" size="icon" onClick={() => setQuickActionsOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Actions Menu Dialog */}
        <Dialog open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Quick Actions</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setQuickActionsOpen(false);
                  setShowMealDetail(true);
                }}
              >
                <Utensils className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Log Meal</div>
                  <div className="text-xs text-muted-foreground">Add food to your nutrition log</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setQuickActionsOpen(false);
                  updateTodayLog({ water: todayLog.water + 250 });
                }}
              >
                <Droplets className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Add Water</div>
                  <div className="text-xs text-muted-foreground">Quick add 250ml of water</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setQuickActionsOpen(false);
                  setActiveWorkout(true);
                }}
              >
                <Dumbbell className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Start Workout</div>
                  <div className="text-xs text-muted-foreground">Begin a new strength training session</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={() => {
                  setQuickActionsOpen(false);
                  setShowCardio(true);
                }}
              >
                <Footprints className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Log Cardio</div>
                  <div className="text-xs text-muted-foreground">Record a cardio activity</div>
                </div>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center pb-2">
              Note: This feature needs improvement
            </div>
          </DialogContent>
        </Dialog>

        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      Daily Overview
                    </CardTitle>
                    <button
                      onClick={toggleDayType}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        dayType === 'workout'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {dayType === 'workout' ? '💪 Workout Day' : '😴 Rest Day'}
                    </button>
                  </div>
                  {dayType === 'rest' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {adjustedCalories} cal ({goals.restDayCalorieAdjustment || -200} cal adjustment)
                    </p>
                  )}
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-8 py-8 pb-12">
                  <div className="flex justify-center items-center">
                    <ProgressRing
                      value={calorieProgress}
                      max={1}
                      label="Calories"
                      sublabel={`${caloriesRemaining > 0 ? caloriesRemaining : 0} left`}
                      size={100}
                      strokeWidth={8}
                    />
                  </div>
                  <div className="flex justify-center items-center">
                    <ProgressRing
                      value={waterProgress}
                      max={1}
                      label="Water"
                      sublabel={`${todayLog.water}/${goals.dailyWater}ml`}
                      size={100}
                      strokeWidth={8}
                      color="hsl(210 100% 50%)"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <QuickAddCard
                  icon={<Utensils className="h-5 w-5" />}
                  label="Calories In"
                  value={todayLog.caloriesIn}
                  onClick={() => setShowMealDetail(true)}
                />
                <QuickAddCard
                  icon={<Droplets className="h-5 w-5" />}
                  label="Water"
                  value={todayLog.water}
                  suffix="ml"
                  onAdd={(v) => updateTodayLog({ water: todayLog.water + v })}
                />
                <QuickAddCard
                  icon={<Zap className="h-5 w-5" />}
                  label="Burned"
                  value={todayLog.caloriesOut}
                />
              </div>

              <SmartNotifications
                todayLog={todayLog}
                goals={goals}
                adjustedCalories={adjustedCalories}
                dayType={dayType}
                hasWorkoutToday={workoutsThisWeek.some(d => d === todayLog.date)}
              />

              <MacroPriority
                todayLog={todayLog}
                goals={goals}
                adjustedProtein={adjustedMacros.protein}
                adjustedCarbs={adjustedMacros.carbs}
                adjustedFat={adjustedMacros.fat}
                adjustedCalories={adjustedCalories}
              />

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end gap-1">
                    {weeklyLogs.slice().reverse().map((log, i) => {
                      const day = new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' });
                      const hasCalories = log.caloriesIn > 0;
                      return (
                        <div key={log.id} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-8 rounded-t ${hasCalories ? 'bg-primary' : 'bg-muted'}`}
                            style={{ height: `${Math.min((log.caloriesIn / goals.dailyCalories) * 60, 60)}px` }}
                          />
                          <span className="text-xs text-muted-foreground">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    Workouts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{workoutsThisWeek.length}</p>
                      <p className="text-sm text-muted-foreground">days this week</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{goals.workoutDaysPerWeek}</p>
                      <p className="text-sm text-muted-foreground">goal</p>
                    </div>
                  </div>
                  <ProgressBar
                    value={workoutsThisWeek.length}
                    max={goals.workoutDaysPerWeek}
                    className="mt-3"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'nutrition' && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <NutritionTracker />
            </motion.div>
          )}

          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Workout
                  </CardTitle>
                  <Button onClick={() => setActiveWorkout(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveWorkout(true)}
                    >
                      <Dumbbell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium">Strength</p>
                      <p className="text-xs text-muted-foreground">Gym / Calisthenics</p>
                    </button>
                    <button 
                      className="p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors"
                      onClick={() => setShowCardio(true)}
                    >
                      <Footprints className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium">Cardio</p>
                      <p className="text-xs text-muted-foreground">Run / Walk / Cycle</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <WorkoutHistory
                onResumeWorkout={(workoutId) => {
                  setResumeWorkoutId(workoutId);
                  setActiveTab('workout');
                }}
              />
              
              <ProgressCharts mode="gym" />
            </motion.div>
          )}

          {activeTab === 'body' && (
            <motion.div
              key="body"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Body Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <StatCard
                    value={`${todayLog.weight}kg`}
                    label="Current Weight"
                    trend="neutral"
                  />
                  <StatCard
                    value={`${data.user?.bodyFat || 14}%`}
                    label="Body Fat"
                    trend="down"
                    trendValue="-1%"
                  />
                </CardContent>
              </Card>

<WeeklyRecap />
              
              <ProgressCharts mode="body" />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <ProfileSettings />
              
              <DataManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showMealDetail} onOpenChange={setShowMealDetail}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Today's Meals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium border-b pb-2">
              <span>Meal</span>
              <span className="text-right">Cal</span>
              <span className="text-right">P</span>
              <span className="text-right">C</span>
              <span className="text-right">F</span>
            </div>
            {todayMeals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No meals logged today</p>
            ) : (
              todayMeals.map((meal, idx) => (
                <div key={meal.id} className="grid grid-cols-4 gap-2 text-sm items-center border-b py-2">
                  <span className="truncate">{meal.name}</span>
                  <span className="text-right font-medium">{meal.calories}</span>
                  <span className="text-right">{meal.protein}g</span>
                  <span className="text-right">{meal.carbs}g</span>
                  <span className="text-right">{meal.fat}g</span>
                </div>
              ))
            )}
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>{todayLog.caloriesIn} cal</span>
              <span>{todayLog.protein}g</span>
              <span>{todayLog.carbs}g</span>
              <span>{todayLog.fat}g</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCardio} onOpenChange={setShowCardio}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cardio</DialogTitle>
          </DialogHeader>
          <CardioTracker onComplete={() => setShowCardio(false)} />
        </DialogContent>
      </Dialog>

      <PostWorkoutMealDialog
        workout={lastCompletedWorkout}
        onClose={() => setLastCompletedWorkout(null)}
        onAddMeal={() => {
          setLastCompletedWorkout(null);
          setActiveTab('nutrition');
        }}
      />
    </div>
  );
}