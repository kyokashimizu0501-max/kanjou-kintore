import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emotionType = searchParams.get("emotionType");

  const strategies = await prisma.copingStrategy.findMany({
    where: emotionType ? { emotionType } : undefined,
    orderBy: [{ successCount: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(strategies);
}
