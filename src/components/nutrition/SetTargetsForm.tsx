"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { NutritionTargetSchema, NutritionTargetInput } from "@/lib/validations";
import { INutritionTarget } from "@/types";
import { Input } from "@/components/ui";
import { Loader2 } from "lucide-react";

interface SetTargetsFormProps {
  currentTarget: INutritionTarget | null;
  onSubmit: (data: NutritionTargetInput) => Promise<void>;
  loading?: boolean;
}

export function SetTargetsForm({ currentTarget, onSubmit, loading }: SetTargetsFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<NutritionTargetInput>({
    resolver: zodResolver(NutritionTargetSchema),
    defaultValues: {
      calories: currentTarget?.calories ?? 2000,
      protein: currentTarget?.protein ?? 150,
      carbs: currentTarget?.carbs ?? 250,
      fats: currentTarget?.fats ?? 65,
      fiber: currentTarget?.fiber ?? 25,
      sodium: currentTarget?.sodium ?? 2300,
      sugar: currentTarget?.sugar ?? 50,
      water: currentTarget?.water ?? 2.5,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Macros</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Calories (kcal)" type="number" min="500" max="10000" {...register("calories")} error={errors.calories?.message} />
          <Input label="Protein (g)" type="number" min="0" {...register("protein")} error={errors.protein?.message} />
          <Input label="Carbs (g)" type="number" min="0" {...register("carbs")} error={errors.carbs?.message} />
          <Input label="Fats (g)" type="number" min="0" {...register("fats")} error={errors.fats?.message} />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider mb-3">Micros & Other</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fiber (g)" type="number" min="0" {...register("fiber")} error={errors.fiber?.message} />
          <Input label="Sodium (mg)" type="number" min="0" {...register("sodium")} error={errors.sodium?.message} />
          <Input label="Sugar (g)" type="number" min="0" {...register("sugar")} error={errors.sugar?.message} />
          <Input label="Water (L)" type="number" min="0" step="0.1" max="20" {...register("water")} error={errors.water?.message} />
        </div>
      </div>

      <p className="text-xs text-[rgb(var(--text-muted))] bg-[rgb(var(--brand-dim))] px-3 py-2 rounded-lg border border-green-500/10">
        💡 These targets persist until you update them again.
      </p>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Saving..." : "Save Targets"}
      </motion.button>
    </form>
  );
}
