"use client";

import { Card, ProgressBar } from "@/components/ui";
import { BADGES, getLevelTitle } from "@/lib/gamification";
import { Trophy, Star, Shield, Droplets, Droplet, Flame } from "lucide-react";

interface GamificationWidgetProps {
  xp: number;
  level: number;
  unlockedBadges: { id: string; unlockedAt: string | Date }[];
}

export function GamificationWidget({ xp, level, unlockedBadges }: GamificationWidgetProps) {
  // calculate XP needed for next level
  const baseForCurrent = Math.pow(level - 1, 2) * 100;
  const baseForNext = Math.pow(level, 2) * 100;
  
  const xpIntoCurrentLevel = xp - baseForCurrent;
  const xpNeededForNextLevel = baseForNext - baseForCurrent;

  const title = getLevelTitle(level);

  // Map badge icon visually
  const getBadgeIcon = (id: string) => {
    switch (id) {
      case "7_day_warrior": return <Flame className="w-6 h-6 text-orange-400" />;
      case "monthly_maestro": return <Star className="w-6 h-6 text-yellow-400" />;
      case "century_club": return <Trophy className="w-6 h-6 text-yellow-500" />;
      case "shield_chest": return <Shield className="w-6 h-6 text-blue-400" />;
      case "hydro_homie": return <Droplet className="w-6 h-6 text-cyan-400" />;
      case "protein_predator": return <Droplets className="w-6 h-6 text-red-500" />;
      default: return <Trophy className="w-6 h-6 text-zinc-400" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Top Section: Level & XP */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20">
          <span className="text-3xl font-display font-black text-white">{level}</span>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md transform rotate-12">
            Lv
          </div>
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-bold font-display text-[rgb(var(--text-primary))] flex items-center gap-2">
            {title}
            {level >= 30 && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
          </h3>
          <p className="text-sm font-medium text-[rgb(var(--text-muted))]">
            {xp} Total XP
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-[rgb(var(--border))]">
        <div className="flex justify-between text-xs font-semibold text-[rgb(var(--text-secondary))]">
          <span>Level {level}</span>
          <span>Level {level + 1}</span>
        </div>
        <ProgressBar value={xpIntoCurrentLevel} max={xpNeededForNextLevel} height="h-3" color="from-purple-500 to-indigo-500" />
        <p className="text-right text-xs text-[rgb(var(--text-muted))]">
          {Math.round(xpNeededForNextLevel - xpIntoCurrentLevel)} XP to next level
        </p>
      </div>

      {/* Trophy Case */}
      <div>
        <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Trophy Case
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(BADGES).map((badgeConf) => {
            const hasUnlocked = unlockedBadges.find((b) => b.id === badgeConf.id);
            return (
              <div
                key={badgeConf.id}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                  hasUnlocked 
                    ? "bg-gradient-to-b from-[rgb(var(--surface))] to-[rgba(var(--background),0.5)] border border-[rgb(var(--border-glass))] shadow-md"
                    : "opacity-40 grayscale border border-dashed border-[rgb(var(--border))]"
                }`}
              >
                {/* Glow behind unlocked badge */}
                {hasUnlocked && (
                  <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-xl -z-10" />
                )}
                
                <div className="mb-2">
                  {getBadgeIcon(badgeConf.id)}
                </div>
                <span className="text-xs font-bold text-center text-[rgb(var(--text-primary))]">
                  {badgeConf.title}
                </span>
                
                {hasUnlocked && (
                  <span className="text-[10px] text-[rgb(var(--text-muted))] mt-1">
                    {new Date(hasUnlocked.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
