"use client";

import { cn } from "@/lib/utils";

interface TagOption {
  id: string;
  label: string;
  emoji?: string;
}

interface TagSelectorProps {
  options: readonly TagOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  trailing?: React.ReactNode;
  className?: string;
}

export function TagSelector({
  options,
  selectedIds,
  onToggle,
  trailing,
  className,
}: TagSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
              "text-sm font-medium transition-all duration-200 border-2",
              selected
                ? "bg-primary border-primary text-white shadow-soft scale-[1.02]"
                : "bg-white border-[#e8e4dc] text-foreground hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            {option.emoji && <span>{option.emoji}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
      {trailing}
    </div>
  );
}
