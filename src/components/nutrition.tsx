'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProgressBar } from '@/components/progress';
import { SmartNotifications } from '@/components/smart-notifications';
import { SmartFoodSuggestions } from '@/components/smart-food-suggestions';
import { Utensils, Plus, Search, Sun, Moon, Sunset, Apple, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalStorage, getToday } from '@/lib/hooks';
import { Meal } from '@/lib/types';
import { FoodItem, searchFoods, calculateFoodMacros, MealType, MEAL_TYPES } from '@/lib/foods';
import { updateFoodHistory } from '@/lib/food-history';

function AddFoodForm({ onAdd, onCancel }: { onAdd: (meal: Meal) => void; onCancel: () => void; }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');

  const searchResults = useMemo(() => searchQuery.length >= 2 ? searchFoods(searchQuery, []) : [], [searchQuery]);
  const calculatedMacros = useMemo(() => {
    if (!selectedFood || !quantity) return null;
    const unit = selectedUnit || selectedFood.servingSizes[0]?.name || 'piece';
    return calculateFoodMacros(selectedFood, parseFloat(quantity) || 1, unit);
  }, [selectedFood, quantity, selectedUnit]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSelectedUnit(food.servingSizes[0]?.name || 'piece');
    setQuantity('1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatedMacros) return;
    
    const icons: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
    const meal: Meal = {
      id: crypto.randomUUID(),
      date: getToday(),
      name: `${icons[mealType]} ${selectedFood?.name || 'Meal'} (${quantity} × ${selectedFood?.servingSizes.find(s => s.name === selectedUnit)?.displayName || selectedUnit})`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      calories: calculatedMacros.calories,
      protein: calculatedMacros.protein,
      carbs: calculatedMacros.carbs,
      fat: calculatedMacros.fat,
      fiber: 0,
    };
    onAdd(meal);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search foods..." className="pr-10" />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {searchResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto border rounded-lg">
          {searchResults.map((food) => (
            <button key={food.id} type="button" onClick={() => handleSelectFood(food)} className="w-full p-2 text-left hover:bg-muted flex justify-between items-center border-b">
              <span className="text-sm font-medium">{food.name}</span>
              <span className="text-xs text-muted-foreground">{food.servingSizes[0]?.displayName} = {food.nutritionPer100g.calories} cal</span>
            </button>
          ))}
        </div>
      )}

      {selectedFood && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((type) => (
                <button key={type.value} type="button" onClick={() => setMealType(type.value)} className={`p-2 rounded-lg text-center text-xs ${mealType === type.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" min="0.1" step="0.1" className="w-full" />
            <div className="flex flex-wrap gap-1">
              {selectedFood.servingSizes.map((serving) => (
                <button key={serving.name} type="button" onClick={() => setSelectedUnit(serving.name)} className={`px-2 py-1 text-xs rounded ${selectedUnit === serving.name ? 'bg-primary' : 'bg-muted'}`}>
                  {serving.displayName}
                </button>
              ))}
            </div>
          </div>

          {calculatedMacros && (
            <div className="p-3 rounded-lg bg-muted grid grid-cols-4 gap-2 text-sm">
              <div><span className="text-muted-foreground">Cal</span><p className="font-medium">{calculatedMacros.calories}</p></div>
              <div><span className="text-muted-foreground">P</span><p className="font-medium">{calculatedMacros.protein}g</p></div>
              <div><span className="text-muted-foreground">C</span><p className="font-medium">{calculatedMacros.carbs}g</p></div>
              <div><span className="text-muted-foreground">F</span><p className="font-medium">{calculatedMacros.fat}g</p></div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1" disabled={!selectedFood || !calculatedMacros}>Add</Button>
      </div>
    </form>
  );
}

export function NutritionTracker() {
  const { data, addMeal, deleteMeal, copyMealToDate, getMealsByDate, updateTodayLog, getTodayLog, getAdjustedMacros, getWorkoutsThisWeek } = useLocalStorage();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyMealSource, setCopyMealSource] = useState<Meal | null>(null);
  const [copyMealType, setCopyMealType] = useState<MealType>('lunch');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const today = getToday();

  const selectedDateMeals = getMealsByDate(selectedDate);
  const todayLog = getTodayLog();
  const workoutsThisWeek = getWorkoutsThisWeek();

  const total = useMemo(() => ({
    cal: selectedDateMeals.reduce((s, m) => s + m.calories, 0),
    p: selectedDateMeals.reduce((s, m) => s + m.protein, 0),
    c: selectedDateMeals.reduce((s, m) => s + m.carbs, 0),
    f: selectedDateMeals.reduce((s, m) => s + m.fat, 0),
  }), [selectedDateMeals]);

  const { goals } = data;
  
  // Use adjusted macros for today's date
  const isToday = selectedDate === today;
  const dayType = isToday ? (todayLog.dayType || 'workout') : 'workout';
  const adjustedMacros = getAdjustedMacros(dayType);
  const targetCalories = isToday ? adjustedMacros.calories : goals.dailyCalories;
  const targetProtein = isToday ? adjustedMacros.protein : goals.dailyProtein;
  const targetCarbs = isToday ? adjustedMacros.carbs : goals.dailyCarbs;
  const targetFat = isToday ? adjustedMacros.fat : goals.dailyFat;

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleAddMeal = (meal: Meal) => {
    addMeal(meal);
    updateFoodHistory(meal); // Track food history for personalized suggestions
    // No need to manually update todayLog - getTodayLog() recalculates from meals automatically
  };

  const handleDeleteMeal = (mealId: string, meal: Meal) => {
    deleteMeal(mealId);
    // No need to manually update todayLog - getTodayLog() recalculates from meals automatically
  };

  const mealsByType = useMemo(() => {
    const g: Record<MealType, Meal[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    selectedDateMeals.forEach(m => { if (m.name.includes('🌅')) g.breakfast.push(m); else if (m.name.includes('☀️')) g.lunch.push(m); else if (m.name.includes('🌙')) g.dinner.push(m); else if (m.name.includes('🍎')) g.snack.push(m); else g.lunch.push(m); });
    return g;
  }, [selectedDateMeals]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => changeDate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-center font-medium bg-transparent" />
              {selectedDate !== today && <p className="text-xs text-muted-foreground">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => changeDate(1)} disabled={selectedDate === today}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isToday && dayType === 'rest' && (
            <p className="text-xs text-muted-foreground mb-2">
              😴 Rest Day - Adjusted targets
            </p>
          )}
          <ProgressBar value={total.cal} max={targetCalories} label="Calories" valueLabel={`${total.cal} / ${targetCalories}`} />
          <ProgressBar value={total.p} max={targetProtein} label="Protein" valueLabel={`${total.p}g / ${targetProtein}g`} color="hsl(0 70% 50%)" />
          <ProgressBar value={total.c} max={targetCarbs} label="Carbs" valueLabel={`${total.c}g / ${targetCarbs}g`} color="hsl(45 70% 50%)" />
          <ProgressBar value={total.f} max={targetFat} label="Fat" valueLabel={`${total.f}g / ${targetFat}g`} color="hsl(35 70% 50%)" />
        </CardContent>
      </Card>

      {isToday && (
        <>
          <SmartNotifications
            todayLog={todayLog}
            goals={goals}
            adjustedCalories={targetCalories}
            dayType={dayType}
            hasWorkoutToday={workoutsThisWeek.some(d => d === todayLog.date)}
          />
          
          <SmartFoodSuggestions
            todayLog={todayLog}
            goals={goals}
            adjustedProtein={targetProtein}
            adjustedCarbs={targetCarbs}
            adjustedFat={targetFat}
            adjustedCalories={targetCalories}
            dayType={dayType}
            hasWorkoutToday={workoutsThisWeek.some(d => d === todayLog.date)}
          />
        </>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Meals</CardTitle>
          <Button size="sm" onClick={() => setShowAddMeal(true)}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </CardHeader>
        <CardContent>
          {selectedDateMeals.length === 0 ? <p className="text-center py-8 text-muted-foreground">No meals logged</p> : (
            <div className="space-y-4">
              {MEAL_TYPES.map(type => {
                const typeMeals = mealsByType[type.value];
                if (!typeMeals.length) return null;
                return (
                  <div key={type.value} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{type.icon} {type.label}</p>
                    {typeMeals.map(meal => (
                      <motion.div key={meal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg border flex justify-between items-center">
                        <div><p className="font-medium text-sm">{meal.name}</p><p className="text-xs text-muted-foreground">{meal.time}</p></div>
                        <div className="flex items-center gap-2">
                          <div className="text-right"><p className="font-medium">{meal.calories} cal</p><p className="text-xs text-muted-foreground">P:{meal.protein} C:{meal.carbs} F:{meal.fat}</p></div>
                          <button onClick={() => { setCopyMealSource(meal); setShowCopyDialog(true); }} className="p-1 text-blue-500"><Copy className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteMeal(meal.id, meal)} className="p-1 text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddMeal} onOpenChange={setShowAddMeal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Food</DialogTitle></DialogHeader>
          <AddFoodForm onAdd={handleAddMeal} onCancel={() => setShowAddMeal(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Copy Meal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">Copy <strong>{copyMealSource?.name}</strong> to:</p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" id="copyDateInput" className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Meal Type</label>
              <div className="grid grid-cols-4 gap-2">
                {MEAL_TYPES.map(type => (
                  <button key={type.value} type="button" onClick={() => setCopyMealType(type.value)} className={`p-2 rounded-lg text-xs ${copyMealType === type.value ? 'bg-primary' : 'bg-muted'}`}>
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCopyDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => { const d = (document.getElementById('copyDateInput') as HTMLInputElement)?.value; if (d && copyMealSource) { copyMealToDate(copyMealSource.id, d, copyMealType); setShowCopyDialog(false); setCopyMealSource(null); }}} className="flex-1">Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}