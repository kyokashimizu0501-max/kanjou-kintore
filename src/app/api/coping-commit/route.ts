import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { actionId, copingStrategyId } = body;

  const { data: commit } = await supabase
    .from("CopingCommit")
    .insert({ actionId, copingStrategyId })
    .select()
    .single();

  const { data: strategy } = await supabase
    .from("CopingStrategy")
    .select("totalUsed")
    .eq("id", copingStrategyId)
    .single();

  await supabase
    .from("CopingStrategy")
    .update({ totalUsed: (strategy?.totalUsed ?? 0) + 1 })
    .eq("id", copingStrategyId);

  return NextResponse.json(commit, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { commitId, effectScore } = body;

  const { data: commit } = await supabase
    .from("CopingCommit")
    .update({ effectScore, evaluatedAt: new Date().toISOString() })
    .eq("id", commitId)
    .select()
    .single();

  if (effectScore >= 2 && commit) {
    const { data: strategy } = await supabase
      .from("CopingStrategy")
      .select("successCount")
      .eq("id", commit.copingStrategyId)
      .single();

    await supabase
      .from("CopingStrategy")
      .update({ successCount: (strategy?.successCount ?? 0) + 1 })
      .eq("id", commit.copingStrategyId);
  }

  return NextResponse.json(commit);
}
