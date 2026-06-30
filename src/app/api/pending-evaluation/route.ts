import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const HOURS_72 = 72 * 60 * 60 * 1000;

export async function GET() {
  const cutoff = new Date(Date.now() - HOURS_72);

  const commit = await prisma.copingCommit.findFirst({
    where: {
      effectScore: null,
      evaluatedAt: null,
      committedAt: { gte: cutoff },
    },
    orderBy: { committedAt: "desc" },
    include: { copingStrategy: true },
  });

  return NextResponse.json(commit ?? null);
}
