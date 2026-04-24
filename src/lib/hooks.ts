'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppData, DEFAULT_EXERCISES, DEFAULT_GOALS, DailyLog, Workout, Meal, BodyComp, Activity, User, Goals, WorkoutTemplate } from './types';
import { 
  calculateBMRMifflin, 
  calculateBMRKatch, 
  calculateTDEE as calcTDEEFromFormulas, 
  calculateLeanMass,
  calculateCaloriesFromMETS,
  suggestActivityLevel
} from './calculations';

const STORAGE_KEY = 'fitness_tracker_data';

const EMPTY_DATA: AppData = {
  user: null,
  dailyLogs: [],
  workouts: [],
  bodyComps: [],
  meals: [],
  activities: [],
  exercises: DEFAULT_EXERCISES,
  goals: DEFAULT_GOALS,
  workoutTemplates: [],
};

let globalState: AppData = EMPTY_DATA;

function loadFromStorage(): AppData {
  if (typeof window === 'undefined') return EMPTY_DATA;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      globalState = { ...EMPTY_DATA, ...parsed };
      return globalState;
    } catch (e) {
      console.error('Failed to parse stored data', e);
    }
  }
  return EMPTY_DATA;
}

function saveToStorage(data: AppData) {
  if (typeof window === 'undefined') return;
  globalState = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function useLocalStorage() {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({ ...EMPTY_DATA, ...parsed });
      } catch (e) {
        console.error('Failed to parse stored data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(data);
    }
  }, [data, isLoaded]);

  const saveData = useCallback((newData: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

const getTodayLog = useCallback((): DailyLog => {
    const today = getToday();
    const existing = data.dailyLogs.find(log => log.date === today);
    
    const todayMeals = data.meals.filter(m => m.date === today);
    const todayWorkouts = data.workouts.filter(w => w.date === today && w.completed);
    const todayActivities = data.activities.filter(a => a.date === today);
    
    const caloriesFromMeals = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const caloriesBurnedFromWorkouts = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const caloriesBurnedFromActivities = todayActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);
    const caloriesBurned = caloriesBurnedFromWorkouts + caloriesBurnedFromActivities;
    const proteinFromMeals = todayMeals.reduce((sum, m) => sum + m.protein, 0);
    const carbsFromMeals = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
    const fatFromMeals = todayMeals.reduce((sum, m) => sum + m.fat, 0);
    
    // Auto-detect day type based on workouts if not set
    const autoDayType = (todayWorkouts.length > 0 || todayActivities.length > 0) ? 'workout' : 'rest';
    
    if (existing) {
      return {
        ...existing,
        caloriesIn: caloriesFromMeals,
        caloriesOut: caloriesBurned,
        protein: proteinFromMeals,
        carbs: carbsFromMeals,
        fat: fatFromMeals,
        dayType: existing.dayType || autoDayType,
      };
    }
    
    return {
      id: crypto.randomUUID(),
      date: today,
      weight: data.user?.weight || 79,
      water: 0,
      caloriesIn: caloriesFromMeals,
      caloriesOut: caloriesBurned,
      protein: proteinFromMeals,
      carbs: carbsFromMeals,
      fat: fatFromMeals,
      notes: '',
      dayType: autoDayType,
    };
  }, [data]);

  const updateTodayLog = useCallback((updates: Partial<DailyLog>) => {
    setData(prev => {
      const today = getToday();
      const logs = [...prev.dailyLogs];
      const idx = logs.findIndex(l => l.date === today);
      if (idx >= 0) {
        logs[idx] = { ...logs[idx], ...updates };
      } else {
        logs.push({
          id: crypto.randomUUID(),
          date: today,
          weight: prev.user?.weight || 79,
          water: 0,
          caloriesIn: 0,
          caloriesOut: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          notes: '',
          ...updates,
        });
      }
      return { ...prev, dailyLogs: logs };
    });
  }, []);

  const addMeal = useCallback((meal: Meal) => {
    setData(prev => ({
      ...prev,
      meals: [...prev.meals, meal],
    }));
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id),
    }));
  }, []);

  const deleteBodyComp = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      bodyComps: prev.bodyComps.filter(b => b.id !== id),
    }));
  }, []);

  const updateBodyComp = useCallback((id: string, updates: Partial<BodyComp>) => {
    setData(prev => ({
      ...prev,
      bodyComps: prev.bodyComps.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  }, []);

  const addWorkout = useCallback((workout: Workout) => {
    console.log('hooks addWorkout called:', workout);
    setData(prev => {
      const newData = {
        ...prev,
        workouts: [...prev.workouts, workout],
      };
      console.log('hooks new workouts count:', newData.workouts.length);
      return newData;
    });
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.map(w =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id),
    }));
  }, []);

  const addActivity = useCallback((activity: Activity) => {
    setData(prev => ({
      ...prev,
      activities: [...prev.activities, activity],
    }));
  }, []);

  const addBodyComp = useCallback((comp: BodyComp) => {
    setData(prev => ({
      ...prev,
      bodyComps: [...prev.bodyComps, comp],
    }));
  }, []);

  const setUser = useCallback((user: User) => {
    setData(prev => ({ ...prev, user }));
  }, []);

  const setGoals = useCallback((goals: Goals) => {
    setData(prev => ({ ...prev, goals }));
  }, []);

  const getWeeklyLogs = useCallback(() => {
    const now = new Date();
    const logs = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = data.dailyLogs.find(l => l.date === dateStr);
      const meals = data.meals.filter(m => m.date === dateStr);
      
      if (existing) {
        logs.push(existing);
      } else {
        logs.push({
          id: crypto.randomUUID(),
          date: dateStr,
          weight: data.user?.weight || 79,
          water: 0,
          caloriesIn: meals.reduce((s, m) => s + m.calories, 0),
          caloriesOut: 0,
          protein: meals.reduce((s, m) => s + m.protein, 0),
          carbs: meals.reduce((s, m) => s + m.carbs, 0),
          fat: meals.reduce((s, m) => s + m.fat, 0),
          notes: '',
          dayType: 'workout', // Default to workout day for missing logs
        });
      }
    }
    return logs;
  }, [data]);

  const getWorkoutsThisWeek = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekWorkouts = data.workouts.filter(w => 
      new Date(w.date) >= weekAgo && w.completed
    );
    const uniqueDays = new Set(weekWorkouts.map(w => w.date));
    return Array.from(uniqueDays);
  }, [data.workouts]);

  const getWorkoutsByDateRange = useCallback((startDate: string, endDate: string) => {
    return data.workouts.filter(w => 
      w.date >= startDate && w.date <= endDate && w.completed
    ).sort((a, b) => b.date.localeCompare(a.date));
  }, [data.workouts]);

  const getWeeklyStats = useCallback(() => {
    const logs = getWeeklyLogs();
    const workouts = getWorkoutsThisWeek();
    
    const totalCaloriesIn = logs.reduce((sum, log) => sum + log.caloriesIn, 0);
    const totalCaloriesOut = logs.reduce((sum, log) => sum + log.caloriesOut, 0);
    const avgCaloriesIn = totalCaloriesIn / 7;
    const avgCaloriesOut = totalCaloriesOut / 7;
    const totalWater = logs.reduce((sum, log) => sum + log.water, 0);
    const avgWater = totalWater / 7;
    const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);
    const totalFat = logs.reduce((sum, log) => sum + log.fat, 0);
    const avgProtein = totalProtein / 7;
    const avgCarbs = totalCarbs / 7;
    const avgFat = totalFat / 7;
    
    return {
      totalCaloriesIn,
      totalCaloriesOut,
      avgCaloriesIn,
      avgCaloriesOut,
      avgWater,
      totalWater,
      avgProtein,
      avgCarbs,
      avgFat,
      totalProtein,
      totalCarbs,
      totalFat,
      workoutsCount: workouts.length,
      workoutsThisWeek: workouts.length,
    };
  }, [getWeeklyLogs, getWorkoutsThisWeek]);

  const getBodyCompHistory = useCallback(() => {
    return [...data.bodyComps]
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.bodyComps]);

  const getLatestBodyComp = useCallback(() => {
    const sorted = [...data.bodyComps].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] || null;
  }, [data.bodyComps]);

  const calculateTDEE = useCallback(() => {
    if (!data.user) return data.goals.dailyCalories;
    const { weight, bodyFat } = data.user;
    const leanMass = weight * (1 - (bodyFat || 14) / 100);
    const bmrKatch = calculateBMRKatch(leanMass);
    return Math.round(calcTDEEFromFormulas(bmrKatch, 'moderate'));
  }, [data.user, data.goals]);

  const getAdaptiveCalorieTarget = useCallback(() => {
    const tdee = calculateTDEE();
    const weight = data.user?.weight || 79;
    const goal = data.goals;
    const intake = goal.dailyCalories;
    const diff = intake - tdee;
    let status = 'maintain';
    if (diff < -200) status = 'cut';
    if (diff > 200) status = 'bulk';
    return { tdee, diff, status };
  }, [calculateTDEE, data.goals, data.user]);

  const getGoalCalories = useCallback(() => {
    const tdee = calculateTDEE();
    return {
      maintain: tdee,
      cut: tdee - 500,
      bulk: tdee + 500,
    };
  }, [calculateTDEE, data.goals]);

  const estimateTDEEFromData = useCallback(() => {
    const logs = data.dailyLogs;
    if (logs.length < 7) return null;
    
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const recentLogs = sortedLogs.slice(0, 14);
    const daysWithData = recentLogs.filter(l => l.caloriesIn > 500 && l.caloriesOut > 100);
    
    if (daysWithData.length < 5) return null;
    
    const totalCaloriesIn = daysWithData.reduce((sum, l) => sum + l.caloriesIn, 0);
    const totalCaloriesOut = daysWithData.reduce((sum, l) => sum + l.caloriesOut, 0);
    const avgCaloriesIn = totalCaloriesIn / daysWithData.length;
    const avgCaloriesOut = totalCaloriesOut / daysWithData.length;
    
    const sortedBody = [...data.bodyComps].sort((a, b) => b.date.localeCompare(a.date));
    let weightChangePerDay = 0;
    
    if (sortedBody.length >= 2) {
      const first = sortedBody[sortedBody.length - 1];
      const last = sortedBody[0];
      const daysDiff = sortedBody.length;
      weightChangePerDay = (last.weight - first.weight) / daysDiff;
    }
    
    const caloricSurplus = weightChangePerDay * 7700;
    const estimatedTDEE = Math.round(avgCaloriesIn + avgCaloriesOut - caloricSurplus);
    
    return {
      estimatedTDEE,
      avgCaloriesIn: Math.round(avgCaloriesIn),
      avgCaloriesOut: Math.round(avgCaloriesOut),
      weightChangePerWeek: Math.round(weightChangePerDay * 7 * 10) / 10,
      confidence: daysWithData.length >= 10 ? 'high' : daysWithData.length >= 7 ? 'medium' : 'low',
    };
  }, [data.dailyLogs, data.bodyComps]);

  const weeklyAutoRecal = useCallback(() => {
    const tdeeData = estimateTDEEFromData();
    if (!tdeeData || !data.user) return null;
    
    const weight = data.user.weight;
    const currentTarget = data.goals.dailyCalories;
    const deficit = currentTarget - tdeeData.estimatedTDEE;
    const newTarget = tdeeData.estimatedTDEE - 300;
    const protein = Math.round(weight * 2.0);
    const fat = Math.round((newTarget * 0.25) / 9);
    const carbs = Math.round((newTarget - (protein * 4) - (fat * 9)) / 4);
    
    return {
      oldCalories: currentTarget,
      newCalories: newTarget,
      estimatedTDEE: tdeeData.estimatedTDEE,
      deficit,
      protein,
      fat,
      carbs,
      weightTrend: tdeeData.weightChangePerWeek,
    };
  }, [estimateTDEEFromData, data.user, data.goals]);

  const getTodayMeals = useCallback(() => {
    const today = getToday();
    return data.meals.filter(m => m.date === today);
  }, [data.meals]);

  const getMealsByDate = useCallback((date: string) => {
    return data.meals.filter(m => m.date === date);
  }, [data.meals]);

  const copyMealToDate = useCallback((mealId: string, newDate: string, newTime: string) => {
    const meal = data.meals.find(m => m.id === mealId);
    if (meal) {
      addMeal({
        ...meal,
        id: crypto.randomUUID(),
        date: newDate,
        time: newTime,
      });
    }
  }, [data.meals, addMeal]);

  const saveWorkoutTemplate = useCallback((name: string, exercises: string[]) => {
    const template: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name,
      exercises,
      createdAt: new Date().toISOString(),
    };
    saveData({ ...data, workoutTemplates: [...data.workoutTemplates, template] });
  }, [data, saveData]);

  const deleteWorkoutTemplate = useCallback((templateId: string) => {
    saveData({
      ...data,
      workoutTemplates: data.workoutTemplates.filter(t => t.id !== templateId),
    });
  }, [data, saveData]);

  const loadWorkoutTemplate = useCallback((templateId: string) => {
    const template = data.workoutTemplates.find(t => t.id === templateId);
    return template || null;
  }, [data.workoutTemplates]);

  const getAdjustedCalorieTarget = useCallback((dayType: 'workout' | 'rest' = 'workout') => {
    const baseCalories = data.goals.dailyCalories;
    const adjustment = data.goals.restDayCalorieAdjustment || -200;
    
    if (dayType === 'rest') {
      return baseCalories + adjustment;
    }
    return baseCalories;
  }, [data.goals]);

  const getAdjustedMacros = useCallback((dayType: 'workout' | 'rest' = 'workout') => {
    const adjustedCalories = getAdjustedCalorieTarget(dayType);
    const baseCalories = data.goals.dailyCalories;
    const ratio = adjustedCalories / baseCalories;
    
    const result = {
      calories: adjustedCalories,
      protein: Math.round(data.goals.dailyProtein * ratio), // Protein also adjusts with calories
      carbs: Math.round(data.goals.dailyCarbs * ratio), // Carbs adjust with calories
      fat: Math.round(data.goals.dailyFat * ratio), // Fat adjusts with calories
    };
    
    return result;
  }, [data.goals, getAdjustedCalorieTarget]);

  return {
    data,
    saveData,
    getTodayLog,
    updateTodayLog,
    addMeal,
    deleteMeal,
    deleteBodyComp,
    updateBodyComp,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addBodyComp,
    addActivity,
    setUser,
    setGoals,
    getWeeklyLogs,
    getWorkoutsThisWeek,
    getWorkoutsByDateRange,
    getWeeklyStats,
    getBodyCompHistory,
    getLatestBodyComp,
    getTDEE: calculateTDEE,
    getAdaptiveCalorieTarget,
    getGoalCalories,
    getTodayMeals,
    getMealsByDate,
    copyMealToDate,
    estimateTDEEFromData,
    weeklyAutoRecal,
    saveWorkoutTemplate,
    deleteWorkoutTemplate,
    loadWorkoutTemplate,
    getAdjustedCalorieTarget,
    getAdjustedMacros,
  };
}