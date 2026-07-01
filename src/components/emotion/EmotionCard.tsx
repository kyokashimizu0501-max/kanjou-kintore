"use client";

import { cn } from "@/lib/utils";
import { EMOTION_TYPES } from "@/lib/constants";
import { IntensityBar } from "./IntensityBar";
import { ChevronRight } from "lucide-react";

interface EmotionCardProps {
  emotionType: string;
  intensity: number;
  eventText?: string | null;
  occurredAt: string;
  situationLabels?: string[];
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function EmotionCard({
  emotionType,
  intensity,
  eventText,
  occurredAt,
  situationLabels,
  className,
  style,
  onClick,
}: EmotionCardProps) {
  const config = EMOTION_TYPES.find((e) => e.id === emotionType);
  const time = new Date(occurredAt).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        "w-full text-left bg-white rounded-2xl p-4 shadow-card transition-all duration-200",
        "hover:shadow-soft hover:-translate-y-0.5 active:scale-[0.98]",
        "border border-[#f0ebe3]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
            config?.colorClass.light,
            "flex-shrink-0",
          )}
        >
          {config?.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className={cn("text-sm font-semibold", config?.colorClass.text)}
              >
                {config?.label}
              </span>
              <IntensityBar
                emotionType={emotionType}
                intensity={intensity}
                size="sm"
              />
            </div>
            <time className="text-xs text-muted-foreground">{time}</time>
          </div>

          {eventText && (
            <p className="text-sm text-foreground/80 truncate mb-2">
              {eventText}
            </p>
          )}

          {situationLabels && situationLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {situationLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {onClick && (
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-2" />
        )}
      </div>
    </button>
  );
}
