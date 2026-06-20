import { NextResponse } from "next/server";

// Holding healthcheck contract: GET /api/health -> { "status": "ok" }
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
