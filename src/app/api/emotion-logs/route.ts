import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TIME_OF_DAY } from "@/lib/constants";

export async function GET() {
  const logs = await prisma.emotionLog.findMany({
    orderBy: { occurredAt: "desc" },
    take: 100,
    include: { actions: true },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emotionType, intensity, situationTag, eventText, actions } = body;

  const log = await prisma.emotionLog.create({
    data: {
      emotionType,
      intensity,
      situationTag: situationTag ?? null,
      eventText: eventText ?? null,
      actions: actions?.length
        ? {
            create: actions.map(
              (a: {
                actionType: string;
                actionDetail?: string;
                isCustomTag?: boolean;
              }) => ({
                actionType: a.actionType,
                actionDetail: a.actionDetail ?? null,
                isCustomTag: a.isCustomTag ?? false,
              }),
            ),
          }
        : undefined,
    },
    include: { actions: true },
  });

  // AppState のトータルログ数を更新
  await prisma.appState.upsert({
    where: { id: 1 },
    update: { totalLogs: { increment: 1 } },
    create: { id: 1, totalLogs: 1 },
  });

  return NextResponse.json(log, { status: 201 });
}
