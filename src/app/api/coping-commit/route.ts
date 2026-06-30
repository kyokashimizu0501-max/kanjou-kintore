import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { actionId, copingStrategyId } = body;

  const commit = await prisma.copingCommit.create({
    data: { actionId, copingStrategyId },
  });

  await prisma.copingStrategy.update({
    where: { id: copingStrategyId },
    data: { totalUsed: { increment: 1 } },
  });

  return NextResponse.json(commit, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { commitId, effectScore } = body;

  const commit = await prisma.copingCommit.update({
    where: { id: commitId },
    data: { effectScore, evaluatedAt: new Date() },
  });

  if (effectScore >= 2) {
    await prisma.copingStrategy.update({
      where: { id: commit.copingStrategyId },
      data: { successCount: { increment: 1 } },
    });
  }

  return NextResponse.json(commit);
}
