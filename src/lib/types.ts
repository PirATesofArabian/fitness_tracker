export interface User {
  id: string;
  name: string;
  weight: number;
  height: number;
  bodyFat: number;
  createdAt: string;
  updatedAt: string;
}

export type DayType = 'workout' | 'rest';

export interface DailyLog {
  id: string;
  date: string;
  weight: number;
  water: number;
  caloriesIn: number;
  caloriesOut: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
  dayType?: DayType; // Optional for backward compatibility
}

export interface Workout {
  id: string;
  date: string;
  startTime?: number;
  endTime?: number; // Timestamp when workout was completed
  exercises: WorkoutExercise[];
  duration: number;
  caloriesBurned: number;
  notes: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  sets: ExerciseSet[];
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  addedWeight: number;
  bodyweight: number;
  totalWeight: number;
  completed: boolean;
  notes: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
}

export type ExerciseCategory = 
  | 'push'
  | 'pull'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'other';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full-body';

export interface BodyComp {
  id: string;
  date: string;
  createdAt?: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  waist: number;
  chest: number;
  arms: number;
  thighs: number;
  notes: string;
}

export interface Meal {
  id: string;
  date: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export type ActivityType = 'workout' | 'running' | 'walking' | 'cycling' | 'swimming' | 'other';

export interface Activity {
  id: string;
  date: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  distance?: number;
  notes?: string;
  pace?: string;
  speed?: number;
}

export interface Goals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number;
  workoutDaysPerWeek: number;
  restDayCalorieAdjustment?: number; // Calorie reduction on rest days (default: -200)
}

export interface AppData {
  user: User | null;
  dailyLogs: DailyLog[];
  workouts: Workout[];
  bodyComps: BodyComp[];
  meals: Meal[];
  activities: Activity[];
  exercises: Exercise[];
  goals: Goals;
  workoutTemplates: WorkoutTemplate[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: string[];
  createdAt: string;
}

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: 'Pull-ups', category: 'pull', muscleGroups: ['back', 'biceps'] },
  { id: '2', name: 'Weighted Pull-ups', category: 'pull', muscleGroups: ['back', 'biceps'] },
  { id: '3', name: 'Dips', category: 'push', muscleGroups: ['chest', 'triceps'] },
  { id: '4', name: 'Weighted Dips', category: 'push', muscleGroups: ['chest', 'triceps'] },
  { id: '5', name: 'Push-ups', category: 'push', muscleGroups: ['chest', 'triceps'] },
  { id: '6', name: 'Pistol Squats', category: 'legs', muscleGroups: ['quads', 'glutes'] },
  { id: '7', name: 'Weighted Pistol Squats', category: 'legs', muscleGroups: ['quads', 'glutes'] },
  { id: '8', name: 'Australian Pull-ups', category: 'pull', muscleGroups: ['back', 'biceps'] },
  { id: '9', name: 'L-Sit Hold', category: 'core', muscleGroups: ['core', 'triceps'] },
  { id: '10', name: 'Handstand Push-ups', category: 'push', muscleGroups: ['shoulders', 'triceps'] },
  { id: '11', name: 'Bench Press', category: 'push', muscleGroups: ['chest', 'triceps'] },
  { id: '12', name: 'Deadlift', category: 'pull', muscleGroups: ['back', 'hamstrings'] },
  { id: '13', name: 'Squat', category: 'legs', muscleGroups: ['quads', 'glutes'] },
  { id: '14', name: 'Barbell Row', category: 'pull', muscleGroups: ['back', 'biceps'] },
];

export const DEFAULT_GOALS: Goals = {
  dailyCalories: 2500,
  dailyProtein: 180,
  dailyCarbs: 250,
  dailyFat: 80,
  dailyWater: 3000,
  workoutDaysPerWeek: 4,
  restDayCalorieAdjustment: -200,
};

export function calculateTotalWeight(addedWeight: number, bodyweight: number): number {
  return bodyweight + addedWeight;
}

export function calculateVolume(sets: ExerciseSet[]): number {
  return sets.reduce((total, set) => {
    if (set.completed) {
      return total + (set.reps * set.totalWeight);
    }
    return total;
  }, 0);
}

export function calculateCaloriesBurned(duration: number, met: number = 5): number {
  return Math.round((met * 3.5 * 79) / 200 * duration);
}