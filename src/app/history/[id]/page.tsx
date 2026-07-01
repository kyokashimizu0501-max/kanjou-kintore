"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  EMOTION_TYPES,
  SITUATION_TAGS,
  POST_ACTIONS,
  INTENSITY_LABELS,
} from "@/lib/constants";
import { IntensityBar } from "@/components/emotion/IntensityBar";
import { ChevronLeft } from "lucide-react";

interface LogDetail {
  id: number;
  emotionType: string;
  intensity: number;
  situationTag: string | null;
  eventText: string | null;
  occurredAt: string;
  actions: {
    id: number;
    actionType: string;
    actionDetail: string | null;
    isCustomTag: boolean;
    effectivenessScore: number | null;
  }[];
}

const effectLabels: Record<number, string> = {
  1: "なし",
  2: "まあまあ",
  3: "あり",
};

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/emotion-logs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setLog(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm">読み込み中…</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-semibold text-foreground">記録詳細</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">記録が見つかりません</p>
        </div>
      </div>
    );
  }

  const config = EMOTION_TYPES.find((e) => e.id === log.emotionType);
  const dateObj = new Date(log.occurredAt);
  const dateStr = dateObj.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const timeStr = dateObj.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const situationLabels = log.situationTag
    ? log.situationTag
        .split(",")
        .map((sid) => SITUATION_TAGS.find((t) => t.id === sid)?.label ?? sid)
    : [];

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-[#f0ebe3] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-semibold text-foreground flex-1">記録詳細</span>
          <span className="text-xs text-muted-foreground">#{log.id}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 space-y-4">
        <div
          className={cn(
            "rounded-2xl border p-5",
            config?.colorClass.light,
            config?.colorClass.border,
          )}
        >
          <p className="text-xs text-foreground/60 mb-2">
            {dateStr} {timeStr}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{config?.emoji}</span>
            <div>
              <p className={cn("text-lg font-bold", config?.colorClass.text)}>
                {config?.label}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <IntensityBar
                  emotionType={log.emotionType}
                  intensity={log.intensity}
                  size="sm"
                />
                <span className="text-xs text-foreground/60">
                  強さ {log.intensity}/5 — {INTENSITY_LABELS[log.intensity]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {situationLabels.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-4">
            <p className="text-xs text-muted-foreground mb-2">状況</p>
            <div className="flex flex-wrap gap-2">
              {situationLabels.map((label, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-muted rounded-full text-xs text-foreground font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {log.eventText && (
          <div className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-4">
            <p className="text-xs text-muted-foreground mb-2">出来事</p>
            <p className="text-sm text-foreground leading-relaxed">
              {log.eventText}
            </p>
          </div>
        )}

        {log.actions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-4">
            <p className="text-xs text-muted-foreground mb-3">行動</p>
            <div className="space-y-2">
              {log.actions.map((action) => {
                const label = action.isCustomTag
                  ? action.actionDetail
                  : (POST_ACTIONS.find((a) => a.id === action.actionType)
                      ?.label ?? action.actionType);
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">{label}</span>
                    {action.effectivenessScore && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          action.effectivenessScore === 3
                            ? "bg-emerald-100 text-emerald-700"
                            : action.effectivenessScore === 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        効果：{effectLabels[action.effectivenessScore]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Link
          href="/history"
          className="block w-full py-3.5 bg-muted text-foreground/70 rounded-2xl text-sm font-semibold text-center"
        >
          履歴一覧へ戻る
        </Link>
      </main>
    </div>
  );
}
