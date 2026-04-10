"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { MASTER_MENU } from "@/data/vendors";
import { getPackageCategoryRules } from "@/lib/bookingMenuHelpers";
import { formatCurrency } from "@/data/mockAccount";
import { AdminMetricCard, AdminPanel, AdminTableCard } from "@/components/admin/AdminUi";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  app: string;
  environment: string;
  routes: {
    health: { path: string; methods: string[]; status: "up" | "down" };
    bookings: { path: string; methods: string[]; status: "up" | "down" };
  };
  integrations: {
    razorpayPublicKey: boolean;
    razorpayServerKeys: boolean;
    googleMapsBrowserKey: boolean;
    emailTransportConfigured: boolean;
    whatsappTransportConfigured: boolean;
  };
  notes: string[];
};

const CUSTOMER_FLOW = [
  "Search caterers",
  "Open vendor profile",
  "Book Now",
  "Capture basics: event type, date, time, guests, food preference, package",
  "Customize menu",
  "Auth gate for non-logged-in users",
  "Collect customer + venue details",
  "Review order + bill",
  "Booking request submitted",
  "Admin review and vendor confirmation",
  "Payment link sent after confirmation",
  "Booking confirmed",
];

const ORDER_STATUS_FLOW = [
  "Booking Request Submitted",
  "Slot Held",
  "Pending Admin Review",
  "Vendor Notified",
  "Vendor Confirmed / Vendor Declined",
  "Payment Link Sent",
  "Payment Pending",
  "Payment Done",
  "Booking Confirmed",
  "Cancelled / Expired",
];

const NOTIFICATION_LOGIC = [
  {
    trigger: "Booking request submitted",
    audience: "Customer + Admin Ops",
    channel: "Email / WhatsApp",
    logic: "Customer receives acknowledgement. Admin queue receives new booking alert.",
  },
  {
    trigger: "Vendor notified",
    audience: "Assigned vendor + Admin Ops",
    channel: "Email / WhatsApp",
    logic: "Vendor receives tokenized confirmation link. Admin activity log is updated.",
  },
  {
    trigger: "Vendor confirmed",
    audience: "Customer + Admin Ops",
    channel: "Email / WhatsApp",
    logic: "Customer moves to payment stage. Ops sees vendor confirmation event.",
  },
  {
    trigger: "Payment link sent",
    audience: "Customer",
    channel: "Email / WhatsApp",
    logic: "Customer receives payment page link and invoice preview after confirmation.",
  },
  {
    trigger: "Payment done",
    audience: "Customer + Admin Ops",
    channel: "Email / WhatsApp",
    logic: "Receipt and booking confirmation follow-up can be issued.",
  },
];

const BILLING_RULES = [
  "Base amount = selected price per plate × guests",
  "Optional add-ons are charged per pax",
  "Water is charged per pax based on selected type",
  "GST = 18%",
  "Convenience fee is currently previewed in frontend logic",
  "Post-confirmation payment split = 30% online + 70% at property",
];

const BOOKING_PAYLOAD = {
  vendorSlug: "rajputana-grand-caterers",
  selectedPackage: "silver",
  pricePerPlate: 933,
  foodPreference: "veg_nonveg",
  guestCount: 150,
  eventType: "Wedding",
  eventDate: "2026-05-12",
  eventTime: "8:00 PM",
  customerName: "Priya Sharma",
  customerPhone: "9876543210",
  customerEmail: "priya@example.com",
  selectedItems: ["soupsDrinks::Tomato Soup", "starters::Paneer Tikka"],
  addOnItems: ["Mocktail"],
  waterType: "ro",
  venueName: "Royal Banquet",
  venueAddress: "C-Scheme, Jaipur",
  specialNote: "Keep one live counter near stage",
};

const BOOKING_RESPONSE = {
  orderId: "2026-123456",
  status: "pending",
  received: true,
};

