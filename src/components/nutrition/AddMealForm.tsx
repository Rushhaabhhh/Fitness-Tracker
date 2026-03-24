"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MealSchema, MealInput } from "@/lib/validations";
import { Input } from "@/components/ui";
import { Loader2, Save, UtensilsCrossed } from "lucide-react";

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
  const [savedMeals, setSavedMeals] = useState<Array<{
    _id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number;
    sugar: number;
  }>>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<MealInput>({
    resolver: zodResolver(MealSchema),
    defaultValues: {
      mealName: "Breakfast", calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 0, sugar: 0,
    },
  });

  useEffect(() => {
    fetch("/api/nutrition/saved")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSavedMeals(d.data);
      })
      .catch(console.error);
  }, []);

  const handleSelectTemplate = (meal: { name: string; calories: number; protein: number; carbs: number; fats: number; fiber: number; sodium: number; sugar: number }) => {
    const currentMealName = getValues("mealName");
    reset({
      mealName: currentMealName, // Keep current meal category
      description: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      fiber: meal.fiber,
      sodium: meal.sodium,
      sugar: meal.sugar,
    });
  };

  const handleFormSubmit = async (data: MealInput) => {
    if (saveAsTemplate && templateName.trim()) {
      try {
        await fetch("/api/nutrition/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, name: templateName.trim() }),
        });
        // refresh saved meals list
        const res = await fetch("/api/nutrition/saved");
        const json = await res.json();
        if (json.success) setSavedMeals(json.data);
      } catch (error) {
        console.error("Failed to save template", error);
      }
    }
    
    await onSubmit(data);
    
    reset();
    setSaveAsTemplate(false);
    setTemplateName("");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {savedMeals.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-2">Saved Templates</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {savedMeals.map(meal => (
              <button
                key={meal._id}
                type="button"
                onClick={() => handleSelectTemplate(meal)}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg border border-[rgb(var(--border-glass))] bg-white/5 hover:bg-white/10 text-xs font-medium text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors flex items-center gap-1.5"
              >
                <UtensilsCrossed size={12} className="text-orange-400" />
                {meal.name} <span className="text-[rgb(var(--text-muted))] ml-0.5">({meal.calories}kcal)</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

      <div className="pt-2 pb-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[rgb(var(--text-secondary))] w-fit">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="w-4 h-4 rounded border-[rgb(var(--border-glass))] bg-white/5 text-green-500 focus:ring-green-500/20"
          />
          <Save size={14} className={saveAsTemplate ? "text-green-400" : "text-[rgb(var(--text-muted))]"} />
          Save this meal as a template
        </label>
        {saveAsTemplate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
            <Input
              label="Template Name"
              placeholder="e.g. Grandma's Famous Lasagna"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required={saveAsTemplate}
            />
          </motion.div>
        )}
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
