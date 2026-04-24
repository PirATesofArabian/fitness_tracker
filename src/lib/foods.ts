export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  nutritionPer100g: NutritionInfo;
  servingSizes: ServingUnit[];
  isCustom?: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface ServingUnit {
  name: string;
  grams: number;
  displayName: string;
}

export type FoodCategory = 
  | 'rice' 
  | 'roti' 
  | 'dal' 
  | 'vegetable' 
  | 'meat' 
  | 'egg' 
  | 'dairy'
  | 'snack'
  | 'drink'
  | 'other';

export interface CalculatedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  totalGrams: number;
}

export function calculateFoodMacros(food: FoodItem, quantity: number, unitName: string): CalculatedMacros {
  const serving = food.servingSizes.find(s => s.name === unitName) || food.servingSizes[0];
  const totalGrams = serving.grams * quantity;
  const multiplier = totalGrams / 100;
  
  return {
    calories: Math.round(food.nutritionPer100g.calories * multiplier),
    protein: Math.round(food.nutritionPer100g.protein * multiplier * 10) / 10,
    carbs: Math.round(food.nutritionPer100g.carbs * multiplier * 10) / 10,
    fat: Math.round(food.nutritionPer100g.fat * multiplier * 10) / 10,
    fiber: Math.round(food.nutritionPer100g.fiber * multiplier * 10) / 10,
    totalGrams: Math.round(totalGrams),
  };
}