const DEPLOYMENT_NOTES = [
  {
    title: "Real persistence",
    status: "pending",
    detail: "Current order, customer, and admin workflows still depend on demo/mock state. Replace local/demo stores with DB-backed services before launch.",
  },
  {
    title: "Notifications transport",
    status: "pending",
    detail: "Template logic exists, but actual email and WhatsApp delivery providers are not wired to production route handlers yet.",
  },
  {
    title: "Payment verification",
    status: "partial",
    detail: "Payment UI and Razorpay configuration are present. Webhook verification and capture reconciliation must still be finalized.",
  },
  {
    title: "Health endpoint",
    status: "live",
    detail: "A lightweight /api/health endpoint is available for route and integration readiness checks.",
  },
  {
    title: "Menu + billing contracts",
    status: "live",
    detail: "Menu grouping, package rules, and bill preview logic are available in shared booking helpers.",
  },
];

function TonePill({
  tone,
  children,
}: {
  tone: "live" | "pending" | "partial" | "up" | "down";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "live" || tone === "up"
      ? "border-[#B7E0C5] bg-[#EEFDF3] text-[#166534]"
      : tone === "partial"
        ? "border-[#F1DEB2] bg-[#FFF8E6] text-[#9A6700]"
        : "border-[#E2E8F0] bg-white text-[#64748B]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${toneClass}`}>
      {children}
    </span>
  );
}

