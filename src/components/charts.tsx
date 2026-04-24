'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/lib/hooks';
import { Dumbbell, Footprints, TrendingUp } from 'lucide-react';

export function TrendChart({ 
  data, 
  label, 
  color = 'hsl(222.2 47.4% 11.2%)',
  unit = ''
}: { 
  data: { date: string; value: number }[]; 
  label: string;
  color?: string;
  unit?: string;
}) {
  if (data.length < 2) {
    return <p className="text-sm text-muted-foreground text-center py-8">Need at least 2 records to show trend</p>;
  }

  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value));
  const range = maxVal - minVal || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const latest = data[data.length - 1]?.value || 0;
  const previous = data[data.length - 2]?.value || 0;
  const change = latest - previous;
  const trend = change > 0 ? '↑' : change < 0 ? '↓' : '→';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{latest}{unit}</span>
          <span className={`text-xs ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {trend} {Math.abs(change).toFixed(1)}{unit}
          </span>
        </div>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-20">
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        <polygon
          fill={`url(#gradient-${label})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function ProgressCharts({ mode = 'gym' }: { mode?: 'gym' | 'body' }) {
  const { data, getBodyCompHistory } = useLocalStorage();
  const [viewType, setViewType] = useState<'strength' | 'cardio'>('strength');
  const [days, setDays] = useState(15);

  const bodyComps = getBodyCompHistory();
  const weightData = bodyComps.slice(0, 30).reverse().map(bc => ({ date: bc.date, value: bc.weight }));
  const bodyFatData = bodyComps.slice(0, 30).reverse().map(bc => ({ date: bc.date, value: bc.bodyFat }));

  const getDateRange = (numDays: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - numDays);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const { start, end } = getDateRange(days);

  const strengthData = useMemo(() => {
    return data.workouts
      .filter(w => w.date >= start && w.date <= end && w.completed)
      .map(w => ({
        date: w.date,
        exercises: w.exercises,
        duration: w.duration,
      }));
  }, [data.workouts, start, end]);

  const cardioData = useMemo(() => {
    return data.activities
      .filter(a => a.date >= start && a.date <= end && a.duration > 0)
      .map(a => ({
        date: a.date,
        type: a.type,
        duration: a.duration,
        distance: a.distance,
        pace: a.pace,
      }));
  }, [data.activities, start, end]);

  const strengthStats = useMemo(() => {
    const map = new Map<string, { date: string; maxWeight: number }>();
    strengthData.forEach(w => {
      w.exercises.forEach(ex => {
        const maxWeight = Math.max(...ex.sets.map(s => s.totalWeight));
        if (maxWeight > 0) {
          if (!map.has(ex.name) || map.get(ex.name)!.maxWeight < maxWeight) {
            map.set(ex.name, { date: w.date, maxWeight });
          }
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, date: stats.date, maxWeight: stats.maxWeight }))
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 10);
  }, [strengthData]);

  const cardioStats = useMemo(() => {
    const runs = cardioData.filter(c => c.type === 'running');
    const walks = cardioData.filter(c => c.type === 'walking');
    return { runs, walks };
  }, [cardioData]);

  const recentStrength = strengthStats.slice(0, 5);
  const totalRuns = cardioStats.runs.length;
  const totalWalks = cardioStats.walks.length;
  
  // Calculate total distance from ALL cardio activities that have distance
  const totalDistance = cardioData.reduce((sum, c) => sum + (c.distance || 0), 0);
  
  // Calculate average pace from all activities that have pace (runs and walks)
  const activitiesWithPace = cardioData.filter(c => c.pace);
  const avgPace = activitiesWithPace.length > 0
    ? activitiesWithPace.reduce((sum, c) => {
        if (!c.pace) return sum;
        const parts = c.pace.split(':');
        if (parts.length !== 2) return sum;
        const [m, s] = parts.map(p => Number(p.replace('/km', '')));
        if (isNaN(m) || isNaN(s)) return sum;
        return sum + (m * 60 + s);
      }, 0) / activitiesWithPace.length
    : 0;

  const formatPace = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (mode === 'body') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Body Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {weightData.length >= 2 && (
            <TrendChart data={weightData} label="Weight" color="hsl(210 100% 50%)" unit="kg" />
          )}
          
          {bodyFatData.length >= 2 && (
            <TrendChart data={bodyFatData} label="Body Fat" color="hsl(0 70% 50%)" unit="%" />
          )}

          {weightData.length < 2 && bodyFatData.length < 2 && (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">No body data logged yet</p>
              <p className="text-sm text-muted-foreground">Go to Profile → Body Composition to add</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          variant={viewType === 'strength' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setViewType('strength')}
        >
          <Dumbbell className="h-4 w-4 mr-1" /> Strength
        </Button>
        <Button 
          variant={viewType === 'cardio' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setViewType('cardio')}
        >
          <Footprints className="h-4 w-4 mr-1" /> Cardio
        </Button>
        <div className="flex-1" />
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-sm border rounded px-2 py-1"
        >
          <option value={7}>7 days</option>
          <option value={15}>15 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {viewType === 'strength' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strength PRs ({days} days)</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStrength.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No strength workouts in this period
              </p>
            ) : (
              <div className="space-y-3">
                {recentStrength.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{s.maxWeight}kg</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cardio ({days} days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(totalRuns === 0 && totalWalks === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No cardio in this period
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold">{totalRuns}</p>
                    <p className="text-xs text-muted-foreground">runs</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold">{totalWalks}</p>
                    <p className="text-xs text-muted-foreground">walks</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold">{totalDistance.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">km total</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-2xl font-bold">{avgPace > 0 ? formatPace(avgPace) : '--'}</p>
                    <p className="text-xs text-muted-foreground">avg pace</p>
                  </div>
                </div>

                {cardioStats.runs.slice(0, 5).map((r, i) => (
                  <div key={i} className="p-2 rounded bg-muted flex justify-between">
                    <div>
                      <span className="font-medium text-sm">{r.date}</span>
                      <span className="text-xs text-muted-foreground ml-2">{r.duration} min</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{r.distance}km</span>
                      {r.pace && <span className="text-xs text-muted-foreground ml-1">{r.pace}</span>}
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}