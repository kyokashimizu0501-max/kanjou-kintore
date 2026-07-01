"use client";

import { useEffect, useState } from "react";
import { EMOTION_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Lightbulb, Sparkles, Check } from "lucide-react";

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
      return {
        label: "✨ 前回効果あり",
        cls: "bg-emerald-50 text-emerald-700",
      };
    if (s.totalUsed > 0)
      return { label: "前回試した方法", cls: "bg-blue-50 text-blue-700" };
    return { label: "新しく試す", cls: "bg-muted text-muted-foreground" };
  }

  if (committed !== null) {
    const chosen = strategies.find((s) => s.id === committed);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-[#c9a882] shadow-elevated">
          <Check className="w-9 h-9 text-white" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">
            コミットしました！
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            次回起動時に効果を振り返ります
          </p>
        </div>
        <div className="w-full bg-white rounded-2xl p-4 text-sm text-foreground/80 font-medium shadow-card border border-[#f0ebe3]">
          「{chosen?.strategyName}」を試してみましょう
        </div>
        <button
          onClick={onDone}
          className="w-full py-4 bg-gradient-to-r from-primary via-[#c9a882] to-primary text-white rounded-2xl font-bold shadow-elevated active:scale-[0.98] transition-all"
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* アラートバナー */}
      {isFirstUxDemo ? (
        <div className="bg-white rounded-2xl border border-[#f0ebe3] p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-bold mb-1">
                はじめての記録
              </p>
              <p className="text-sm text-foreground/80">
                記録が増えると、同じ状況を検知して対応策を提案します。今日から始めましょう！
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-bold mb-1">
                同じ状況を検知
              </p>
              <p className="text-sm text-amber-800">
                以前も似たような状況がありました（一致度{" "}
                {Math.round((similarityScore ?? 0) * 100)}%）
              </p>
            </div>
          </div>
        </div>
      )}

      {/* タブ */}
      {!isFirstUxDemo && similarLog && (
        <>
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {(["prev", "trend"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {tab === "prev" ? "前回の記録" : "傾向"}
              </button>
            ))}
          </div>

          {activeTab === "prev" && (
            <div className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-4 text-sm space-y-2">
              <p className="text-muted-foreground text-xs">
                {new Date(similarLog.occurredAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-foreground font-medium">
                {
                  EMOTION_TYPES.find((e) => e.id === similarLog.emotionType)
                    ?.emoji
                }{" "}
                強さ {similarLog.intensity}/5
              </p>
              {similarLog.actions.length > 0 && (
                <p className="text-muted-foreground">
                  行動:{" "}
                  {similarLog.actions
                    .map((a) => a.actionDetail ?? a.actionType)
                    .join("、")}
                </p>
              )}
            </div>
          )}

          {activeTab === "trend" && (
            <div className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-5 space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>傾向分析まで</span>
                <span className="font-bold text-primary">
                  {totalLogs !== null ? `${totalLogs} / 10件` : "…"}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((totalLogs ?? 0) / 10) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
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
        <h3 className="font-bold text-foreground mb-3">
          対応策を選んでコミット
        </h3>
        <div className="space-y-2">
          {strategies.slice(0, 5).map((s) => {
            const badge = getBadge(s);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium",
                        badge.cls,
                      )}
                    >
                      {badge.label}
                    </span>
                    <p className="text-sm text-foreground font-medium">
                      {s.strategyName}
                    </p>
                  </div>
                  <button
                    onClick={() => commitStrategy(s.id)}
                    className="shrink-0 px-4 py-2 bg-primary active:bg-primary/90 text-white text-xs font-bold rounded-xl"
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
        className="w-full py-3.5 text-sm text-muted-foreground active:text-foreground rounded-2xl"
      >
        スキップしてホームへ
      </button>
    </div>
  );
}
