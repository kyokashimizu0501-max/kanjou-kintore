"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  EMOTION_TYPES,
  SITUATION_TAGS,
  POST_ACTIONS,
  INTENSITY_LABELS,
} from "@/lib/constants";

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
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中…</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col min-h-full bg-[#F8F8F9]">
        <header className="bg-white px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-500 text-lg"
          >
            ←
          </button>
          <span className="font-semibold text-gray-800">記録詳細</span>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">記録が見つかりません</p>
        </div>
      </div>
    );
  }

  const emotion = EMOTION_TYPES.find((e) => e.id === log.emotionType);
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
        .map((id) => SITUATION_TAGS.find((t) => t.id === id)?.label ?? id)
    : [];

  const colorMap: Record<string, string> = {
    anger: "bg-red-100 border-red-200 text-red-700",
    sadness: "bg-blue-100 border-blue-200 text-blue-700",
    anxiety: "bg-yellow-100 border-yellow-200 text-yellow-700",
    joy: "bg-green-100 border-green-200 text-green-700",
  };

  const barColor: Record<string, string> = {
    anger: "bg-red-400",
    sadness: "bg-blue-400",
    anxiety: "bg-yellow-400",
    joy: "bg-green-400",
  };

  const effectLabels: Record<number, string> = {
    1: "なし",
    2: "まあまあ",
    3: "あり",
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8F8F9]">
      <header className="bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-500 text-lg"
          >
            ←
          </button>
          <span className="font-semibold text-gray-800 flex-1">記録詳細</span>
          <span className="text-xs text-gray-400">#{log.id}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 space-y-4">
        {/* 日時 + 感情ヘッダー */}
        <div
          className={`rounded-2xl border p-5 ${colorMap[log.emotionType] ?? "bg-gray-100 border-gray-200 text-gray-700"}`}
        >
          <p className="text-xs opacity-70 mb-2">
            {dateStr} {timeStr}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{emotion?.emoji}</span>
            <div>
              <p className="text-lg font-bold">{emotion?.label}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-5 h-2 rounded-full ${n <= log.intensity ? (barColor[log.emotionType] ?? "bg-indigo-400") : "bg-white/40"}`}
                  />
                ))}
                <span className="text-xs ml-1 opacity-70">
                  強さ {log.intensity}/5 — {INTENSITY_LABELS[log.intensity]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 状況タグ */}
        {situationLabels.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-2">状況</p>
            <div className="flex flex-wrap gap-2">
              {situationLabels.map((label, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 出来事テキスト */}
        {log.eventText && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-2">出来事</p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {log.eventText}
            </p>
          </div>
        )}

        {/* 行動 */}
        {log.actions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-3">行動</p>
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
                    <span className="text-sm text-gray-700">{label}</span>
                    {action.effectivenessScore && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          action.effectivenessScore === 3
                            ? "bg-green-100 text-green-700"
                            : action.effectivenessScore === 2
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
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
          className="block w-full py-3.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-2xl text-sm font-semibold text-center"
        >
          履歴一覧へ戻る
        </Link>
      </main>
    </div>
  );
}
