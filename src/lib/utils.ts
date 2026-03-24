import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { IProfile } from "@/types";

dayjs.extend(utc);

export function getTodayUTC(): string {
  return dayjs.utc().format("YYYY-MM-DD");
}

export function formatDate(date: string): string {
  return dayjs(date).format("MMM D, YYYY");
}

export function calculateBMI(weight: number, height: number): { bmi: number; category: "Underweight" | "Normal" | "Overweight" | "Obese" } {
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
  let category: "Underweight" | "Normal" | "Overweight" | "Obese";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi, category };
}

export function updateProfileBMI(profile: IProfile): IProfile {
  if (profile.weight && profile.height) {
    const { bmi, category } = calculateBMI(profile.weight, profile.height);
    return { ...profile, bmi, bmiCategory: category };
  }
  return profile;
}

export function calculateStreaks(
  history: Array<{ date: string; gymDone: boolean; mealsLogged: boolean; sleepLogged: boolean; completed: boolean }>
): { gymStreak: number; gymBestStreak: number; dailyStreak: number; dailyBestStreak: number } {
  // Sort from oldest to newest (chronological)
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

  let gymStreak = 0;
  let gymBestStreak = 0;
  let gymGap = 0;

  let dailyStreak = 0;
  let dailyBestStreak = 0;

  for (const day of sorted) {
    // Gym Streak - maintained if gap is <= 3 days
    if (day.gymDone) {
      gymStreak++;
      gymGap = 0;
      if (gymStreak > gymBestStreak) gymBestStreak = gymStreak;
    } else {
      gymGap++;
      if (gymGap > 3) {
        gymStreak = 0;
      }
    }

    // Daily Checklist Streak - strict consecutive
    if (day.completed) {
      dailyStreak++;
      if (dailyStreak > dailyBestStreak) dailyBestStreak = dailyStreak;
    } else {
      dailyStreak = 0;
    }
  }

  return { gymStreak, gymBestStreak, dailyStreak, dailyBestStreak };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getActivityMultiplier(level?: string): number {
  const map: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  return map[level ?? "sedentary"] ?? 1.2;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getProgressColor(pct: number): string {
  if (pct >= 100) return "from-emerald-500 to-green-400";
  if (pct >= 75) return "from-green-500 to-teal-400";
  if (pct >= 50) return "from-yellow-500 to-amber-400";
  return "from-orange-500 to-red-400";
}

export function get14DayRange(endDate?: string): string[] {
  const days: string[] = [];
  const baseDate = endDate ? dayjs.utc(endDate) : dayjs.utc();
  for (let i = 13; i >= 0; i--) {
    days.push(baseDate.subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
}

export function get30DayRange(endDate?: string): string[] {
  const days: string[] = [];
  const baseDate = endDate ? dayjs.utc(endDate) : dayjs.utc();
  for (let i = 29; i >= 0; i--) {
    days.push(baseDate.subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
}

export function get90DayRange(endDate?: string): string[] {
  const days: string[] = [];
  const baseDate = endDate ? dayjs.utc(endDate) : dayjs.utc();
  for (let i = 89; i >= 0; i--) {
    days.push(baseDate.subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
}
