"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, Flame } from "lucide-react";

interface ResilienceScoreCardProps {
  score: number;
  streakDays: number;
  weeklyCount: number;
  previousScore?: number;
  className?: string;
}

export function ResilienceScoreCard({
  score,
  streakDays,
  weeklyCount,
  previousScore,
  className,
}: ResilienceScoreCardProps) {
  const scoreDiff = previousScore ? score - previousScore : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#c07850] via-[#b06840] to-[#a05830]",
        "p-6 text-white shadow-elevated",
        className,
      )}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-white/80 mb-1">
              感情耐性スコア
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">{score}</span>
              <span className="text-lg text-white/60">/ 100</span>
            </div>
          </div>

          {previousScore !== undefined && scoreDiff !== 0 && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                scoreDiff > 0
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/80",
              )}
            >
              <TrendingUp
                className={cn("w-3 h-3", scoreDiff < 0 && "rotate-180")}
              />
              {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
            </div>
          )}
        </div>

        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-white/90 to-white/70 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
            <Flame className="w-4 h-4 text-amber-200" />
            <span className="text-sm font-medium">{streakDays}日連続</span>
          </div>
          <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
            <span className="text-sm font-medium">今週 {weeklyCount}件</span>
          </div>
        </div>
      </div>
    </div>
  );
}
