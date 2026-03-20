"use client";

import { motion } from "framer-motion";
import { Trash2, Coffee, Sun, Moon, Apple, Zap, Dumbbell } from "lucide-react";
import { IMeal } from "@/types";
import { Badge } from "@/components/ui";

interface MealCardProps {
  meal: IMeal;
  onDelete?: () => void;
  index?: number;
}

const MEAL_ICONS: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
  Breakfast: { icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/15" },
  Lunch: { icon: Sun, color: "text-yellow-500", bg: "bg-yellow-500/15" },
  Dinner: { icon: Moon, color: "text-indigo-400", bg: "bg-indigo-500/15" },
  Snack: { icon: Apple, color: "text-rose-400", bg: "bg-rose-500/15" },
  "Pre-Workout": { icon: Zap, color: "text-orange-400", bg: "bg-orange-500/15" },
  "Post-Workout": { icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/15" },
};

export function MealCard({ meal, onDelete, index = 0 }: MealCardProps) {
  const config = MEAL_ICONS[meal.mealName] || { icon: Coffee, color: "text-[rgb(var(--text-muted))]", bg: "bg-[rgb(var(--border-glass))]/30" };
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -15 }}
      transition={{ delay: index * 0.05, duration: 0.35, type: "spring", bounce: 0.2 }}
      className="glass rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
    >
      <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden border border-white/5`}>
        <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none`} />
        <Icon className={`w-5 h-5 ${config.color} relative z-10 drop-shadow-sm`} strokeWidth={2.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-[15px] text-[rgb(var(--text-primary))] font-display truncate">{meal.mealName}</span>
          <Badge variant="green">{meal.calories} kcal</Badge>
        </div>
        {meal.description && (
          <p className="text-sm text-[rgb(var(--text-secondary))] truncate mb-2 font-medium">{meal.description}</p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold tracking-wide uppercase text-[rgb(var(--text-muted))]">
          <span className="flex items-baseline gap-1">P <span className="text-[rgb(var(--text-primary))] text-xs">{meal.protein}g</span></span>
          <span className="flex items-baseline gap-1">C <span className="text-[rgb(var(--text-primary))] text-xs">{meal.carbs}g</span></span>
          <span className="flex items-baseline gap-1">F <span className="text-[rgb(var(--text-primary))] text-xs">{meal.fats}g</span></span>
          {meal.fiber > 0 && <span className="flex items-baseline gap-1 hidden sm:flex">Fib <span className="text-[rgb(var(--text-primary))] text-xs">{meal.fiber}g</span></span>}
        </div>
      </div>

      {onDelete && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="lg:opacity-0 group-hover:opacity-100 p-2.5 rounded-xl hover:bg-red-500/15 text-[rgb(var(--text-muted))] hover:text-red-400 transition-all shadow-sm"
        >
          <Trash2 size={16} />
        </motion.button>
      )}
    </motion.div>
  );
}
