import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { NutritionTarget, MealEntry, SleepEntry, GymEntry } from "@/lib/models";
import { get30DayRange } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const range = get30DayRange();
    const userId = session.user.id;

    await connectDB();

    const [targets, meals, sleeps, gyms] = await Promise.all([
      NutritionTarget.find({ userId, date: { $in: range } }),
      MealEntry.find({ userId, date: { $in: range } }),
      SleepEntry.find({ userId, date: { $in: range } }),
      GymEntry.find({ userId, date: { $in: range } }),
    ]);

    const targetMap = Object.fromEntries(targets.map((t) => [t.date, { calories: t.calories, protein: t.protein }]));
    const mealMap = Object.fromEntries(
      meals.map((m) => [
        m.date,
        { 
          calories: m.meals.reduce((s: number, x: { calories?: number }) => s + (x.calories || 0), 0), 
          protein: m.meals.reduce((s: number, x: { protein?: number }) => s + (x.protein || 0), 0),
          count: m.meals.length 
        },
      ])
    );
    const sleepMap = Object.fromEntries(sleeps.map((s) => [s.date, s.hours]));
    const gymMap = Object.fromEntries(gyms.map((g) => [g.date, g.done]));

    // Get the last known target for each day
    let lastTargetCal = 2000;
    let lastTargetPro = 150;
    const history = range.map((date) => {
      if (targetMap[date]) {
        lastTargetCal = targetMap[date].calories;
        lastTargetPro = targetMap[date].protein || 150;
      }
      const mealData = mealMap[date] || { calories: 0, protein: 0, count: 0 };
      const gymDone = gymMap[date] ?? false;
      const sleepHours = sleepMap[date] ?? 0;
      const mealsCount = mealData.count;
      const completed = gymDone && mealsCount > 0 && sleepHours > 0;
      return {
        date,
        calories: mealData.calories,
        protein: mealData.protein,
        target: lastTargetCal,
        targetProtein: lastTargetPro,
        gymDone,
        sleepHours,
        mealsCount,
        completed,
      };
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
