// XP Rewards Map
export const XP_REWARDS = {
  MEAL_LOGGED: 10,
  PROTEIN_TARGET_MET: 25,
  WORKOUT_LOGGED: 50,
  PR_HIT: 100, // Optional usage
  TRIFECTA: 150, // Nutrition + Sleep + Workout all done
  SLEEP_LOGGED: 10,
};

// Level Calculator: Level = floor(sqrt(totalXP / 100)) + 1
export const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
};

// Available Badges
export const BADGES = {
  SEVEN_DAY_WARRIOR: { id: "7_day_warrior", title: "7-Day Warrior" },
  MONTHLY_MAESTRO: { id: "monthly_maestro", title: "Monthly Maestro" },
  CENTURY_CLUB: { id: "century_club", title: "Century Club" },
  VAMPIRE_SLAYER: { id: "vampire_slayer", title: "Vampire Slayer" },
  SHIELD_CHEST: { id: "shield_chest", title: "Shield Chest" },
  T_REX_MODE: { id: "t_rex_mode", title: "T-Rex Mode" },
  SILVERBACK: { id: "silverback", title: "Silverback" },
  PROTEIN_PREDATOR: { id: "protein_predator", title: "Protein Predator" },
  HYDRO_HOMIE: { id: "hydro_homie", title: "Hydro Homie" },
};

export const getLevelTitle = (level: number): string => {
  if (level < 10) return "Novice Lifter";
  if (level < 20) return "Iron Disciple";
  if (level < 30) return "Gym Regular";
  if (level < 40) return "Strength Seraph";
  if (level < 50) return "Apex Athlete";
  return "Fitness God";
};
