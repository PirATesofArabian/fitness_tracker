import { FitnessGoal } from './types';
import { 
  calculateBMRMifflin, 
  calculateBMRKatch, 
  calculateLeanMass,
  ActivityLevel,
  ACTIVITY_MULTIPLIERS 
} from './calculations';

export interface GoalCalculationInput {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  bodyFat: number;
  muscleMass: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPerKg: number;
  carbsPercent: number;
  fatPercent: number;
  proteinPercent: number;
}

export interface GoalRecommendation {
  title: string;
  description: string;
  macros: MacroTargets;
  bmr: number;
  tdee: number;
  deficit: number;
  surplus: number;
  recommendations: string[];
  trainingTips: string[];
  nutritionTips: string[];
  progressMetrics: string[];
  expectedResults: string;
}

/**
 * Calculate BMR using both Mifflin-St Jeor and Katch-McArdle formulas
 * Returns the average for better accuracy
 */
function calculateAccurateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  bodyFat: number
): number {
  const isMale = gender === 'male';
  const leanMass = calculateLeanMass(weight, bodyFat);
  
  // Mifflin-St Jeor (considers gender, age, height)
  const mifflinBMR = calculateBMRMifflin(weight, height, age, isMale);
  
  // Katch-McArdle (considers lean body mass - more accurate when BF% known)
  const katchBMR = calculateBMRKatch(leanMass);
  
  // Average both for best accuracy
  return Math.round((mifflinBMR + katchBMR) / 2);
}

/**
 * Calculate goal-specific calorie and macro targets
 */
export function calculateGoalTargets(input: GoalCalculationInput): GoalRecommendation {
  const { weight, height, age, gender, bodyFat, muscleMass, fitnessGoal, activityLevel } = input;
  
  // Calculate BMR and TDEE
  const bmr = calculateAccurateBMR(weight, height, age, gender, bodyFat);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
  const leanMass = calculateLeanMass(weight, bodyFat);
  
  let recommendation: GoalRecommendation;
  
  switch (fitnessGoal) {
    case 'abs':
      recommendation = calculateAbsGoal(weight, height, age, gender, bodyFat, leanMass, bmr, tdee);
      break;
    case 'muscle':
      recommendation = calculateMuscleGoal(weight, height, age, gender, bodyFat, leanMass, bmr, tdee);
      break;
    case 'athletic':
      recommendation = calculateAthleticGoal(weight, height, age, gender, bodyFat, leanMass, bmr, tdee);
      break;
    default:
      recommendation = calculateAthleticGoal(weight, height, age, gender, bodyFat, leanMass, bmr, tdee);
  }
  
  return recommendation;
}

/**
 * VISIBLE ABS GOAL - Fat Loss Focus
 * Target: 10-12% BF for men, 18-20% for women
 */
