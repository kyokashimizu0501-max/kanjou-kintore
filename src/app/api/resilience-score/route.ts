import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // intensity >= 3 のログ数（分母）
  const highIntensityLogs = await prisma.emotionLog.count({
    where: { intensity: { gte: 3 } },
  });

  // effectScore >= 2 のコミット数（分子）
  const successCommits = await prisma.copingCommit.count({
    where: {
      effectScore: { gte: 2 },
      evaluatedAt: { not: null },
    },
  });

  const score =
    highIntensityLogs === 0
      ? 0
      : Math.min(Math.round((successCommits / highIntensityLogs) * 100), 100);

  return NextResponse.json({
    score,
    successCount: successCommits,
    totalHighIntensity: highIntensityLogs,
  });
}
