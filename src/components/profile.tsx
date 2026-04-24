'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Scale, 
  Ruler, 
  Target, 
  Settings,
  ChevronRight,
  Save,
  Dumbbell,
  Utensils,
  Droplets,
  TrendingUp,
  Activity,
  Calculator,
  Pencil
} from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';
import { calculateBMRKatch, calculateLeanMass, calculateTDEE as calcTDEE, suggestActivityLevel } from '@/lib/calculations';

interface UserProfileFormProps {
  onSave: (user: any) => void;
  onCancel: () => void;
  initialUser?: any;
}

function UserProfileForm({ onSave, onCancel, initialUser }: UserProfileFormProps) {
  const [name, setName] = useState(initialUser?.name || '');
  const [weight, setWeight] = useState(initialUser?.weight?.toString() || '79');
  const [height, setHeight] = useState(initialUser?.height?.toString() || '175');
  const [bodyFat, setBodyFat] = useState(initialUser?.bodyFat?.toString() || '14');
  const [age, setAge] = useState('25');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialUser?.id || crypto.randomUUID(),
      name: name || 'Athlete',
      weight: parseFloat(weight) || 79,
      height: parseFloat(height) || 175,
      bodyFat: parseFloat(bodyFat) || 14,
      createdAt: initialUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onCancel();
  };

  const leanMass = calculateLeanMass(parseFloat(weight) || 79, parseFloat(bodyFat) || 14);
  const bmrKatch = calculateBMRKatch(leanMass);
  const tdee = calcTDEE(bmrKatch, 'moderate');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight (kg)</label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="79"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Height (cm)</label>
          <Input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="175"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Body Fat %</label>
          <Input
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="14"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Age</label>
          <Input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Calculated Stats
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Lean Mass:</span>{' '}
            <span className="font-medium">{leanMass.toFixed(1)} kg</span>
          </div>
          <div>
            <span className="text-muted-foreground">BMR (Katch):</span>{' '}
            <span className="font-medium">{bmrKatch} kcal</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">TDEE (moderate):</span>{' '}
            <span className="font-medium">{tdee} kcal/day</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </form>
  );
}

interface BodyCompFormProps {
  onSave: (bodyComp: any) => void;
  onCancel: () => void;
  initial?: any;
}

function BodyCompForm({ onSave, onCancel, initial }: BodyCompFormProps) {
  const [weight, setWeight] = useState(initial?.weight?.toString() || '79');
  const [bodyFat, setBodyFat] = useState(initial?.bodyFat?.toString() || '14');
  const [waist, setWaist] = useState(initial?.waist?.toString() || '');
  const [chest, setChest] = useState(initial?.chest?.toString() || '');
  const [arms, setArms] = useState(initial?.arms?.toString() || '');
  const [thighs, setThighs] = useState(initial?.thighs?.toString() || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initial?.id || crypto.randomUUID(),
      date: initial?.date || new Date().toISOString().split('T')[0],
      createdAt: initial?.createdAt || new Date().toISOString(),
      weight: parseFloat(weight) || 79,
      bodyFat: parseFloat(bodyFat) || 14,
      muscleMass: parseFloat(weight) * (1 - parseFloat(bodyFat) / 100),
      waist: parseFloat(waist) || 0,
      chest: parseFloat(chest) || 0,
      arms: parseFloat(arms) || 0,
      thighs: parseFloat(thighs) || 0,
      notes,
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight (kg)</label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="79"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Body Fat %</label>
          <Input
            type="number"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="14"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Waist (cm)</label>
          <Input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="80"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Chest (cm)</label>
          <Input
            type="number"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Arms (cm)</label>
          <Input
            type="number"
            value={arms}
            onChange={(e) => setArms(e.target.value)}
            placeholder="35"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Thighs (cm)</label>
          <Input
            type="number"
            value={thighs}
            onChange={(e) => setThighs(e.target.value)}
            placeholder="55"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How do you look/feel?"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </form>
  );
}

