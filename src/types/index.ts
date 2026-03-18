import { Types } from "mongoose";

export interface IBadge {
  id: string;
  unlockedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  profile: IProfile;
  xp: number;
  level: number;
  badges: IBadge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfile {
  age?: number;
  sex?: "male" | "female" | "other";
  height?: number; // cm
  weight?: number; // kg
  goalWeight?: number; // kg
  bodyFat?: number; // %
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  bmi?: number;
  bmiCategory?: "Underweight" | "Normal" | "Overweight" | "Obese";
}

export interface INutritionTarget {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD UTC
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
  fiber: number; // g
  sodium: number; // mg
  sugar: number; // g
  water: number; // L
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMeal {
  toObject?: () => IMeal;
  _id?: Types.ObjectId;
  mealName: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Pre-Workout" | "Post-Workout";
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugar: number;
  loggedAt?: Date;
}

export interface IMealEntry {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD UTC
  meals: IMeal[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISleepEntry {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD UTC
  hours: number;
  quality?: "poor" | "fair" | "good" | "excellent";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGymEntry {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD UTC
  done: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExerciseSet {
  weight: number;
  reps: number;
}

export interface IExercise {
  name: string;
  sets: IExerciseSet[];
}

export interface IWorkoutEntry {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD UTC
  name: string;
  duration: number; // minutes
  exercises: IExercise[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStreakData {
  gymStreak: number;
  gymBestStreak: number;
  dailyStreak: number;
  dailyBestStreak: number;
  last14Days: Array<{
    date: string;
    gymDone: boolean;
    mealsLogged: boolean;
    sleepLogged: boolean;
    completed: boolean;
  }>;
}

export interface IDashboardData {
  today: string;
  readinessScore?: number;
  target: INutritionTarget | null;
  meals: IMeal[];
  sleep: ISleepEntry | null;
  gym: IGymEntry | null;
  streaks: IStreakData;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number;
    sugar: number;
  };
}

export interface IHistoryDay {
  date: string;
  calories: number;
  target: number;
  gymDone: boolean;
  sleepHours: number;
  mealsCount: number;
  completed: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface ProfileFormData {
  name: string;
  email: string;
  age?: number;
  sex?: "male" | "female" | "other";
  height?: number;
  weight?: number;
  goalWeight?: number;
  bodyFat?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export interface NutritionTargetFormData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugar: number;
  water: number;
}

export interface MealFormData {
  mealName: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Pre-Workout" | "Post-Workout";
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

export interface SleepFormData {
  hours: number;
  quality?: "poor" | "fair" | "good" | "excellent";
}
