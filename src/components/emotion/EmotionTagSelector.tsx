"use client";

import { cn } from "@/lib/utils";
import { EMOTION_TYPES, type EmotionTypeId } from "@/lib/constants";

interface EmotionTagSelectorProps {
  selected: EmotionTypeId | null;
  onSelect: (emotion: EmotionTypeId) => void;
  className?: string;
}

export function EmotionTagSelector({
  selected,
  onSelect,
  className,
}: EmotionTagSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {EMOTION_TYPES.map((emotion) => {
        const isSelected = selected === emotion.id;
        return (
          <button
            key={emotion.id}
            onClick={() => onSelect(emotion.id)}
            className={cn(
              "relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-200",
              "border-2",
              isSelected
                ? cn(
                    emotion.colorClass.light,
                    emotion.colorClass.border,
                    "shadow-soft scale-[1.02]",
                  )
                : "bg-white border-[#e8e4dc] hover:border-[#d8d4cc] hover:bg-[#f9f7f3]",
            )}
          >
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all duration-200",
                isSelected
                  ? cn(emotion.colorClass.bg, "text-white shadow-md")
                  : "bg-muted/30",
              )}
            >
              {emotion.emoji}
            </div>
            <div className="text-left">
              <p
                className={cn(
                  "font-semibold text-base transition-colors",
                  isSelected ? emotion.colorClass.text : "text-foreground",
                )}
              >
                {emotion.label}
              </p>
            </div>
            {isSelected && (
              <div
                className={cn(
                  "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center",
                  emotion.colorClass.bg,
                )}
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
