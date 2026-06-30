import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const log = await prisma.emotionLog.findUnique({
    where: { id: Number(id) },
    include: { actions: true },
  });
  if (!log) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(log);
}
