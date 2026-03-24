import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { NutritionTarget, MealEntry, SleepEntry, GymEntry } from "@/lib/models";
import { getTodayUTC, get90DayRange, calculateStreaks } from "@/lib/utils";
import dayjs from "dayjs";
import { calculateReadiness } from "@/lib/readiness";
import { IDashboardData } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get("date") || getTodayUTC();
    const range90 = get90DayRange(targetDate);
    const userId = session.user.id;

    await connectDB();

    const [target, mealEntry, sleep, gym, rangeGym, rangeMeals, rangeSleep] = await Promise.all([
      NutritionTarget.findOne({ userId, date: { $lte: targetDate } }).sort({ date: -1 }),
      MealEntry.findOne({ userId, date: targetDate }),
      SleepEntry.findOne({ userId, date: targetDate }),
      GymEntry.findOne({ userId, date: targetDate }),
      GymEntry.find({ userId, date: { $in: range90 } }),
      MealEntry.find({ userId, date: { $in: range90 } }),
      SleepEntry.find({ userId, date: { $in: range90 } }),
    ]);

    const gymMap = Object.fromEntries(rangeGym.map((g) => [g.date, g.done]));
    const mealMap = Object.fromEntries(rangeMeals.map((m) => [m.date, m.meals.length > 0]));
    const sleepMap = Object.fromEntries(rangeSleep.map((s) => [s.date, s.hours > 0]));

    const last90Days = range90.map((date: string) => ({
      date,
      gymDone: gymMap[date] ?? false,
      mealsLogged: mealMap[date] ?? false,
      sleepLogged: sleepMap[date] ?? false,
      completed: (gymMap[date] ?? false) && (mealMap[date] ?? false) && (sleepMap[date] ?? false),
    }));

    const last14Days = last90Days.slice(-14);

    const streakData = calculateStreaks(last90Days);

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

    const yesterday = dayjs(targetDate).subtract(1, "day").format("YYYY-MM-DD");
    const [ySleep, yGym, yMeals] = await Promise.all([
      SleepEntry.findOne({ userId: session.user.id, date: yesterday }),
      GymEntry.findOne({ userId: session.user.id, date: yesterday }),
      MealEntry.findOne({ userId: session.user.id, date: yesterday }),
    ]);

    const fullStreakData = { ...streakData, last14Days };
    const readinessScore = calculateReadiness(ySleep, yGym, yMeals, fullStreakData);

    const dashboardData: IDashboardData = { // Renamed to payload in instruction, but keeping dashboardData as it's the original type.
      today: targetDate,
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
