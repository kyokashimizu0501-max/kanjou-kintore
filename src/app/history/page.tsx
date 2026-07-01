"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EMOTION_TYPES, SITUATION_TAGS } from "@/lib/constants";
import { EmotionCard } from "@/components/emotion/EmotionCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, BarChart3 } from "lucide-react";

interface Log {
  id: number;
  emotionType: string;
  intensity: number;
  eventText: string | null;
  situationTag: string | null;
  occurredAt: string;
}

const TREND_THRESHOLD = 10;

function situationLabels(situationTag: string | null): string[] {
  if (!situationTag) return [];
  return situationTag
    .split(",")
    .map((id) => SITUATION_TAGS.find((t) => t.id === id)?.label ?? id);
}

export default function HistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("list");

  useEffect(() => {
    fetch("/api/emotion-logs")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  const total = logs.length;
  const trendUnlocked = total >= TREND_THRESHOLD;
  const progressPct = Math.min((total / TREND_THRESHOLD) * 100, 100);

  const emotionCounts = EMOTION_TYPES.map((e) => ({
    ...e,
    count: logs.filter((l) => l.emotionType === e.id).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="px-4 py-6 space-y-6 animate-fade-in">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">履歴</h1>
        <p className="text-sm text-muted-foreground">
          過去の感情記録を振り返ろう
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full bg-muted/50 p-1 rounded-xl">
          <TabsTrigger
            value="list"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5"
          >
            <Calendar className="w-4 h-4 mr-2" />
            記録一覧
          </TabsTrigger>
          <TabsTrigger
            value="trend"
            className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2.5"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            傾向
            {!trendUnlocked && (
              <span className="ml-1.5 text-xs text-muted-foreground/70 font-normal">
                {total}/{TREND_THRESHOLD}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6 space-y-3">
          {loading && (
            <p className="text-center text-muted-foreground py-16">
              読み込み中…
            </p>
          )}

          {!loading && logs.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <p className="text-5xl">📝</p>
              <p className="text-foreground font-medium">
                まだ記録がありません
              </p>
              <p className="text-sm text-muted-foreground">
                感情を記録して積み重ねていきましょう
              </p>
              <Link
                href="/record"
                className="inline-block mt-3 px-8 py-3 bg-gradient-to-r from-primary via-[#c9a882] to-primary text-white rounded-2xl text-sm font-semibold shadow-elevated"
              >
                最初の記録をする
              </Link>
            </div>
          )}

          {logs.map((log) => (
            <EmotionCard
              key={log.id}
              emotionType={log.emotionType}
              intensity={log.intensity}
              eventText={log.eventText}
              occurredAt={log.occurredAt}
              situationLabels={situationLabels(log.situationTag)}
              onClick={() => router.push(`/history/${log.id}`)}
            />
          ))}
        </TabsContent>

        <TabsContent value="trend" className="mt-6 space-y-4">
          {!trendUnlocked && (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3] space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-foreground">
                  傾向分析まで
                </p>
                <span className="text-sm font-bold text-primary">
                  {total} / {TREND_THRESHOLD} 件
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                あと {TREND_THRESHOLD - total} 件で傾向分析が解放されます
              </p>
            </div>
          )}

          {trendUnlocked ? (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3]">
              <h3 className="text-base font-semibold text-foreground mb-4">
                感情の出現回数
              </h3>
              <div className="space-y-4">
                {emotionCounts.map((e) => (
                  <div key={e.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{e.emoji}</span>
                        <span className="text-sm font-medium">{e.label}</span>
                      </div>
                      <span className="text-sm font-semibold">{e.count}回</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${e.colorClass.bg}`}
                        style={{
                          width:
                            total > 0 ? `${(e.count / total) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {["感情の出現回数", "時間帯の傾向", "強度の推移"].map((label) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-5 shadow-card border border-[#f0ebe3] flex items-center justify-between opacity-50"
                >
                  <p className="text-sm font-semibold text-muted-foreground">
                    {label}
                  </p>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    🔒 {TREND_THRESHOLD - total}件後
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
