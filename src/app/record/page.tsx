"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  EMOTION_TYPES,
  SITUATION_TAGS,
  POST_ACTIONS,
  INTENSITY_LABELS,
} from "@/lib/constants";
import type { EmotionTypeId } from "@/lib/constants";
import AlertCard from "@/components/AlertCard";
import QuickCommit from "@/components/QuickCommit";

// STEP 1-5 = 入力ステップ（プログレスバー表示）/ 6 = 確認画面
type Step = 1 | 2 | 3 | 4 | 5 | 6 | "alert" | "commit" | "done";

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

const TOTAL_STEPS = 5;

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
    similar: unknown;
    similarityScore?: number;
    isFirstUxDemo?: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [committedStrategy, setCommittedStrategy] = useState<string | null>(
    null,
  );

  const numericStep = typeof step === "number" ? (step as number) : null;
  const showProgress = numericStep !== null && numericStep <= TOTAL_STEPS;
  const selectedEmotion = EMOTION_TYPES.find((e) => e.id === state.emotionType);

  useEffect(() => {
    fetch("/api/custom-tags")
      .then((r) => r.json())
      .then(setCustomTags);
  }, []);

  useEffect(() => {
    if (addingTag) newTagRef.current?.focus();
  }, [addingTag]);

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
      // 作成と同時に選択済みにする
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

  // 確認画面用：選択された全行動のラベル
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

  return (
    <div className="flex flex-col min-h-full bg-[#F8F8F9]">
      {/* ヘッダー + プログレスバー */}
      <header className="bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => {
              if (typeof step === "number" && step > 1) {
                setStep((step - 1) as Step);
              } else {
                router.back();
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 text-gray-500 text-lg"
          >
            ←
          </button>
          <span className="font-semibold text-gray-800 flex-1">
            感情を記録する
          </span>
          {showProgress && (
            <span className="text-xs text-gray-400">
              {numericStep}/{TOTAL_STEPS}
            </span>
          )}
        </div>
        {showProgress && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-indigo-500 transition-all duration-300"
              style={{
                width: `${((numericStep as number) / TOTAL_STEPS) * 100}%`,
              }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-6">
        {/* STEP 1: 感情タグ選択 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-indigo-500 font-semibold mb-1">
                STEP 1 / 5 — 必須
              </p>
              <h2 className="text-xl font-bold text-gray-900">今の感情は？</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EMOTION_TYPES.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setState((s) => ({ ...s, emotionType: e.id }))}
                  className={`flex flex-col items-center gap-3 py-6 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    state.emotionType === e.id
                      ? `${e.color} border-current shadow-md`
                      : "bg-white border-gray-200"
                  }`}
                >
                  <span className="text-5xl leading-none">{e.emoji}</span>
                  <span className="text-sm font-semibold text-gray-700 leading-tight text-center px-1">
                    {e.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              disabled={!state.emotionType}
              onClick={() => setStep(2)}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl text-base font-bold transition-colors"
            >
              次へ
            </button>
          </div>
        )}

        {/* STEP 2: 感情強度 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-indigo-500 font-semibold mb-1">
                STEP 2 / 5 — 必須
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                強さはどのくらい？
              </h2>
            </div>
            {selectedEmotion && (
              <div
                className={`rounded-2xl py-5 text-center ${selectedEmotion.color}`}
              >
                <span className="text-6xl">{selectedEmotion.emoji}</span>
                <p className="mt-2 text-sm font-semibold">
                  {selectedEmotion.label}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>弱い</span>
                <span>強い</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setState((s) => ({ ...s, intensity: n }))}
                    className={`flex-1 py-5 rounded-2xl text-xl font-bold border-2 transition-all active:scale-[0.95] ${
                      state.intensity === n
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 h-5">
                {INTENSITY_LABELS[state.intensity]}
              </p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl text-base font-bold"
            >
              次へ
            </button>
          </div>
        )}

        {/* STEP 3: 状況タグ（任意） */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">
                STEP 3 / 5 — 任意
              </p>
              <h2 className="text-xl font-bold text-gray-900">どんな状況？</h2>
              <p className="text-sm text-gray-400 mt-1">
                当てはまるものを選んでください
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SITUATION_TAGS.map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      situationTags: s.situationTags.includes(t.id)
                        ? s.situationTags.filter((x) => x !== t.id)
                        : [...s.situationTags, t.id],
                    }))
                  }
                  className={`px-5 py-3 rounded-full text-sm border-2 font-medium transition-all active:scale-[0.97] ${
                    state.situationTags.includes(t.id)
                      ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl text-base font-bold"
            >
              次へ（スキップ可）
            </button>
          </div>
        )}

        {/* STEP 4: 出来事テキスト（任意） */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">
                STEP 4 / 5 — 任意
              </p>
              <h2 className="text-xl font-bold text-gray-900">何があった？</h2>
              <p className="text-sm text-gray-400 mt-1">
                具体的な出来事を200字以内で（任意）
              </p>
            </div>
            <textarea
              value={state.eventText}
              onChange={(e) =>
                setState((s) => ({ ...s, eventText: e.target.value }))
              }
              maxLength={200}
              rows={5}
              placeholder="例：会議で意見を否定されて、その場では返せなかった…"
              className="w-full bg-white rounded-2xl border-2 border-gray-200 focus:border-indigo-400 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 resize-none focus:outline-none"
            />
            <p className="text-xs text-right text-gray-400">
              {state.eventText.length}/200
            </p>
            <button
              onClick={() => setStep(5)}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl text-base font-bold"
            >
              次へ（スキップ可）
            </button>
          </div>
        )}

        {/* STEP 5: 感情後の行動（任意） */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1">
                STEP 5 / 5 — 任意
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                その後、何をした？
              </h2>
              <p className="text-sm text-gray-400 mt-1">複数選択できます</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* ビルトイン行動 */}
              {POST_ACTIONS.filter((a) => a.id !== "custom").map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleBuiltin(a.id)}
                  className={`px-5 py-3 rounded-full text-sm border-2 font-medium transition-all active:scale-[0.97] ${
                    isBuiltinSelected(a.id)
                      ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {a.label}
                </button>
              ))}

              {/* マイタグ（既存） */}
              {customTags.map((tag) => (
                <button
                  key={`custom-${tag.id}`}
                  onClick={() => toggleCustom(tag)}
                  className={`px-5 py-3 rounded-full text-sm border-2 font-medium transition-all active:scale-[0.97] ${
                    isCustomSelected(tag)
                      ? "bg-indigo-100 border-indigo-400 text-indigo-700"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {tag.label}
                </button>
              ))}

              {/* インライン新規追加 */}
              {addingTag ? (
                <div className="flex items-center gap-1 bg-white border-2 border-indigo-300 rounded-full px-3 py-1.5">
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
                    className="text-sm focus:outline-none text-gray-800 placeholder:text-gray-300 w-28"
                  />
                  <button
                    onClick={confirmNewTag}
                    className="text-indigo-500 text-xs font-bold shrink-0"
                  >
                    追加
                  </button>
                </div>
              ) : (
                customTags.length < 5 && (
                  <button
                    onClick={() => setAddingTag(true)}
                    className="px-5 py-3 rounded-full text-sm border-2 border-dashed border-gray-300 text-gray-400 font-medium active:bg-gray-50"
                  >
                    ＋ 追加
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setStep(6)}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl text-base font-bold"
            >
              確認へ（スキップ可）
            </button>
          </div>
        )}

        {/* STEP 6: 確認・記録 */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">確認して記録</h2>
              <p className="text-sm text-gray-400 mt-1">
                内容を確認してください
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 text-sm overflow-hidden">
              <SummaryRow label="感情">
                {selectedEmotion && (
                  <span>
                    {selectedEmotion.emoji} {selectedEmotion.label}
                  </span>
                )}
              </SummaryRow>
              <SummaryRow label="強さ">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">
                    {state.intensity}
                  </span>
                  <span className="text-gray-300">/5</span>
                  <span className="text-gray-500">
                    {INTENSITY_LABELS[state.intensity]}
                  </span>
                </div>
              </SummaryRow>
              <SummaryRow label="状況">
                {state.situationTags.length > 0 ? (
                  SITUATION_TAGS.filter((t) =>
                    state.situationTags.includes(t.id),
                  )
                    .map((t) => t.label)
                    .join("、")
                ) : (
                  <span className="text-gray-300">未選択</span>
                )}
              </SummaryRow>
              {state.eventText.trim() && (
                <SummaryRow label="出来事">
                  <span className="leading-relaxed">
                    {state.eventText.trim()}
                  </span>
                </SummaryRow>
              )}
              <SummaryRow label="行動">
                {selectedActionLabels().length > 0 ? (
                  selectedActionLabels().join("、")
                ) : (
                  <span className="text-gray-300">未選択</span>
                )}
              </SummaryRow>
            </div>
            <button
              disabled={saving}
              onClick={saveLog}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-base font-bold transition-colors"
            >
              {saving ? "保存中…" : "記録する 📝"}
            </button>
          </div>
        )}

        {/* アラート画面 */}
        {step === "alert" && (
          <AlertCard
            similarLog={similarData?.similar as never}
            similarityScore={similarData?.similarityScore}
            isFirstUxDemo={similarData?.isFirstUxDemo}
            currentLogId={savedLogId}
            emotionType={state.emotionType!}
            onDone={() => router.push("/")}
          />
        )}

        {/* コミット画面（アラートなし時） */}
        {step === "commit" && (
          <QuickCommit
            emotionType={state.emotionType!}
            emotionEmoji={selectedEmotion?.emoji ?? ""}
            onCommit={(name) => {
              setCommittedStrategy(name);
              setStep("done");
            }}
            onSkip={() => setStep("done")}
          />
        )}

        {/* 完了 */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
              ✅
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                お疲れさまでした
              </p>
              {committedStrategy ? (
                <div className="mt-3 bg-indigo-50 rounded-2xl px-4 py-3 text-sm text-indigo-800 font-medium">
                  「{committedStrategy}」を試してみましょう
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  積み重ねが自分を変えていきます
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-2 w-full py-4 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl font-bold"
            >
              ホームへ戻る
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 px-4 py-3.5">
      <span className="text-gray-400 w-12 shrink-0 text-xs pt-0.5">
        {label}
      </span>
      <span className="text-gray-800">{children}</span>
    </div>
  );
}
