"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { SleepSchema, SleepInput } from "@/lib/validations";
import { ISleepEntry } from "@/types";
import { Select } from "@/components/ui";
import { Loader2, Moon } from "lucide-react";

interface SleepFormProps {
  current: ISleepEntry | null;
  onSubmit: (data: SleepInput) => Promise<void>;
  loading?: boolean;
}

const QUALITY_OPTIONS = [
  { value: "poor", label: "😴 Poor" },
  { value: "fair", label: "😐 Fair" },
  { value: "good", label: "😊 Good" },
  { value: "excellent", label: "🌟 Excellent" },
];

export function SleepForm({ current, onSubmit, loading }: SleepFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SleepInput>({
    resolver: zodResolver(SleepSchema),
    defaultValues: {
      hours: current?.hours ?? 7,
      quality: current?.quality ?? "good",
    },
  });

  const hours = watch("hours");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Hours slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Hours Slept</label>
          <div className="flex items-center gap-1.5 text-2xl font-display font-bold text-green-400">
            <Moon size={18} className="text-blue-400" />
            <span>{Number(hours).toFixed(1)}h</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          {...register("hours")}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(Number(hours) / 12) * 100}%, rgb(var(--border)) ${(Number(hours) / 12) * 100}%, rgb(var(--border)) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-[rgb(var(--text-muted))]">
          <span>0h</span>
          <span>6h (recommended: 7-9h)</span>
          <span>12h</span>
        </div>
        {errors.hours && <p className="text-xs text-red-400">{errors.hours.message}</p>}
      </div>

      {/* Or type */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Or type exact hours</label>
        <input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={hours}
          onChange={(e) => setValue("hours", parseFloat(e.target.value) || 0)}
          className="input-glass w-full"
          placeholder="e.g. 7.5"
        />
      </div>

      <Select
        label="Sleep Quality"
        options={QUALITY_OPTIONS}
        {...register("quality")}
        error={errors.quality?.message}
      />

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Saving..." : "Log Sleep"}
      </motion.button>
    </form>
  );
}
