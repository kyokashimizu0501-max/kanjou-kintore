"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EMOTION_TYPES } from "@/lib/constants";

interface Log {
  id: number;
  emotionType: string;
  intensity: number;
  occurredAt: string;
}

interface PendingEval {
  id: number;
  copingStrategy: { strategyName: string };
}

function calcStreak(logs: Log[]): number {
  if (logs.length === 0) return 0;
  const days = new Set(
    logs.map((l) => new Date(l.occurredAt).toLocaleDateString("ja-JP")),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toLocaleDateString("ja-JP"))) streak++;
    else break;
  }
  return streak;
}

function calcWeekCount(logs: Log[]): number {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return logs.filter((l) => new Date(l.occurredAt) >= monday).length;
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(date, today)) return "今日";
  if (same(date, yesterday)) return "昨日";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [pendingEval, setPendingEval] = useState<PendingEval | null>(null);
  const [evalDone, setEvalDone] = useState(false);
  const [resilienceScore, setResilienceScore] = useState<number | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/emotion-logs").then((r) => r.json()),
      fetch("/api/pending-evaluation").then((r) => r.json()),
      fetch("/api/resilience-score").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([logsData, evalData, scoreData, profileData]) => {
      // オンボーディング未完了なら /onboarding へ
      if (!profileData.onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }
      setLogs(logsData);
      setPendingEval(evalData);
      setResilienceScore(scoreData.score);
      setGoal(profileData.goal ?? null);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitEval(score: number) {
    if (!pendingEval) return;
    await fetch("/api/coping-commit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commitId: pendingEval.id, effectScore: score }),
    });
    setEvalDone(true);
    setPendingEval(null);
    // スコアを再取得
    fetch("/api/resilience-score")
      .then((r) => r.json())
      .then((d) => setResilienceScore(d.score));
  }

  const streak = calcStreak(logs);
  const weekCount = calcWeekCount(logs);
  const recentLogs = logs.slice(0, 4);
  const hasData = logs.length > 0;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-4 space-y-4">
      {/* タイトル行 */}
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          感情筋トレ
        </h1>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString("ja-JP", {
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* 目標 */}
      {goal && (
        <div className="bg-indigo-50 rounded-2xl px-4 py-3">
          <p className="text-xs text-indigo-400 mb-0.5">今の目標</p>
          <p className="text-sm text-indigo-800 font-medium leading-snug">
            {goal}
          </p>
        </div>
      )}

      {/* 評価バナー */}
      {pendingEval && !evalDone && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-600 mb-1">
            前回の対応策、どうでしたか？
          </p>
          <p className="text-sm text-gray-800 mb-3 font-medium">
            「{pendingEval.copingStrategy.strategyName}」
          </p>
          <div className="flex gap-2">
            {[
              { score: 3, label: "効いた 👍" },
              { score: 2, label: "まあまあ" },
              { score: 1, label: "効かなかった" },
            ].map((opt) => (
              <button
                key={opt.score}
                onClick={() => submitEval(opt.score)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white border border-amber-200 active:bg-amber-100 text-amber-800"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPendingEval(null)}
            className="mt-2 text-xs text-gray-400 w-full text-center py-1"
          >
            スキップ
          </button>
        </div>
      )}
      {evalDone && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-green-700">
            ✓ 評価を記録しました
          </p>
        </div>
      )}

      {/* 感情耐性スコア */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs text-gray-400 mb-2">感情耐性スコア</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold text-indigo-600 leading-none">
            {resilienceScore ?? 0}
          </span>
          <span className="text-lg text-gray-400 pb-1">点</span>
          <span className="text-xs text-gray-400 pb-1.5">/ 100</span>
        </div>
        <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-indigo-400 transition-all"
            style={{ width: `${resilienceScore ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {hasData
            ? "intensity3以上の場面でうまく対処できた割合"
            : "記録を重ねるとスコアが算出されます"}
        </p>
      </div>

      {/* ステータスカード 2列 */}
      {hasData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">連続記録</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-indigo-600">
                {streak}
              </span>
              <span className="text-sm text-gray-500 pb-0.5">日</span>
              {streak >= 3 && <span className="text-lg pb-0.5">🔥</span>}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">今週の記録</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-indigo-600">
                {weekCount}
              </span>
              <span className="text-sm text-gray-500 pb-0.5">件</span>
            </div>
          </div>
        </div>
      )}

      {/* 直近の感情（縦リスト） */}
      {hasData && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-3">直近の感情</p>
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const emotion = EMOTION_TYPES.find(
                (e) => e.id === log.emotionType,
              );
              const colorMap: Record<string, string> = {
                anger: "bg-red-400",
                sadness: "bg-blue-400",
                anxiety: "bg-yellow-400",
                joy: "bg-green-400",
              };
              return (
                <div key={log.id} className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">{emotion?.emoji}</span>
                  <div className="shrink-0 w-16">
                    <p className="text-xs font-semibold text-gray-700 leading-tight">
                      {relativeDate(log.occurredAt)}
                    </p>
                    <p className="text-xs text-gray-400 leading-tight">
                      {formatTime(log.occurredAt)}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={`flex-1 h-2 rounded-full ${n <= log.intensity ? (colorMap[log.emotionType] ?? "bg-indigo-400") : "bg-gray-100"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-6 text-right">
                    {log.intensity}/5
                  </span>
                </div>
              );
            })}
          </div>
          {logs.length > 4 && (
            <Link
              href="/history"
              className="mt-4 flex items-center justify-center gap-1 text-xs text-indigo-500 font-semibold py-1"
            >
              もっと見る <span>→</span>
            </Link>
          )}
        </div>
      )}

      {!hasData && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3">
          <p className="text-3xl">🌱</p>
          <p className="font-semibold text-gray-800">最初の記録をしましょう</p>
          <p className="text-sm text-gray-400">
            記録を重ねるとスコアが育ちます
          </p>
        </div>
      )}

      {/* 記録CTA */}
      <Link
        href="/record"
        className="block w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl text-base font-bold text-center shadow-lg shadow-indigo-100 active:scale-[0.98] transition-transform"
      >
        感情を記録する
      </Link>
    </div>
  );
}
