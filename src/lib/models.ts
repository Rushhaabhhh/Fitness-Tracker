import mongoose, { Schema, Model } from "mongoose";
import { IUser, INutritionTarget, IMealEntry, ISleepEntry, IGymEntry, IWorkoutEntry } from "@/types";

// User Model
const ProfileSchema = new Schema({
  age: Number,
  sex: { type: String, enum: ["male", "female", "other"] },
  height: Number,
  weight: Number,
  goalWeight: Number,
  bodyFat: Number,
  activityLevel: { type: String, enum: ["sedentary", "light", "moderate", "active", "very_active"] },
  bmi: Number,
  bmiCategory: { type: String, enum: ["Underweight", "Normal", "Overweight", "Obese"] },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: String,
    image: String,
    profile: { type: ProfileSchema, default: {} },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        id: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// NutritionTarget Model
const NutritionTargetSchema = new Schema<INutritionTarget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 150 },
    carbs: { type: Number, default: 250 },
    fats: { type: Number, default: 65 },
    fiber: { type: Number, default: 25 },
    sodium: { type: Number, default: 2300 },
    sugar: { type: Number, default: 50 },
    water: { type: Number, default: 2.5 },
  },
  { timestamps: true }
);
NutritionTargetSchema.index({ userId: 1, date: 1 }, { unique: true });

// MealEntry Model
const MealSchema = new Schema({
  mealName: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-Workout", "Post-Workout"], required: true },
  description: String,
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  loggedAt: { type: Date, default: Date.now },
});

const MealEntrySchema = new Schema<IMealEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    meals: [MealSchema],
  },
  { timestamps: true }
);
MealEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

// SleepEntry Model
const SleepEntrySchema = new Schema<ISleepEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    hours: { type: Number, required: true },
    quality: { type: String, enum: ["poor", "fair", "good", "excellent"] },
  },
  { timestamps: true }
);
SleepEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

// GymEntry Model
const GymEntrySchema = new Schema<IGymEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    done: { type: Boolean, default: false },
    notes: String,
  },
  { timestamps: true }
);
GymEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

// Export models with cache check
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const NutritionTarget: Model<INutritionTarget> = mongoose.models.NutritionTarget || mongoose.model<INutritionTarget>("NutritionTarget", NutritionTargetSchema);
export const MealEntry: Model<IMealEntry> = mongoose.models.MealEntry || mongoose.model<IMealEntry>("MealEntry", MealEntrySchema);
export const SleepEntry: Model<ISleepEntry> = mongoose.models.SleepEntry || mongoose.model<ISleepEntry>("SleepEntry", SleepEntrySchema);
export const GymEntry: Model<IGymEntry> = mongoose.models.GymEntry || mongoose.model<IGymEntry>("GymEntry", GymEntrySchema);

// WorkoutEntry Model
const ExerciseSetSchema = new Schema({
  weight: { type: Number, required: true },
  reps: { type: Number, required: true },
});

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  sets: [ExerciseSetSchema],
});

const WorkoutEntrySchema = new Schema<IWorkoutEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    exercises: [ExerciseSchema],
  },
  { timestamps: true }
);
WorkoutEntrySchema.index({ userId: 1, date: 1 });

export const WorkoutEntry: Model<IWorkoutEntry> = mongoose.models.WorkoutEntry || mongoose.model<IWorkoutEntry>("WorkoutEntry", WorkoutEntrySchema);
