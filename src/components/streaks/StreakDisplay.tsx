"use client";

import { motion } from "framer-motion";
import { Trophy, Dumbbell, CheckCircle2 } from "lucide-react";
import { IStreakData } from "@/types";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

interface StreakDisplayProps {
  streaks: IStreakData;
}

export function StreakDisplay({ streaks }: StreakDisplayProps) {
  const { gymStreak, gymBestStreak, dailyStreak, dailyBestStreak, last14Days } = streaks;
  const showFire = gymStreak > 4 || dailyStreak > 4;

  return (
    <div className="space-y-5">
      {/* Streak counters */}
      <div className="grid grid-cols-2 gap-4">
        <StreakCounter
          label="Gym Streak"
          value={gymStreak}
          best={gymBestStreak}
          icon={<Dumbbell size={16} />}
          fire={gymStreak > 4}
          color="from-orange-500 to-red-500"
        />
        <StreakCounter
          label="Daily Streak"
          value={dailyStreak}
          best={dailyBestStreak}
          icon={<CheckCircle2 size={16} />}
          fire={dailyStreak > 4}
          color="from-green-500 to-emerald-400"
        />
      </div>

      {/* 14-day row */}
      <div>
        <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider font-medium mb-3">Last 14 Days</p>
        <div className="grid grid-cols-14 gap-1" style={{ display: "flex", gap: "4px" }}>
          {last14Days.map((day, i) => {
            const isToday = day.date === dayjs().format("YYYY-MM-DD");
            const dayLabel = dayjs(day.date).format("dd")[0];
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[9px] text-[rgb(var(--text-muted))] font-medium">{dayLabel}</span>
                <div className={cn(
                  "w-full aspect-square rounded-md transition-all duration-300",
                  day.completed
                    ? "bg-green-500 shadow-sm"
                    : day.gymDone || day.mealsLogged || day.sleepLogged
                    ? "bg-green-500/30"
                    : "bg-[rgb(var(--border-glass))]/30",
                  isToday ? "ring-2 ring-green-400/60" : ""
                )}
                style={day.completed ? { boxShadow: "0 0 8px rgba(34,197,94,0.4)" } : {}}
                />
              </motion.div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
            <span className="text-[10px] text-[rgb(var(--text-muted))]">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500/30" />
            <span className="text-[10px] text-[rgb(var(--text-muted))]">Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[rgb(var(--border-glass))]/30" />
            <span className="text-[10px] text-[rgb(var(--text-muted))]">Missed</span>
          </div>
        </div>
      </div>

      {/* Fire effect for high streaks */}
      {showFire && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20"
        >
          <span className="fire-icon text-2xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-orange-400">You&apos;re on fire!</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">
              {gymStreak > 4 ? `${gymStreak}-day gym` : ""}{gymStreak > 4 && dailyStreak > 4 ? " & " : ""}
              {dailyStreak > 4 ? `${dailyStreak}-day completion` : ""} streak
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface StreakCounterProps {
  label: string;
  value: number;
  best: number;
  icon: React.ReactNode;
  fire: boolean;
  color: string;
}

function StreakCounter({ label, value, best, icon, fire, color }: StreakCounterProps) {
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))] font-medium">
          {icon}
          {label}
        </div>
        {fire && <span className="fire-icon">🔥</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("text-3xl font-display font-black bg-gradient-to-br bg-clip-text text-transparent", color)}
        >
          {value}
        </motion.span>
        <span className="text-sm text-[rgb(var(--text-muted))]">days</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
        <Trophy size={11} />
        <span>Best: {best}</span>
      </div>
    </div>
  );
}

// Confetti hook
export function useConfetti() {
  const triggerConfetti = async () => {
    if (typeof window === "undefined") return;
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#4ade80", "#86efac", "#f97316", "#fb923c"],
      });
    } catch {}
  };
  return { triggerConfetti };
}
