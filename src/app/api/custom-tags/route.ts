import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
  const { data: tags } = await supabase
    .from("CustomTag")
    .select("*")
    .order("createdAt", { ascending: true });
  return NextResponse.json(tags ?? []);
}

export async function POST(req: NextRequest) {
  const { label } = await req.json();

  const { count } = await supabase
    .from("CustomTag")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "不要なタグを削除してください（上限5件）" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const { data: tag } = await supabase
    .from("CustomTag")
    .insert({ label, updatedAt: now })
    .select()
    .single();
  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await supabase.from("CustomTag").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
