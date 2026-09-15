import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Render's health check target. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
