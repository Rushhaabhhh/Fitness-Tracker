"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Utensils, Flame } from "lucide-react";
import { IMeal, INutritionTarget } from "@/types";
import { Card, Modal, ProgressBar, Skeleton, SectionHeader } from "@/components/ui";
import { AddMealForm } from "@/components/nutrition/AddMealForm";
import { SetTargetsForm } from "@/components/nutrition/SetTargetsForm";
import { MealCard } from "@/components/nutrition/MealCard";
import { MealInput, NutritionTargetInput } from "@/lib/validations";

export default function NutritionPage() {
  const [meals, setMeals] = useState<IMeal[]>([]);
  const [target, setTarget] = useState<INutritionTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"meal" | "targets" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [mealsRes, targetRes] = await Promise.all([
        fetch("/api/nutrition"),
        fetch("/api/targets"),
      ]);
      const [mealsJson, targetJson] = await Promise.all([mealsRes.json(), targetRes.json()]);
      if (mealsJson.success) setMeals(mealsJson.data);
      if (targetJson.success) setTarget(targetJson.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fats: acc.fats + m.fats,
      fiber: acc.fiber + m.fiber,
      sodium: acc.sodium + m.sodium,
      sugar: acc.sugar + m.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 0, sugar: 0 }
  );

  const handleAddMeal = async (data: MealInput) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { setMeals(json.data); setModal(null); }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const res = await fetch(`/api/nutrition/${mealId}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) setMeals(json.data);
  };

  const handleSetTargets = async (data: NutritionTargetInput) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { setTarget(json.data); setModal(null); }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48 rounded-xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Nutrition"
        subtitle="Track your daily macros and meals"
        action={
          <div className="flex gap-2">
            <button onClick={() => setModal("targets")} className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5">
              <Target size={13} /> Targets
            </button>
            <button onClick={() => setModal("meal")} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
              <Plus size={13} /> Add Meal
            </button>
          </div>
        }
      />

      {/* Calorie Overview */}
      <Card delay={0.05} className="overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Flame size={20} className="text-orange-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Today&apos;s Calories</h3>
            <p className="text-xs text-[rgb(var(--text-muted))]">
              {target ? `${Math.max(0, target.calories - totals.calories)} remaining` : "Set a target to track progress"}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-display font-black text-[rgb(var(--text-primary))]">{Math.round(totals.calories)}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">/ {target?.calories ?? "—"} kcal</p>
          </div>
        </div>
        <ProgressBar value={totals.calories} max={target?.calories ?? 2000} height="h-3" />
      </Card>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Protein", value: totals.protein, target: target?.protein, color: "from-blue-400 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400", unit: "g" },
          { label: "Carbs", value: totals.carbs, target: target?.carbs, color: "from-yellow-400 to-amber-500", bg: "bg-yellow-500/10", text: "text-yellow-400", unit: "g" },
          { label: "Fats", value: totals.fats, target: target?.fats, color: "from-pink-400 to-rose-500", bg: "bg-pink-500/10", text: "text-pink-400", unit: "g" },
          { label: "Fiber", value: totals.fiber, target: target?.fiber, color: "from-green-400 to-emerald-500", bg: "bg-green-500/10", text: "text-green-400", unit: "g" },
        ].map(({ label, value, target: t, color, text, unit }, i) => (
          <Card key={label} delay={0.1 + i * 0.05} className="space-y-2">
            <p className="text-xs font-medium text-[rgb(var(--text-muted))] uppercase tracking-wider">{label}</p>
            <div className={`text-2xl font-display font-black ${text}`}>{Math.round(value)}<span className="text-sm font-normal text-[rgb(var(--text-muted))] ml-0.5">{unit}</span></div>
            {t !== undefined && (
              <>
                <ProgressBar value={value} max={t} height="h-1.5" color={color} />
                <p className="text-[10px] text-[rgb(var(--text-muted))]">of {t}{unit}</p>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Micro nutrients */}
      {target && (
        <Card delay={0.3}>
          <h3 className="font-display font-semibold text-[rgb(var(--text-primary))] mb-4">Micronutrients</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Sodium", value: totals.sodium, target: target.sodium, unit: "mg", color: "from-purple-400 to-violet-500" },
              { label: "Sugar", value: totals.sugar, target: target.sugar, unit: "g", color: "from-pink-400 to-rose-500" },
              { label: "Water", value: 0, target: target.water, unit: "L", color: "from-blue-400 to-sky-500" },
            ].map(({ label, value, target: t, unit, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(var(--text-secondary))] font-medium">{label}</span>
                  <span className="font-mono text-xs text-[rgb(var(--text-muted))]">{Math.round(value)} / {t}{unit}</span>
                </div>
                <ProgressBar value={value} max={t} height="h-2" color={color} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meals List */}
      <Card delay={0.35}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">
            Meals <span className="text-sm text-[rgb(var(--text-muted))] font-normal ml-1">({meals.length})</span>
          </h3>
          <button onClick={() => setModal("meal")} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
            <Plus size={13} /> Add
          </button>
        </div>
        <AnimatePresence mode="popLayout">
          {meals.length > 0 ? (
            <div className="space-y-2">
              {meals.map((meal, i) => (
                <MealCard
                  key={String(meal._id)}
                  meal={meal}
                  index={i}
                  onDelete={() => handleDeleteMeal(String(meal._id))}
                />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
              <Utensils size={36} className="mx-auto mb-3 text-[rgb(var(--text-muted))] opacity-30" />
              <p className="text-[rgb(var(--text-muted))]">No meals logged today</p>
              <button onClick={() => setModal("meal")} className="mt-3 text-green-400 text-sm font-medium hover:text-green-300">
                Add your first meal →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Modal open={modal === "meal"} onClose={() => setModal(null)} title="Log a Meal">
        <AddMealForm onSubmit={handleAddMeal} loading={actionLoading} />
      </Modal>
      <Modal open={modal === "targets"} onClose={() => setModal(null)} title="Daily Nutrition Targets">
        <SetTargetsForm currentTarget={target} onSubmit={handleSetTargets} loading={actionLoading} />
      </Modal>
    </div>
  );
}
