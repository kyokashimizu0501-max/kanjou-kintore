"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EMOTION_TYPES } from "@/lib/constants";
import {
  User,
  Bell,
  Tag,
  Brain,
  BarChart3,
  Target,
  Plus,
  X,
} from "lucide-react";

interface TagItem {
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

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [goalSaving, setGoalSaving] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("21:00");
  const [notifSaving, setNotifSaving] = useState(false);

  const [tags, setTags] = useState<TagItem[]>([]);
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

  async function saveNotification(next: {
    reminderEnabled: boolean;
    reminderTime: string;
  }) {
    setNotifSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setProfile((p) => (p ? { ...p, ...next } : p));
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
    <div className="px-4 py-6 space-y-6 animate-fade-in">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">設定</h1>
        <p className="text-sm text-muted-foreground">
          プロフィールや通知をカスタマイズ
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full bg-muted/50 p-1 rounded-xl">
          <TabsTrigger
            value="profile"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 gap-1"
          >
            <User className="w-4 h-4" />
            プロフィール
          </TabsTrigger>
          <TabsTrigger
            value="notification"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 gap-1"
          >
            <Bell className="w-4 h-4" />
            通知
          </TabsTrigger>
          <TabsTrigger
            value="tags"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5 gap-1"
          >
            <Tag className="w-4 h-4" />
            マイタグ
          </TabsTrigger>
        </TabsList>

        {/* プロフィール */}
        <TabsContent value="profile" className="mt-6 space-y-4">
          {profile?.mbtiType ? (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">MBTIタイプ</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {profile.mbtiType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {MBTI_LABELS[profile.mbtiType] ?? ""}
                  </p>
                </div>
              </div>

              {profile.emotionTendency && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">感情の傾向</p>
                  </div>
                  <div className="space-y-2">
                    {(["anger", "sadness", "anxiety"] as const).map((key) => {
                      const val = profile.emotionTendency![key];
                      const max = Math.max(
                        ...Object.values(profile.emotionTendency!),
                      );
                      const config = EMOTION_TYPES.find((e) => e.id === key);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-28 shrink-0">
                            {TENDENCY_LABELS[key]}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div
                              className={cn(
                                "h-1.5 rounded-full",
                                config?.colorClass.bg,
                              )}
                              style={{
                                width: max > 0 ? `${(val / max) * 100}%` : "0%",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-primary font-semibold mt-2">
                    {TENDENCY_LABELS[primaryTendency(profile.emotionTendency)]}
                    が出やすいタイプ
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#f0ebe3] p-5 text-center">
              <p className="text-muted-foreground text-sm">
                診断データがありません
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  今の目標
                </p>
              </div>
              {!editingGoal && (
                <button
                  onClick={() => setEditingGoal(true)}
                  className="text-xs text-primary font-semibold"
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
                  className="w-full bg-muted/30 rounded-xl border border-[#e8e4dc] focus:border-primary px-3 py-2 text-sm text-foreground resize-none focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      setEditingGoal(false);
                      setGoalDraft(profile?.goal ?? "");
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    className="flex-1 rounded-xl"
                    onClick={saveGoal}
                    disabled={goalSaving}
                  >
                    {goalSaving ? "保存中…" : "保存"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">
                {profile?.goal ?? (
                  <span className="text-muted-foreground/60">未設定</span>
                )}
              </p>
            )}
          </div>

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
            className="w-full py-3.5 bg-muted active:bg-muted/70 text-foreground/70 rounded-2xl text-sm font-semibold"
          >
            診断をやり直す
          </button>
        </TabsContent>

        {/* 通知 */}
        <TabsContent value="notification" className="mt-6 space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <p className="text-xs text-amber-600 font-semibold mb-0.5">
              v1.0 UI設定のみ
            </p>
            <p className="text-xs text-amber-500">
              実際の通知送信はv2.0で対応予定です。
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-[#f0ebe3] divide-y divide-[#f0ebe3]">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  リマインダー
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  毎日の記録を促す通知
                </p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={(checked) => {
                  setReminderEnabled(checked);
                  saveNotification({ reminderEnabled: checked, reminderTime });
                }}
              />
            </div>

            <div
              className={cn(
                "flex items-center justify-between px-5 py-4",
                !reminderEnabled && "opacity-40",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  通知時刻
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  毎日この時刻に通知
                </p>
              </div>
              <input
                type="time"
                value={reminderTime}
                disabled={!reminderEnabled || notifSaving}
                onChange={(e) => setReminderTime(e.target.value)}
                onBlur={() =>
                  saveNotification({ reminderEnabled, reminderTime })
                }
                className="text-sm font-bold text-primary bg-transparent focus:outline-none disabled:text-muted-foreground/50"
              />
            </div>
          </div>
        </TabsContent>

        {/* マイタグ */}
        <TabsContent value="tags" className="mt-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-foreground">
                マイタグ
              </h3>
              <span className="text-xs text-muted-foreground">
                {tags.length}/5
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              行動記録「その他」に入力した内容が自動追加されます。最大5件。
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground/70 py-1">
                  まだマイタグはありません
                </p>
              )}
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-full"
                >
                  <span className="text-sm">{tag.label}</span>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {tags.length < 5 ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="新しいタグを追加…"
                  className="flex-1 bg-muted/30 rounded-xl border border-[#e8e4dc] focus:border-primary px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <Button
                  size="icon"
                  className="rounded-xl shrink-0"
                  onClick={addTag}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                <p className="text-xs text-amber-600">
                  上限（5件）に達しています。不要なタグを削除してから追加できます。
                </p>
              </div>
            )}

            {tagError && (
              <p className="text-sm text-destructive mt-2">{tagError}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
