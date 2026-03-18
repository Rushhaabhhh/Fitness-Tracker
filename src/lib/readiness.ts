import { ISleepEntry, IGymEntry, IMealEntry, IStreakData } from "@/types";

export function calculateReadiness(
  yesterdaySleep: ISleepEntry | null,
  yesterdayGym: IGymEntry | null,
  yesterdayMeals: IMealEntry | null,
  streaks: IStreakData
): number {
  let score = 60; // Base score

  // 1. Sleep Impact (Huge factor)
  if (yesterdaySleep) {
    if (yesterdaySleep.hours >= 8) score += 20;
    else if (yesterdaySleep.hours >= 7) score += 10;
    else if (yesterdaySleep.hours >= 6) score += 0;
    else if (yesterdaySleep.hours < 6) score -= 20;

    if (yesterdaySleep.quality === "excellent") score += 10;
    if (yesterdaySleep.quality === "poor") score -= 10;
  } else {
    // No sleep data? Assume bad recovery just in case
    score -= 10;
  }

  // 2. Physical Fatigue (Did they work out yesterday?)
  if (yesterdayGym?.done) {
    score -= 15; // Muscles need recovery
  } else {
    score += 10; // Rest day advantage
  }

  // 3. Nutrition Recovery
  if (yesterdayMeals && yesterdayMeals.meals.length > 2) {
    score += 15; // At least 3 meals means decent fuel
  } else {
    score -= 10; // Underfueled
  }

  // 4. Cumulative Fatigue (Long gym streaks)
  if (streaks.gymStreak >= 4) {
    score -= 10; // Body is taking a beating
  }

  // Cap at 1-100
  return Math.max(1, Math.min(100, score));
}
