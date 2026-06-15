import { NextResponse } from "next/server";
import { getMyRecentPages } from "@/lib/confluence";

export async function GET() {
  try {
    const pages = await getMyRecentPages(30);
    return NextResponse.json({ pages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
