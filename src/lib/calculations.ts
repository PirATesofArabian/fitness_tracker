export type ActivityLevel = 
  | 'sedentary'      // 1.2 - Desk job, little exercise
  | 'light'        // 1.375 - Light exercise 1-3 days/week
  | 'moderate'     // 1.55 - Moderate exercise 3-5 days/week
  | 'active'       // 1.725 - Hard exercise 6-7 days/week
  | 'veryactive';  // 1.9 - Athlete 2x/day training

export interface TDEEResult {
  bmr: number;
  tdee: number;
  leanMass: number;
  fatMass: number;
  formula: 'mifflin' | 'katch' | 'cunningham' | 'average';
}

export interface CaloriesBurnedResult {
  calories: number;
  mets: number;
  formula: string;
  duration: number;
  weight: number;
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryactive: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (no exercise)',
  light: 'Light (1-3 days/week)',
  moderate: 'Moderate (3-5 days/week)',
  active: 'Active (6-7 days/week)',
  veryactive: 'Very Active (athlete)',
};

export interface METActivity {
  name: string;
  met: number;
  category: string;
}

export const EXERCISE_METS: METActivity[] = [
  { name: 'Walking, 2 mph', met: 2.8, category: 'walking' },
  { name: 'Walking, 3 mph', met: 3.5, category: 'walking' },
  { name: 'Walking, 4 mph', met: 5.0, category: 'walking' },
  { name: 'Walking, briskly', met: 4.3, category: 'walking' },
  { name: 'Running, 5 mph', met: 8.3, category: 'running' },
  { name: 'Running, 6 mph', met: 9.8, category: 'running' },
  { name: 'Running, 7 mph', met: 11.0, category: 'running' },
  { name: 'Running, 8 mph', met: 11.8, category: 'running' },
  { name: 'Running, 10 mph', met: 14.5, category: 'running' },
  { name: 'Weight training, general', met: 3.5, category: 'strength' },
  { name: 'Weight training, vigorous', met: 6.0, category: 'strength' },
  { name: 'Circuit training', met: 8.0, category: 'strength' },
  { name: 'Calisthenics, moderate', met: 4.5, category: 'strength' },
  { name: 'Calisthenics, vigorous', met: 8.0, category: 'strength' },
  { name: 'Pull-ups', met: 5.0, category: 'strength' },
  { name: 'Dips', met: 5.0, category: 'strength' },
  { name: 'Pistol squats', met: 5.5, category: 'strength' },
  { name: 'Cycling, leisure', met: 4.0, category: 'cycling' },
  { name: 'Cycling, moderate', met: 8.0, category: 'cycling' },
  { name: 'Cycling, vigorous', met: 10.0, category: 'cycling' },
  { name: 'Swimming, moderate', met: 8.3, category: 'swimming' },
  { name: 'Swimming, vigorous', met: 9.8, category: 'swimming' },
  { name: 'Yoga', met: 2.5, category: 'flexibility' },
  { name: 'Stretching', met: 2.0, category: 'flexibility' },
];

export function calculateLeanMass(weight: number, bodyFatPercent: number): number {
  return weight * (1 - bodyFatPercent / 100);
}

export function calculateFatMass(weight: number, bodyFatPercent: number): number {
  return weight * (bodyFatPercent / 100);
}

export function calculateBMRMifflin(
  weight: number,
  height: number,
  age: number,
  isMale: boolean
): number {
  const s = isMale ? 5 : -161;
  return Math.round((10 * weight) + (6.25 * height) - (5 * age) + s);
}

export function calculateBMRKatch(leanMass: number): number {
  return Math.round(370 + (21.6 * leanMass));
}

export function calculateBMRCunningham(leanMass: number): number {
  return Math.round(500 + (22 * leanMass));
}

export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateAllTDEE(
  weight: number,
  height: number,
  age: number,
  isMale: boolean,
  bodyFatPercent: number
): TDEEResult {
  const leanMass = calculateLeanMass(weight, bodyFatPercent);
  const fatMass = calculateFatMass(weight, bodyFatPercent);
  
  const mifflinBMR = calculateBMRMifflin(weight, height, age, isMale);
  const katchBMR = calculateBMRKatch(leanMass);
  const cunninghamBMR = calculateBMRCunningham(leanMass);
  
  const averageBMR = Math.round((mifflinBMR + katchBMR + cunninghamBMR) / 3);
  
  return {
    bmr: averageBMR,
    tdee: averageBMR,
    leanMass,
    fatMass,
    formula: 'average',
  };
}

export function calculateCaloriesBurned(
  met: number,
  durationMinutes: number,
  weight: number
): number {
  return Math.round(met * weight * (durationMinutes / 60) * 1);
}

export function calculateCaloriesFromMETS(
  met: number,
  durationMinutes: number,
  weight: number
): number {
  return Math.round(met * weight * (durationMinutes / 60) * 0.95);
}

export function getMETForActivity(
  activityName: string
): number | null {
  const activity = EXERCISE_METS.find(
    a => a.name.toLowerCase() === activityName.toLowerCase()
  );
  return activity?.met ?? null;
}

export function suggestActivityLevel(workoutsPerWeek: number): ActivityLevel {
  if (workoutsPerWeek <= 1) return 'sedentary';
  if (workoutsPerWeek <= 3) return 'light';
  if (workoutsPerWeek <= 5) return 'moderate';
  if (workoutsPerWeek <= 7) return 'active';
  return 'veryactive';
}