function calculateAbsGoal(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  bodyFat: number,
  leanMass: number,
  bmr: number,
  tdee: number
): GoalRecommendation {
  // Aggressive but sustainable deficit: 15-20% below TDEE
  const deficitPercent = bodyFat > 20 ? 0.20 : 0.15;
  const deficit = Math.round(tdee * deficitPercent);
  const targetCalories = tdee - deficit;
  
  // High protein to preserve muscle during cut
  const proteinPerKg = 2.2; // g/kg bodyweight
  const protein = Math.round(weight * proteinPerKg);
  
  // Moderate fat for hormones (25% of calories)
  const fatPercent = 0.25;
  const fat = Math.round((targetCalories * fatPercent) / 9);
  
  // Remaining calories from carbs
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = targetCalories - proteinCals - fatCals;
  const carbs = Math.round(carbCals / 4);
  
  const targetBF = gender === 'male' ? 10 : 18;
  const bfToLose = Math.max(0, bodyFat - targetBF);
  const fatToLose = (weight * bfToLose) / 100;
  const weeksEstimate = Math.ceil(fatToLose / 0.5); // 0.5kg/week safe rate
  
  return {
    title: 'Visible Abs - Fat Loss',
    description: `Achieve visible abs through strategic fat loss while preserving muscle mass. Target: ${targetBF}% body fat.`,
    macros: {
      calories: targetCalories,
      protein,
      carbs,
      fat,
      proteinPerKg,
      carbsPercent: Math.round((carbCals / targetCalories) * 100),
      fatPercent: Math.round((fatCals / targetCalories) * 100),
      proteinPercent: Math.round((proteinCals / targetCalories) * 100),
    },
    bmr,
    tdee,
    deficit,
    surplus: 0,
    recommendations: [
      `${deficit} calorie deficit (${deficitPercent * 100}% below TDEE)`,
      `High protein (${proteinPerKg}g/kg) to preserve muscle`,
      'Prioritize strength training to maintain muscle mass',
      'Add 2-3 cardio sessions per week for additional deficit',
      'Track body fat % weekly, not just weight',
    ],
    trainingTips: [
      'Maintain strength training volume (3-5x/week)',
      'Focus on compound movements: pull-ups, dips, squats',
      'Add HIIT or steady-state cardio 2-3x/week',
      'Keep workout intensity high despite calorie deficit',
      'Prioritize recovery - sleep 7-9 hours',
    ],
    nutritionTips: [
      `Eat ${protein}g protein daily (spread across 4-5 meals)`,
      'Time carbs around workouts for energy',
      'Include healthy fats for hormone production',
      'Stay hydrated - 3-4L water daily',
      'Consider refeed day every 7-10 days',
    ],
    progressMetrics: [
      'Body fat % (target: decrease 0.5-1% per week)',
      'Weight (target: -0.5kg per week)',
      'Waist measurement',
      'Strength levels (should maintain)',
      'Progress photos weekly',
    ],
    expectedResults: `Estimated ${weeksEstimate} weeks to reach ${targetBF}% body fat at safe rate of 0.5kg/week. You'll lose approximately ${fatToLose.toFixed(1)}kg of fat while preserving ${leanMass.toFixed(1)}kg lean mass.`,
  };
}

/**
 * MUSCLE GAIN GOAL - Bulking Focus
 * Target: Maximize muscle growth with minimal fat gain
 */
function calculateMuscleGoal(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  bodyFat: number,
  leanMass: number,
  bmr: number,
  tdee: number
): GoalRecommendation {
  // Moderate surplus: 10-15% above TDEE
  const surplusPercent = 0.12;
  const surplus = Math.round(tdee * surplusPercent);
  const targetCalories = tdee + surplus;
  
  // High protein for muscle synthesis
  const proteinPerKg = 2.0; // g/kg bodyweight
  const protein = Math.round(weight * proteinPerKg);
  
  // Moderate fat (25% of calories)
  const fatPercent = 0.25;
  const fat = Math.round((targetCalories * fatPercent) / 9);
  
  // High carbs for energy and recovery
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = targetCalories - proteinCals - fatCals;
  const carbs = Math.round(carbCals / 4);
  
  // Realistic muscle gain: 0.5-1kg per month for beginners, 0.25-0.5kg for intermediate
  const monthlyGain = 0.5;
  const expectedMuscleGain = monthlyGain * 3; // 3 months
  
  return {
    title: 'Muscle Gain - Lean Bulk',
    description: 'Build muscle mass through progressive overload and strategic calorie surplus while minimizing fat gain.',
    macros: {
      calories: targetCalories,
      protein,
      carbs,
      fat,
      proteinPerKg,
      carbsPercent: Math.round((carbCals / targetCalories) * 100),
      fatPercent: Math.round((fatCals / targetCalories) * 100),
      proteinPercent: Math.round((proteinCals / targetCalories) * 100),
    },
    bmr,
    tdee,
    deficit: 0,
    surplus,
    recommendations: [
      `${surplus} calorie surplus (${surplusPercent * 100}% above TDEE)`,
      `High protein (${proteinPerKg}g/kg) for muscle synthesis`,
      'Progressive overload in every workout',
      'Focus on compound movements for mass',
      'Minimize cardio to preserve surplus',
    ],
    trainingTips: [
      'Train 4-6x per week with progressive overload',
      'Focus on compound lifts: pull-ups, dips, squats, deadlifts',
      'Aim for 8-12 reps for hypertrophy',
      'Increase volume or weight each week',
      'Rest 48-72 hours between muscle groups',
    ],
    nutritionTips: [
      `Eat ${protein}g protein daily (1.6-2.2g/kg)`,
      'Consume carbs pre and post-workout',
      'Eat in slight surplus consistently',
      'Don\'t skip meals - eat 4-6 times daily',
      'Stay hydrated for muscle recovery',
    ],
    progressMetrics: [
      'Muscle mass (target: +0.5kg per month)',
      'Body weight (target: +0.5-1kg per month)',
      'Strength gains on key lifts',
      'Body measurements (arms, chest, legs)',
      'Progress photos monthly',
    ],
    expectedResults: `Expect to gain ${expectedMuscleGain.toFixed(1)}kg of muscle over 3 months with minimal fat gain. Current lean mass: ${leanMass.toFixed(1)}kg → Target: ${(leanMass + expectedMuscleGain).toFixed(1)}kg.`,
  };
}

