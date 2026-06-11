import { NextRequest, NextResponse } from "next/server";
import { getPages } from "@/lib/confluence";

export async function GET(req: NextRequest) {
  try {
    const spaceKey = req.nextUrl.searchParams.get("spaceKey");
    if (!spaceKey) {
      return NextResponse.json({ error: "spaceKey is required" }, { status: 400 });
    }
    const pages = await getPages(spaceKey);
    return NextResponse.json({ pages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
