import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    app: "MeraHalwai",
    environment: process.env.NODE_ENV ?? "development",
    routes: {
      health: { path: "/api/health", methods: ["GET"], status: "up" as const },
      bookings: { path: "/api/bookings", methods: ["POST"], status: "up" as const },
    },
    integrations: {
      razorpayPublicKey: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
      razorpayServerKeys: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      googleMapsBrowserKey: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
      emailTransportConfigured: false,
      whatsappTransportConfigured: false,
    },
    notes: [
      "This endpoint reports route and integration readiness only.",
      "Secrets are never returned; only boolean configuration status is exposed.",
    ],
  };

  return NextResponse.json(health, { status: 200 });
}
