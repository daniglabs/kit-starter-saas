import { NextResponse } from "next/server";
import { seedInitialData } from "@/app/actions/seed";

export async function GET() {
  await seedInitialData();
  return NextResponse.json({ ok: true });
}

