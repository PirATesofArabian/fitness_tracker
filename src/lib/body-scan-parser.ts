import { BodyComp } from './types';

export interface ParsedBodyData {
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  bmi?: number;
  skeletalMuscleMass?: number;
  bodyFatMass?: number;
  totalBodyWater?: number;
  protein?: number;
  minerals?: number;
  visceralFatLevel?: number;
  basalMetabolicRate?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  hips?: number;
  neck?: number;
  testProvider?: string;
  testDate?: string;
}

/**
 * Parse body composition data from OCR text
 * Supports multiple formats: InBody, HDFC, and generic scans
 */
export function parseBodyScanText(text: string): ParsedBodyData {
  const result: ParsedBodyData = {};
  const lines = text.split('\n').map(line => line.trim());
  
  // Detect provider
  result.testProvider = detectProvider(text);
  
  // Extract date
  result.testDate = extractDate(text);
  
  // Parse each line for metrics
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Weight (kg) - look for patterns like "78.4 kg" or "Weight: 78.4"
    if (!result.weight) {
      if (lowerLine.includes('weight') && !lowerLine.includes('control')) {
        const weightMatch = line.match(/(\d+\.?\d*)\s*(?:kg|kgs)/i);
        if (weightMatch) {
          const val = parseFloat(weightMatch[1]);
          console.log(`Found weight candidate: ${val} kg from line: "${line}"`);
          if (val > 30 && val < 200) { // Reasonable weight range
            result.weight = val;
            console.log(`✓ Accepted weight: ${val} kg`);
          }
        }
      }
    }
    
    // Body Fat % - look for patterns like "24.4%" or "PBF: 24.4"
    if (!result.bodyFat) {
      if (lowerLine.includes('body fat') || lowerLine.includes('pbf') || lowerLine.includes('fat %')) {
        const fatMatch = line.match(/(\d+\.?\d*)\s*%/);
        if (fatMatch) {
          const val = parseFloat(fatMatch[1]);
          console.log(`Found body fat candidate: ${val}% from line: "${line}"`);
          if (val > 3 && val < 60) { // Reasonable body fat range
            result.bodyFat = val;
            console.log(`✓ Accepted body fat: ${val}%`);
          }
        }
      }
    }
    
    // BMI
    if (!result.bmi && lowerLine.includes('bmi')) {
      const bmiPatterns = [
        /bmi\s*(\d+)\s+(\d+)/i,  // "BMI 23 2" -> 23.2
        /bmi\s*(\d+\.?\d*)/i,    // "BMI 23.2"
      ];
      
      for (const pattern of bmiPatterns) {
        const match = line.match(pattern);
        if (match) {
          let val: number;
          if (match[2]) {
            val = parseFloat(`${match[1]}.${match[2]}`);
          } else {
            val = parseFloat(match[1]);
          }
          console.log(`Found BMI candidate: ${val} from line: "${line}"`);
          if (val > 10 && val < 50) {
            result.bmi = val;
            console.log(`✓ Accepted BMI: ${val}`);
            break;
          }
        }
      }
    }
    
    // Skeletal Muscle Mass
    if (!result.skeletalMuscleMass && (lowerLine.includes('skeletal muscle') || lowerLine.includes('smm'))) {
      const musclePatterns = [
        /(\d+)\s+(\d+)\s*(?:kg|kgs)/i,  // "45 7 kg" -> 45.7
        /(\d+\.?\d*)\s*(?:kg|kgs)/i,    // "45.7 kg"
      ];
      
      for (const pattern of musclePatterns) {
        const match = line.match(pattern);
        if (match) {
          let val: number;
          if (match[2]) {
            val = parseFloat(`${match[1]}.${match[2]}`);
          } else {
            val = parseFloat(match[1]);
          }
          console.log(`Found skeletal muscle candidate: ${val} kg from line: "${line}"`);
          if (val > 20 && val < 100) {
            result.skeletalMuscleMass = val;
            if (!result.muscleMass) {
              result.muscleMass = val;
            }
            console.log(`✓ Accepted skeletal muscle: ${val} kg`);
            break;
          }
        }
      }
    }
    
    // Body Fat Mass
    if (!result.bodyFatMass && lowerLine.includes('fat mass')) {
      result.bodyFatMass = extractNumber(line, ['kg', 'kgs']);
    }
    
    // Total Body Water
    if (!result.totalBodyWater && (lowerLine.includes('body water') || lowerLine.includes('tbw'))) {
      result.totalBodyWater = extractNumber(line, ['kg', 'kgs', 'l']);
    }
    
    // Protein
    if (!result.protein && lowerLine.includes('protein')) {
      result.protein = extractNumber(line, ['kg', 'kgs']);
    }
    
    // Minerals
    if (!result.minerals && lowerLine.includes('mineral')) {
      result.minerals = extractNumber(line, ['kg', 'kgs']);
    }
    
    // Visceral Fat Level - look for "Visceral Fat Level 4"
    if (!result.visceralFatLevel && lowerLine.includes('visceral fat level')) {
      const visceralMatch = line.match(/visceral fat level\s*(\d+)/i);
      if (visceralMatch) {
        const val = parseFloat(visceralMatch[1]);
        console.log(`Found visceral fat candidate: ${val} from line: "${line}"`);
        if (val >= 1 && val <= 20) {
          result.visceralFatLevel = val;
          console.log(`✓ Accepted visceral fat level: ${val}`);
        }
      }
    }
    
    // Basal Metabolic Rate
    if (!result.basalMetabolicRate && (lowerLine.includes('bmr') || lowerLine.includes('basal metabolic'))) {
      result.basalMetabolicRate = extractNumber(line, ['kcal']);
    }
    
    // Measurements
    if (!result.waist && lowerLine.includes('waist')) {
      result.waist = extractNumber(line, ['cm']);
    }
    if (!result.chest && lowerLine.includes('chest')) {
      result.chest = extractNumber(line, ['cm']);
    }
    if (!result.arms && (lowerLine.includes('arm') || lowerLine.includes('bicep'))) {
      result.arms = extractNumber(line, ['cm']);
    }
    if (!result.thighs && (lowerLine.includes('thigh') || lowerLine.includes('leg'))) {
      result.thighs = extractNumber(line, ['cm']);
    }
    if (!result.hips && lowerLine.includes('hip')) {
      result.hips = extractNumber(line, ['cm']);
    }
    if (!result.neck && lowerLine.includes('neck')) {
      result.neck = extractNumber(line, ['cm']);
    }
  }
  
  console.log('Parsed data:', result);
  console.log('=== End Parsing ===');
  
  return result;
}

