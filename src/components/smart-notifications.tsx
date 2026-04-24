'use client';

import { useMemo, useEffect } from 'react';
import { AlertCircle, TrendingDown, TrendingUp, Zap, Droplets } from 'lucide-react';
import { DailyLog, Goals, DayType } from '@/lib/types';
import { addNotification } from '@/lib/notification-system';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  icon: React.ReactNode;
  message: string;
  priority: number;
}

interface SmartNotificationsProps {
  todayLog: DailyLog;
  goals: Goals;
  adjustedCalories: number;
  dayType: DayType;
  hasWorkoutToday: boolean;
}

export function SmartNotifications({ 
  todayLog, 
  goals, 
  adjustedCalories, 
  dayType,
  hasWorkoutToday 
}: SmartNotificationsProps) {
  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    
    const calorieDeficit = adjustedCalories - todayLog.caloriesIn;
    const proteinProgress = todayLog.protein / goals.dailyProtein;
    const waterProgress = todayLog.water / goals.dailyWater;
    const carbProgress = todayLog.carbs / (goals.dailyCarbs * (dayType === 'rest' ? 0.8 : 1));
    
    // Large calorie deficit warning (only if eaten something)
    if (calorieDeficit > 500 && todayLog.caloriesIn > 500) {
      notifs.push({
        id: 'large-deficit',
        type: 'warning',
        icon: <TrendingDown className="h-4 w-4" />,
        message: `You're in a ${Math.round(calorieDeficit)} cal deficit. Good for fat loss, but may impact performance if repeated.`,
        priority: 1,
      });
    }
    
    // Large calorie surplus warning (only if significantly over)
    if (calorieDeficit < -300 && todayLog.caloriesIn > adjustedCalories) {
      notifs.push({
        id: 'large-surplus',
        type: 'info',
        icon: <TrendingUp className="h-4 w-4" />,
        message: `You're ${Math.abs(Math.round(calorieDeficit))} cal over target. Great for muscle building!`,
        priority: 2,
      });
    }
    
    // Low protein warning (only if eaten substantial calories)
    if (proteinProgress < 0.5 && todayLog.caloriesIn > adjustedCalories * 0.5) {
      notifs.push({
        id: 'low-protein',
        type: 'warning',
        icon: <AlertCircle className="h-4 w-4" />,
        message: `Protein is low (${Math.round(todayLog.protein)}g / ${goals.dailyProtein}g). Prioritize protein-rich foods.`,
        priority: 1,
      });
    }
    
    // Low carbs after workout (only if eaten substantial calories)
    if (hasWorkoutToday && carbProgress < 0.4 && todayLog.caloriesIn > adjustedCalories * 0.6) {
      notifs.push({
        id: 'low-carbs-post-workout',
        type: 'tip',
        icon: <Zap className="h-4 w-4" />,
        message: `You trained today but carbs are low (${Math.round(todayLog.carbs)}g). Consider adding carbs for recovery.`,
        priority: 2,
      });
    }
    
    // Rest day with high carbs (only if significantly over)
    if (dayType === 'rest' && !hasWorkoutToday && carbProgress > 1.3 && todayLog.carbs > 50) {
      notifs.push({
        id: 'high-carbs-rest-day',
        type: 'info',
        icon: <AlertCircle className="h-4 w-4" />,
        message: `Rest day with high carbs (${Math.round(todayLog.carbs)}g). Consider reducing carbs on non-training days.`,
        priority: 3,
      });
    }
    
    // Low water intake (only after 4 PM and if significantly low)
    // Changed from 2 PM to 4 PM to reduce notification frequency
    const currentHour = new Date().getHours();
    if (waterProgress < 0.3 && currentHour >= 16 && todayLog.water < goals.dailyWater * 0.3) {
      notifs.push({
        id: 'low-water',
        type: 'warning',
        icon: <Droplets className="h-4 w-4" />,
        message: `Water intake is low (${Math.round(todayLog.water)}ml / ${goals.dailyWater}ml). Stay hydrated!`,
        priority: 1,
      });
    }
    
    // Good progress (only if eaten substantial amount)
    if (
      proteinProgress >= 0.8 &&
      proteinProgress <= 1.2 &&
      Math.abs(calorieDeficit) < 200 &&
      todayLog.caloriesIn > adjustedCalories * 0.8
    ) {
      notifs.push({
        id: 'good-progress',
        type: 'success',
        icon: <TrendingUp className="h-4 w-4" />,
        message: `Great job! You're hitting your targets well today. 💪`,
        priority: 4,
      });
    }
    
    // Sort by priority (lower number = higher priority)
    return notifs.sort((a, b) => a.priority - b.priority);
  }, [todayLog, goals, adjustedCalories, dayType, hasWorkoutToday]);
  
  // Save high-priority notifications to notification center
  useEffect(() => {
    notifications.forEach(notif => {
      if (notif.priority <= 2) { // Only save warnings and important tips
        addNotification({
          type: notif.type,
          message: notif.message,
        });
      }
    });
  }, [notifications]);
  
  if (notifications.length === 0) return null;
  
  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400';
      case 'tip':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };
  
  return (
    <div className="space-y-2">
      {notifications.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${getNotificationStyles(notif.type)}`}
        >
          <div className="mt-0.5">{notif.icon}</div>
          <p className="flex-1">{notif.message}</p>
        </div>
      ))}
    </div>
  );
}

