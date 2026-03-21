"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Input } from "@/components/ui";
import { Plus, Trash2, Play, Square, Timer } from "lucide-react";

interface SetData {
  weight: string;
  reps: string;
}

interface ExerciseData {
  id: string;
  name: string;
  sets: SetData[];
}

export default function WorkoutBuilder({ onSuccess, date }: { onSuccess?: () => void, date?: string }) {
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync offline workouts
  useEffect(() => {
    const syncWorkouts = async () => {
      const offline = JSON.parse(localStorage.getItem('offlineWorkouts') || '[]');
      if (offline.length === 0) return;

      try {
        for (const payload of offline) {
          await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        localStorage.removeItem('offlineWorkouts');
        alert("Offline workouts synced successfully!");
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Failed to sync offline workouts", err);
      }
    };

    window.addEventListener("online", syncWorkouts);
    if (typeof window !== "undefined" && navigator.onLine) {
      syncWorkouts();
    }

    return () => window.removeEventListener("online", syncWorkouts);
  }, [onSuccess]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, startTime]);

  const addExercise = () => {
    setExercises([...exercises, { id: crypto.randomUUID(), name: "", sets: [{ weight: "", reps: "" }] }]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          // pre-fill with previous set data if available
          const lastSet = e.sets[e.sets.length - 1];
          return { ...e, sets: [...e.sets, { weight: lastSet?.weight || "", reps: lastSet?.reps || "" }] };
        }
        return e;
      })
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: "weight" | "reps", value: string) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          const newSets = [...e.sets];
          newSets[setIndex] = { ...newSets[setIndex], [field]: value };
          return { ...e, sets: newSets };
        }
        return e;
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(
      exercises.map((e) => {
        if (e.id === exerciseId) {
          return { ...e, sets: e.sets.filter((_, i) => i !== setIndex) };
        }
        return e;
      })
    );
  };

  const startWorkout = () => {
    if (!workoutName) return alert("Please name your workout!");
    setIsStarted(true);
    setStartTime(new Date());
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) return alert("Please add at least one exercise.");
    
    // Validate empty fields
    for (const ex of exercises) {
      if (!ex.name) return alert("All exercises must have a name.");
      for (const set of ex.sets) {
        if (!set.weight || !set.reps) return alert("All sets must have weight and reps.");
      }
    }

    setIsSubmitting(true);
    const durationMinutes = Math.floor(elapsedSeconds / 60);

    const payload = {
      name: workoutName,
      date,
      duration: durationMinutes,
      exercises: exercises.map((e) => ({
        name: e.name,
        sets: e.sets.map((s) => ({ weight: Number(s.weight), reps: Number(s.reps) })),
      })),
    };

    if (!navigator.onLine) {
      const offline = JSON.parse(localStorage.getItem("offlineWorkouts") || "[]");
      offline.push({ ...payload, date: new Date().toISOString() });
      localStorage.setItem("offlineWorkouts", JSON.stringify(offline));
      
      alert("You are offline. Workout saved locally and will sync when reconnected! 📲");
      
      setIsStarted(false);
      setStartTime(null);
      setElapsedSeconds(0);
      setWorkoutName("");
      setExercises([]);
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      return;
    }

    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      if (data.gamification?.leveledUp) {
        alert(`Leveled Up! You are now Level ${data.gamification.user.level} 🎉`);
      } else {
        alert("Workout saved! +50 XP");
      }

      setIsStarted(false);
      setStartTime(null);
      setElapsedSeconds(0);
      setWorkoutName("");
      setExercises([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save workout";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {isStarted && <Timer className="w-5 h-5 text-emerald-500 animate-pulse" />}
          {isStarted ? formatTime(elapsedSeconds) : "New Workout"}
        </h2>
        
        {isStarted ? (
          <button onClick={finishWorkout} disabled={isSubmitting} className="btn bg-red-500 hover:bg-red-600 text-white flex items-center justify-center">
            <Square className="w-4 h-4 mr-2" /> Finish
          </button>
        ) : (
          <button onClick={startWorkout} className="btn bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center">
            <Play className="w-4 h-4 mr-2" /> Start
          </button>
        )}
      </div>

      <div className="space-y-6">
        {!isStarted && (
          <Input
            placeholder="e.g. Push Day, Full Body 5x5"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            disabled={isStarted}
          />
        )}

        <AnimatePresence>
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50"
            >
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Exercise Name"
                  value={exercise.name}
                  onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                  className="font-semibold text-lg max-w-[250px]"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-500 w-6">{setIdx + 1}</span>
                    <Input
                      type="number"
                      placeholder="kg"
                      value={set.weight}
                      onChange={(e) => updateSet(exercise.id, setIdx, "weight", e.target.value)}
                      className="w-24 text-center"
                    />
                    <span className="text-zinc-500">×</span>
                    <Input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) => updateSet(exercise.id, setIdx, "reps", e.target.value)}
                      className="w-24 text-center"
                    />
                    {exercise.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(exercise.id, setIdx)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSet(exercise.id)}
                className="btn-ghost flex items-center justify-center mt-4 text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Set
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStarted && (
          <button type="button" onClick={addExercise} className="btn w-full flex items-center justify-center border-dashed border-2 bg-transparent text-[rgb(var(--text-primary))] hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" /> Add Exercise
          </button>
        )}
      </div>
    </Card>
  );
}