/**
 * Detect the scan provider from text
 */
function detectProvider(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('inbody')) return 'InBody';
  if (lowerText.includes('hdfc')) return 'HDFC Bank';
  if (lowerText.includes('tanita')) return 'Tanita';
  if (lowerText.includes('omron')) return 'Omron';
  
  return undefined;
}

/**
 * Extract date from text
 */
function extractDate(text: string): string | undefined {
  // Match various date formats
  const datePatterns = [
    /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})/,  // YYYY/MM/DD or YYYY-MM-DD
    /(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return undefined;
}

/**
 * Extract a number from a line of text
 * @param line - Text line to extract from
 * @param units - Optional units to look for (e.g., ['kg', '%'])
 * @returns Extracted number or undefined
 */
function extractNumber(line: string, units?: string[]): number | undefined {
  // Remove common non-numeric characters but keep decimal points
  let cleanLine = line.replace(/[^\d\.\-\s]/g, ' ');
  
  // If units specified, try to find number near the unit
  if (units) {
    for (const unit of units) {
      const unitIndex = line.toLowerCase().indexOf(unit.toLowerCase());
      if (unitIndex !== -1) {
        // Look for number before the unit
        const beforeUnit = line.substring(0, unitIndex);
        const numbers = beforeUnit.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
          const num = parseFloat(numbers[numbers.length - 1]);
          if (!isNaN(num)) return num;
        }
      }
    }
  }
  
  // Extract all numbers from the line
  const numbers = cleanLine.match(/\d+\.?\d*/g);
  if (!numbers || numbers.length === 0) return undefined;
  
  // Return the most relevant number (usually the last one)
  const num = parseFloat(numbers[numbers.length - 1]);
  return isNaN(num) ? undefined : num;
}

/**
 * Validate extracted body data
 * @param data - Parsed body data
 * @returns Validation result with errors
 */
export function validateBodyData(data: ParsedBodyData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.weight) {
    errors.push('Weight is required');
  } else if (data.weight < 30 || data.weight > 300) {
    errors.push('Weight must be between 30-300 kg');
  }
  
  if (!data.bodyFat) {
    errors.push('Body fat percentage is required');
  } else if (data.bodyFat < 3 || data.bodyFat > 60) {
    errors.push('Body fat must be between 3-60%');
  }
  
  if (!data.muscleMass) {
    errors.push('Muscle mass is required');
  } else if (data.muscleMass < 10 || data.muscleMass > 100) {
    errors.push('Muscle mass must be between 10-100 kg');
  }
  
  if (!data.bmi) {
    errors.push('BMI is required');
  } else if (data.bmi < 10 || data.bmi > 50) {
    errors.push('BMI must be between 10-50');
  }
  
  // Validate optional fields if present
  if (data.visceralFatLevel !== undefined && (data.visceralFatLevel < 1 || data.visceralFatLevel > 30)) {
    errors.push('Visceral fat level must be between 1-30');
  }
  
  if (data.basalMetabolicRate !== undefined && (data.basalMetabolicRate < 800 || data.basalMetabolicRate > 4000)) {
    errors.push('BMR must be between 800-4000 kcal');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate missing fields from available data
 */
export function calculateMissingFields(data: ParsedBodyData): ParsedBodyData {
  const result = { ...data };
  
  // Calculate BMI if weight is available but BMI isn't
  // Note: We'd need height for this, which we don't have from scans
  // This is just a placeholder for future enhancement
  
  // Calculate body fat mass if weight and body fat % are available
  if (result.weight && result.bodyFat && !result.bodyFatMass) {
    result.bodyFatMass = (result.weight * result.bodyFat) / 100;
  }
  
  // Calculate muscle mass if weight and body fat mass are available
  if (result.weight && result.bodyFatMass && !result.muscleMass) {
    result.muscleMass = result.weight - result.bodyFatMass;
  }
  
  return result;
}