/**
 * ATHLETIC MAINTENANCE GOAL - Body Recomposition
 * Target: Maintain/improve performance while optimizing body composition
 */
function calculateAthleticGoal(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  bodyFat: number,
  leanMass: number,
  bmr: number,
  tdee: number
): GoalRecommendation {
  // Slight deficit for recomp or maintenance
  const deficit = bodyFat > 15 ? 100 : 0;
  const targetCalories = tdee - deficit;
  
  // High protein for recomp
  const proteinPerKg = 2.0;
  const protein = Math.round(weight * proteinPerKg);
  
  // Balanced macros (30% fat, rest carbs)
  const fatPercent = 0.30;
  const fat = Math.round((targetCalories * fatPercent) / 9);
  
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = targetCalories - proteinCals - fatCals;
  const carbs = Math.round(carbCals / 4);
  
  return {
    title: 'Athletic Maintenance - Recomp',
    description: 'Maintain strong athletic performance while optimizing body composition through balanced nutrition and training.',
    macros: {
      calories: targetCalories,
      protein,
      carbs,
      fat,
      proteinPerKg,
      carbsPercent: Math.round((carbCals / targetCalories) * 100),
      fatPercent: Math.round((fatCals / targetCalories) * 100),
      proteinPercent: Math.round((proteinCals / targetCalories) * 100),
    },
    bmr,
    tdee,
    deficit,
    surplus: 0,
    recommendations: [
      deficit > 0 ? `Small ${deficit} calorie deficit for recomp` : 'Maintenance calories for performance',
      `High protein (${proteinPerKg}g/kg) for recovery`,
      'Balance strength and conditioning',
      'Focus on performance metrics',
      'Adjust calories based on training volume',
    ],
    trainingTips: [
      'Mix strength training (3-4x/week) with conditioning',
      'Periodize training for peak performance',
      'Include mobility and flexibility work',
      'Vary intensity - hard days and recovery days',
      'Track performance metrics, not just aesthetics',
    ],
    nutritionTips: [
      `Eat ${protein}g protein for recovery`,
      'Time nutrition around training',
      'Carb cycle: higher on training days',
      'Stay flexible with calorie intake',
      'Prioritize whole foods and micronutrients',
    ],
    progressMetrics: [
      'Performance metrics (strength, endurance)',
      'Body composition (muscle:fat ratio)',
      'Recovery quality and energy levels',
      'Training volume capacity',
      'Overall athletic performance',
    ],
    expectedResults: `Maintain current weight (${weight}kg) while improving body composition. Expect gradual fat loss and muscle gain simultaneously (recomp). Focus on performance improvements and sustainable habits.`,
  };
}

/**
 * Get goal description for UI display
 */
export function getGoalDescription(goal: FitnessGoal): string {
  switch (goal) {
    case 'abs':
      return 'Fat loss focus - Achieve visible abs through strategic calorie deficit';
    case 'muscle':
      return 'Muscle gain focus - Build mass through progressive overload and surplus';
    case 'athletic':
      return 'Performance focus - Maintain strength while optimizing body composition';
    default:
      return 'Balanced approach to fitness and nutrition';
  }
}

/**
 * Get goal icon emoji
 */
export function getGoalIcon(goal: FitnessGoal): string {
  switch (goal) {
    case 'abs':
      return '🔥';
    case 'muscle':
      return '💪';
    case 'athletic':
      return '⚡';
    default:
      return '🎯';
  }
}

// Made with Bob