export function calculateAdaptiveCalories(
  baseTDEE: number,
  caloriesBurnedToday: number,
  goal: 'maintain' | 'cut' | 'bulk',
  deficitSurplus: number = 250
): { target: number; adjustment: string } {
  const netCalories = baseTDEE + caloriesBurnedToday;
  
  switch (goal) {
    case 'bulk':
      return {
        target: Math.round(netCalories + deficitSurplus),
        adjustment: `+${deficitSurplus} surplus for muscle building`
      };
    case 'cut':
      return {
        target: Math.round(netCalories - deficitSurplus),
        adjustment: `-${deficitSurplus} deficit for fat loss`
      };
    case 'maintain':
    default:
      return {
        target: Math.round(netCalories),
        adjustment: 'Maintain current weight'
      };
  }
}

export const DEFAULT_EXERCISE_METS: Record<string, number> = {
  'pull-ups': 5.0,
  'weighted pull-ups': 6.0,
  'dips': 5.0,
  'weighted dips': 6.0,
  'push-ups': 4.5,
  'pistol squats': 5.5,
  'weighted pistol squats': 6.5,
  'australian pull-ups': 4.5,
  'l-sit hold': 4.0,
  'handstand push-ups': 6.0,
  'bench press': 5.0,
  'deadlift': 6.0,
  'squat': 5.5,
  'barbell row': 5.0,
  'overhead press': 5.0,
};

export function getMETForCalisthenics(exerciseName: string): number {
  return DEFAULT_EXERCISE_METS[exerciseName.toLowerCase()] ?? 4.0;
}

export function calculateExerciseCalories(
  exerciseName: string,
  sets: number,
  reps: number,
  secondsPerRep: number,
  bodyweight: number,
  addedWeight: number = 0
): number {
  const totalReps = sets * reps;
  const durationMinutes = (totalReps * secondsPerRep) / 60;
  const met = getMETForCalisthenics(exerciseName) + (addedWeight / 20);
  
  return calculateCaloriesFromMETS(met, durationMinutes, bodyweight);
}

/**
 * Calculate calories burned during a strength training workout
 * Based on research: Resistance training burns 3-6 METs depending on intensity
 *
 * Research sources:
 * - Ainsworth et al. (2011) Compendium of Physical Activities
 * - Scott et al. (2011) "Energy expenditure during resistance training"
 * - Bloomer (2005) "Energy cost of moderate-duration resistance training"
 *
 * Formula considers:
 * 1. Base MET value for resistance training (3.5-6.0)
 * 2. Intensity factor based on weight lifted vs bodyweight
 * 3. Volume (sets × reps) as a proxy for work done
 * 4. Rest periods (longer workouts = more total energy)
 */
export interface WorkoutExerciseData {
  name: string;
  sets: Array<{
    reps: number;
    weight: number;
    totalWeight: number;
    completed: boolean;
  }>;
}

export function calculateWorkoutCalories(
  exercises: WorkoutExerciseData[],
  durationMinutes: number,
  bodyweight: number
): number {
  if (exercises.length === 0 || durationMinutes === 0) {
    return 0;
  }

  // Calculate total volume and intensity
  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;
  let weightedIntensity = 0;

  exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      if (set.completed) {
        totalSets++;
        totalReps += set.reps;
        totalVolume += set.reps * set.totalWeight;
        
        // Intensity factor: weight lifted relative to bodyweight
        const intensityRatio = set.totalWeight / bodyweight;
        weightedIntensity += intensityRatio * set.reps;
      }
    });
  });

  if (totalSets === 0) {
    return 0;
  }

  // Calculate average intensity per rep
  const avgIntensity = weightedIntensity / totalReps;

  // Determine MET value based on intensity
  // Research shows:
  // - Light resistance (< 0.5x BW): 3.5 METs
  // - Moderate resistance (0.5-1.5x BW): 5.0 METs
  // - Heavy resistance (> 1.5x BW): 6.0 METs
  // - Circuit training (minimal rest): 8.0 METs
  let baseMET = 3.5;
  
  if (avgIntensity < 0.5) {
    baseMET = 3.5; // Light
  } else if (avgIntensity < 1.0) {
    baseMET = 4.5; // Moderate-light
  } else if (avgIntensity < 1.5) {
    baseMET = 5.5; // Moderate-heavy
  } else if (avgIntensity < 2.0) {
    baseMET = 6.0; // Heavy
  } else {
    baseMET = 6.5; // Very heavy
  }

  // Adjust for workout density (sets per minute)
  // Higher density = less rest = higher MET
  const setsPerMinute = totalSets / durationMinutes;
  if (setsPerMinute > 0.5) {
    // Circuit-style training (< 2 min per set)
    baseMET += 1.0;
  } else if (setsPerMinute > 0.33) {
    // Moderate rest (2-3 min per set)
    baseMET += 0.5;
  }
  // Long rest (> 3 min per set) = no adjustment

  // Cap MET at 8.0 (vigorous circuit training)
  const finalMET = Math.min(baseMET, 8.0);

  // Calculate calories: MET × weight(kg) × duration(hours)
  const calories = finalMET * bodyweight * (durationMinutes / 60);

  return Math.round(calories);
}