export default function AdminSystemPage() {
  const { state } = useAdmin();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        if (!ignore) setHealth(data);
      })
      .catch(() => {
        if (!ignore) {
          setHealth({
            status: "degraded",
            timestamp: new Date().toISOString(),
            app: "MeraHalwai",
            environment: "unknown",
            routes: {
              health: { path: "/api/health", methods: ["GET"], status: "down" },
              bookings: { path: "/api/bookings", methods: ["POST"], status: "up" },
            },
            integrations: {
              razorpayPublicKey: false,
              razorpayServerKeys: false,
              googleMapsBrowserKey: false,
              emailTransportConfigured: false,
              whatsappTransportConfigured: false,
            },
            notes: ["Browser could not fetch runtime health state."],
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const pendingOrders = state.orders.filter((order) =>
    ["bookingRequestSubmitted", "slotHeld", "pendingAdminReview", "vendorNotified"].includes(order.status)
  ).length;
  const liveTemplates = state.templates.length;
  const activeVendors = state.vendors.filter((vendor) => vendor.status === "active").length;
  const masterMenuItemCount = MASTER_MENU.reduce((sum, category) => sum + category.items.length, 0);
  const bronzeRules = getPackageCategoryRules("bronze");
  const silverRules = getPackageCategoryRules("silver");
  const goldRules = getPackageCategoryRules("gold");
  const categoryLabels = state.settings.categoryMaster;
  const previewConvenienceFee = Math.round(100000 * 0.02);

  const integrationCount = [
    health?.integrations.razorpayPublicKey,
    health?.integrations.razorpayServerKeys,
    health?.integrations.googleMapsBrowserKey,
    health?.integrations.emailTransportConfigured,
    health?.integrations.whatsappTransportConfigured,
  ].filter(Boolean).length;

  const readinessRows = useMemo(
    () => [
      {
        area: "Customer booking routes",
        status: "live",
        note: "/caterers → /caterer/[slug] → /book/* → /booking/success",
      },
      {
        area: "Admin operations",
        status: "live",
        note: `${state.orders.length} demo orders · ${state.vendors.length} vendors in current state`,
      },
      {
        area: "Notifications transport",
        status:
          health?.integrations.emailTransportConfigured || health?.integrations.whatsappTransportConfigured
            ? "partial"
            : "pending",
        note: `${liveTemplates} templates exist, provider delivery still needs production wiring`,
      },
      {
        area: "Payment configuration",
        status: health?.integrations.razorpayServerKeys ? "live" : "pending",
        note: `Provider: ${state.settings.paymentLinkProvider}`,
      },
    ],
    [
      health?.integrations.emailTransportConfigured,
      health?.integrations.razorpayServerKeys,
      health?.integrations.whatsappTransportConfigured,
      liveTemplates,
      state.orders.length,
      state.settings.paymentLinkProvider,
      state.vendors.length,
    ]
  );

  return (
    <AdminShell
      title="System Health & Logic"
      description="Internal reference for API health, booking flow logic, billing rules, menu engine, notifications, and production readiness."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="Runtime Status" value={health?.status === "ok" ? "Healthy" : "Degraded"} helper={health?.timestamp ? new Date(health.timestamp).toLocaleString("en-IN") : "Loading runtime state"} tone={health?.status === "ok" ? "green" : "amber"} />
          <AdminMetricCard label="Pending Orders" value={String(pendingOrders)} helper="Orders waiting for admin or vendor action" tone="amber" />
          <AdminMetricCard label="Integrations Ready" value={`${integrationCount}/5`} helper="Keys and transports currently detected" tone="blue" />
          <AdminMetricCard label="Master Menu Items" value={String(masterMenuItemCount)} helper={`${MASTER_MENU.length} source categories · ${activeVendors} active vendors`} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AdminTableCard title="API Health" eyebrow="Routes & Integrations">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  <tr>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Path / Source</th>
                    <th className="px-5 py-4">Methods</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF4] text-[14px] text-[#0F172A]">
                  <tr>
                    <td className="px-5 py-4 font-semibold">Health API</td>
                    <td className="px-5 py-4 font-mono text-[12px] text-[#64748B]">{health?.routes.health.path ?? "/api/health"}</td>
                    <td className="px-5 py-4">{health?.routes.health.methods.join(", ") ?? "GET"}</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.routes.health.status ?? "down"}>{health?.routes.health.status ?? "down"}</TonePill>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold">Bookings API</td>
                    <td className="px-5 py-4 font-mono text-[12px] text-[#64748B]">{health?.routes.bookings.path ?? "/api/bookings"}</td>
                    <td className="px-5 py-4">{health?.routes.bookings.methods.join(", ") ?? "POST"}</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.routes.bookings.status ?? "down"}>{health?.routes.bookings.status ?? "down"}</TonePill>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold">Razorpay Public Key</td>
                    <td className="px-5 py-4 text-[#64748B]">NEXT_PUBLIC_RAZORPAY_KEY_ID</td>
                    <td className="px-5 py-4">ENV</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.integrations.razorpayPublicKey ? "live" : "pending"}>
                        {health?.integrations.razorpayPublicKey ? "live" : "pending"}
                      </TonePill>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold">Razorpay Server Keys</td>
                    <td className="px-5 py-4 text-[#64748B]">Server secret pair</td>
                    <td className="px-5 py-4">ENV</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.integrations.razorpayServerKeys ? "live" : "pending"}>
                        {health?.integrations.razorpayServerKeys ? "live" : "pending"}
                      </TonePill>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold">Google Maps Browser Key</td>
                    <td className="px-5 py-4 text-[#64748B]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</td>
                    <td className="px-5 py-4">ENV</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.integrations.googleMapsBrowserKey ? "live" : "pending"}>
                        {health?.integrations.googleMapsBrowserKey ? "live" : "pending"}
                      </TonePill>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold">Email Transport</td>
                    <td className="px-5 py-4 text-[#64748B]">Notification provider</td>
                    <td className="px-5 py-4">Service</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.integrations.emailTransportConfigured ? "live" : "pending"}>
                        {health?.integrations.emailTransportConfigured ? "live" : "pending"}
                      </TonePill>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-semibold">WhatsApp Transport</td>
                    <td className="px-5 py-4 text-[#64748B]">Notification provider</td>
                    <td className="px-5 py-4">Service</td>
                    <td className="px-5 py-4">
                      <TonePill tone={health?.integrations.whatsappTransportConfigured ? "live" : "pending"}>
                        {health?.integrations.whatsappTransportConfigured ? "live" : "pending"}
                      </TonePill>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AdminTableCard>

          <AdminPanel eyebrow="Readiness" title="Deployment Snapshot">
            <div className="space-y-3">
              {readinessRows.map((item) => (
                <div key={item.area} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-semibold text-[#0F172A]">{item.area}</p>
                    <TonePill tone={item.status as "live" | "pending" | "partial"}>{item.status}</TonePill>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[#64748B]">{item.note}</p>
                </div>
              ))}
            </div>
            {health?.notes?.length ? (
              <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Runtime Notes</p>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.7] text-[#5B6574]">
                  {health.notes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </AdminPanel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <AdminPanel eyebrow="Booking Engine" title="Customer Flow">
            <div className="space-y-3">
              {CUSTOMER_FLOW.map((step, index) => (
                <div key={step} className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#0F172A]">
                  <span className="mr-2 text-[#64748B]">{index + 1}.</span>
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Billing Engine" title="Billing Logic">
            <div className="space-y-3">
              {BILLING_RULES.map((rule) => (
                <div key={rule} className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] leading-[1.7] text-[#334155]">
                  {rule}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Current Settings Cross-check</p>
              <div className="mt-3 space-y-2 text-[13px] text-[#475569]">
                <div className="flex items-center justify-between"><span>GST rate</span><span className="font-semibold text-[#0F172A]">{state.settings.gstRate}%</span></div>
                <div className="flex items-center justify-between"><span>Slot hold</span><span className="font-semibold text-[#0F172A]">{state.settings.slotHoldDurationMinutes} mins</span></div>
                <div className="flex items-center justify-between"><span>Preview convenience fee on ₹1,00,000</span><span className="font-semibold text-[#0F172A]">{formatCurrency(previewConvenienceFee)}</span></div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Status Machine" title="Order Lifecycle">
            <div className="space-y-3">
              {ORDER_STATUS_FLOW.map((step, index) => (
                <div key={step} className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#0F172A]">
                  <span className="mr-2 text-[#64748B]">{index + 1}.</span>
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AdminTableCard title="Menu Logic Matrix" eyebrow="Package Rules">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  <tr>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Bronze</th>
                    <th className="px-5 py-4">Silver</th>
                    <th className="px-5 py-4">Gold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF4] text-[13px] text-[#0F172A]">
                  {categoryLabels.map((category) => (
                    <tr key={category.key}>
                      <td className="px-5 py-4 font-semibold">{category.label}</td>
                      <td className="px-5 py-4 text-[#64748B]">
                        {bronzeRules[category.key].requiredCount} required
                      </td>
                      <td className="px-5 py-4 text-[#64748B]">
                        {silverRules[category.key].requiredCount} required
                      </td>
                      <td className="px-5 py-4 text-[#64748B]">
                        {goldRules[category.key].requiredCount} required
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableCard>

          <AdminPanel eyebrow="Master Menu" title="Source Dataset">
            <div className="space-y-3">
              {MASTER_MENU.map((category) => (
                <div key={category.name} className="flex items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px]">
                  <span className="font-medium text-[#334155]">{category.name}</span>
                  <span className="font-semibold text-[#0F172A]">{category.items.length}</span>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>

        <AdminTableCard title="Notification Trigger Matrix" eyebrow="Automation Logic">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                <tr>
                  <th className="px-5 py-4">Trigger</th>
                  <th className="px-5 py-4">Audience</th>
                  <th className="px-5 py-4">Channel</th>
                  <th className="px-5 py-4">Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4] text-[13px] text-[#0F172A]">
                {NOTIFICATION_LOGIC.map((item) => (
                  <tr key={item.trigger}>
                    <td className="px-5 py-4 font-semibold">{item.trigger}</td>
                    <td className="px-5 py-4">{item.audience}</td>
                    <td className="px-5 py-4">{item.channel}</td>
                    <td className="px-5 py-4 text-[#64748B]">{item.logic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminTableCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminPanel eyebrow="Contracts" title="Booking API Request">
            <div className="overflow-hidden rounded-[16px] border border-[#1E293B] bg-[#0F172A] p-4 text-[12px] leading-[1.8] text-[#D8E4F5]">
              <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(BOOKING_PAYLOAD, null, 2)}</pre>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Contracts" title="Booking API Response">
            <div className="overflow-hidden rounded-[16px] border border-[#1E293B] bg-[#0F172A] p-4 text-[12px] leading-[1.8] text-[#D8E4F5]">
              <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(BOOKING_RESPONSE, null, 2)}</pre>
            </div>
          </AdminPanel>
        </div>

        <AdminPanel
          eyebrow="Deploy Readiness"
          title="Before Production Launch"
          description="Use this checklist to identify what still needs real backend wiring or production verification."
        >
          <div className="space-y-3">
            {DEPLOYMENT_NOTES.map((item) => (
              <div key={item.title} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[15px] font-semibold text-[#0F172A]">{item.title}</p>
                  <TonePill tone={item.status as "live" | "pending" | "partial"}>{item.status}</TonePill>
                </div>
                <p className="mt-2 text-[13px] leading-[1.8] text-[#64748B]">{item.detail}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
