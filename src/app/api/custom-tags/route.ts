import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tags = await prisma.customTag.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const { label } = await req.json();

  const count = await prisma.customTag.count();
  if (count >= 5) {
    return NextResponse.json(
      { error: "不要なタグを削除してください（上限5件）" },
      { status: 400 },
    );
  }

  const tag = await prisma.customTag.create({ data: { label } });
  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.customTag.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
