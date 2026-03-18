"use client";

import { Card } from "@/components/ui";
import { BatteryCharging, BatteryFull, BatteryWarning } from "lucide-react";

interface ReadinessWidgetProps {
  score: number;
}

export function ReadinessWidget({ score }: ReadinessWidgetProps) {
  let color = "text-green-500";
  let message = "Prime condition! You're ready to push hard today.";
  let Icon = BatteryFull;

  if (score < 40) {
    color = "text-red-500";
    message = "Your body needs rest. Prioritize recovery and sleep today.";
    Icon = BatteryWarning;
  } else if (score < 70) {
    color = "text-yellow-500";
    message = "Good to go. Maintain a balanced intensity.";
    Icon = BatteryCharging;
  }

  // 96px container (w-24 h-24), center is 48, radius 44
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <Card className="flex flex-col sm:flex-row items-center gap-6 p-6">
      {/* Circular Score */}
      <div className="relative shrink-0 flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className={`${color} opacity-20`}
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="flex flex-col items-center justify-center absolute inset-0">
          <span className={`text-2xl font-black font-display ${color}`}>{score}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold flex items-center gap-2 text-[rgb(var(--text-primary))] font-display">
          <Icon className={`w-5 h-5 ${color}`} />
          Daily Readiness
        </h3>
        <p className="text-sm font-medium text-[rgb(var(--text-secondary))] mt-1">
          {message}
        </p>
        <p className="text-xs text-[rgb(var(--text-muted))] mt-2 opacity-80">
          Powered by your recent sleep, workout volume, and nutrition trends.
        </p>
      </div>
    </Card>
  );
}
