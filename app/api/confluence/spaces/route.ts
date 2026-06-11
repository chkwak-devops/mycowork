import { NextResponse } from "next/server";
import { getSpaces } from "@/lib/confluence";

export async function GET() {
  try {
    let spaces = await getSpaces();
    const filterKey = process.env.CONFLUENCE_SPACE_KEY;
    if (filterKey) {
      spaces = spaces.filter((s) => s.key === filterKey);
    }
    return NextResponse.json({ spaces });
    return NextResponse.json({ spaces });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
