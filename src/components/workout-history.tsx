'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/lib/hooks';
import { Calendar, Footprints, Dumbbell, Trash2, AlertCircle } from 'lucide-react';
import { calculateWorkoutCalories } from '@/lib/calculations';

interface CombinedActivity {
  id: string;
  date: string;
  type: 'strength' | 'cardio';
  name: string;
  duration: number;
  caloriesBurned: number;
  exercises?: { name: string; sets: { completed: boolean }[] }[];
  distance?: number;
  pace?: string;
  completed?: boolean;
}

const ACTIVITY_ICONS: Record<string, string> = {
  running: '🏃',
  walking: '🚶',
  cycling: '🚴',
  swimming: '🏊',
  other: '❤️',
  strength: '💪',
};

export function WorkoutHistory({ onResumeWorkout }: { onResumeWorkout?: (workoutId: string) => void }) {
  const { data, deleteWorkout } = useLocalStorage();
  const bodyweight = data.user?.weight || 79;

  const getCombinedActivities = (): CombinedActivity[] => {
    // Include both completed AND in-progress workouts
    const strength = data.workouts
      .filter(w => w && w.exercises.length > 0)
      .map(w => {
        // Calculate estimated calories for in-progress workouts
        let calories = w.caloriesBurned;
        if (!w.completed && w.exercises.length > 0) {
          const currentDuration = w.startTime
            ? Math.round((Date.now() - w.startTime) / 60000)
            : 0;
          calories = calculateWorkoutCalories(w.exercises, currentDuration, bodyweight);
        }
        
        return {
          id: w.id,
          date: w.date,
          type: 'strength' as const,
          name: w.exercises.map(e => e.name).join(', '),
          duration: w.duration,
          caloriesBurned: calories,
          exercises: w.exercises,
          completed: w.completed,
        };
      });

    const cardio = data.activities
      .filter(a => a && a.duration > 0)
      .map(a => ({
        id: a.id,
        date: a.date,
        type: 'cardio' as const,
        name: (ACTIVITY_ICONS[a.type] || '❤️') + ' ' + a.type,
        duration: a.duration,
        caloriesBurned: a.caloriesBurned,
        distance: a.distance,
        pace: a.pace,
        completed: true, // Cardio activities are always completed
      }));

    return [...strength, ...cardio]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15);
  };

  const activities = getCombinedActivities();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  const activitiesByDate = useMemo(() => {
    const grouped: Record<string, CombinedActivity[]> = {};
    activities.forEach(a => {
      if (!grouped[a.date]) grouped[a.date] = [];
      grouped[a.date].push(a);
    });
    return grouped;
  }, [activities]);

  const dates = Object.keys(activitiesByDate).sort((a, b) => b.localeCompare(a));

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No workouts yet. Start one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dates.slice(0, 5).map(date => (
            <div key={date}>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {formatDate(date)}
              </div>
              {activitiesByDate[date].map((a, i) => (
                <div key={a.id} className="p-3 rounded-lg bg-muted mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {a.type === 'strength' ? <Dumbbell className="h-3 w-3" /> : <Footprints className="h-3 w-3" />}
                      {a.duration > 0 ? `${a.duration} min` : 'in progress'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {a.caloriesBurned > 0 ? `${a.caloriesBurned} cal` : '~0 cal'}
                      </span>
                      {!a.completed && onResumeWorkout && a.type === 'strength' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => onResumeWorkout(a.id)}
                        >
                          Resume
                        </Button>
                      )}
                      {a.completed && a.type === 'strength' && a.duration === 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                          onClick={() => deleteWorkout(a.id)}
                          title="Delete incomplete workout"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    {a.name}
                    {a.distance && ` • ${a.distance}km`}
                    {a.pace && ` • ${a.pace}`}
                  </div>
                  {a.completed && a.type === 'strength' && a.duration === 0 && (
                    <div className="flex items-start gap-1 mt-2 text-xs text-amber-600 dark:text-amber-500">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>This workout was marked complete but has no duration. Click trash to remove it.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}