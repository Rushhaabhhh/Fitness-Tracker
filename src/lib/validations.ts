import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  age: z.coerce.number().min(10).max(120).optional().or(z.literal("")),
  sex: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  height: z.coerce.number().min(50).max(300).optional().or(z.literal("")),
  weight: z.coerce.number().min(20).max(500).optional().or(z.literal("")),
  goalWeight: z.coerce.number().min(20).max(500).optional().or(z.literal("")),
  bodyFat: z.coerce.number().min(1).max(70).optional().or(z.literal("")),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional().or(z.literal("")),
});

export const NutritionTargetSchema = z.object({
  calories: z.coerce.number().min(500).max(10000),
  protein: z.coerce.number().min(0).max(1000),
  carbs: z.coerce.number().min(0).max(2000),
  fats: z.coerce.number().min(0).max(500),
  fiber: z.coerce.number().min(0).max(200),
  sodium: z.coerce.number().min(0).max(10000),
  sugar: z.coerce.number().min(0).max(500),
  water: z.coerce.number().min(0).max(20),
});

export const MealSchema = z.object({
  mealName: z.enum(["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"]),
  description: z.string().max(500).optional(),
  calories: z.coerce.number().min(0).max(5000),
  protein: z.coerce.number().min(0).max(500),
  carbs: z.coerce.number().min(0).max(1000),
  fats: z.coerce.number().min(0).max(500),
  fiber: z.coerce.number().min(0).max(200),
  sodium: z.coerce.number().min(0).max(10000),
  sugar: z.coerce.number().min(0).max(500),
});

export const SleepSchema = z.object({
  hours: z.coerce.number().min(0).max(24),
  quality: z.enum(["poor", "fair", "good", "excellent"]).optional().or(z.literal("")),
});

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
export type NutritionTargetInput = z.infer<typeof NutritionTargetSchema>;
export type MealInput = z.infer<typeof MealSchema>;
export type SleepInput = z.infer<typeof SleepSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
