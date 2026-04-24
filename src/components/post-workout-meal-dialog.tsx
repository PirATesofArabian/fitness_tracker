'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Utensils, X } from 'lucide-react';
import { Workout } from '@/lib/types';

interface PostWorkoutMealDialogProps {
  workout: Workout | null;
  onClose: () => void;
  onAddMeal: () => void;
}

function getMealTimeCategory(timestamp: number): string {
  const hour = new Date(timestamp).getHours();
  
  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 16) return 'Lunch';
  if (hour >= 16 && hour < 21) return 'Dinner';
  return 'Snack';
}

function getPostWorkoutSuggestions(mealTime: string): string[] {
  const suggestions: Record<string, string[]> = {
    'Breakfast': [
      '3 Eggs + 2 Slices Toast + Banana',
      'Oatmeal + Protein Powder + Berries',
      'Greek Yogurt + Granola + Honey',
    ],
    'Lunch': [
      '200g Chicken + 150g Rice + Vegetables',
      '150g Fish + Sweet Potato + Salad',
      'Chicken Wrap + Fruit',
    ],
    'Dinner': [
      '200g Chicken + 150g Rice + Vegetables',
      'Salmon + Quinoa + Broccoli',
      'Lean Beef + Pasta + Salad',
    ],
    'Snack': [
      'Protein Shake + Banana',
      '2 Boiled Eggs + Toast',
      'Greek Yogurt + Nuts',
    ],
  };
  
  return suggestions[mealTime] || suggestions['Snack'];
}

export function PostWorkoutMealDialog({ workout, onClose, onAddMeal }: PostWorkoutMealDialogProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (workout && workout.endTime && !dismissed) {
      // Show dialog immediately after workout completion
      setShow(true);
    }
  }, [workout, dismissed]);

  if (!workout || !workout.endTime || !show) return null;

  const mealTime = getMealTimeCategory(workout.endTime);
  const suggestions = getPostWorkoutSuggestions(mealTime);
  const minutesAgo = Math.floor((Date.now() - workout.endTime) / 60000);

  const handleClose = () => {
    setShow(false);
    setDismissed(true);
    onClose();
  };

  const handleAddMeal = () => {
    setShow(false);
    setDismissed(true);
    onAddMeal();
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Post-Workout Nutrition
            </DialogTitle>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm font-medium">Great workout! 💪</p>
            <p className="text-xs text-muted-foreground mt-1">
              Completed {minutesAgo} {minutesAgo === 1 ? 'minute' : 'minutes'} ago
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Optimal time for {mealTime.toLowerCase()}:</p>
            <p className="text-xs text-muted-foreground mb-3">
              Refuel within 2 hours for best recovery. Focus on protein + carbs.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Suggested meals:</p>
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-muted/50 text-sm">
                • {suggestion}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleAddMeal} className="flex-1">
              <Utensils className="h-4 w-4 mr-2" />
              Log Meal Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


