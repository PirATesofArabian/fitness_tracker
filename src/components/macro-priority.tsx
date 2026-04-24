'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { DailyLog, Goals } from '@/lib/types';

interface MacroPriorityProps {
  todayLog: DailyLog;
  goals: Goals;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  adjustedCalories: number;
}

type MacroStatus = 'complete' | 'in-progress' | 'pending';

interface MacroItem {
  name: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  status: MacroStatus;
  priority: number;
  emoji: string;
}

export function MacroPriority({ 
  todayLog, 
  goals, 
  adjustedProtein, 
  adjustedCarbs, 
  adjustedFat,
  adjustedCalories 
}: MacroPriorityProps) {
  const macros = useMemo(() => {
    const items: MacroItem[] = [
      {
        name: 'Protein',
        current: todayLog.protein,
        target: adjustedProtein,
        unit: 'g',
        progress: todayLog.protein / adjustedProtein,
        status: 'pending',
        priority: 1,
        emoji: '🥩',
      },
      {
        name: 'Carbs',
        current: todayLog.carbs,
        target: adjustedCarbs,
        unit: 'g',
        progress: todayLog.carbs / adjustedCarbs,
        status: 'pending',
        priority: 2,
        emoji: '🍚',
      },
      {
        name: 'Fat',
        current: todayLog.fat,
        target: adjustedFat,
        unit: 'g',
        progress: todayLog.fat / adjustedFat,
        status: 'pending',
        priority: 3,
        emoji: '🥑',
      },
      {
        name: 'Calories',
        current: todayLog.caloriesIn,
        target: adjustedCalories,
        unit: 'cal',
        progress: todayLog.caloriesIn / adjustedCalories,
        status: 'pending',
        priority: 4,
        emoji: '🔥',
      },
    ];

    // Determine status for each macro
    items.forEach(item => {
      if (item.progress >= 0.95) {
        item.status = 'complete';
      } else if (item.progress >= 0.7) {
        item.status = 'in-progress';
      } else {
        item.status = 'pending';
      }
    });

    // Sort by priority (protein first, then incomplete items)
    return items.sort((a, b) => {
      // Incomplete items come first
      if (a.status === 'complete' && b.status !== 'complete') return 1;
      if (a.status !== 'complete' && b.status === 'complete') return -1;
      // Then by priority
      return a.priority - b.priority;
    });
  }, [todayLog, adjustedProtein, adjustedCarbs, adjustedFat, adjustedCalories]);

  const nextMacro = macros.find(m => m.status !== 'complete');
  const remaining = nextMacro ? Math.max(0, Math.round(nextMacro.target - nextMacro.current)) : 0;
  const allComplete = macros.every(m => m.status === 'complete');

  const getStatusIcon = (status: MacroStatus) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Macro Priority
          </CardTitle>
          {allComplete && (
            <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
              Complete ✓
            </span>
          )}
        </div>
        {nextMacro && !allComplete && (
          <p className="text-sm text-muted-foreground">
            Focus: <span className="font-medium text-foreground">{nextMacro.emoji} {nextMacro.name}</span> 
            {' '}({remaining}{nextMacro.unit} remaining)
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {macros.map((macro) => {
            const isNext = macro === nextMacro && !allComplete;
            return (
              <div
                key={macro.name}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isNext 
                    ? 'bg-primary/10 border-2 border-primary/30 shadow-sm' 
                    : 'bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(macro.status)}
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <span>{macro.emoji}</span>
                      <span>{macro.name}</span>
                      {isNext && <span className="text-xs text-primary font-normal">← Next</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(macro.progress * 100)}% complete
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {Math.round(macro.current)} / {macro.target}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {macro.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {allComplete && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              🎉 All macros complete! Great job!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


