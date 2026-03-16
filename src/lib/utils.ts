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
  last14Days: Array<{ date: string; gymDone: boolean; mealsLogged: boolean; sleepLogged: boolean; completed: boolean }>
): { gymStreak: number; gymBestStreak: number; dailyStreak: number; dailyBestStreak: number } {
  const sorted = [...last14Days].sort((a, b) => b.date.localeCompare(a.date));

  let gymStreak = 0;
  let gymBestStreak = 0;
  let gymTemp = 0;
  let dailyStreak = 0;
  let dailyBestStreak = 0;
  let dailyTemp = 0;
  let gymStreakBroken = false;
  let dailyStreakBroken = false;

  for (const day of sorted) {
    if (!gymStreakBroken) {
      if (day.gymDone) { gymStreak++; gymTemp++; }
      else { gymStreakBroken = true; if (gymTemp > gymBestStreak) gymBestStreak = gymTemp; gymTemp = 0; }
    } else {
      if (day.gymDone) { gymTemp++; if (gymTemp > gymBestStreak) gymBestStreak = gymTemp; }
      else { if (gymTemp > gymBestStreak) gymBestStreak = gymTemp; gymTemp = 0; }
    }

    if (!dailyStreakBroken) {
      if (day.completed) { dailyStreak++; dailyTemp++; }
      else { dailyStreakBroken = true; if (dailyTemp > dailyBestStreak) dailyBestStreak = dailyTemp; dailyTemp = 0; }
    } else {
      if (day.completed) { dailyTemp++; if (dailyTemp > dailyBestStreak) dailyBestStreak = dailyTemp; }
      else { if (dailyTemp > dailyBestStreak) dailyBestStreak = dailyTemp; dailyTemp = 0; }
    }
  }

  if (gymTemp > gymBestStreak) gymBestStreak = gymTemp;
  if (dailyTemp > dailyBestStreak) dailyBestStreak = dailyTemp;

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

export function get14DayRange(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    days.push(dayjs.utc().subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
}

export function get30DayRange(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(dayjs.utc().subtract(i, "day").format("YYYY-MM-DD"));
  }
  return days;
}