export function ProfileSettings() {
  const { data, setUser, addBodyComp, getBodyCompHistory, getLatestBodyComp, setGoals, getTDEE, deleteBodyComp, updateBodyComp, estimateTDEEFromData, weeklyAutoRecal } = useLocalStorage();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showBodyCompDialog, setShowBodyCompDialog] = useState(false);
  const [showBodyCompListDialog, setShowBodyCompListDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [editingBodyComp, setEditingBodyComp] = useState<any>(null);
  const [goalsTab, setGoalsTab] = useState<'nutrition' | 'workout'>('nutrition');

  const user = data.user;
  const latestBodyComp = getLatestBodyComp();
  const bodyCompHistory = getBodyCompHistory();
  const tdee = getTDEE();
  const tdeeEst = estimateTDEEFromData();
  const weeklyRec = weeklyAutoRecal();
  const { goals } = data;

  const [editCalories, setEditCalories] = useState(goals.dailyCalories);
  const [editProtein, setEditProtein] = useState(goals.dailyProtein);
  const [editFat, setEditFat] = useState(goals.dailyFat);

  const openGoalsDialog = () => {
    setEditCalories(goals.dailyCalories);
    setEditProtein(goals.dailyProtein);
    setEditFat(goals.dailyFat);
    setShowGoalsDialog(true);
  };

  const handleSaveUser = (userData: any) => {
    setUser(userData);
    
    if (userData.weight && userData.bodyFat) {
      const weight = parseFloat(userData.weight);
      const bodyFat = parseFloat(userData.bodyFat);
      const leanMass = weight * (1 - bodyFat / 100);
      
      const bmrKatch = 370 + (21.6 * leanMass);
      const tdee = Math.round(bmrKatch * 1.55);
      const targetCalories = tdee - 200;
      
      const protein = Math.round(weight * 2.0);
      const fat = Math.round((targetCalories * 0.25) / 9);
      const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
      
      setGoals({
        dailyCalories: targetCalories,
        dailyProtein: protein,
        dailyCarbs: carbs,
        dailyFat: fat,
        dailyWater: 3000,
        workoutDaysPerWeek: 4,
      });
    }
  };

  const handleSaveBodyComp = (bodyComp: any) => {
    if (editingBodyComp) {
      updateBodyComp(bodyComp.id, bodyComp);
      setEditingBodyComp(null);
    } else {
      addBodyComp(bodyComp);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.weight}kg · {user.height}cm · {user.bodyFat}% BF
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowUserDialog(true)}>
                  Edit
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Lean Mass</p>
                  <p className="font-medium">{calculateLeanMass(user.weight, user.bodyFat).toFixed(1)} kg</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">BMR</p>
                  <p className="font-medium">{calculateBMRKatch(calculateLeanMass(user.weight, user.bodyFat))} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">TDEE</p>
                  <p className="font-medium">{tdee} kcal</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">Set up your profile for accurate calculations</p>
              <Button onClick={() => setShowUserDialog(true)}>
                <User className="h-4 w-4 mr-1" />
                Set Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Body Composition
          </CardTitle>
          <Button size="sm" onClick={() => setShowBodyCompDialog(true)}>
            Log
          </Button>
        </CardHeader>
        <CardContent>
          {latestBodyComp ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{latestBodyComp.date}</span>
                <span className="font-medium">{latestBodyComp.weight}kg · {latestBodyComp.bodyFat}% BF</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {latestBodyComp.waist > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Waist</p>
                    <p className="font-medium">{latestBodyComp.waist}cm</p>
                  </div>
                )}
                {latestBodyComp.chest > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Chest</p>
                    <p className="font-medium">{latestBodyComp.chest}cm</p>
                  </div>
                )}
                {latestBodyComp.arms > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Arms</p>
                    <p className="font-medium">{latestBodyComp.arms}cm</p>
                  </div>
                )}
                {latestBodyComp.thighs > 0 && (
                  <div className="p-2 rounded bg-muted">
                    <p className="text-muted-foreground">Thighs</p>
                    <p className="font-medium">{latestBodyComp.thighs}cm</p>
                  </div>
                )}
              </div>
              {bodyCompHistory.length > 1 && (
                <div className="pt-2">
                  <button 
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={() => setShowBodyCompListDialog(true)}
                  >
                    {bodyCompHistory.length} records · Last updated {bodyCompHistory[0]?.date}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Log body composition monthly to track progress
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals
          </CardTitle>
<Button size="sm" variant="outline" onClick={() => setShowGoalsDialog(true)}>
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={goalsTab} onValueChange={(v) => setGoalsTab(v as typeof goalsTab)}>
              <TabsList className="w-full">
                <TabsTrigger value="nutrition" className="flex-1">
                  <Utensils className="h-4 w-4 mr-1" />
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="workout" className="flex-1">
                  <Dumbbell className="h-4 w-4 mr-1" />
                  Workout
                </TabsTrigger>
              </TabsList>
              <TabsContent value="nutrition" className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Calories</span>
                  <span className="font-medium">{goals.dailyCalories}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span className="font-medium">{goals.dailyProtein}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Carbs</span>
                  <span className="font-medium">{goals.dailyCarbs}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fat</span>
                  <span className="font-medium">{goals.dailyFat}g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Water</span>
                  <span className="font-medium">{goals.dailyWater}ml</span>
                </div>
                {user && (
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => {
                    if (user) {
                      const weight = user.weight;
                      const bodyFat = user.bodyFat;
                      const leanMass = weight * (1 - bodyFat / 100);
                      const bmrKatch = 370 + (21.6 * leanMass);
                      const tdee = Math.round(bmrKatch * 1.55);
                      const targetCalories = tdee - 200;
                      const protein = Math.round(weight * 2.0);
                      const fat = Math.round((targetCalories * 0.25) / 9);
                      const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
                      setGoals({
                        dailyCalories: targetCalories,
                        dailyProtein: protein,
                        dailyCarbs: carbs,
                        dailyFat: fat,
                        dailyWater: goals.dailyWater,
                        workoutDaysPerWeek: goals.workoutDaysPerWeek,
                      });
                    }
                  }}>
                    Recalc from Profile
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="workout" className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Workout Days/Week</span>
                  <span className="font-medium">{goals.workoutDaysPerWeek}</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {tdeeEst && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                TDEE Estimator
              </CardTitle>
              <span className={`text-xs px-2 py-1 rounded ${tdeeEst.confidence === 'high' ? 'bg-green-100 text-green-700' : tdeeEst.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                {tdeeEst.confidence}
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Estimated TDEE</p>
                  <p className="font-medium">{tdeeEst.estimatedTDEE} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Formula TDEE</p>
                  <p className="font-medium">{tdee} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Avg Calories In</p>
                  <p className="font-medium">{tdeeEst.avgCaloriesIn} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground text-xs">Weight Change</p>
                  <p className={`font-medium ${tdeeEst.weightChangePerWeek > 0 ? 'text-green-600' : tdeeEst.weightChangePerWeek < 0 ? 'text-red-600' : ''}`}>
                    {tdeeEst.weightChangePerWeek > 0 ? '+' : ''}{tdeeEst.weightChangePerWeek}kg/wk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {weeklyRec && (
          <Card className="border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Weekly Recal
              </CardTitle>
              <Button size="sm" onClick={() => setGoals({
                ...goals,
                dailyCalories: weeklyRec.newCalories,
                dailyProtein: weeklyRec.protein,
                dailyCarbs: weeklyRec.carbs,
                dailyFat: weeklyRec.fat,
              })}>
                Apply
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Old Target</p>
                  <p className="font-medium">{weeklyRec.oldCalories} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">New Target</p>
                  <p className="font-medium text-blue-600">{weeklyRec.newCalories} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Est. TDEE</p>
                  <p className="font-medium">{weeklyRec.estimatedTDEE} kcal</p>
                </div>
                <div className="p-2 rounded bg-muted">
                  <p className="text-muted-foreground">Deficit</p>
                  <p className="font-medium">{weeklyRec.deficit} kcal</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Newtargets:</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">P</p>
                    <p className="font-medium">{weeklyRec.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">C</p>
                    <p className="font-medium">{weeklyRec.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">F</p>
                    <p className="font-medium">{weeklyRec.fat}g</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <UserProfileForm
            onSave={handleSaveUser}
            onCancel={() => setShowUserDialog(false)}
            initialUser={user}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBodyCompDialog} onOpenChange={setShowBodyCompDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBodyComp ? 'Edit' : 'Log'} Body Composition</DialogTitle>
          </DialogHeader>
          <BodyCompForm
            onSave={handleSaveBodyComp}
            onCancel={() => {
              setShowBodyCompDialog(false);
              setEditingBodyComp(null);
            }}
            initial={editingBodyComp}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBodyCompListDialog} onOpenChange={setShowBodyCompListDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Body Composition History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {getBodyCompHistory().map((bc) => (
              <div key={bc.id} className="flex justify-between items-center p-2 rounded bg-muted">
                <div className="flex-1">
                  <p className="text-sm font-medium">{bc.date} {bc.createdAt ? new Date(bc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                  <p className="text-xs text-muted-foreground">
                    {bc.weight}kg · {bc.bodyFat}% BF
                    {bc.waist > 0 && ` · Waist: ${bc.waist}cm`}
                    {bc.thighs > 0 && ` · Thighs: ${bc.thighs}cm`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setEditingBodyComp(bc);
                      setShowBodyCompDialog(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      deleteBodyComp(bc.id);
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goals</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const water = parseInt((form.elements.namedItem('water') as HTMLInputElement).value);
              const workoutDays = parseInt((form.elements.namedItem('workoutDays') as HTMLInputElement).value);
              const carbs = Math.round((editCalories - (editProtein * 4) - (editFat * 9)) / 4);
              setGoals({
                dailyCalories: editCalories,
                dailyProtein: editProtein,
                dailyCarbs: carbs,
                dailyFat: editFat,
                dailyWater: water,
                workoutDaysPerWeek: workoutDays,
              });
              setShowGoalsDialog(false);
            }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">Carbs = (Calories - Protein×4 - Fat×9) / 4</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Calories</label>
                <Input name="calories" type="number" value={editCalories} onChange={(e) => setEditCalories(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm">Protein (g)</label>
                <Input name="protein" type="number" value={editProtein} onChange={(e) => setEditProtein(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm">Fat (g)</label>
                <Input name="fat" type="number" value={editFat} onChange={(e) => setEditFat(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-sm">Carbs (g) - Auto</label>
                <Input value={Math.max(0, Math.round((editCalories - (editProtein * 4) - (editFat * 9)) / 4))} disabled className="bg-muted" />
              </div>
            </div>
            <div>
              <label className="text-sm">Water (ml)</label>
              <Input name="water" type="number" defaultValue={goals.dailyWater} />
            </div>
            <div>
              <label className="text-sm">Workout Days/Week</label>
              <Input name="workoutDays" type="number" defaultValue={goals.workoutDaysPerWeek} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowGoalsDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}