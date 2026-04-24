'use client';

import { Meal } from './types';

const FOOD_HISTORY_KEY = 'fitness_tracker_food_history';

export interface FoodHistoryItem {
  name: string;
  count: number;
  lastEaten: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
}

export function getFoodHistory(): FoodHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(FOOD_HISTORY_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse food history', e);
    return [];
  }
}

export function updateFoodHistory(meal: Meal): void {
  if (typeof window === 'undefined') return;
  
  const history = getFoodHistory();
  
  // Extract base food name (remove emoji and serving size info)
  const baseName = meal.name
    .replace(/[🌅☀️🌙🍎]/g, '') // Remove meal type emojis
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .trim();
  
  const existing = history.find(item => item.name === baseName);
  
  if (existing) {
    // Update existing item with running average
    const totalCount = existing.count + 1;
    existing.avgCalories = Math.round((existing.avgCalories * existing.count + meal.calories) / totalCount);
    existing.avgProtein = Math.round((existing.avgProtein * existing.count + meal.protein) / totalCount);
    existing.avgCarbs = Math.round((existing.avgCarbs * existing.count + meal.carbs) / totalCount);
    existing.avgFat = Math.round((existing.avgFat * existing.count + meal.fat) / totalCount);
    existing.count = totalCount;
    existing.lastEaten = meal.date;
  } else {
    // Add new item
    history.push({
      name: baseName,
      count: 1,
      lastEaten: meal.date,
      avgCalories: meal.calories,
      avgProtein: meal.protein,
      avgCarbs: meal.carbs,
      avgFat: meal.fat,
    });
  }
  
  // Sort by count (most frequent first)
  history.sort((a, b) => b.count - a.count);
  
  // Keep only top 50 items
  const trimmed = history.slice(0, 50);
  
  localStorage.setItem(FOOD_HISTORY_KEY, JSON.stringify(trimmed));
}

export function getPersonalizedSuggestions(
  proteinNeeded: number,
  carbsNeeded: number,
  fatNeeded: number,
  caloriesNeeded: number
): FoodHistoryItem[] {
  const history = getFoodHistory();
  
  if (history.length === 0) return [];
  
  // Score each food based on how well it matches needs
  const scored = history.map(food => {
    let score = 0;
    
    // Prioritize protein if needed
    if (proteinNeeded > 20 && food.avgProtein > 15) {
      score += food.avgProtein * 2;
    }
    
    // Prioritize carbs if needed
    if (carbsNeeded > 30 && food.avgCarbs > 20) {
      score += food.avgCarbs * 1.5;
    }
    
    // Prioritize fats if needed
    if (fatNeeded > 10 && food.avgFat > 8) {
      score += food.avgFat * 1.5;
    }
    
    // Bonus for frequently eaten foods
    score += food.count * 5;
    
    // Bonus for recently eaten foods
    const daysSinceEaten = Math.floor(
      (new Date().getTime() - new Date(food.lastEaten).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceEaten < 7) {
      score += 10;
    }
    
    // Penalty if food doesn't fit calorie budget
    if (food.avgCalories > caloriesNeeded * 1.5) {
      score -= 20;
    }
    
    return { ...food, score };
  });
  
  // Sort by score and return top 5
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

