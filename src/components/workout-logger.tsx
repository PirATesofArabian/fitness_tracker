'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Dumbbell,
  Plus,
  Check,
  Trash2,
  Timer,
  X,
  CheckCircle
} from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks';
import { Workout, WorkoutExercise, ExerciseSet, Exercise, ExerciseCategory } from '@/lib/types';
import { calculateWorkoutCalories } from '@/lib/calculations';

interface WorkoutLoggerProps {
  onComplete?: (workout: Workout) => void;
  onCancel?: () => void;
  existingWorkoutId?: string | null;
}

export function WorkoutLogger({ onComplete, onCancel, existingWorkoutId }: WorkoutLoggerProps) {
  const { data, addWorkout, updateWorkout, getTodayLog, updateTodayLog, saveWorkoutTemplate, deleteWorkoutTemplate } = useLocalStorage();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const workoutExercises = activeWorkout?.exercises || [];
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(90);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bodyweight = data.user?.weight || 79;

  useEffect(() => {
    // Check if we're resuming an existing workout
    if (existingWorkoutId) {
      const existingWorkout = data.workouts.find(w => w.id === existingWorkoutId);
      if (existingWorkout && !existingWorkout.completed) {
        console.log('Resuming workout:', existingWorkout);
        setActiveWorkout(existingWorkout);
        return;
      }
    }
    
    // Create new workout only if we don't have one
    if (!activeWorkout) {
      setActiveWorkout({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        startTime: Date.now(),
        exercises: [],
        duration: 0,
        caloriesBurned: 0,
        notes: '',
        completed: false,
      });
    }
  }, [existingWorkoutId, data.workouts]);

  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      timerRef.current = setTimeout(() => setRestTimer(restTimer - 1), 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [restTimer]);

  const endWorkout = () => {
    if (!activeWorkout) return;
    
    setIsSaving(true);
    
    const duration = Math.round((Date.now() - (activeWorkout.startTime || Date.now())) / 60000);
    
    // Calculate calories based on actual exercises performed
    const caloriesBurned = calculateWorkoutCalories(
      activeWorkout.exercises,
      duration,
      bodyweight
    );
    
    const completedWorkout: Workout = {
      ...activeWorkout,
      duration,
      endTime: Date.now(), // Store completion time
      completed: true,
      caloriesBurned,
    };
    
    console.log('saving workout:', completedWorkout, 'calories:', caloriesBurned);
    
    addWorkout(completedWorkout);
    
    const todayLog = getTodayLog();
    updateTodayLog({
      caloriesOut: todayLog.caloriesOut + completedWorkout.caloriesBurned,
    });
    
    setActiveWorkout(null);
    
    // Call onComplete callback after a short delay to ensure state is saved
    setTimeout(() => {
      if (onComplete) {
        onComplete(completedWorkout);
      }
    }, 100);
  };

  const addExercise = (exercise: Exercise) => {
    if (!activeWorkout) return;
    
    const existingIdx = activeWorkout.exercises.findIndex(e => e.name === exercise.name);
    if (existingIdx >= 0) {
      addSet(existingIdx);
      setShowExercisePicker(false);
      return;
    }
    
    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: [],
    };
    
    const newExercises = [...activeWorkout.exercises, newExercise];
    setActiveWorkout({
      ...activeWorkout,
      exercises: newExercises,
    });
    setShowExercisePicker(false);
    
    setTimeout(() => {
      addSet(newExercises.length - 1);
    }, 100);
  };

  const addSet = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    
    const exercise = activeWorkout.exercises[exerciseIndex];
    if (!exercise) return;
    
    const lastSet = exercise.sets?.[exercise.sets.length - 1];
    const nameLower = exercise.name.toLowerCase();
    const isWeighted = nameLower.includes('weighted') || nameLower.includes('pistol');
    
    const newSet: ExerciseSet = {
      id: crypto.randomUUID(),
      reps: lastSet?.reps || 10,
      weight: 0,
      addedWeight: isWeighted ? (lastSet?.addedWeight || 0) : 0,
      bodyweight: bodyweight,
      totalWeight: isWeighted ? bodyweight + (lastSet?.addedWeight || 0) : bodyweight,
      completed: false,
      notes: '',
    };
    
    const exercises = [...activeWorkout.exercises];
    exercises[exerciseIndex] = {
      ...exercise,
      sets: [...(exercise.sets || []), newSet],
    };
    
    setActiveWorkout({ ...activeWorkout, exercises });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, updates: Partial<ExerciseSet>) => {
    if (!activeWorkout) return;
    
    const exercises = [...activeWorkout.exercises];
    const set = { ...exercises[exerciseIndex].sets[setIndex], ...updates };
    
    if ('addedWeight' in updates) {
      set.totalWeight = set.bodyweight + set.addedWeight;
    }
    exercises[exerciseIndex].sets[setIndex] = set;
    
    setActiveWorkout({ ...activeWorkout, exercises });
  };

  const removeExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    
    const exercises = activeWorkout.exercises.filter((_, i) => i !== exerciseIndex);
    setActiveWorkout({ ...activeWorkout, exercises });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    
    const exercises = [...activeWorkout.exercises];
    exercises[exerciseIndex].sets = exercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setActiveWorkout({ ...activeWorkout, exercises });
  };

  const startRestTimer = (duration: number = 90) => {
    setRestDuration(duration);
    setRestTimer(duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = ['push', 'pull', 'legs', 'core'] as const;

  if (!activeWorkout) {
    return (
      <div className="p-4 space-y-3">
        <Button onClick={() => setActiveWorkout({
          id: crypto.randomUUID(),
          date: new Date().toISOString().split('T')[0],
          exercises: [],
          duration: 0,
          caloriesBurned: 0,
          notes: '',
          completed: false,
        })} className="w-full">
          <Dumbbell className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
        
        {data.workoutTemplates && data.workoutTemplates.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Templates</p>
            <div className="flex flex-col gap-2">
              {data.workoutTemplates.map((template) => (
                <div key={template.id} className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      const templateExercises = template.exercises.map((exName) => {
                        const ex = data.exercises.find(e => e.name === exName);
                        const category: ExerciseCategory = ex?.category || 'other';
                        return {
                          id: crypto.randomUUID(),
                          exerciseId: ex?.id || exName,
                          name: exName,
                          category,
                          sets: [],
                        };
                      });
                      setActiveWorkout({
                        id: crypto.randomUUID(),
                        date: new Date().toISOString().split('T')[0],
                        exercises: templateExercises,
                        duration: 0,
                        caloriesBurned: 0,
                        notes: '',
                        completed: false,
                      });
                    }}
                  >
                    {template.name}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteWorkoutTemplate(template.id)}>
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {workoutExercises.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)} className="w-full">
            Save as Template
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {restTimer !== null && (
        <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Rest Timer</p>
            <p className="text-7xl font-bold font-mono">{formatTime(restTimer)}</p>
            <div className="flex gap-2 justify-center mt-6">
              {[60, 90, 120, 180].map((dur) => (
                <Button
                  key={dur}
                  variant={restDuration === dur ? 'default' : 'outline'}
                  onClick={() => startRestTimer(dur)}
                >
                  {dur / 60}m
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => setRestTimer(null)}>
              Skip
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Save in-progress workout
              if (existingWorkoutId) {
                updateWorkout(existingWorkoutId, activeWorkout);
              } else {
                addWorkout(activeWorkout);
              }
              if (onCancel) onCancel();
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold">Workout</h2>
            <p className="text-sm text-muted-foreground">
              {activeWorkout.exercises.length} exercises
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => startRestTimer()}>
            <Timer className="h-4 w-4 mr-1" />
            Rest
          </Button>
          <Button onClick={endWorkout} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? <CheckCircle className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            {isSaving ? 'Saving...' : 'Finish'}
          </Button>
        </div>
      </div>

      {activeWorkout.exercises.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No exercises yet</p>
            <Button onClick={() => setShowExercisePicker(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>
      )}

      {activeWorkout.exercises.map((exercise, exerciseIndex) => {
        const nameLower = exercise.name.toLowerCase();
        const isWeighted = nameLower.includes('weighted') || nameLower.includes('pistol');
        
        return (
          <Card key={exercise.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{exercise.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => removeExercise(exerciseIndex)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2 text-xs text-muted-foreground mb-1">
                  <span className="w-8">Set</span>
                  {isWeighted && <span className="w-20">+Weight</span>}
                  <span className="flex-1">Reps</span>
                  <span className="w-8"></span>
                </div>
                {exercise.sets.length === 0 && (
                  <div className="text-center py-2">
                    <Button size="sm" variant="outline" onClick={() => addSet(exerciseIndex)}>
                      <Plus className="h-3 w-3 mr-1" /> Add Set
                    </Button>
                  </div>
                )}
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="flex gap-2 items-center">
                    <span className="w-8 text-sm font-medium">{setIndex + 1}</span>
                    {isWeighted && (
                      <input
                        type="number"
                        className="w-20 h-8 text-sm border rounded px-2"
                        value={set.addedWeight || ''}
                        placeholder="+kg"
                        onChange={(e) => updateSet(exerciseIndex, setIndex, { addedWeight: parseInt(e.target.value) || 0 })}
                      />
                    )}
                    <input
                      type="number"
                      className="flex-1 h-8 text-sm border rounded px-2"
                      value={set.reps}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                    />
                    <div className="w-8 flex gap-1">
                      <button
                        onClick={() => updateSet(exerciseIndex, setIndex, { completed: !set.completed })}
                        className={`h-8 w-full rounded flex items-center justify-center ${
                          set.completed ? 'bg-green-500 text-white' : 'bg-muted'
                        }`}
                      >
                        {set.completed ? <Check className="h-4 w-4" /> : '○'}
                      </button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addSet(exerciseIndex)} className="w-full mt-2">
                  <Plus className="h-3 w-3 mr-1" /> Add Set
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button className="w-full" variant="outline" onClick={() => setShowExercisePicker(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Exercise
      </Button>

      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <p className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                  {category}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {data.exercises
                    .filter((e) => e.category === category)
                    .map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => addExercise(exercise)}
                        className="p-2 text-sm border rounded hover:bg-muted transition-colors text-left"
                      >
                        {exercise.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm">Template Name</label>
              <Input 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                placeholder="e.g., Push Day"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Exercises: {workoutExercises.map(e => e.name).join(', ')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (templateName && activeWorkout) {
                    saveWorkoutTemplate(
                      templateName,
                      activeWorkout.exercises.map(e => e.name)
                    );
                    setTemplateName('');
                    setShowTemplateDialog(false);
                  }
                }} 
                className="flex-1"
                disabled={!templateName}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}