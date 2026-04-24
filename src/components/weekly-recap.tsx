'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Flame,
  Droplets,
  Dumbbell,
  Utensils,
  Activity
} from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';

export function WeeklyRecap() {
  const { getWeeklyStats, data, getWorkoutsThisWeek, getLatestBodyComp, getWeeklyLogs, getAdjustedMacros } = useLocalStorage();
  const stats = getWeeklyStats();
  const { goals } = data;
  const latestBodyComp = getLatestBodyComp();
  const weeklyLogs = getWeeklyLogs();

  // Calculate actual weekly goals based on workout/rest days
  const weeklyGoals = weeklyLogs.reduce((acc, log) => {
    const dayType = (log.dayType || 'workout') as 'workout' | 'rest';
    const adjustedMacros = getAdjustedMacros(dayType);
    
    return {
      calories: acc.calories + adjustedMacros.calories,
      protein: acc.protein + adjustedMacros.protein,
      carbs: acc.carbs + adjustedMacros.carbs,
      fat: acc.fat + adjustedMacros.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const calorieGoal = weeklyGoals.calories;
  const proteinGoal = weeklyGoals.protein;
  const carbsGoal = weeklyGoals.carbs;
  const fatGoal = weeklyGoals.fat;
  const waterGoal = goals.dailyWater * 7;
  
  const getTrend = (current: number, previous: number) => {
    if (current > previous * 1.05) return { icon: TrendingUp, color: 'text-green-500' };
    if (current < previous * 0.95) return { icon: TrendingDown, color: 'text-red-500' };
    return { icon: Minus, color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Weekly Recap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Calories In</span>
              </div>
              <p className="text-xl font-bold">{Math.round(stats.totalCaloriesIn).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(calorieGoal).toLocaleString()} goal · {Math.round((stats.totalCaloriesIn / calorieGoal) * 100)}%
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Burned</span>
              </div>
              <p className="text-xl font-bold">{Math.round(stats.totalCaloriesOut).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(stats.avgCaloriesOut)}/day avg
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 mb-1">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Workouts</span>
              </div>
              <p className="text-xl font-bold">{stats.workoutsCount}</p>
              <p className="text-xs text-muted-foreground">
                {goals.workoutDaysPerWeek}/week goal
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-1 mb-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Water</span>
              </div>
              <p className="text-xl font-bold">{(stats.totalWater / 1000).toFixed(1)}L</p>
              <p className="text-xs text-muted-foreground">
                {(stats.totalWater / waterGoal * 100).toFixed(0)}% of goal
              </p>
            </div>
          </div>

          <ProgressBar
            value={stats.workoutsCount}
            max={goals.workoutDaysPerWeek}
            label="Weekly Goal"
            valueLabel={`${stats.workoutsCount}/${goals.workoutDaysPerWeek} workouts`}
            color="hsl(142 71% 45%)"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Macros Summary</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Protein</span>
                <span>{stats.totalProtein.toFixed(1)}g / {proteinGoal.toFixed(0)}g</span>
              </div>
              <ProgressBar
                value={stats.totalProtein}
                max={proteinGoal}
                showLabel={false}
                height={4}
                color="hsl(0 70% 50%)"
              />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Carbs</span>
                <span>{stats.totalCarbs.toFixed(1)}g / {carbsGoal.toFixed(0)}g</span>
              </div>
              <ProgressBar
                value={stats.totalCarbs}
                max={carbsGoal}
                showLabel={false}
                height={4}
                color="hsl(45 70% 50%)"
              />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Fat</span>
                <span>{stats.totalFat.toFixed(1)}g / {fatGoal.toFixed(0)}g</span>
              </div>
              <ProgressBar
                value={stats.totalFat}
                max={fatGoal}
                showLabel={false}
                height={4}
                color="hsl(35 70% 50%)"
              />
            </div>
          </div>

          {latestBodyComp && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Body Stats
              </p>
              <p className="text-sm text-muted-foreground">
                Last logged: {latestBodyComp.date} · {latestBodyComp.weight}kg · {latestBodyComp.bodyFat}% BF
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}