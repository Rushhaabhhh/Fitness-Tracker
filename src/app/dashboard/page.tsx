"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, Moon, Target, RefreshCw, CheckCircle, Circle, Utensils } from "lucide-react";
import { IDashboardData } from "@/types";
import { Card, ProgressBar, Modal, Skeleton } from "@/components/ui";
import { StreakDisplay, useConfetti } from "@/components/streaks/StreakDisplay";
import { AddMealForm } from "@/components/nutrition/AddMealForm";
import { SetTargetsForm } from "@/components/nutrition/SetTargetsForm";
import { SleepForm } from "@/components/dashboard/SleepForm";
import { MealCard } from "@/components/nutrition/MealCard";
import { MealInput, NutritionTargetInput, SleepInput } from "@/lib/validations";
import { getGreeting } from "@/lib/utils";
import dayjs from "dayjs";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { triggerConfetti } = useConfetti();
  const [data, setData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"meal" | "targets" | "sleep" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [gymToggling, setGymToggling] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Check completion and trigger confetti
  useEffect(() => {
    if (!data) return;
    const { gym, sleep, meals } = data;
    const isComplete = gym?.done && sleep && meals.length > 0;
    if (isComplete && data.streaks.dailyStreak > 0) {
      const key = `confetti-${data.today}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        setTimeout(() => triggerConfetti(), 500);
      }
    }
  }, [data, triggerConfetti]);

  const handleAddMeal = async (mealData: MealInput) => {
    setActionLoading(true);
    try {
      await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      });
      setModal(null);
      await fetchDashboard();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    await fetch(`/api/nutrition/${mealId}`, { method: "DELETE" });
    await fetchDashboard();
  };

  const handleSetTargets = async (targetData: NutritionTargetInput) => {
    setActionLoading(true);
    try {
      await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetData),
      });
      setModal(null);
      await fetchDashboard();
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogSleep = async (sleepData: SleepInput) => {
    setActionLoading(true);
    try {
      await fetch("/api/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sleepData),
      });
      setModal(null);
      await fetchDashboard();
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleGym = async () => {
    if (!data || gymToggling) return;
    setGymToggling(true);
    try {
      await fetch("/api/gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !data.gym?.done }),
      });
      await fetchDashboard();
    } finally {
      setGymToggling(false);
    }
  };

  const calPct = data?.target ? Math.min((data.totals.calories / data.target.calories) * 100, 100) : 0;
  const isComplete = data ? (data.gym?.done && data.sleep && data.meals.length > 0) : false;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[rgb(var(--text-muted))] font-medium">
            {dayjs().format("dddd, MMMM D")}
          </p>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-[rgb(var(--text-primary))] mt-0.5">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20"
            >
              <CheckCircle size={12} />
              Today completed! 🎉
            </motion.div>
          )}
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2 rounded-xl glass hover:bg-white/10 transition-all text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
        >
          <RefreshCw size={16} />
        </button>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Add Meal", icon: Plus, color: "green", onClick: () => setModal("meal") },
          { label: "Log Sleep", icon: Moon, color: "blue", onClick: () => setModal("sleep") },
          { label: "Set Targets", icon: Target, color: "orange", onClick: () => setModal("targets") },
        ].map(({ label, icon: Icon, color, onClick }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`glass rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all border ${
              color === "green" ? "hover:border-green-500/30 hover:bg-green-500/5" :
              color === "blue" ? "hover:border-blue-500/30 hover:bg-blue-500/5" :
              "hover:border-orange-500/30 hover:bg-orange-500/5"
            } border-[rgb(var(--border-glass))]/20`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              color === "green" ? "bg-green-500/15 text-green-400" :
              color === "blue" ? "bg-blue-500/15 text-blue-400" :
              "bg-orange-500/15 text-orange-400"
            }`}>
              <Icon size={18} />
            </div>
            <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column - Nutrition */}
        <div className="lg:col-span-2 space-y-5">
          {/* Calorie Card */}
          <Card delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <Utensils size={16} className="text-orange-400" />
                </div>
                <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Calories Today</h3>
              </div>
              {data?.target && (
                <span className="text-xs text-[rgb(var(--text-muted))] font-mono">
                  Target: {data.target.calories} kcal
                </span>
              )}
            </div>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-display font-black text-[rgb(var(--text-primary))]">
                {data?.totals.calories ?? 0}
              </span>
              <span className="text-[rgb(var(--text-muted))] mb-1">/ {data?.target?.calories ?? "—"} kcal</span>
              {data?.target && (
                <span className={`ml-auto text-sm font-semibold ${calPct >= 100 ? "text-green-400" : "text-[rgb(var(--text-muted))]"}`}>
                  {Math.round(calPct)}%
                </span>
              )}
            </div>

            <ProgressBar
              value={data?.totals.calories ?? 0}
              max={data?.target?.calories ?? 2000}
              height="h-3"
            />

            {/* Macros */}
            {data?.target && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: "Protein", value: data.totals.protein, target: data.target.protein, color: "from-blue-400 to-cyan-500", unit: "g" },
                  { label: "Carbs", value: data.totals.carbs, target: data.target.carbs, color: "from-yellow-400 to-amber-500", unit: "g" },
                  { label: "Fats", value: data.totals.fats, target: data.target.fats, color: "from-red-400 to-pink-500", unit: "g" },
                ].map(({ label, value, target, color, unit }) => (
                  <div key={label} className="glass rounded-xl p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[rgb(var(--text-muted))] font-medium">{label}</span>
                      <span className="font-mono text-[rgb(var(--text-secondary))]">{Math.round(value)}{unit}</span>
                    </div>
                    <ProgressBar value={value} max={target} height="h-1.5" color={color} />
                    <p className="text-[10px] text-[rgb(var(--text-muted))]">of {target}{unit}</p>
                  </div>
                ))}
              </div>
            )}

            {!data?.target && (
              <div className="mt-4 text-center py-4">
                <p className="text-sm text-[rgb(var(--text-muted))]">No targets set yet.</p>
                <button onClick={() => setModal("targets")} className="text-green-400 text-sm font-medium hover:text-green-300 mt-1">
                  Set daily targets →
                </button>
              </div>
            )}
          </Card>

          {/* Meals List */}
          <Card delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">
                Today&apos;s Meals
                {data && data.meals.length > 0 && (
                  <span className="ml-2 text-xs text-[rgb(var(--text-muted))] font-normal">({data.meals.length})</span>
                )}
              </h3>
              <button onClick={() => setModal("meal")} className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5">
                <Plus size={13} /> Add Meal
              </button>
            </div>
            <AnimatePresence mode="popLayout">
              {data && data.meals.length > 0 ? (
                <div className="space-y-2">
                  {data.meals.map((meal, i) => (
                    <MealCard
                      key={String(meal._id)}
                      meal={meal}
                      index={i}
                      onDelete={() => handleDeleteMeal(String(meal._id))}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center text-[rgb(var(--text-muted))]"
                >
                  <Utensils size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No meals logged today</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Right column - Gym + Sleep + Streaks */}
        <div className="space-y-5">
          {/* Gym Toggle */}
          <Card delay={0.2}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Gym Today</h3>
              <Dumbbell size={18} className="text-[rgb(var(--text-muted))]" />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleGym}
              disabled={gymToggling}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
                data?.gym?.done
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "border border-[rgb(var(--border-glass))]/30 text-[rgb(var(--text-muted))] hover:bg-white/5"
              }`}
              style={data?.gym?.done ? { boxShadow: "0 0 20px rgba(34,197,94,0.15)" } : {}}
            >
              {data?.gym?.done ? (
                <><CheckCircle size={18} /> Gym Done! ✓</>
              ) : (
                <><Circle size={18} /> Mark as Done</>
              )}
            </motion.button>
          </Card>

          {/* Sleep */}
          <Card delay={0.25}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Sleep</h3>
              <Moon size={18} className="text-blue-400" />
            </div>
            {data?.sleep ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-blue-400">{data.sleep.hours}</span>
                  <span className="text-[rgb(var(--text-muted))]">hours</span>
                </div>
                <ProgressBar value={data.sleep.hours} max={9} height="h-2" color="from-blue-400 to-indigo-500" />
                {data.sleep.quality && (
                  <span className="text-xs text-[rgb(var(--text-muted))] capitalize">Quality: {data.sleep.quality}</span>
                )}
                <button onClick={() => setModal("sleep")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Update →
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Moon size={28} className="mx-auto mb-2 opacity-30 text-blue-400" />
                <p className="text-sm text-[rgb(var(--text-muted))] mb-3">No sleep logged</p>
                <button onClick={() => setModal("sleep")} className="btn-ghost text-xs py-1.5 px-3">
                  Log Sleep
                </button>
              </div>
            )}
          </Card>

          {/* Streaks */}
          <Card delay={0.3}>
            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))] mb-4">Streaks</h3>
            {data?.streaks && <StreakDisplay streaks={data.streaks} />}
          </Card>

          {/* Daily completion status */}
          <Card delay={0.35}>
            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))] mb-3">Daily Checklist</h3>
            <div className="space-y-2">
              {[
                { label: "Meals logged", done: (data?.meals.length ?? 0) > 0, count: data?.meals.length },
                { label: "Sleep logged", done: !!data?.sleep },
                { label: "Gym done", done: !!data?.gym?.done },
              ].map(({ label, done, count }) => (
                <div key={label} className="flex items-center gap-3 py-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${done ? "bg-green-500" : "border border-[rgb(var(--border))]"}`}>
                    {done && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm flex-1 ${done ? "text-[rgb(var(--text-primary))]" : "text-[rgb(var(--text-muted))]"}`}>
                    {label}
                  </span>
                  {count !== undefined && <span className="text-xs text-[rgb(var(--text-muted))]">{count}</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal open={modal === "meal"} onClose={() => setModal(null)} title="Add Meal">
        <AddMealForm onSubmit={handleAddMeal} loading={actionLoading} />
      </Modal>
      <Modal open={modal === "targets"} onClose={() => setModal(null)} title="Set Daily Targets">
        <SetTargetsForm currentTarget={data?.target ?? null} onSubmit={handleSetTargets} loading={actionLoading} />
      </Modal>
      <Modal open={modal === "sleep"} onClose={() => setModal(null)} title="Log Sleep">
        <SleepForm current={data?.sleep ?? null} onSubmit={handleLogSleep} loading={actionLoading} />
      </Modal>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
