import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const state = await prisma.appState.findUnique({ where: { id: 1 } });
  return NextResponse.json(
    state ?? { id: 1, totalLogs: 0, firstUxDemoSeen: false },
  );
}

export async function PATCH() {
  const state = await prisma.appState.upsert({
    where: { id: 1 },
    update: { firstUxDemoSeen: true },
    create: { id: 1, firstUxDemoSeen: true },
  });
  return NextResponse.json(state);
}
