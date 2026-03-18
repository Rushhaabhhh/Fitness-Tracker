"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ProfileSchema, ProfileInput } from "@/lib/validations";
import { IUser } from "@/types";
import { Card, Input, Select, Skeleton, SectionHeader, Badge } from "@/components/ui";
import { GamificationWidget } from "@/components/profile/GamificationWidget";
import { Loader2, User, Ruler, Scale, Activity, Check } from "lucide-react";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "light", label: "Light (1-3 days/week)" },
  { value: "moderate", label: "Moderate (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very_active", label: "Very Active (hard daily exercise)" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { name: "", email: "" },
  });

  const weight = watch("weight");
  const height = watch("height");
  const bmi = weight && height ? parseFloat((Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)) : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"
    : null;

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setUser(json.data);
          const { name, email, profile } = json.data;
          reset({
            name: name || "",
            email: email || "",
            age: profile?.age ?? undefined,
            sex: profile?.sex ?? undefined,
            height: profile?.height ?? undefined,
            weight: profile?.weight ?? undefined,
            goalWeight: profile?.goalWeight ?? undefined,
            bodyFat: profile?.bodyFat ?? undefined,
            activityLevel: profile?.activityLevel ?? undefined,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-40 rounded-xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader
        title="Profile"
        subtitle="Manage your personal information and body metrics"
      />

      {/* Avatar / Summary */}
      <Card delay={0.05}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 flex items-center justify-center text-2xl font-display font-black text-green-400 border border-green-500/20">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[rgb(var(--text-primary))]">{user?.name}</h3>
            <p className="text-sm text-[rgb(var(--text-muted))]">{user?.email}</p>
            <div className="flex gap-2 mt-1.5">
              {user?.profile?.bmi && (
                <Badge variant={
                  user.profile.bmiCategory === "Normal" ? "green" :
                  user.profile.bmiCategory === "Overweight" || user.profile.bmiCategory === "Obese" ? "orange" : "blue"
                }>
                  BMI {user.profile.bmi} · {user.profile.bmiCategory}
                </Badge>
              )}
              {user?.profile?.activityLevel && (
                <Badge variant="gray">{user.profile.activityLevel}</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Gamification */}
      {user && (
        <GamificationWidget
          xp={user.xp || 0}
          level={user.level || 1}
          unlockedBadges={user.badges || []}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <Card delay={0.1} animate>
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-green-400" />
            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Basic Info</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Jane Doe" {...register("name")} error={errors.name?.message} />
            <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
            <Input label="Age" type="number" min="10" max="120" placeholder="25" {...register("age")} error={errors.age?.message} />
            <Select label="Sex" options={SEX_OPTIONS} {...register("sex")} error={errors.sex?.message} />
          </div>
        </Card>

        {/* Body Metrics */}
        <Card delay={0.15} animate>
          <div className="flex items-center gap-2 mb-4">
            <Ruler size={16} className="text-blue-400" />
            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Body Metrics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Height (cm)" type="number" min="50" max="300" placeholder="170" {...register("height")} error={errors.height?.message} />
            <Input label="Weight (kg)" type="number" min="20" max="500" step="0.1" placeholder="70" {...register("weight")} error={errors.weight?.message} />
            <Input label="Goal Weight (kg)" type="number" min="20" max="500" step="0.1" placeholder="65" {...register("goalWeight")} error={errors.goalWeight?.message} />
            <Input label="Body Fat %" type="number" min="1" max="70" step="0.1" placeholder="18" {...register("bodyFat")} error={errors.bodyFat?.message} />
          </div>

          {/* Live BMI Preview */}
          {bmi && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-[rgb(var(--brand-dim))] border border-green-500/15 flex items-center gap-3"
            >
              <Scale size={16} className="text-green-400" />
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Calculated BMI</p>
                <p className="font-display font-bold text-lg text-[rgb(var(--text-primary))]">
                  {bmi} <span className="text-sm font-normal text-green-400">· {bmiCategory}</span>
                </p>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Activity */}
        <Card delay={0.2} animate>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-orange-400" />
            <h3 className="font-display font-semibold text-[rgb(var(--text-primary))]">Activity Level</h3>
          </div>
          <Select
            label="Activity Level"
            options={ACTIVITY_OPTIONS}
            {...register("activityLevel")}
            error={errors.activityLevel?.message}
          />
          <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
            Used to estimate your daily calorie needs.
          </p>
        </Card>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${saved ? "bg-emerald-500" : ""}`}
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check size={16} /> Saved!</>
          ) : (
            "Save Profile"
          )}
        </motion.button>
      </form>
    </div>
  );
}
