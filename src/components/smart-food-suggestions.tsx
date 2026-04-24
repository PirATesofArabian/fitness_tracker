'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap, Moon, History } from 'lucide-react';
import { DailyLog, Goals, DayType } from '@/lib/types';
import { getPersonalizedSuggestions } from '@/lib/food-history';

interface SmartFoodSuggestionsProps {
  todayLog: DailyLog;
  goals: Goals;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  adjustedCalories: number;
  dayType: DayType;
  hasWorkoutToday: boolean;
}

interface FoodSuggestion {
  food: string;
  reason: string;
  macros: string;
  priority: 'high' | 'medium' | 'low';
}

export function SmartFoodSuggestions({
  todayLog,
  goals,
  adjustedProtein,
  adjustedCarbs,
  adjustedFat,
  adjustedCalories,
  dayType,
  hasWorkoutToday,
}: SmartFoodSuggestionsProps) {
  const suggestions = useMemo(() => {
    const suggs: FoodSuggestion[] = [];
    
    const proteinNeeded = Math.max(0, adjustedProtein - todayLog.protein);
    const carbsNeeded = Math.max(0, adjustedCarbs - todayLog.carbs);
    const fatNeeded = Math.max(0, adjustedFat - todayLog.fat);
    const caloriesNeeded = Math.max(0, adjustedCalories - todayLog.caloriesIn);
    
    const proteinProgress = todayLog.protein / adjustedProtein;
    const carbProgress = todayLog.carbs / adjustedCarbs;
    const fatProgress = todayLog.fat / adjustedFat;
    
    // High protein needed
    if (proteinProgress < 0.7 && proteinNeeded > 30) {
      if (hasWorkoutToday) {
        suggs.push({
          food: '200g Chicken Breast + 2 Eggs',
          reason: 'Post-workout protein boost',
          macros: '~60g protein, 5g carbs, 10g fat',
          priority: 'high',
        });
      } else {
        suggs.push({
          food: '150g Chicken + Greek Yogurt',
          reason: 'High protein, low carb for rest day',
          macros: '~50g protein, 10g carbs, 8g fat',
          priority: 'high',
        });
      }
    }
    
    // Post-workout carbs needed
    if (hasWorkoutToday && carbProgress < 0.6 && carbsNeeded > 40) {
      suggs.push({
        food: '150g Rice + Banana',
        reason: 'Replenish glycogen after training',
        macros: '~50g carbs, 5g protein, 1g fat',
        priority: 'high',
      });
      suggs.push({
        food: '2 Idlis + Sambar',
        reason: 'Easy to digest post-workout carbs',
        macros: '~40g carbs, 8g protein, 2g fat',
        priority: 'medium',
      });
    }
    
    // Balanced meal needed
    if (proteinProgress < 0.8 && carbProgress < 0.8 && caloriesNeeded > 400) {
      if (hasWorkoutToday) {
        suggs.push({
          food: '150g Rice + 150g Chicken + Curd',
          reason: 'Complete post-workout meal',
          macros: '~55g carbs, 45g protein, 12g fat',
          priority: 'high',
        });
      } else {
        suggs.push({
          food: '100g Rice + 150g Chicken + Vegetables',
          reason: 'Balanced meal for rest day',
          macros: '~35g carbs, 40g protein, 10g fat',
          priority: 'medium',
        });
      }
    }
    
    // Healthy fats needed
    if (fatProgress < 0.6 && fatNeeded > 15) {
      suggs.push({
        food: 'Banana + 2 tbsp Peanut Butter',
        reason: 'Healthy fats and quick energy',
        macros: '~30g carbs, 8g protein, 16g fat',
        priority: 'medium',
      });
    }
    
    // Light protein snack
    if (proteinProgress < 0.9 && proteinNeeded > 15 && proteinNeeded < 30) {
      suggs.push({
        food: '2 Boiled Eggs + Fruit',
        reason: 'Quick protein top-up',
        macros: '~15g carbs, 14g protein, 10g fat',
        priority: 'low',
      });
    }
    
    // Rest day - avoid excess carbs
    if (dayType === 'rest' && !hasWorkoutToday && carbProgress > 0.8) {
      suggs.push({
        food: 'Grilled Chicken + Salad',
        reason: 'High protein, low carb for rest day',
        macros: '~5g carbs, 35g protein, 8g fat',
        priority: 'medium',
      });
    }
    
    // Add personalized suggestions from food history
    const personalizedFoods = getPersonalizedSuggestions(
      proteinNeeded,
      carbsNeeded,
      fatNeeded,
      caloriesNeeded
    );
    
    personalizedFoods.forEach(food => {
      // Determine why this food is being suggested
      let reason = 'You eat this often';
      if (food.avgProtein > 20) reason = 'High protein (your favorite)';
      if (food.avgCarbs > 30 && hasWorkoutToday) reason = 'Good carbs (you eat this often)';
      
      suggs.push({
        food: food.name,
        reason,
        macros: `~${food.avgCarbs}g carbs, ${food.avgProtein}g protein, ${food.avgFat}g fat`,
        priority: 'medium',
      });
    });
    
    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return suggs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [todayLog, adjustedProtein, adjustedCarbs, adjustedFat, adjustedCalories, dayType, hasWorkoutToday]);
  
  const getPriorityColor = (priority: FoodSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-green-500';
      case 'medium':
        return 'border-l-4 border-l-yellow-500';
      case 'low':
        return 'border-l-4 border-l-blue-500';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Smart Food Suggestions
          {hasWorkoutToday && <Zap className="h-3 w-3 text-yellow-500" />}
          {dayType === 'rest' && <Moon className="h-3 w-3 text-blue-500" />}
        </CardTitle>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {hasWorkoutToday
            ? '💪 Post-workout nutrition recommendations'
            : '😴 Rest day meal ideas'}
          <History className="h-3 w-3 ml-1" />
          <span>+ Your favorites</span>
        </p>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground space-y-3">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <div>
              <p className="text-sm font-medium">No suggestions right now</p>
              <p className="text-xs mt-1">
                {todayLog.caloriesIn > adjustedCalories * 0.9
                  ? "You're close to your targets! 🎉"
                  : "Keep logging meals to see personalized suggestions"}
              </p>
            </div>
            
            <div className="text-left bg-muted/50 rounded-lg p-3 text-xs space-y-2">
              <p className="font-medium text-foreground">Suggestions appear when:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Protein needed: <span className="font-mono">{'>'}30g</span></li>
                <li>Carbs needed: <span className="font-mono">{'>'}40g</span> (especially after workouts)</li>
                <li>Fats needed: <span className="font-mono">{'>'}15g</span></li>
                <li>Calories remaining: <span className="font-mono">{'>'}400 cal</span></li>
              </ul>
              <p className="text-muted-foreground mt-2">
                💡 Your frequently eaten foods will show with a 🕐 icon
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, 4).map((sugg, idx) => {
            const isPersonalized = sugg.reason.includes('favorite') || sugg.reason.includes('often');
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg bg-muted/50 ${getPriorityColor(sugg.priority)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-1">
                      {sugg.food}
                      {isPersonalized && <History className="h-3 w-3 text-blue-500" />}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{sugg.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {sugg.macros}
                    </p>
                  </div>
                  {sugg.priority === 'high' && (
                    <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


