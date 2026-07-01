"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  EMOTION_TYPES,
  SITUATION_TAGS,
  POST_ACTIONS,
  INTENSITY_LABELS,
} from "@/lib/constants";
import type { EmotionTypeId } from "@/lib/constants";
import { EmotionTagSelector } from "@/components/emotion/EmotionTagSelector";
import { IntensitySelector } from "@/components/emotion/IntensitySelector";
import { TagSelector } from "@/components/emotion/TagSelector";
import AlertCard from "@/components/AlertCard";
import QuickCommit from "@/components/QuickCommit";
import { ChevronLeft, X, ChevronRight, Check } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | "alert" | "commit";

const STEPS = [
  { subtitle: "今の気持ちは？" },
  { subtitle: "どれくらい強い？" },
  { subtitle: "どんな場面？" },
  { subtitle: "何があった？" },
  { subtitle: "どうした？" },
  { subtitle: "これでOK？" },
];

interface CustomTag {
  id: number;
  label: string;
}

interface SelectedAction {
  actionType: string;
  actionDetail?: string;
  isCustomTag?: boolean;
}

interface RecordState {
  emotionType: EmotionTypeId | null;
  intensity: number;
  situationTags: string[];
  eventText: string;
  actions: SelectedAction[];
}

export default function RecordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<RecordState>({
    emotionType: null,
    intensity: 3,
    situationTags: [],
    eventText: "",
    actions: [],
  });
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const newTagRef = useRef<HTMLInputElement>(null);
  const [savedLogId, setSavedLogId] = useState<number | null>(null);
  const [similarData, setSimilarData] = useState<{
    similar: Parameters<typeof AlertCard>[0]["similarLog"];
    similarityScore?: number;
    isFirstUxDemo?: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const numericStep = typeof step === "number" ? step : null;
  const emotionConfig = EMOTION_TYPES.find((e) => e.id === state.emotionType);

  useEffect(() => {
    fetch("/api/custom-tags")
      .then((r) => r.json())
      .then(setCustomTags);
  }, []);

  useEffect(() => {
    if (addingTag) newTagRef.current?.focus();
  }, [addingTag]);

  function toggleSituation(id: string) {
    setState((s) => ({
      ...s,
      situationTags: s.situationTags.includes(id)
        ? s.situationTags.filter((x) => x !== id)
        : [...s.situationTags, id],
    }));
  }

  function isBuiltinSelected(actionId: string) {
    return state.actions.some(
      (x) => x.actionType === actionId && !x.isCustomTag,
    );
  }

  function toggleBuiltin(actionId: string) {
    setState((s) => ({
      ...s,
      actions: isBuiltinSelected(actionId)
        ? s.actions.filter((x) => x.actionType !== actionId)
        : [...s.actions, { actionType: actionId }],
    }));
  }

  function isCustomSelected(tag: CustomTag) {
    return state.actions.some(
      (x) => x.isCustomTag && x.actionDetail === tag.label,
    );
  }

  function toggleCustom(tag: CustomTag) {
    setState((s) => ({
      ...s,
      actions: isCustomSelected(tag)
        ? s.actions.filter(
            (x) => !(x.isCustomTag && x.actionDetail === tag.label),
          )
        : [
            ...s.actions,
            {
              actionType: "custom",
              actionDetail: tag.label,
              isCustomTag: true,
            },
          ],
    }));
  }

  async function confirmNewTag() {
    const label = newTagInput.trim();
    if (!label) {
      setAddingTag(false);
      return;
    }
    const res = await fetch("/api/custom-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      const tag: CustomTag = await res.json();
      setCustomTags((prev) => [...prev, tag]);
      setState((s) => ({
        ...s,
        actions: [
          ...s.actions,
          { actionType: "custom", actionDetail: tag.label, isCustomTag: true },
        ],
      }));
    }
    setNewTagInput("");
    setAddingTag(false);
  }

  function selectedActionLabels(): string[] {
    return state.actions
      .map((a) => {
        if (a.isCustomTag) return a.actionDetail ?? "";
        return (
          POST_ACTIONS.find((p) => p.id === a.actionType)?.label ?? a.actionType
        );
      })
      .filter(Boolean);
  }

  function situationLabelsSelected(): string[] {
    return state.situationTags.map(
      (id) => SITUATION_TAGS.find((t) => t.id === id)?.label ?? id,
    );
  }

  async function saveLog() {
    setSaving(true);
    const res = await fetch("/api/emotion-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emotionType: state.emotionType,
        intensity: state.intensity,
        situationTag: state.situationTags.join(",") || null,
        eventText: state.eventText.trim() || null,
        actions: state.actions,
      }),
    });
    const log = await res.json();
    setSavedLogId(log.id);

    const checkRes = await fetch("/api/similar-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emotionType: state.emotionType,
        intensity: state.intensity,
        situationTag: state.situationTags.join(",") || null,
        currentLogId: log.id,
      }),
    });
    const checkData = await checkRes.json();
    setSimilarData(checkData);
    setSaving(false);

    if (checkData.similar || checkData.isFirstUxDemo) {
      setStep("alert");
    } else {
      setStep("commit");
    }
  }

  function handleBack() {
    if (typeof step === "number" && step > 1) {
      setStep((step - 1) as Step);
    } else {
      router.back();
    }
  }

  function handleNext() {
    if (step === 6) {
      saveLog();
      return;
    }
    if (typeof step === "number") setStep((step + 1) as Step);
  }

  if (step === "alert" && savedLogId !== null) {
    return (
      <div className="px-4 py-6">
        <AlertCard
          similarLog={similarData?.similar ?? null}
          similarityScore={similarData?.similarityScore}
          isFirstUxDemo={similarData?.isFirstUxDemo}
          currentLogId={savedLogId}
          emotionType={state.emotionType ?? "anger"}
          onDone={() => router.push("/")}
        />
      </div>
    );
  }

  if (step === "commit") {
    return (
      <div className="px-4 py-6">
        <QuickCommit
          emotionType={state.emotionType ?? "anger"}
          emotionEmoji={emotionConfig?.emoji ?? ""}
          onCommit={() => router.push("/")}
          onSkip={() => router.push("/")}
        />
      </div>
    );
  }

  const progress = numericStep ? (numericStep / STEPS.length) * 100 : 0;
  const canProceed = step === 1 ? state.emotionType !== null : true;

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-[#f0ebe3] px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            {typeof step === "number" && step > 1 ? (
              <ChevronLeft className="w-5 h-5 text-foreground" />
            ) : (
              <X className="w-5 h-5 text-foreground" />
            )}
          </button>

          <div className="flex-1 mx-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#c9a882] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1.5">
              {numericStep ? STEPS[numericStep - 1].subtitle : ""}
            </p>
          </div>

          {numericStep && numericStep >= 3 && numericStep <= 5 ? (
            <button
              onClick={handleNext}
              className="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              スキップ
            </button>
          ) : (
            <div className="w-14" />
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  今の感情を選んでね
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  一番近いものを選んでください
                </p>
              </div>
              <EmotionTagSelector
                selected={state.emotionType}
                onSelect={(e) => setState((s) => ({ ...s, emotionType: e }))}
              />
            </div>
          )}

          {step === 2 && state.emotionType && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-3">{emotionConfig?.emoji}</div>
                <h1 className="text-xl font-bold text-foreground">
                  その{emotionConfig?.label}、どれくらい強い？
                </h1>
              </div>
              <IntensitySelector
                emotionType={state.emotionType}
                selected={state.intensity}
                onSelect={(i) => setState((s) => ({ ...s, intensity: i }))}
              />
              <div className="bg-muted/50 rounded-2xl p-4">
                <p className="text-sm text-muted-foreground text-center">
                  {emotionConfig?.advice}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  どんな状況で感じた？
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  あてはまるものを選んでね（複数選択可）
                </p>
              </div>
              <TagSelector
                options={SITUATION_TAGS}
                selectedIds={state.situationTags}
                onToggle={toggleSituation}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  何があった？
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  自由に書き出してOK（最大200文字）
                </p>
              </div>
              <div className="space-y-2">
                <textarea
                  value={state.eventText}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      eventText: e.target.value.slice(0, 200),
                    }))
                  }
                  placeholder="今日の出来事を書いてみよう..."
                  rows={5}
                  className={cn(
                    "w-full h-40 p-4 rounded-2xl resize-none",
                    "bg-white border-2 border-[#e8e4dc]",
                    "text-foreground placeholder:text-muted-foreground/50",
                    "focus:border-primary focus:ring-0 focus:outline-none",
                    "transition-colors duration-200",
                  )}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {state.eventText.length} / 200
                </p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  どう対処した？
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  あてはまるものを選んでね（複数選択可）
                </p>
              </div>
              <TagSelector
                options={POST_ACTIONS.filter((a) => a.id !== "custom")}
                selectedIds={state.actions
                  .filter((a) => !a.isCustomTag)
                  .map((a) => a.actionType)}
                onToggle={toggleBuiltin}
                trailing={
                  <>
                    {customTags.map((tag) => (
                      <button
                        key={`custom-${tag.id}`}
                        onClick={() => toggleCustom(tag)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2",
                          isCustomSelected(tag)
                            ? "bg-primary border-primary text-white shadow-soft scale-[1.02]"
                            : "bg-white border-[#e8e4dc] text-foreground hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        {tag.label}
                      </button>
                    ))}
                    {addingTag ? (
                      <div className="flex items-center gap-1 bg-white border-2 border-primary/40 rounded-full px-3 py-1.5">
                        <input
                          ref={newTagRef}
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmNewTag();
                            if (e.key === "Escape") {
                              setAddingTag(false);
                              setNewTagInput("");
                            }
                          }}
                          placeholder="行動名を入力"
                          className="text-sm focus:outline-none text-foreground placeholder:text-muted-foreground/60 w-28"
                        />
                        <button
                          onClick={confirmNewTag}
                          className="text-primary text-xs font-bold shrink-0"
                        >
                          追加
                        </button>
                      </div>
                    ) : (
                      customTags.length < 5 && (
                        <button
                          onClick={() => setAddingTag(true)}
                          className="px-4 py-2.5 rounded-full text-sm border-2 border-dashed border-muted-foreground/30 text-muted-foreground font-medium active:bg-muted/50"
                        >
                          ＋ 追加
                        </button>
                      )
                    )}
                  </>
                }
              />
            </div>
          )}

          {step === 6 && state.emotionType && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  記録内容の確認
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  ミスがなければ完了しよう
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3] space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
                      emotionConfig?.colorClass.light,
                    )}
                  >
                    {emotionConfig?.emoji}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-lg font-semibold",
                        emotionConfig?.colorClass.text,
                      )}
                    >
                      {emotionConfig?.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      強度 {state.intensity} —{" "}
                      {INTENSITY_LABELS[state.intensity]}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {situationLabelsSelected().length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                        状況:
                      </span>
                      <span className="text-sm">
                        {situationLabelsSelected().join("、")}
                      </span>
                    </div>
                  )}
                  {state.eventText && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        出来事:
                      </span>
                      <p className="text-sm mt-1">{state.eventText}</p>
                    </div>
                  )}
                  {selectedActionLabels().length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                        対処:
                      </span>
                      <span className="text-sm">
                        {selectedActionLabels().join("、")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-[#f0ebe3] px-4 py-4">
        <button
          onClick={handleNext}
          disabled={!canProceed || saving}
          className={cn(
            "w-full py-4 rounded-2xl font-semibold text-base",
            "transition-all duration-200 active:scale-[0.98]",
            "flex items-center justify-center gap-2",
            canProceed && !saving
              ? "bg-gradient-to-r from-primary via-[#c9a882] to-primary text-white shadow-elevated hover:shadow-xl"
              : "bg-muted text-muted-foreground",
          )}
        >
          {step === 6 ? (
            <>
              <Check className="w-5 h-5" />
              {saving ? "記録中…" : "記録を完了"}
            </>
          ) : (
            <>
              次へ
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
