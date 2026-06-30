"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MBTI_QUESTIONS,
  TENDENCY_QUESTIONS,
  suggestGoal,
} from "@/lib/constants";

type Phase = "mbti" | "tendency" | "goal" | "done";

function calcMbti(answers: string[]): string {
  const e = answers.filter((a) => a === "E").length;
  const s = answers.filter((a) => a === "S").length;
  const t = answers.filter((a) => a === "T").length;
  const j = answers.filter((a) => a === "J").length;
  return (
    (e >= 1 ? "E" : "I") +
    (s >= 1 ? "S" : "N") +
    (t >= 1 ? "T" : "F") +
    (j >= 1 ? "J" : "P")
  );
}

function calcTendency(answers: string[]): {
  anger: number;
  sadness: number;
  anxiety: number;
} {
  return {
    anger: answers.filter((a) => a === "anger").length,
    sadness: answers.filter((a) => a === "sadness").length,
    anxiety: answers.filter((a) => a === "anxiety").length,
  };
}

function primaryTendency(t: {
  anger: number;
  sadness: number;
  anxiety: number;
}): string {
  const max = Math.max(t.anger, t.sadness, t.anxiety);
  if (t.anger === max) return "anger";
  if (t.anxiety === max) return "anxiety";
  return "sadness";
}

const MBTI_LABELS: Record<string, string> = {
  INTJ: "建築家",
  INTP: "論理学者",
  ENTJ: "指揮官",
  ENTP: "討論者",
  INFJ: "提唱者",
  INFP: "仲介者",
  ENFJ: "主人公",
  ENFP: "運動家",
  ISTJ: "管理者",
  ISFJ: "擁護者",
  ESTJ: "幹部",
  ESFJ: "領事",
  ISTP: "巨匠",
  ISFP: "冒険家",
  ESTP: "起業家",
  ESFP: "エンターテイナー",
};

const TENDENCY_LABELS: Record<string, string> = {
  anger: "怒り・イライラ",
  sadness: "悲しみ・落ち込み",
  anxiety: "不安・焦り",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("mbti");
  const [mbtiAnswers, setMbtiAnswers] = useState<string[]>([]);
  const [tendencyAnswers, setTendencyAnswers] = useState<string[]>([]);
  const [goalText, setGoalText] = useState("");
  const [saving, setSaving] = useState(false);

  const mbtiStep = mbtiAnswers.length; // 0〜7
  const tendencyStep = tendencyAnswers.length; // 0〜4
  const totalSteps = MBTI_QUESTIONS.length + TENDENCY_QUESTIONS.length + 1; // 8+5+1=14
  const currentStep =
    phase === "mbti"
      ? mbtiStep
      : phase === "tendency"
        ? MBTI_QUESTIONS.length + tendencyStep
        : MBTI_QUESTIONS.length + TENDENCY_QUESTIONS.length;
  const progress = (currentStep / totalSteps) * 100;

  function answerMbti(value: string) {
    const next = [...mbtiAnswers, value];
    setMbtiAnswers(next);
    if (next.length >= MBTI_QUESTIONS.length) {
      setPhase("tendency");
    }
  }

  function answerTendency(value: string) {
    const next = [...tendencyAnswers, value];
    setTendencyAnswers(next);
    if (next.length >= TENDENCY_QUESTIONS.length) {
      const mbti = calcMbti(mbtiAnswers);
      const tendency = calcTendency(next);
      const primary = primaryTendency(tendency);
      setGoalText(suggestGoal(mbti, primary));
      setPhase("goal");
    }
  }

  async function saveAndFinish() {
    setSaving(true);
    const mbti = calcMbti(mbtiAnswers);
    const tendency = calcTendency(tendencyAnswers);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onboardingCompleted: true,
        mbtiType: mbti,
        emotionTendency: tendency,
        goal: goalText.trim(),
      }),
    });
    setSaving(false);
    router.push("/");
  }

  const mbtiType = phase !== "mbti" ? calcMbti(mbtiAnswers) : null;
  const tendency = phase === "goal" ? calcTendency(tendencyAnswers) : null;
  const primary = tendency ? primaryTendency(tendency) : null;

  return (
    <div className="flex flex-col min-h-full bg-[#F8F8F9]">
      {/* プログレスバー */}
      <div className="bg-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">
            はじめましょう
          </span>
          <span className="text-xs text-gray-400">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-4 py-6">
        {/* MBTI診断フェーズ */}
        {phase === "mbti" && mbtiStep < MBTI_QUESTIONS.length && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-indigo-500 font-semibold mb-1">
                MBTI診断 — {mbtiStep + 1} / {MBTI_QUESTIONS.length}問
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                {MBTI_QUESTIONS[mbtiStep].question}
              </h2>
            </div>
            <div className="space-y-3">
              {MBTI_QUESTIONS[mbtiStep].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answerMbti(opt.value)}
                  className="w-full bg-white rounded-2xl border-2 border-gray-200 px-5 py-5 text-left text-sm font-medium text-gray-800 active:bg-indigo-50 active:border-indigo-400 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 感情傾向診断フェーズ */}
        {phase === "tendency" && tendencyStep < TENDENCY_QUESTIONS.length && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-indigo-500 font-semibold mb-1">
                感情傾向診断 — {tendencyStep + 1} / {TENDENCY_QUESTIONS.length}
                問
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                {TENDENCY_QUESTIONS[tendencyStep].question}
              </h2>
            </div>
            <div className="space-y-3">
              {TENDENCY_QUESTIONS[tendencyStep].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answerTendency(opt.value)}
                  className="w-full bg-white rounded-2xl border-2 border-gray-200 px-5 py-5 text-left text-sm font-medium text-gray-800 active:bg-indigo-50 active:border-indigo-400 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 目標設定フェーズ */}
        {phase === "goal" && mbtiType && tendency && primary && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-indigo-500 font-semibold mb-1">
                目標設定
              </p>
              <h2 className="text-xl font-bold text-gray-900">あなたの目標</h2>
            </div>

            {/* 診断結果サマリー */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">MBTIタイプ</p>
                <p className="font-bold text-indigo-600">
                  {mbtiType} — {MBTI_LABELS[mbtiType] ?? ""}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">感情の傾向</p>
                <p className="font-bold text-gray-700">
                  {TENDENCY_LABELS[primary]}が出やすい
                </p>
              </div>
            </div>

            {/* 目標テキスト編集 */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                AIが目標を提案しました。自由に編集できます。
              </p>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                maxLength={100}
                rows={3}
                className="w-full bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-400 px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none"
              />
              <p className="text-xs text-right text-gray-400">
                {goalText.length}/100
              </p>
            </div>

            <button
              onClick={saveAndFinish}
              disabled={saving || !goalText.trim()}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl text-base font-bold"
            >
              {saving ? "保存中…" : "スタート！"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
