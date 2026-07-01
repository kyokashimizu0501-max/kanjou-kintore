"use client";

import { cn } from "@/lib/utils";
import { EMOTION_TYPES, type EmotionTypeId } from "@/lib/constants";

interface IntensitySelectorProps {
  emotionType: EmotionTypeId;
  selected: number | null;
  onSelect: (intensity: number) => void;
  className?: string;
}

const intensityLabels: Record<number, string> = {
  1: "少し感じる",
  2: "軽く感じる",
  3: "普通に感じる",
  4: "強く感じる",
  5: "非常に強く感じる",
};

export function IntensitySelector({
  emotionType,
  selected,
  onSelect,
  className,
}: IntensitySelectorProps) {
  const config = EMOTION_TYPES.find((e) => e.id === emotionType);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">強度を選択</span>
        <span className={cn("text-sm font-medium", config?.colorClass.text)}>
          {selected ? intensityLabels[selected] : "未選択"}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = selected === level;
          const barHeight = 40 + level * 12;
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className="flex flex-col items-center gap-2 group transition-all duration-200"
            >
              <div
                className={cn(
                  "w-10 rounded-xl transition-all duration-200 flex items-end justify-center pb-2",
                  isSelected
                    ? cn(config?.colorClass.bg, "shadow-md scale-110")
                    : "bg-muted/50 group-hover:bg-muted/80",
                )}
                style={{ height: `${barHeight}px` }}
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-white mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isSelected
                    ? config?.colorClass.text
                    : "text-muted-foreground",
                )}
              >
                {level}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>弱い</span>
        <span>強い</span>
      </div>
    </div>
  );
}
