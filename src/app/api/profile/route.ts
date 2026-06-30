import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const state = await prisma.appState.upsert({
    where: { id: 1 },
    create: {},
    update: {},
  });
  return NextResponse.json({
    onboardingCompleted: state.onboardingCompleted,
    mbtiType: state.mbtiType,
    emotionTendency: state.emotionTendency
      ? JSON.parse(state.emotionTendency)
      : null,
    goal: state.goal,
    reminderEnabled: state.reminderEnabled,
    reminderTime: state.reminderTime,
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const updated = await prisma.appState.upsert({
    where: { id: 1 },
    create: {
      onboardingCompleted: body.onboardingCompleted ?? false,
      mbtiType: body.mbtiType ?? null,
      emotionTendency: body.emotionTendency
        ? JSON.stringify(body.emotionTendency)
        : null,
      goal: body.goal ?? null,
      reminderEnabled: body.reminderEnabled ?? false,
      reminderTime: body.reminderTime ?? "21:00",
    },
    update: {
      ...(body.onboardingCompleted !== undefined && {
        onboardingCompleted: body.onboardingCompleted,
      }),
      ...(body.mbtiType !== undefined && { mbtiType: body.mbtiType }),
      ...(body.emotionTendency !== undefined && {
        emotionTendency: JSON.stringify(body.emotionTendency),
      }),
      ...(body.goal !== undefined && { goal: body.goal }),
      ...(body.reminderEnabled !== undefined && {
        reminderEnabled: body.reminderEnabled,
      }),
      ...(body.reminderTime !== undefined && {
        reminderTime: body.reminderTime,
      }),
    },
  });
  return NextResponse.json({ ok: true, data: updated });
}
