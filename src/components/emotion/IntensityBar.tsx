"use client";

import { cn } from "@/lib/utils";
import { EMOTION_TYPES } from "@/lib/constants";

interface IntensityBarProps {
  emotionType: string;
  intensity: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { height: "h-2", gap: "gap-0.5" },
  md: { height: "h-3", gap: "gap-1" },
  lg: { height: "h-4", gap: "gap-1.5" },
};

export function IntensityBar({
  emotionType,
  intensity,
  showLabel = false,
  size = "md",
}: IntensityBarProps) {
  const config = EMOTION_TYPES.find((e) => e.id === emotionType);
  const { height, gap } = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium">
          強度 {intensity}
        </span>
      )}
      <div className={cn("flex items-end", gap)}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "w-2 rounded-full transition-all duration-300",
              height,
              level <= intensity
                ? cn(config?.colorClass.bg, "shadow-sm")
                : "bg-muted/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