export const INDIAN_FOODS: FoodItem[] = [
  // Rice & Rice Dishes
  { id: '1', name: 'Rice (Steamed/Cooked)', category: 'rice', nutritionPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'plate', grams: 200, displayName: '1 plate' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '2', name: 'Ginger Garlic Chicken', category: 'meat', nutritionPer100g: { calories: 180, protein: 22, carbs: 4, fat: 8, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '3', name: 'Chicken Biryani', category: 'meat', nutritionPer100g: { calories: 164, protein: 8, carbs: 18, fat: 6, fiber: 1 }, servingSizes: [{ name: 'plate', grams: 300, displayName: '1 plate' }, { name: 'dumps', grams: 350, displayName: '1 dum (large)' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '4', name: 'Chicken Curry', category: 'meat', nutritionPer100g: { calories: 185, protein: 18, carbs: 5, fat: 10, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 120, displayName: '1 piece' }, { name: 'cup', grams: 200, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '5', name: 'Mutton Biryani', category: 'meat', nutritionPer100g: { calories: 188, protein: 10, carbs: 15, fat: 10, fiber: 1 }, servingSizes: [{ name: 'plate', grams: 300, displayName: '1 plate' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '6', name: 'Mutton Fry', category: 'meat', nutritionPer100g: { calories: 245, protein: 20, carbs: 4, fat: 17, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 100, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '7', name: 'Mutton Keema', category: 'meat', nutritionPer100g: { calories: 215, protein: 21, carbs: 3, fat: 13, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // South Indian Breakfast
  { id: '8', name: 'Idli (Rice)', category: 'rice', nutritionPer100g: { calories: 92, protein: 2.6, carbs: 19, fat: 0.4, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 40, displayName: '1 idli' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '9', name: 'Idli (Ragi)', category: 'rice', nutritionPer100g: { calories: 85, protein: 3, carbs: 17, fat: 0.5, fiber: 2 }, servingSizes: [{ name: 'piece', grams: 35, displayName: '1 idli' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '10', name: 'Dosa (Plain)', category: 'rice', nutritionPer100g: { calories: 120, protein: 2, carbs: 22, fat: 2.5, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 100, displayName: '1 dosa' }, { name: 'masala', grams: 180, displayName: '1 masala dosa' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '11', name: 'Dosa (Masala)', category: 'rice', nutritionPer100g: { calories: 150, protein: 3, carbs: 20, fat: 5, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 180, displayName: '1 masala dosa' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '12', name: 'Pongal', category: 'rice', nutritionPer100g: { calories: 165, protein: 5, carbs: 22, fat: 6, fiber: 1 }, servingSizes: [{ name: 'cup', grams: 200, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '13', name: 'Upma', category: 'rice', nutritionPer100g: { calories: 120, protein: 3, carbs: 18, fat: 4, fiber: 2 }, servingSizes: [{ name: 'cup', grams: 180, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '14', name: 'Parota (Layered)', category: 'roti', nutritionPer100g: { calories: 220, protein: 5, carbs: 28, fat: 10, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 80, displayName: '1 parota' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '15', name: 'Poori', category: 'roti', nutritionPer100g: { calories: 250, protein: 5, carbs: 30, fat: 12, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 60, displayName: '1 poori' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Rotis
  { id: '16', name: 'Chapathi/Roti (Wheat)', category: 'roti', nutritionPer100g: { calories: 260, protein: 7, carbs: 45, fat: 5, fiber: 4 }, servingSizes: [{ name: 'piece', grams: 60, displayName: '1 chapathi' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '17', name: 'Chapathi (Ragi)', category: 'roti', nutritionPer100g: { calories: 200, protein: 6, carbs: 38, fat: 3, fiber: 6 }, servingSizes: [{ name: 'piece', grams: 70, displayName: '1 ragi chapathi' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '18', name: 'Jowar Roti', category: 'roti', nutritionPer100g: { calories: 190, protein: 5, carbs: 38, fat: 2, fiber: 5 }, servingSizes: [{ name: 'piece', grams: 75, displayName: '1 roti' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Dals
  { id: '19', name: 'Dal (Toor/Tuvar)', category: 'dal', nutritionPer100g: { calories: 120, protein: 8, carbs: 20, fat: 0.5, fiber: 8 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'scoop', grams: 80, displayName: '1 scoop' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '20', name: 'Dal Tadka', category: 'dal', nutritionPer100g: { calories: 140, protein: 9, carbs: 22, fat: 3, fiber: 6 }, servingSizes: [{ name: 'cup', grams: 160, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '21', name: 'Dal Makhani', category: 'dal', nutritionPer100g: { calories: 165, protein: 8, carbs: 18, fat: 8, fiber: 5 }, servingSizes: [{ name: 'cup', grams: 180, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '22', name: 'Rajma', category: 'dal', nutritionPer100g: { calories: 118, protein: 8, carbs: 21, fat: 0.5, fiber: 7 }, servingSizes: [{ name: 'cup', grams: 160, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '23', name: 'Chana Peas (Chole)', category: 'dal', nutritionPer100g: { calories: 164, protein: 8, carbs: 25, fat: 4, fiber: 6 }, servingSizes: [{ name: 'cup', grams: 165, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '24', name: 'Moong Dal', category: 'dal', nutritionPer100g: { calories: 105, protein: 7, carbs: 19, fat: 0.4, fiber: 8 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Vegetable Dishes
  { id: '25', name: 'Potato Palya', category: 'vegetable', nutritionPer100g: { calories: 85, protein: 1.5, carbs: 15, fat: 2.5, fiber: 2 }, servingSizes: [{ name: 'cup', grams: 120, displayName: '1 cup' }, { name: 'piece', grams: 60, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '26', name: 'Spinach Palya (Palak)', category: 'vegetable', nutritionPer100g: { calories: 28, protein: 3, carbs: 4, fat: 0.5, fiber: 2 }, servingSizes: [{ name: 'cup', grams: 100, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '27', name: 'Cabbage Palya', category: 'vegetable', nutritionPer100g: { calories: 22, protein: 1.3, carbs: 5, fat: 0.2, fiber: 2 }, servingSizes: [{ name: 'cup', grams: 100, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '28', name: 'Beans Carrot Palya', category: 'vegetable', nutritionPer100g: { calories: 45, protein: 1.5, carbs: 8, fat: 0.8, fiber: 3 }, servingSizes: [{ name: 'cup', grams: 120, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '29', name: 'mixed Vegetable Sabzi', category: 'vegetable', nutritionPer100g: { calories: 55, protein: 2, carbs: 9, fat: 1.5, fiber: 3 }, servingSizes: [{ name: 'cup', grams: 130, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '30', name: 'Bhindi (Okra) Fry', category: 'vegetable', nutritionPer100g: { calories: 90, protein: 2, carbs: 10, fat: 4.5, fiber: 3 }, servingSizes: [{ name: 'cup', grams: 100, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Meat
  { id: '31', name: 'Chicken Breast (Boiled)', category: 'meat', nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1 breast' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '32', name: 'Chicken Thigh', category: 'meat', nutritionPer100g: { calories: 210, protein: 26, carbs: 0, fat: 11, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 100, displayName: '1 thigh' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '33', name: 'Chicken Liver', category: 'meat', nutritionPer100g: { calories: 167, protein: 24, carbs: 1, fat: 6, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 30, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '34', name: 'Fish (Pomfret)', category: 'meat', nutritionPer100g: { calories: 95, protein: 20, carbs: 0, fat: 1, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 120, displayName: '1 fish' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '35', name: 'Fish (Salmon)', category: 'meat', nutritionPer100g: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '36', name: 'Prawns', category: 'meat', nutritionPer100g: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 15, displayName: '1 prawn' }, { name: 'cup', grams: 100, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '37', name: 'Egg (Boiled)', category: 'egg', nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 50, displayName: '1 egg' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '38', name: 'Egg (Fried)', category: 'egg', nutritionPer100g: { calories: 240, protein: 14, carbs: 2, fat: 19, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 60, displayName: '1 egg' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '39', name: 'Omelette (Plain)', category: 'egg', nutritionPer100g: { calories: 210, protein: 12, carbs: 2, fat: 17, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 70, displayName: '1 omelette' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Dairy & Extras
  { id: '40', name: 'Curd/Yogurt', category: 'dairy', nutritionPer100g: { calories: 63, protein: 3.5, carbs: 5, fat: 2.5, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 200, displayName: '1 cup' }, { name: 'bowl', grams: 150, displayName: '1 bowl' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '41', name: 'Cottage Cheese (Paneer)', category: 'dairy', nutritionPer100g: { calories: 265, protein: 14, carbs: 3.6, fat: 22, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 30, displayName: '1 piece' }, { name: 'cup', grams: 100, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '42', name: 'Ghee', category: 'dairy', nutritionPer100g: { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 }, servingSizes: [{ name: 'tsp', grams: 5, displayName: '1 tsp' }, { name: 'tbsp', grams: 14, displayName: '1 tbsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '43', name: 'Milk (Whole)', category: 'dairy', nutritionPer100g: { calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 250, displayName: '1 cup' }, { name: 'glass', grams: 300, displayName: '1 glass' }, { name: 'ml', grams: 100, displayName: '100ml' }] },
  { id: '44', name: 'Coffee with Milk', category: 'drink', nutritionPer100g: { calories: 45, protein: 2, carbs: 5, fat: 1.5, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 180, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Side Dishes
  { id: '45', name: 'Pickle (Lime)', category: 'other', nutritionPer100g: { calories: 25, protein: 0.5, carbs: 6, fat: 0.2, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 10, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '46', name: 'Papad', category: 'other', nutritionPer100g: { calories: 350, protein: 8, carbs: 55, fat: 2, fiber: 3 }, servingSizes: [{ name: 'piece', grams: 15, displayName: '1 papad' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '47', name: 'Sambar', category: 'dal', nutritionPer100g: { calories: 85, protein: 4, carbs: 14, fat: 2, fiber: 3 }, servingSizes: [{ name: 'cup', grams: 180, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '48', name: 'Chutney (Coconut)', category: 'other', nutritionPer100g: { calories: 180, protein: 2, carbs: 8, fat: 16, fiber: 3 }, servingSizes: [{ name: 'tbsp', grams: 15, displayName: '1 tbsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '49', name: 'Chutney (Tomato)', category: 'other', nutritionPer100g: { calories: 45, protein: 1, carbs: 10, fat: 0.5, fiber: 2 }, servingSizes: [{ name: 'tbsp', grams: 15, displayName: '1 tbsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '50', name: 'Raitha', category: 'dairy', nutritionPer100g: { calories: 50, protein: 2, carbs: 4, fat: 2, fiber: 1 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Snacks
  { id: '51', name: 'Banana', category: 'snack', nutritionPer100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }, servingSizes: [{ name: 'piece', grams: 118, displayName: '1 medium' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '52', name: 'Mango (Ripe)', category: 'snack', nutritionPer100g: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1 slice/piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '53', name: 'Badusha', category: 'snack', nutritionPer100g: { calories: 380, protein: 4, carbs: 55, fat: 16, fiber: 1 }, servingSizes: [{ name: 'piece', grams: 40, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '54', name: 'Jangri', category: 'snack', nutritionPer100g: { calories: 400, protein: 4, carbs: 60, fat: 15, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 30, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '55', name: 'Murukku', category: 'snack', nutritionPer100g: { calories: 420, protein: 7, carbs: 50, fat: 20, fiber: 2 }, servingSizes: [{ name: 'piece', grams: 15, displayName: '1 piece' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '56', name: 'Pakoda', category: 'snack', nutritionPer100g: { calories: 340, protein: 7, carbs: 30, fat: 22, fiber: 2 }, servingSizes: [{ name: 'piece', grams: 20, displayName: '1 pakoda' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '57', name: 'Samosa', category: 'snack', nutritionPer100g: { calories: 310, protein: 5, carbs: 35, fat: 16, fiber: 2 }, servingSizes: [{ name: 'piece', grams: 80, displayName: '1 samosa' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '58', name: 'Bhelpuri', category: 'snack', nutritionPer100g: { calories: 150, protein: 4, carbs: 25, fat: 4, fiber: 3 }, servingSizes: [{ name: 'cup', grams: 50, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  
  // Oils
  { id: '59', name: 'Vegetable Oil', category: 'other', nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, servingSizes: [{ name: 'tsp', grams: 5, displayName: '1 tsp' }, { name: 'tbsp', grams: 14, displayName: '1 tbsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: '60', name: 'Coconut Oil', category: 'other', nutritionPer100g: { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 }, servingSizes: [{ name: 'tsp', grams: 5, displayName: '1 tsp' }, { name: 'tbsp', grams: 14, displayName: '1 tbsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
];

export const GLOBAL_FOODS: FoodItem[] = [
  { id: 'g1', name: 'Chicken Breast (Grilled)', category: 'meat', nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1 breast' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g2', name: 'Egg (Whole, Boiled)', category: 'egg', nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 50, displayName: '1 egg' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g3', name: 'Egg Whites', category: 'egg', nutritionPer100g: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 250, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g4', name: 'Rice (White, Cooked)', category: 'rice', nutritionPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'plate', grams: 200, displayName: '1 plate' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g5', name: 'Rice (Brown, Cooked)', category: 'rice', nutritionPer100g: { calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g6', name: 'Oats (Dry)', category: 'snack', nutritionPer100g: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 }, servingSizes: [{ name: 'cup', grams: 80, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g7', name: 'Greek Yogurt', category: 'dairy', nutritionPer100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 200, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g8', name: 'Cottage Cheese', category: 'dairy', nutritionPer100g: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 150, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g9', name: 'Avocado', category: 'snack', nutritionPer100g: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1/2 avocado' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g10', name: 'Almonds', category: 'snack', nutritionPer100g: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 }, servingSizes: [{ name: 'handful', grams: 30, displayName: '1 handful (30g)' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g11', name: 'Peanut Butter', category: 'snack', nutritionPer100g: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 }, servingSizes: [{ name: 'tbsp', grams: 32, displayName: '2 tbsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g12', name: 'Whey Protein', category: 'snack', nutritionPer100g: { calories: 400, protein: 80, carbs: 10, fat: 5, fiber: 0 }, servingSizes: [{ name: 'scoop', grams: 30, displayName: '1 scoop' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g13', name: 'Sweet Potato', category: 'vegetable', nutritionPer100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 }, servingSizes: [{ name: 'piece', grams: 130, displayName: '1 medium' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g14', name: 'Broccoli', category: 'vegetable', nutritionPer100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 }, servingSizes: [{ name: 'cup', grams: 100, displayName: '1 cup' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g15', name: 'Spinach', category: 'vegetable', nutritionPer100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }, servingSizes: [{ name: 'cup', grams: 30, displayName: '1 cup raw' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g16', name: 'Salmon', category: 'meat', nutritionPer100g: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }, servingSizes: [{ name: 'piece', grams: 150, displayName: '1 fillet' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g17', name: 'Tuna', category: 'meat', nutritionPer100g: { calories: 132, protein: 28, carbs: 0, fat: 1, fiber: 0 }, servingSizes: [{ name: 'can', grams: 100, displayName: '1 can' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g18', name: 'Olive Oil', category: 'other', nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }, servingSizes: [{ name: 'tbsp', grams: 14, displayName: '1 tbsp' }, { name: 'tsp', grams: 5, displayName: '1 tsp' }, { name: 'grams', grams: 100, displayName: '100g' }] },
  { id: 'g19', name: 'Milk (2%)', category: 'dairy', nutritionPer100g: { calories: 50, protein: 3.3, carbs: 4.8, fat: 2, fiber: 0 }, servingSizes: [{ name: 'cup', grams: 250, displayName: '1 cup' }, { name: 'ml', grams: 100, displayName: '100ml' }] },
  { id: 'g20', name: 'Protein Bar', category: 'snack', nutritionPer100g: { calories: 333, protein: 33, carbs: 37, fat: 12, fiber: 5 }, servingSizes: [{ name: 'piece', grams: 60, displayName: '1 bar' }, { name: 'grams', grams: 100, displayName: '100g' }] },
];

export function searchFoods(query: string, customFoods: FoodItem[] = []): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  const allFoods = [...customFoods, ...INDIAN_FOODS, ...GLOBAL_FOODS];
  return allFoods
    .filter(food => food.name.toLowerCase().includes(q))
    .slice(0, 15);
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];