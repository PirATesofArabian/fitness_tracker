'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Footprints, X, Plus } from 'lucide-react';
import { useLocalStorage, getToday } from '@/lib/hooks';

interface CardioActivity {
  id: string;
  date: string;
  type: string;
  duration: number;
  distance?: number;
  pace?: string;
  caloriesBurned: number;
  speed?: number;
}

interface ActivityType {
  value: string;
  label: string;
  icon: string;
  minSpeed: number;
  maxSpeed: number;
  metAtMin: number;
  metAtMax: number;
}

const ACTIVITY_TYPES: ActivityType[] = [
  { value: 'running', label: 'Running', icon: '🏃', minSpeed: 8, maxSpeed: 16, metAtMin: 9.8, metAtMax: 16 },
  { value: 'walking', label: 'Walking', icon: '🚶', minSpeed: 4, maxSpeed: 6.4, metAtMin: 4.3, metAtMax: 6 },
  { value: 'cycling', label: 'Cycling', icon: '🚴', minSpeed: 16, maxSpeed: 32, metAtMin: 8.0, metAtMax: 12 },
  { value: 'swimming', label: 'Swimming', icon: '🏊', minSpeed: 1, maxSpeed: 4, metAtMin: 6, metAtMax: 12 },
  { value: 'other', label: 'Other', icon: '❤️', minSpeed: 0, maxSpeed: 0, metAtMin: 5, metAtMax: 8 },
];

function calculateMET(activity: ActivityType, speedKmh: number): number {
  if (activity.value === 'other' || speedKmh <= 0) return (activity.metAtMin + activity.metAtMax) / 2;
  
  const ratio = (speedKmh - activity.minSpeed) / (activity.maxSpeed - activity.minSpeed);
  const clamped = Math.max(0, Math.min(1, ratio));
  return activity.metAtMin + clamped * (activity.metAtMax - activity.metAtMin);
}

function calculateCalories(met: number, weight: number, durationMinutes: number): number {
  return Math.round(met * weight * (durationMinutes / 60));
}

function formatPace(secondsPerKm: number): string {
  if (!isFinite(secondsPerKm) || secondsPerKm <= 0) return '--';
  const totalSec = Math.round(secondsPerKm);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}/km`;
}

export function CardioTracker({ onComplete }: { onComplete?: () => void }) {
  const { data, addActivity, getTodayLog, updateTodayLog } = useLocalStorage();
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [timeMin, setTimeMin] = useState<string>('');
  const [timeSec, setTimeSec] = useState<string>('0');
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  const weight = data.user?.weight || 79;

  const getTotalMinutes = () => {
    const min = parseFloat(timeMin) || 0;
    const sec = parseFloat(timeSec) || 0;
    return min + (sec / 60);
  };

  const getCalculations = () => {
    const activityType = ACTIVITY_TYPES.find(a => a.value === selectedActivity);
    const totalMin = getTotalMinutes();
    if (!activityType || totalMin <= 0) return { met: 0, pace: '', calories: 0, speed: 0 };

    const distNum = parseFloat(distanceKm) || 0;
    
    if (distNum > 0 && totalMin > 0) {
      const speed = distNum / (totalMin / 60);
      const met = calculateMET(activityType, speed);
      const pace = formatPace((totalMin * 60) / distNum);
      const calories = calculateCalories(met, weight, totalMin);
      return { met, pace, calories, speed };
    }

    const met = activityType.metAtMin;
    const calories = calculateCalories(met, weight, totalMin);
    return { met, pace: '?', calories, speed: 0 };
  };

  const { met, pace, calories, speed } = getCalculations();

  const saveCardio = () => {
    if (!selectedActivity || getTotalMinutes() <= 0) return;
    
    const totalMin = getTotalMinutes();
    const distNum = parseFloat(distanceKm) || 0;

    const cardio: CardioActivity = {
      id: crypto.randomUUID(),
      date: getToday(),
      type: selectedActivity || 'other',
      duration: Math.round(totalMin),
      distance: distNum > 0 ? distNum : undefined,
      pace: pace !== '?' ? pace : undefined,
      caloriesBurned: calories,
      speed: speed > 0 ? speed : undefined,
    };

    addActivity(cardio);
    updateTodayLog({ caloriesOut: getTodayLog().caloriesOut + calories });
    
    setSelectedActivity('');
    setTimeMin('');
    setDistanceKm('');
    setShowAddForm(false);
    onComplete?.();
  };

  const cancel = () => {
    setSelectedActivity('');
    setTimeMin('');
    setDistanceKm('');
    setShowAddForm(false);
  };

  const today = getToday();
  const todayActivities = data.activities.filter(a => a.date === today);
  const totalCalories = todayActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const totalDuration = todayActivities.reduce((sum, a) => sum + a.duration, 0);

  if (showAddForm) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Add Cardio</CardTitle>
            <button onClick={cancel}><X className="h-4 w-4" /></button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm mb-2 block">Activity</label>
              <div className="grid grid-cols-5 gap-1">
                {ACTIVITY_TYPES.map(act => (
                  <button
                    key={act.value}
                    onClick={() => setSelectedActivity(act.value)}
                    className={`p-2 rounded-lg border text-center ${
                      selectedActivity === act.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="text-lg block">{act.icon}</span>
                    <p className="text-xs mt-1">{act.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-2 block">Time</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="30"
                      value={timeMin}
                      onChange={(e) => setTimeMin(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">min</p>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={timeSec}
                      onChange={(e) => setTimeSec(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">sec</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm mb-2 block">Distance (km) - optional</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                />
              </div>
            </div>

            {timeMin && (
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pace</span>
                  <span className="font-medium">{pace} min/km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MET</span>
                  <span className="font-medium">{met.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories</span>
                  <span className="font-bold text-lg">{calories}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={cancel} className="flex-1">Cancel</Button>
              <Button onClick={saveCardio} disabled={!selectedActivity || getTotalMinutes() <= 0} className="flex-1">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Footprints className="h-5 w-5" />
            Cardio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{totalDuration}</p>
              <p className="text-xs text-muted-foreground">min</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{totalCalories}</p>
              <p className="text-xs text-muted-foreground">cal</p>
            </div>
          </div>

          <Button onClick={() => setShowAddForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> Add Cardio
          </Button>

          {todayActivities.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Today</p>
              {todayActivities.map(activity => (
                <div key={activity.id} className="p-2 rounded-lg border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{ACTIVITY_TYPES.find(a => a.value === activity.type)?.icon}</span>
                    <div>
                      <p className="font-medium text-sm capitalize">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.duration} min
                        {activity.distance && ` • ${activity.distance}km`}
                        {activity.pace && ` • ${activity.pace}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">{activity.caloriesBurned} cal</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}