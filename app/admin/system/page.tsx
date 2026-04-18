"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { getAdminDisplayStatus } from "@/data/mockAdmin";
import { AdminMetricCard, AdminPanel } from "@/components/admin/AdminUi";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  routes: {
    health: { status: "up" | "down" };
    bookings: { status: "up" | "down" };
  };
  integrations: {
    razorpayPublicKey: boolean;
    razorpayServerKeys: boolean;
    googleMapsBrowserKey: boolean;
    emailTransportConfigured: boolean;
    whatsappTransportConfigured: boolean;
  };
};

export default function AdminSystemPage() {
  const { state } = useAdmin();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setHealth(data);
      })
      .catch(() => {
        if (!ignore) setHealth(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AdminShell
      title="System"
      description="Only the live pieces that matter for booking, payment, and notifications."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Runtime"
          value={health?.status === "ok" ? "Healthy" : "Needs Check"}
          helper={health?.timestamp ? new Date(health.timestamp).toLocaleString("en-IN") : "Health API pending"}
          tone={health?.status === "ok" ? "green" : "amber"}
        />
        <AdminMetricCard
          label="Not Confirmed"
          value={String(state.orders.filter((order) => getAdminDisplayStatus(order.status) === "notConfirmed").length)}
          helper="Needs admin action"
          tone="amber"
        />
        <AdminMetricCard
          label="Live Vendors"
          value={String(state.vendors.filter((vendor) => vendor.status === "active").length)}
          helper="Customer-facing vendors"
          tone="blue"
        />
        <AdminMetricCard
          label="Templates"
          value={String(state.templates.length)}
          helper="Booking and payment notifications"
          tone="slate"
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Health Checks" eyebrow="Current">
          <div className="space-y-3">
            {[
              ["Health API", health?.routes.health.status === "up"],
              ["Bookings API", health?.routes.bookings.status === "up"],
              ["Razorpay Public Key", health?.integrations.razorpayPublicKey],
              ["Razorpay Server Keys", health?.integrations.razorpayServerKeys],
              ["Google Maps Key", health?.integrations.googleMapsBrowserKey],
              ["Email Transport", health?.integrations.emailTransportConfigured],
            ].map(([label, ok]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
              >
                <span className="text-[14px] font-medium text-[#334155]">{label}</span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                    ok ? "bg-[#ECFDF3] text-[#166534]" : "bg-white text-[#64748B]"
                  }`}
                >
                  {ok ? "live" : "pending"}
                </span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Flow Notes" eyebrow="Live Logic">
          <div className="space-y-3 text-[14px] leading-[1.7] text-[#475569]">
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              Customer submits booking request → admin receives queue entry → vendor gets confirmation link → customer gets payment link after confirmation.
            </div>
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              Customer sees support phone only. Vendor phone is never shown on the customer side.
            </div>
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              Coupons and convenience fee are not part of the live customer flow right now.
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
