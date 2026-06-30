import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  const { data: logs } = await supabase
    .from("EmotionLog")
    .select("*, actions:Action(*)")
    .order("occurredAt", { ascending: false })
    .limit(100);
  return NextResponse.json(logs ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { emotionType, intensity, situationTag, eventText, actions } = body;

  const { data: log } = await supabase
    .from("EmotionLog")
    .insert({
      emotionType,
      intensity,
      situationTag: situationTag ?? null,
      eventText: eventText ?? null,
    })
    .select()
    .single();

  if (actions?.length && log) {
    await supabase.from("Action").insert(
      actions.map(
        (a: {
          actionType: string;
          actionDetail?: string;
          isCustomTag?: boolean;
        }) => ({
          emotionLogId: log.id,
          actionType: a.actionType,
          actionDetail: a.actionDetail ?? null,
          isCustomTag: a.isCustomTag ?? false,
        }),
      ),
    );
  }

  const { data: state } = await supabase
    .from("AppState")
    .select("totalLogs")
    .eq("id", 1)
    .maybeSingle();

  await supabase.from("AppState").upsert(
    {
      id: 1,
      totalLogs: (state?.totalLogs ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  const { data: fullLog } = await supabase
    .from("EmotionLog")
    .select("*, actions:Action(*)")
    .eq("id", log!.id)
    .single();

  return NextResponse.json(fullLog, { status: 201 });
}
