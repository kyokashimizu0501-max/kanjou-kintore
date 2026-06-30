import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emotionType = searchParams.get("emotionType");

  let query = supabase
    .from("CopingStrategy")
    .select("*")
    .order("successCount", { ascending: false })
    .order("id", { ascending: true });

  if (emotionType) {
    query = query.eq("emotionType", emotionType);
  }

  const { data } = await query;
  return NextResponse.json(data ?? []);
}
