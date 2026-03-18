import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { NutritionTarget, MealEntry, SleepEntry, GymEntry } from "@/lib/models";
import { getTodayUTC, get14DayRange, calculateStreaks } from "@/lib/utils";
import dayjs from "dayjs";
import { calculateReadiness } from "@/lib/readiness";
import { IDashboardData } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const today = getTodayUTC();
    const range = get14DayRange();
    const userId = session.user.id;

    await connectDB();

    const [target, mealEntry, sleep, gym, rangeGym, rangeMeals, rangeSleep] = await Promise.all([
      NutritionTarget.findOne({ userId, date: { $lte: today } }).sort({ date: -1 }),
      MealEntry.findOne({ userId, date: today }),
      SleepEntry.findOne({ userId, date: today }),
      GymEntry.findOne({ userId, date: today }),
      GymEntry.find({ userId, date: { $in: range } }),
      MealEntry.find({ userId, date: { $in: range } }),
      SleepEntry.find({ userId, date: { $in: range } }),
    ]);

    const gymMap = Object.fromEntries(rangeGym.map((g) => [g.date, g.done]));
    const mealMap = Object.fromEntries(rangeMeals.map((m) => [m.date, m.meals.length > 0]));
    const sleepMap = Object.fromEntries(rangeSleep.map((s) => [s.date, s.hours > 0]));

    const last14Days = range.map((date: string) => ({
      date,
      gymDone: gymMap[date] ?? false,
      mealsLogged: mealMap[date] ?? false,
      sleepLogged: sleepMap[date] ?? false,
      completed: (gymMap[date] ?? false) && (mealMap[date] ?? false) && (sleepMap[date] ?? false),
    }));

    const streakData = calculateStreaks(last14Days);

    const meals = mealEntry?.meals || []; // Renamed from mealEntry to entry in the instruction, but keeping mealEntry as it's defined above.
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
        fiber: acc.fiber + m.fiber,
        sodium: acc.sodium + m.sodium,
        sugar: acc.sugar + m.sugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 0, sugar: 0 }
    );

    const yesterday = dayjs(today).subtract(1, "day").format("YYYY-MM-DD");
    const [ySleep, yGym, yMeals] = await Promise.all([
      SleepEntry.findOne({ userId: session.user.id, date: yesterday }),
      GymEntry.findOne({ userId: session.user.id, date: yesterday }),
      MealEntry.findOne({ userId: session.user.id, date: yesterday }),
    ]);

    const fullStreakData = { ...streakData, last14Days };
    const readinessScore = calculateReadiness(ySleep, yGym, yMeals, fullStreakData);

    const dashboardData: IDashboardData = { // Renamed to payload in instruction, but keeping dashboardData as it's the original type.
      today,
      readinessScore,
      target: target ? target.toObject() : null,
      meals: meals.map((m) => ({ ...m.toObject ? m.toObject() : m })),
      sleep: sleep ? sleep.toObject() : null,
      gym: gym ? gym.toObject() : null,
      streaks: fullStreakData,
      totals,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
