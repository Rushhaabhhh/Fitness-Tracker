"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine
} from "recharts";
import { IHistoryDay } from "@/types";
import { Card, Skeleton, Badge, SectionHeader } from "@/components/ui";
import { CheckCircle2, XCircle, Dumbbell, Moon, Utensils, TrendingUp } from "lucide-react";
import dayjs from "dayjs";

type FilterType = "week" | "month";

export default function HistoryPage() {
  const [data, setData] = useState<IHistoryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("month");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = filter === "week" ? data.slice(-7) : data;

  const gymDays = filtered.filter((d) => d.gymDone).length;
  const completedDays = filtered.filter((d) => d.completed).length;
  const avgSleep = filtered.filter((d) => d.sleepHours > 0).reduce((a, b) => a + b.sleepHours, 0) /
    Math.max(1, filtered.filter((d) => d.sleepHours > 0).length);
  const avgCalories = filtered.filter((d) => d.calories > 0).reduce((a, b) => a + b.calories, 0) /
    Math.max(1, filtered.filter((d) => d.calories > 0).length);

  const chartData = filtered.map((d) => ({
    date: dayjs(d.date).format(filter === "week" ? "ddd" : "M/D"),
    calories: d.calories,
    target: d.target,
    sleep: d.sleepHours,
    gym: d.gymDone ? 1 : 0,
    completed: d.completed,
  }));

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="History"
        subtitle="Your fitness journey over time"
        action={
          <div className="flex gap-1 glass rounded-xl p-1">
            {(["week", "month"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-green-500/20 text-green-400"
                    : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                }`}
              >
                {f === "week" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Gym Days",
            value: gymDays,
            sub: `of ${filtered.length}`,
            icon: <Dumbbell size={18} className="text-orange-400" />,
            bg: "bg-orange-500/10",
          },
          {
            label: "Completed Days",
            value: completedDays,
            sub: `${Math.round((completedDays / Math.max(1, filtered.length)) * 100)}% rate`,
            icon: <CheckCircle2 size={18} className="text-green-400" />,
            bg: "bg-green-500/10",
          },
          {
            label: "Avg Sleep",
            value: avgSleep.toFixed(1),
            sub: "hours per night",
            icon: <Moon size={18} className="text-blue-400" />,
            bg: "bg-blue-500/10",
          },
          {
            label: "Avg Calories",
            value: Math.round(avgCalories),
            sub: "kcal per day",
            icon: <Utensils size={18} className="text-yellow-400" />,
            bg: "bg-yellow-500/10",
          },
        ].map(({ label, value, sub, icon, bg }, i) => (
          <Card key={label} delay={0.05 + i * 0.05}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              {icon}
            </div>
            <p className="text-xs text-[rgb(var(--text-muted))] font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-display font-black text-[rgb(var(--text-primary))] mt-0.5">{value}</p>
            <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Calorie Trend Chart */}
      <Card delay={0.25}>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-green-400" />
          <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Calorie Trend</h3>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "rgb(var(--surface))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "rgb(var(--text-primary))", fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="target" stroke="#f97316" strokeWidth={1.5} fill="url(#targetGrad)" strokeDasharray="4 4" name="Target" />
              <Area type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} fill="url(#calGrad)" name="Calories" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sleep Chart */}
      <Card delay={0.3}>
        <div className="flex items-center gap-2 mb-5">
          <Moon size={18} className="text-blue-400" />
          <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Sleep Hours</h3>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ background: "rgb(var(--surface))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
              />
              <ReferenceLine y={7} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={9} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Bar dataKey="sleep" fill="#3b82f6" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-[rgb(var(--text-muted))] text-center mt-2">Blue lines = recommended range (7-9 hours)</p>
      </Card>

      {/* History Table */}
      <Card delay={0.35}>
        <h3 className="font-display font-semibold text-[rgb(var(--text-primary))] mb-4">Daily Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-right pb-3 font-medium">Calories</th>
                <th className="text-right pb-3 font-medium">Sleep</th>
                <th className="text-center pb-3 font-medium">Gym</th>
                <th className="text-center pb-3 font-medium">Done</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {[...filtered].reverse().map((day, i) => (
                <motion.tr
                  key={day.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t border-[rgb(var(--border-glass))]/10 hover:bg-white/3 transition-colors"
                >
                  <td className="py-2.5 text-[rgb(var(--text-secondary))]">
                    <span className="font-medium">{dayjs(day.date).format("MMM D")}</span>
                    <span className="text-[rgb(var(--text-muted))] ml-2 text-xs">{dayjs(day.date).format("ddd")}</span>
                  </td>
                  <td className="text-right py-2.5 font-mono text-xs">
                    {day.calories > 0 ? (
                      <span className={day.calories >= day.target * 0.9 && day.calories <= day.target * 1.1 ? "text-green-400" : "text-[rgb(var(--text-secondary))]"}>
                        {Math.round(day.calories)}
                      </span>
                    ) : <span className="text-[rgb(var(--text-muted))]">—</span>}
                  </td>
                  <td className="text-right py-2.5 font-mono text-xs text-[rgb(var(--text-secondary))]">
                    {day.sleepHours > 0 ? `${day.sleepHours}h` : "—"}
                  </td>
                  <td className="text-center py-2.5">
                    {day.gymDone
                      ? <CheckCircle2 size={14} className="text-green-400 mx-auto" />
                      : <XCircle size={14} className="text-[rgb(var(--text-muted))] mx-auto" />}
                  </td>
                  <td className="text-center py-2.5">
                    {day.completed
                      ? <Badge variant="green">✓</Badge>
                      : <span className="text-[rgb(var(--text-muted))] text-xs">—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
