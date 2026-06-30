import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TIME_OF_DAY } from "@/lib/constants";

function getTimeOfDay(date: Date) {
  return TIME_OF_DAY(date.getHours());
}

function computeSimilarity(
  newLog: {
    emotionType: string;
    intensity: number;
    situationTag?: string;
    occurredAt: Date;
  },
  pastLog: {
    emotionType: string;
    intensity: number;
    situationTag: string | null;
    occurredAt: Date;
  },
): number {
  let score = 0;

  // emotion_type 一致 (重み 0.4)
  if (newLog.emotionType === pastLog.emotionType) score += 0.4;

  // situation_tag 一致 (重み 0.3)
  if (newLog.situationTag && pastLog.situationTag) {
    const newTags = new Set(newLog.situationTag.split(","));
    const pastTags = new Set(pastLog.situationTag.split(","));
    const intersection = [...newTags].filter((t) => pastTags.has(t)).length;
    const union = new Set([...newTags, ...pastTags]).size;
    if (union > 0) score += 0.3 * (intersection / union);
  } else if (!newLog.situationTag && !pastLog.situationTag) {
    score += 0.3;
  }

  // 時間帯の近似 (重み 0.2)
  if (getTimeOfDay(newLog.occurredAt) === getTimeOfDay(pastLog.occurredAt))
    score += 0.2;

  // intensity ±1以内 (重み 0.1)
  if (Math.abs(newLog.intensity - pastLog.intensity) <= 1) score += 0.1;

  return Math.round(score * 100) / 100;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emotionType, intensity, situationTag, currentLogId } = body;

  const appState = await prisma.appState.findUnique({ where: { id: 1 } });
  if (!appState || appState.totalLogs < 5) {
    return NextResponse.json({
      similar: null,
      isFirstUxDemo: appState?.totalLogs === 1 && !appState.firstUxDemoSeen,
    });
  }

  const pastLogs = await prisma.emotionLog.findMany({
    where: currentLogId ? { id: { not: currentLogId } } : undefined,
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: {
      actions: {
        include: { copingCommits: { include: { copingStrategy: true } } },
      },
    },
  });

  const newLogData = {
    emotionType,
    intensity,
    situationTag,
    occurredAt: new Date(),
  };

  let bestLog = null;
  let bestScore = 0;

  for (const log of pastLogs) {
    const score = computeSimilarity(newLogData, log);
    if (score > bestScore) {
      bestScore = score;
      bestLog = log;
    }
  }

  if (bestScore >= 0.7 && bestLog) {
    return NextResponse.json({ similar: bestLog, similarityScore: bestScore });
  }

  return NextResponse.json({ similar: null });
}
