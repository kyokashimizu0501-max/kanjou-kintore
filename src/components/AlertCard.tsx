"use client";

import { useEffect, useState } from "react";
import { EMOTION_TYPES } from "@/lib/constants";

interface PastLog {
  id: number;
  emotionType: string;
  intensity: number;
  situationTag: string | null;
  occurredAt: string;
  actions: { id: number; actionType: string; actionDetail: string | null }[];
}

interface Strategy {
  id: number;
  strategyName: string;
  successCount: number;
  totalUsed: number;
  isDefault: boolean;
}

interface Props {
  similarLog: PastLog | null;
  similarityScore?: number;
  isFirstUxDemo?: boolean;
  currentLogId: number | null;
  emotionType: string;
  onDone: () => void;
}

export default function AlertCard({
  similarLog,
  similarityScore,
  isFirstUxDemo,
  currentLogId,
  emotionType,
  onDone,
}: Props) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [committed, setCommitted] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"prev" | "trend">("prev");
  const [totalLogs, setTotalLogs] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/coping-strategies?emotionType=${emotionType}`)
      .then((r) => r.json())
      .then(setStrategies);
    fetch("/api/app-state")
      .then((r) => r.json())
      .then((d) => setTotalLogs(d.totalLogs ?? null));
  }, [emotionType]);

  async function commitStrategy(strategyId: number) {
    if (!currentLogId) return;
    await fetch("/api/emotion-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emotionType,
        intensity: 3,
        actions: [{ actionType: "coping_commit" }],
      }),
    }).catch(() => null);

    const logsRes = await fetch("/api/emotion-logs");
    const logs = await logsRes.json();
    const actionId = logs[0]?.actions?.[0]?.id;

    if (actionId) {
      await fetch("/api/coping-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, copingStrategyId: strategyId }),
      });
    }

    setCommitted(strategyId);
  }

  function getBadge(s: Strategy) {
    if (s.successCount > 0)
      return { label: "✨ 前回効果あり", cls: "bg-green-100 text-green-700" };
    if (s.totalUsed > 0)
      return { label: "前回試した方法", cls: "bg-blue-100 text-blue-700" };
    return { label: "新しく試す", cls: "bg-gray-100 text-gray-500" };
  }

  if (committed !== null) {
    const chosen = strategies.find((s) => s.id === committed);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl">
          💪
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">コミットしました！</p>
          <p className="text-sm text-gray-400 mt-1">
            次回起動時に効果を振り返ります
          </p>
        </div>
        <div className="w-full bg-indigo-50 rounded-2xl p-4 text-sm text-indigo-800 font-medium">
          「{chosen?.strategyName}」を試してみましょう
        </div>
        <button
          onClick={onDone}
          className="w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl font-bold"
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* アラートバナー */}
      {isFirstUxDemo ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <p className="text-xs text-indigo-500 font-bold mb-1">
            🎉 はじめての記録
          </p>
          <p className="text-sm text-indigo-800">
            記録が増えると、同じ状況を検知して対応策を提案します。今日から始めましょう！
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs text-amber-600 font-bold mb-1">
            ⚠️ 同じ状況を検知
          </p>
          <p className="text-sm text-amber-800">
            以前も似たような状況がありました（一致度{" "}
            {Math.round((similarityScore ?? 0) * 100)}%）
          </p>
        </div>
      )}

      {/* タブ */}
      {!isFirstUxDemo && similarLog && (
        <>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(["prev", "trend"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {tab === "prev" ? "前回の記録" : "傾向"}
              </button>
            ))}
          </div>

          {activeTab === "prev" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-sm space-y-2">
              <p className="text-gray-400 text-xs">
                {new Date(similarLog.occurredAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-800 font-medium">
                {
                  EMOTION_TYPES.find((e) => e.id === similarLog.emotionType)
                    ?.emoji
                }{" "}
                強さ {similarLog.intensity}/5
              </p>
              {similarLog.actions.length > 0 && (
                <p className="text-gray-500">
                  行動:{" "}
                  {similarLog.actions
                    .map((a) => a.actionDetail ?? a.actionType)
                    .join("、")}
                </p>
              )}
            </div>
          )}

          {activeTab === "trend" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>傾向分析まで</span>
                <span className="font-bold text-indigo-500">
                  {totalLogs !== null ? `${totalLogs} / 10件` : "…"}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((totalLogs ?? 0) / 10) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                {totalLogs !== null && totalLogs < 10
                  ? `あと ${10 - totalLogs} 件で傾向分析が使えます`
                  : "10件以上の記録が貯まると傾向分析が表示されます"}
              </p>
            </div>
          )}
        </>
      )}

      {/* 対応策リスト */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">対応策を選んでコミット</h3>
        <div className="space-y-2">
          {strategies.slice(0, 5).map((s) => {
            const badge = getBadge(s);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    <p className="text-sm text-gray-800 font-medium">
                      {s.strategyName}
                    </p>
                  </div>
                  <button
                    onClick={() => commitStrategy(s.id)}
                    className="shrink-0 px-4 py-2 bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                  >
                    試す
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 text-sm text-gray-400 active:text-gray-600 rounded-2xl"
      >
        スキップしてホームへ
      </button>
    </div>
  );
}
