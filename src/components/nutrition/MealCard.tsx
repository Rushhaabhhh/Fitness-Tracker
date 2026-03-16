"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { IMeal } from "@/types";
import { Badge } from "@/components/ui";

interface MealCardProps {
  meal: IMeal;
  onDelete?: () => void;
  index?: number;
}

const MEAL_EMOJI: Record<string, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snack: "🍎",
  "Pre-Workout": "⚡",
  "Post-Workout": "💪",
};

export function MealCard({ meal, onDelete, index = 0 }: MealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="glass rounded-xl p-4 flex items-start gap-3 group"
    >
      <span className="text-2xl mt-0.5 flex-shrink-0">{MEAL_EMOJI[meal.mealName] ?? "🍽️"}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-[rgb(var(--text-primary))] font-display">{meal.mealName}</span>
          <Badge variant="green">{meal.calories} kcal</Badge>
        </div>
        {meal.description && (
          <p className="text-xs text-[rgb(var(--text-muted))] truncate mb-2">{meal.description}</p>
        )}
        <div className="flex gap-3 text-xs text-[rgb(var(--text-muted))]">
          <span>P: <strong className="text-[rgb(var(--text-secondary))]">{meal.protein}g</strong></span>
          <span>C: <strong className="text-[rgb(var(--text-secondary))]">{meal.carbs}g</strong></span>
          <span>F: <strong className="text-[rgb(var(--text-secondary))]">{meal.fats}g</strong></span>
          {meal.fiber > 0 && <span>Fiber: <strong className="text-[rgb(var(--text-secondary))]">{meal.fiber}g</strong></span>}
        </div>
      </div>

      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-[rgb(var(--text-muted))] hover:text-red-400 transition-all"
        >
          <Trash2 size={14} />
        </motion.button>
      )}
    </motion.div>
  );
}
