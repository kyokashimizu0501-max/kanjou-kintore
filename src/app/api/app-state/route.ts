import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  const { data: state } = await supabase
    .from("AppState")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return NextResponse.json(
    state ?? { id: 1, totalLogs: 0, firstUxDemoSeen: false },
  );
}

export async function PATCH() {
  const { data: state } = await supabase
    .from("AppState")
    .upsert(
      { id: 1, firstUxDemoSeen: true, updatedAt: new Date().toISOString() },
      { onConflict: "id" },
    )
    .select()
    .single();
  return NextResponse.json(state);
}
