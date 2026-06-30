import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  let { data: state } = await supabase
    .from("AppState")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (!state) {
    const { data } = await supabase
      .from("AppState")
      .insert({ id: 1, updatedAt: new Date().toISOString() })
      .select()
      .single();
    state = data;
  }

  return NextResponse.json({
    onboardingCompleted: state?.onboardingCompleted ?? false,
    mbtiType: state?.mbtiType ?? null,
    emotionTendency: state?.emotionTendency
      ? JSON.parse(state.emotionTendency)
      : null,
    goal: state?.goal ?? null,
    reminderEnabled: state?.reminderEnabled ?? false,
    reminderTime: state?.reminderTime ?? "21:00",
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (body.onboardingCompleted !== undefined)
    updateData.onboardingCompleted = body.onboardingCompleted;
  if (body.mbtiType !== undefined) updateData.mbtiType = body.mbtiType;
  if (body.emotionTendency !== undefined)
    updateData.emotionTendency = JSON.stringify(body.emotionTendency);
  if (body.goal !== undefined) updateData.goal = body.goal;
  if (body.reminderEnabled !== undefined)
    updateData.reminderEnabled = body.reminderEnabled;
  if (body.reminderTime !== undefined)
    updateData.reminderTime = body.reminderTime;

  const { data: updated } = await supabase
    .from("AppState")
    .upsert({ id: 1, ...updateData }, { onConflict: "id" })
    .select()
    .single();

  return NextResponse.json({ ok: true, data: updated });
}
