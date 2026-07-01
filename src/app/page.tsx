"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITUATION_TAGS } from "@/lib/constants";
import { ResilienceScoreCard } from "@/components/emotion/ResilienceScoreCard";
import { EmotionCard } from "@/components/emotion/EmotionCard";
import { PenLine, Target, ChevronRight } from "lucide-react";

interface Log {
  id: number;
  emotionType: string;
  intensity: number;
  eventText: string | null;
  situationTag: string | null;
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

function situationLabels(situationTag: string | null): string[] {
  if (!situationTag) return [];
  return situationTag
    .split(",")
    .map((id) => SITUATION_TAGS.find((t) => t.id === id)?.label ?? id);
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
    ])
      .then(([logsData, evalData, scoreData, profileData]) => {
        if (!profileData || profileData.error) {
          setLoading(false);
          return;
        }
        if (!profileData.onboardingCompleted) {
          router.replace("/onboarding");
          return;
        }
        setLogs(logsData ?? []);
        setPendingEval(evalData);
        setResilienceScore(scoreData?.score ?? 0);
        setGoal(profileData.goal ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground text-sm">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-fade-in">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">感情筋トレ</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            今日の感情を記録して、耐性を育てよう
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("ja-JP", {
            month: "long",
            day: "numeric",
          })}
        </span>
      </header>

      <ResilienceScoreCard
        score={resilienceScore ?? 0}
        streakDays={streak}
        weeklyCount={weekCount}
      />

      {goal && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span className="font-medium">今の目標</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-card border border-[#f0ebe3]">
            <p className="text-sm text-foreground font-medium leading-snug">
              {goal}
            </p>
          </div>
        </section>
      )}

      {pendingEval && !evalDone && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-600 mb-1">
            前回の対応策、どうでしたか？
          </p>
          <p className="text-sm text-foreground mb-3 font-medium">
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
            className="mt-2 text-xs text-muted-foreground w-full text-center py-1"
          >
            スキップ
          </button>
        </div>
      )}
      {evalDone && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-emerald-700">
            ✓ 評価を記録しました
          </p>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            直近の感情
          </h2>
          {logs.length > 4 && (
            <Link
              href="/history"
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              もっと見る <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {hasData ? (
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <EmotionCard
                key={log.id}
                emotionType={log.emotionType}
                intensity={log.intensity}
                eventText={log.eventText}
                occurredAt={log.occurredAt}
                situationLabels={situationLabels(log.situationTag)}
                className="animate-fade-in"
                style={
                  { animationDelay: `${index * 80}ms` } as React.CSSProperties
                }
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#f0ebe3] shadow-card p-6 text-center space-y-3">
            <p className="text-3xl">🌱</p>
            <p className="font-semibold text-foreground">
              最初の記録をしましょう
            </p>
            <p className="text-sm text-muted-foreground">
              記録を重ねるとスコアが育ちます
            </p>
          </div>
        )}
      </section>

      <div className="h-16" />

      <Link
        href="/record"
        className="fixed bottom-24 right-4 left-4 max-w-[358px] mx-auto"
      >
        <button className="w-full py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-primary via-[#c9a882] to-primary text-white shadow-elevated transition-all duration-200 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
          <PenLine className="w-5 h-5" />
          感情を記録する
        </button>
      </Link>
    </div>
  );
}
