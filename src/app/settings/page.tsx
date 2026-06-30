"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Tag {
  id: number;
  label: string;
}

interface Profile {
  mbtiType: string | null;
  emotionTendency: { anger: number; sadness: number; anxiety: number } | null;
  goal: string | null;
  reminderEnabled: boolean;
  reminderTime: string;
}

const TENDENCY_LABELS: Record<string, string> = {
  anger: "怒り・イライラ",
  sadness: "悲しみ・落ち込み",
  anxiety: "不安・焦り",
};

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

type SettingsTab = "profile" | "notification" | "tags";

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>("profile");

  // プロフィール
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalSaving, setGoalSaving] = useState(false);

  // 通知
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("21:00");
  const [notifSaving, setNotifSaving] = useState(false);

  // マイタグ
  const [tags, setTags] = useState<Tag[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [tagError, setTagError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: Profile & { onboardingCompleted: boolean }) => {
        setProfile(data);
        setGoalDraft(data.goal ?? "");
        setReminderEnabled(data.reminderEnabled);
        setReminderTime(data.reminderTime);
      });
    fetch("/api/custom-tags")
      .then((r) => r.json())
      .then(setTags);
  }, []);

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

  async function saveGoal() {
    setGoalSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: goalDraft.trim() }),
    });
    setProfile((p) => (p ? { ...p, goal: goalDraft.trim() } : p));
    setGoalSaving(false);
    setEditingGoal(false);
  }

  async function saveNotification() {
    setNotifSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderEnabled, reminderTime }),
    });
    setProfile((p) => (p ? { ...p, reminderEnabled, reminderTime } : p));
    setNotifSaving(false);
  }

  async function addTag() {
    const label = newLabel.trim();
    if (!label) return;
    setTagError("");
    const res = await fetch("/api/custom-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (res.ok) {
      const tag = await res.json();
      setTags((prev) => [...prev, tag]);
      setNewLabel("");
    } else {
      const data = await res.json();
      setTagError(data.error ?? "エラーが発生しました");
    }
  }

  async function deleteTag(id: number) {
    await fetch("/api/custom-tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTags((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="pb-4">
      {/* ヘッダー */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      </div>

      {/* タブ */}
      <div className="px-4 mb-4">
        <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
          {(["profile", "notification", "tags"] as SettingsTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {t === "profile"
                ? "プロフィール"
                : t === "notification"
                  ? "通知"
                  : "マイタグ"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* ─── プロフィールタブ ─── */}
        {tab === "profile" && (
          <div className="space-y-4">
            {profile?.mbtiType ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">MBTIタイプ</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-0.5">
                      {profile.mbtiType}
                    </p>
                    <p className="text-sm text-gray-500">
                      {MBTI_LABELS[profile.mbtiType] ?? ""}
                    </p>
                  </div>
                  <div className="text-4xl">🧠</div>
                </div>
                {profile.emotionTendency && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">感情の傾向</p>
                    <div className="space-y-2">
                      {(["anger", "sadness", "anxiety"] as const).map((key) => {
                        const val = profile.emotionTendency![key];
                        const max = Math.max(
                          ...Object.values(profile.emotionTendency!),
                        );
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-24 shrink-0">
                              {TENDENCY_LABELS[key]}
                            </span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${key === "anger" ? "bg-red-400" : key === "sadness" ? "bg-blue-400" : "bg-yellow-400"}`}
                                style={{
                                  width:
                                    max > 0 ? `${(val / max) * 100}%` : "0%",
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-4 text-right">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-indigo-500 font-semibold mt-2">
                      {
                        TENDENCY_LABELS[
                          primaryTendency(profile.emotionTendency)
                        ]
                      }
                      が出やすいタイプ
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-center">
                <p className="text-gray-400 text-sm">診断データがありません</p>
              </div>
            )}

            {/* 目標 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">今の目標</p>
                {!editingGoal && (
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="text-xs text-indigo-500 font-semibold"
                  >
                    編集
                  </button>
                )}
              </div>
              {editingGoal ? (
                <div className="space-y-2">
                  <textarea
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    maxLength={100}
                    rows={3}
                    className="w-full bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-400 px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingGoal(false);
                        setGoalDraft(profile?.goal ?? "");
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 active:bg-gray-200"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={saveGoal}
                      disabled={goalSaving}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white active:bg-indigo-700 disabled:opacity-40"
                    >
                      {goalSaving ? "保存中…" : "保存"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile?.goal ?? (
                    <span className="text-gray-300">未設定</span>
                  )}
                </p>
              )}
            </div>

            {/* 再診断ボタン */}
            <button
              onClick={() => {
                if (
                  confirm(
                    "再診断するとMBTIタイプと目標が上書きされます。よろしいですか？",
                  )
                ) {
                  fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ onboardingCompleted: false }),
                  }).then(() => router.push("/onboarding"));
                }
              }}
              className="w-full py-3.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-2xl text-sm font-semibold"
            >
              診断をやり直す
            </button>
          </div>
        )}

        {/* ─── 通知タブ ─── */}
        {tab === "notification" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <p className="text-xs text-amber-600 font-semibold mb-0.5">
                v1.0 UI設定のみ
              </p>
              <p className="text-xs text-amber-500">
                実際の通知送信はv2.0で対応予定です。
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {/* リマインダー ON/OFF */}
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    リマインダー
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    毎日の記録を促す通知
                  </p>
                </div>
                <button
                  onClick={() => setReminderEnabled((v) => !v)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    reminderEnabled ? "bg-indigo-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      reminderEnabled ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* 時刻設定 */}
              <div
                className={`flex items-center justify-between px-4 py-4 ${!reminderEnabled ? "opacity-40" : ""}`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    通知時刻
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    毎日この時刻に通知
                  </p>
                </div>
                <input
                  type="time"
                  value={reminderTime}
                  disabled={!reminderEnabled}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="text-sm font-bold text-indigo-600 bg-transparent focus:outline-none disabled:text-gray-300"
                />
              </div>
            </div>

            <button
              onClick={saveNotification}
              disabled={notifSaving}
              className="w-full py-4 bg-indigo-600 active:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl text-sm font-bold"
            >
              {notifSaving ? "保存中…" : "保存する"}
            </button>
          </div>
        )}

        {/* ─── マイタグタブ ─── */}
        {tab === "tags" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400">
                行動記録「その他」に入力した内容が自動追加されます。最大5件。
              </p>
            </div>

            <div className="space-y-2">
              {tags.length === 0 && (
                <p className="text-sm text-gray-400 py-2">
                  まだマイタグはありません
                </p>
              )}
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3.5"
                >
                  <span className="text-sm text-gray-800 font-medium">
                    {tag.label}
                  </span>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 active:bg-red-100 text-red-400 text-sm transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {tags.length < 5 ? (
              <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="新しいタグを追加…"
                  className="flex-1 text-sm focus:outline-none text-gray-800 placeholder:text-gray-300"
                />
                <button
                  onClick={addTag}
                  className="shrink-0 px-4 py-2 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                >
                  追加
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-amber-600">
                  上限（5件）に達しています。不要なタグを削除してから追加できます。
                </p>
              </div>
            )}

            {tagError && <p className="text-sm text-red-500">{tagError}</p>}

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`flex-1 h-1.5 rounded-full ${n <= tags.length ? "bg-indigo-400" : "bg-gray-200"}`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">
                {tags.length}/5
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
