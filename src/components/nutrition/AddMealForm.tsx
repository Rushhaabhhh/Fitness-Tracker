"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MealSchema, MealInput } from "@/lib/validations";
import { Input } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface AddMealFormProps {
  onSubmit: (data: MealInput) => Promise<void>;
  loading?: boolean;
}

const MEAL_OPTIONS = [
  { value: "Breakfast", label: "🌅 Breakfast" },
  { value: "Lunch", label: "☀️ Lunch" },
  { value: "Dinner", label: "🌙 Dinner" },
  { value: "Snack", label: "🍎 Snack" },
  { value: "Pre-Workout", label: "⚡ Pre-Workout" },
  { value: "Post-Workout", label: "💪 Post-Workout" },
];

export function AddMealForm({ onSubmit, loading }: AddMealFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MealInput>({
    resolver: zodResolver(MealSchema),
    defaultValues: {
      mealName: "Breakfast", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 0, sugar: 0,
    },
  });

  const handleFormSubmit = async (data: MealInput) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider mb-1.5">Meal Type</label>
          <select
            {...register("mealName")}
            className="input-glass w-full appearance-none"
            style={{ background: "rgb(var(--surface))" }}
          >
            {MEAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "rgb(var(--surface))" }}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.mealName && <p className="text-xs text-red-400 mt-1">{errors.mealName.message}</p>}
        </div>

        <div className="col-span-2">
          <Input
            label="Description (optional)"
            placeholder="e.g. Grilled chicken with rice"
            {...register("description")}
            error={errors.description?.message}
          />
        </div>
      </div>

      {/* Macros */}
      <div>
        <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Macronutrients</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Calories (kcal)" type="number" min="0" step="1" {...register("calories")} error={errors.calories?.message} />
          <Input label="Protein (g)" type="number" min="0" step="0.1" {...register("protein")} error={errors.protein?.message} />
          <Input label="Carbs (g)" type="number" min="0" step="0.1" {...register("carbs")} error={errors.carbs?.message} />
          <Input label="Fats (g)" type="number" min="0" step="0.1" {...register("fats")} error={errors.fats?.message} />
        </div>
      </div>

      {/* Micros */}
      <div>
        <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Micronutrients</p>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Fiber (g)" type="number" min="0" step="0.1" {...register("fiber")} error={errors.fiber?.message} />
          <Input label="Sodium (mg)" type="number" min="0" step="1" {...register("sodium")} error={errors.sodium?.message} />
          <Input label="Sugar (g)" type="number" min="0" step="0.1" {...register("sugar")} error={errors.sugar?.message} />
        </div>
      </div>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Adding..." : "Add Meal"}
      </motion.button>
    </form>
  );
}
