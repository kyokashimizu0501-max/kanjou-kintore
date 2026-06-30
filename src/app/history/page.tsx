"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EMOTION_TYPES, SITUATION_TAGS } from "@/lib/constants";

interface Log {
  id: number;
  emotionType: string;
  intensity: number;
  situationTag: string | null;
  occurredAt: string;
  actions: { id: number; actionType: string; actionDetail: string | null }[];
}

const TREND_THRESHOLD = 10;

const EMOTION_BORDER: Record<string, string> = {
  anger: "border-l-red-400",
  sadness: "border-l-blue-400",
  anxiety: "border-l-yellow-400",
  joy: "border-l-green-400",
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"list" | "trend">("list");

  useEffect(() => {
    fetch("/api/emotion-logs")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  const total = logs.length;
  const progressPct = Math.min((total / TREND_THRESHOLD) * 100, 100);
  const trendUnlocked = total >= TREND_THRESHOLD;

  // 傾向タブ用の集計（10件以上あれば計算）
  const emotionCounts = EMOTION_TYPES.map((e) => ({
    ...e,
    count: logs.filter((l) => l.emotionType === e.id).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col">
      {/* ページタイトル */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold text-gray-900">履歴</h1>
      </div>

      {/* タブ切り替え */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab("list")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "list"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-400"
            }`}
          >
            記録一覧
          </button>
          <button
            onClick={() => setTab("trend")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "trend"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-400"
            }`}
          >
            傾向
            {!trendUnlocked && (
              <span className="ml-1.5 text-xs text-gray-300 font-normal">
                {total}/{TREND_THRESHOLD}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 記録一覧タブ */}
      {tab === "list" && (
        <div className="px-4 pb-4">
          {loading && (
            <p className="text-center text-gray-400 py-16">読み込み中…</p>
          )}

          {!loading && logs.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <p className="text-5xl">📝</p>
              <p className="text-gray-500 font-medium">まだ記録がありません</p>
              <p className="text-sm text-gray-400">
                感情を記録して積み重ねていきましょう
              </p>
              <Link
                href="/record"
                className="inline-block mt-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-semibold"
              >
                最初の記録をする
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {logs.map((log) => {
              const emotion = EMOTION_TYPES.find(
                (e) => e.id === log.emotionType,
              );
              const tags = log.situationTag
                ? log.situationTag
                    .split(",")
                    .map(
                      (id) =>
                        SITUATION_TAGS.find((t) => t.id === id)?.label ?? id,
                    )
                : [];

              return (
                <Link
                  key={log.id}
                  href={`/history/${log.id}`}
                  className={`block bg-white rounded-2xl border-l-4 border border-gray-100 p-4 space-y-2.5 active:opacity-75 ${
                    EMOTION_BORDER[log.emotionType] ?? "border-l-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{emotion?.emoji}</span>
                      <span className="font-semibold text-gray-800">
                        {emotion?.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.occurredAt).toLocaleDateString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">強さ</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`w-5 h-2 rounded-full ${n <= log.intensity ? "bg-indigo-400" : "bg-gray-100"}`}
                      />
                    ))}
                    <span className="text-xs text-indigo-500 font-semibold ml-1">
                      {log.intensity}/5
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.actions.length > 0 && (
                    <p className="text-xs text-gray-400">
                      行動:{" "}
                      {log.actions
                        .slice(0, 3)
                        .map((a) => a.actionDetail ?? a.actionType)
                        .join("、")}
                      {log.actions.length > 3 && "…"}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 傾向タブ */}
      {tab === "trend" && (
        <div className="px-4 pb-4 space-y-4">
          {/* 進捗カード（10件達成で非表示） */}
          {!trendUnlocked && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-800">
                  傾向分析まで
                </p>
                <span className="text-sm font-bold text-indigo-500">
                  {total} / {TREND_THRESHOLD} 件
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-indigo-400 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                あと {TREND_THRESHOLD - total} 件で傾向分析が解放されます
              </p>
            </div>
          )}

          {/* 感情の出現回数（10件以上で表示） */}
          {trendUnlocked ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <p className="text-sm font-semibold text-gray-800">
                感情の出現回数
              </p>
              <div className="space-y-2.5">
                {emotionCounts.map((e) => (
                  <div key={e.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        {e.emoji} {e.label}
                      </span>
                      <span className="text-gray-400 font-medium">
                        {e.count}回
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${e.color.split(" ")[0].replace("bg-", "bg-").replace("-100", "-400")}`}
                        style={{
                          width:
                            total > 0 ? `${(e.count / total) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ロック中プレースホルダー */
            <div className="space-y-3">
              {["感情の出現回数", "時間帯の傾向", "強度の推移"].map((label) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between opacity-50"
                >
                  <p className="text-sm font-semibold text-gray-500">{label}</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    🔒 {TREND_THRESHOLD - total}件後
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
