import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  const { count: highIntensityLogs } = await supabase
    .from("EmotionLog")
    .select("*", { count: "exact", head: true })
    .gte("intensity", 3);

  const { count: successCommits } = await supabase
    .from("CopingCommit")
    .select("*", { count: "exact", head: true })
    .gte("effectScore", 2)
    .not("evaluatedAt", "is", null);

  const total = highIntensityLogs ?? 0;
  const success = successCommits ?? 0;
  const score =
    total === 0 ? 0 : Math.min(Math.round((success / total) * 100), 100);

  return NextResponse.json({
    score,
    successCount: success,
    totalHighIntensity: total,
  });
}
