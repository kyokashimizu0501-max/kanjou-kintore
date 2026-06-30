"use client";

import { useEffect, useState } from "react";

interface Strategy {
  id: number;
  strategyName: string;
  successCount: number;
  totalUsed: number;
}

interface Props {
  emotionType: string;
  emotionEmoji: string;
  onCommit: (strategyName: string) => void;
  onSkip: () => void;
}

export default function QuickCommit({
  emotionType,
  emotionEmoji,
  onCommit,
  onSkip,
}: Props) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    fetch(`/api/coping-strategies?emotionType=${emotionType}`)
      .then((r) => r.json())
      .then(setStrategies);
  }, [emotionType]);

  async function handleCommit(strategy: Strategy) {
    setCommitting(true);
    // coping_commit アクション付きのログを作成してコミットIDを得る
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
        body: JSON.stringify({ actionId, copingStrategyId: strategy.id }),
      });
    }

    setCommitting(false);
    onCommit(strategy.strategyName);
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">
          ✅
        </div>
        <p className="text-lg font-bold text-gray-900">記録しました！</p>
        <p className="text-sm text-gray-400">
          {emotionEmoji} の気持ちに、今からどう向き合いますか？
        </p>
      </div>

      {/* 対応策リスト */}
      <div className="space-y-2">
        {strategies.slice(0, 4).map((s) => (
          <button
            key={s.id}
            onClick={() => handleCommit(s)}
            disabled={committing}
            className="w-full bg-white rounded-2xl border border-gray-100 px-4 py-4 flex items-center justify-between gap-3 active:bg-indigo-50 active:border-indigo-200 transition-colors disabled:opacity-50"
          >
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {s.strategyName}
              </p>
              {s.successCount > 0 && (
                <p className="text-xs text-green-600 mt-0.5">✨ 前回効果あり</p>
              )}
            </div>
            <span className="text-xs font-bold text-indigo-600 shrink-0">
              試す →
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        disabled={committing}
        className="w-full py-3.5 text-sm text-gray-400 active:text-gray-600 rounded-2xl"
      >
        スキップしてホームへ
      </button>
    </div>
  );
}
