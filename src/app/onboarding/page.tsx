"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MBTI_QUESTIONS,
  TENDENCY_QUESTIONS,
  suggestGoal,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Brain,
  Heart,
  Target,
} from "lucide-react";

type Phase = "welcome" | "mbti" | "tendency" | "goal";

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

function calcTendency(answers: string[]) {
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
}) {
  const max = Math.max(t.anger, t.sadness, t.anxiety);
  if (t.anger === max) return "anger";
  if (t.anxiety === max) return "anxiety";
  return "sadness";
}

const MBTI_DESCRIPTIONS: Record<string, string> = {
  INFJ: "稀な理想主義者。深い感情と洞察力を併せ持つ",
  INFP: "穏やかな夢想家。内面の価値観を大切にする",
  INTJ: "戦略的な計画者。長期的なビジョンを持つ",
  INTP: "論理的な思想家。知的な探求を楽しむ",
  ISFJ: "献身的な支援者。細部に気配りを尽くす",
  ISFP: "穏やかなアーティスト。今の瞬間を大切にする",
  ISTJ: "信頼できる管理者。責任感が強い",
  ISTP: "柔軟な職人。実践的な問題解決が得意",
  ENFJ: "情熱的な指導者。人の成長を応援する",
  ENFP: "熱狂的な提唱者。可能性を信じる",
  ENTJ: "断固たる指揮官。効率的に目標を達成する",
  ENTP: "巧みな討論者。新しいアイデアを好む",
  ESFJ: "親切な供給者。人との調和を大切にする",
  ESFP: "陽気なパフォーマー。刺激を楽しむ",
  ESTJ: "実務的な管理者。秩序と伝統を重んじる",
  ESTP: "大胆な起業家。即座の行動を好む",
};

const TENDENCY_LABELS: Record<string, string> = {
  anger: "怒り・イライラ",
  sadness: "悲しみ・落ち込み",
  anxiety: "不安・焦り",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [mbtiAnswers, setMbtiAnswers] = useState<string[]>([]);
  const [tendencyAnswers, setTendencyAnswers] = useState<string[]>([]);
  const [goalText, setGoalText] = useState("");
  const [saving, setSaving] = useState(false);

  const mbtiStep = mbtiAnswers.length;
  const tendencyStep = tendencyAnswers.length;

  function answerMbti(value: string) {
    const next = [...mbtiAnswers, value];
    setMbtiAnswers(next);
    if (next.length >= MBTI_QUESTIONS.length) {
      setTimeout(() => setPhase("tendency"), 250);
    }
  }

  function answerTendency(value: string) {
    const next = [...tendencyAnswers, value];
    setTendencyAnswers(next);
    if (next.length >= TENDENCY_QUESTIONS.length) {
      const mbti = calcMbti(mbtiAnswers);
      const primary = primaryTendency(calcTendency(next));
      setGoalText(suggestGoal(mbti, primary));
      setTimeout(() => setPhase("goal"), 250);
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

  const mbtiType =
    phase !== "welcome" && phase !== "mbti" ? calcMbti(mbtiAnswers) : null;
  const tendency = phase === "goal" ? calcTendency(tendencyAnswers) : null;
  const primary = tendency ? primaryTendency(tendency) : null;

  function handleBack() {
    if (phase === "mbti" && mbtiStep > 0) {
      setMbtiAnswers((a) => a.slice(0, -1));
    } else if (phase === "mbti") {
      setPhase("welcome");
    } else if (phase === "tendency" && tendencyStep > 0) {
      setTendencyAnswers((a) => a.slice(0, -1));
    } else if (phase === "tendency") {
      setPhase("mbti");
      setMbtiAnswers((a) => a.slice(0, -1));
    } else if (phase === "goal") {
      setPhase("tendency");
      setTendencyAnswers((a) => a.slice(0, -1));
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col">
      {phase !== "welcome" && (
        <header className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
        </header>
      )}

      <div className="flex-1">
        {phase === "welcome" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-[#c9a882] flex items-center justify-center mb-6 shadow-elevated">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              感情筋トレへようこそ
            </h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              あなたに合った目標を設定するため、
              <br />
              いくつかの質問にお答えください
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                MBTI診断
              </div>
              <span>+</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                感情傾向診断
              </div>
            </div>
            <Button
              onClick={() => setPhase("mbti")}
              className="px-8 py-6 rounded-2xl bg-gradient-to-r from-primary via-[#c9a882] to-primary text-white shadow-elevated hover:shadow-xl transition-all text-base"
            >
              始める
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {phase === "mbti" && mbtiStep < MBTI_QUESTIONS.length && (
          <div className="animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Brain className="w-4 h-4" />
                MBTI診断 {mbtiStep + 1} / {MBTI_QUESTIONS.length}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#c9a882] rounded-full transition-all duration-500"
                  style={{
                    width: `${((mbtiStep + 1) / MBTI_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {MBTI_QUESTIONS[mbtiStep].question}
              </h2>
            </header>

            <div className="space-y-3">
              {MBTI_QUESTIONS[mbtiStep].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answerMbti(opt.value)}
                  className="w-full p-5 rounded-2xl text-left transition-all duration-200 border-2 bg-white border-[#e8e4dc] hover:border-primary/40"
                >
                  <span className="text-base font-medium text-foreground">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "tendency" && tendencyStep < TENDENCY_QUESTIONS.length && (
          <div className="animate-fade-in">
            <header className="mb-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Sparkles className="w-4 h-4" />
                感情傾向診断 {tendencyStep + 1} / {TENDENCY_QUESTIONS.length}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${((tendencyStep + 1) / TENDENCY_QUESTIONS.length) * 100}%`,
                  }}
                />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {TENDENCY_QUESTIONS[tendencyStep].question}
              </h2>
            </header>

            <div className="space-y-3">
              {TENDENCY_QUESTIONS[tendencyStep].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answerTendency(opt.value)}
                  className="w-full p-5 rounded-2xl text-left transition-all duration-200 border-2 bg-white border-[#e8e4dc] hover:border-amber-400/50"
                >
                  <span className="text-base font-medium text-foreground">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "goal" && mbtiType && primary && (
          <div className="animate-fade-in text-center">
            <div className="mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-[#c9a882] flex items-center justify-center mx-auto mb-4 shadow-elevated">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                診断完了
              </h2>
              <p className="text-sm text-muted-foreground">
                あなたに合った目標を設定しました
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3] mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  {mbtiType}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {MBTI_DESCRIPTIONS[mbtiType] ?? "あなた独自の魅力があります"}
              </p>
              <p className="text-xs text-primary font-semibold mt-3">
                {TENDENCY_LABELS[primary]}が出やすい
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 mb-6 border border-amber-200 text-left">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Target className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-semibold text-amber-800">
                  あなたの目標
                </h3>
              </div>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                maxLength={100}
                rows={3}
                className={cn(
                  "w-full bg-white/70 rounded-xl border border-amber-200 focus:border-amber-400",
                  "px-3 py-2 text-sm text-amber-900 resize-none focus:outline-none",
                )}
              />
              <p className="text-xs text-amber-500 text-right mt-1">
                {goalText.length}/100
              </p>
            </div>

            <Button
              onClick={saveAndFinish}
              disabled={saving || !goalText.trim()}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary via-[#c9a882] to-primary text-white shadow-elevated hover:shadow-xl transition-all text-base"
            >
              <Check className="w-5 h-5 mr-2" />
              {saving ? "保存中…" : "始める"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
