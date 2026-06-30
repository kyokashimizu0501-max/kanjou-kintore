import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

const HOURS_72 = 72 * 60 * 60 * 1000;

export async function GET() {
  const cutoff = new Date(Date.now() - HOURS_72).toISOString();

  const { data: commit } = await supabase
    .from("CopingCommit")
    .select("*, copingStrategy:CopingStrategy(*)")
    .is("effectScore", null)
    .is("evaluatedAt", null)
    .gte("committedAt", cutoff)
    .order("committedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json(commit ?? null);
}
