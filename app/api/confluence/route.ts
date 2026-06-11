import { NextRequest, NextResponse } from "next/server";
import { createPage } from "@/lib/confluence";
import type { ConfluenceCreateRequest } from "@/lib/confluence";

export async function POST(req: NextRequest) {
  try {
    const body: ConfluenceCreateRequest = await req.json();

    if (!body.title || !body.space?.key) {
      return NextResponse.json({ error: "title and space.key are required" }, { status: 400 });
    }

    const page = await createPage(body);
    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
