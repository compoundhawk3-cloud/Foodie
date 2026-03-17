// ============================================================
// Database Types — mirrors Supabase schema
// ============================================================

export type MealType = 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'takeaway' | 'snack' | 'dessert';

export type FoodType =
  | 'burger' | 'pizza' | 'pasta' | 'sushi' | 'ramen' | 'curry' | 'salad'
  | 'steak' | 'seafood' | 'sandwich' | 'tacos' | 'pho' | 'dim_sum'
  | 'kebab' | 'fried_chicken' | 'bbq' | 'thai' | 'indian' | 'chinese'
  | 'japanese' | 'mexican' | 'italian' | 'french' | 'mediterranean'
  | 'korean' | 'vietnamese' | 'british' | 'american' | 'middle_eastern'
  | 'african' | 'caribbean' | 'dessert' | 'breakfast_food' | 'cafe'
  | 'street_food' | 'fine_dining' | 'buffet' | 'other';

export type PortionSize = 'small' | 'medium' | 'large';

export type PriceLevel = '1' | '2' | '3' | '4';

export interface Profile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  restaurant_id: string | null;
  title: string;
  visit_date: string;
  meal_type: MealType;
  food_type: FoodType;
  comment: string;
  foodie_rating: number;
  service_rating: number | null;
  portion_size: PortionSize | null;
  price_level: PriceLevel;
  worth_it: boolean | null;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface EntryPhoto {
  id: string;
  entry_id: string;
  storage_path: string;
  url: string;
  display_order: number;
  created_at: string;
}

// Entry with joined data
export interface EntryWithDetails extends Entry {
  restaurant: Restaurant | null;
  photos: EntryPhoto[];
  profile: Profile;
}

// Form data for creating an entry
export interface EntryFormData {
  title: string;
  visit_date: string;
  meal_type: MealType;
  food_type: FoodType;
  comment: string;
  foodie_rating: number;
  service_rating: number | null;
  portion_size: PortionSize | null;
  price_level: PriceLevel;
  worth_it: boolean | null;
  city: string;
  restaurant_name: string;
  photos: File[];
}

// ============================================================
// Display helpers
// ============================================================

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  lunch: 'Lunch',
  dinner: 'Dinner',
  takeaway: 'Takeaway',
  snack: 'Snack',
  dessert: 'Dessert',
};

export const FOOD_TYPE_LABELS: Record<FoodType, string> = {
  burger: 'Burger', pizza: 'Pizza', pasta: 'Pasta', sushi: 'Sushi',
  ramen: 'Ramen', curry: 'Curry', salad: 'Salad', steak: 'Steak',
  seafood: 'Seafood', sandwich: 'Sandwich', tacos: 'Tacos', pho: 'Pho',
  dim_sum: 'Dim Sum', kebab: 'Kebab', fried_chicken: 'Fried Chicken',
  bbq: 'BBQ', thai: 'Thai', indian: 'Indian', chinese: 'Chinese',
  japanese: 'Japanese', mexican: 'Mexican', italian: 'Italian',
  french: 'French', mediterranean: 'Mediterranean', korean: 'Korean',
  vietnamese: 'Vietnamese', british: 'British', american: 'American',
  middle_eastern: 'Middle Eastern', african: 'African', caribbean: 'Caribbean',
  dessert: 'Dessert', breakfast_food: 'Breakfast', cafe: 'Café',
  street_food: 'Street Food', fine_dining: 'Fine Dining', buffet: 'Buffet',
  other: 'Other',
};

export const PORTION_SIZE_LABELS: Record<PortionSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

export const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  '1': '£',
  '2': '££',
  '3': '£££',
  '4': '££££',
};
