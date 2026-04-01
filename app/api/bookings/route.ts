import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id =
      "2026-" + String(Math.floor(100000 + Math.random() * 899999));
    return NextResponse.json({
      orderId: id,
      status: "pending" as const,
      received: Boolean(body?.vendorSlug),
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
