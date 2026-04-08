"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Phone, XCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { getVendorOrderByToken, respondToVendorToken } from "@/data/mockAdmin";
import { formatCurrency } from "@/data/mockAccount";

export default function VendorOrderTokenPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const [submitting, setSubmitting] = useState<"confirm" | "decline" | null>(null);
  const [result, setResult] = useState<"confirm" | "decline" | null>(null);
  const order = getVendorOrderByToken(token);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F7F4EE]">
        <Navbar />
        <div className="mx-auto max-w-[780px] px-4 py-16">
          <div className="rounded-[32px] border border-[#E7DED2] bg-white px-6 py-12 text-center shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
            <p className="text-[28px] font-black tracking-[-0.03em] text-[#171511]">Invalid vendor link</p>
            <p className="mt-3 text-[15px] text-[#6E645A]">
              This confirmation link is unavailable or has expired. Please contact the MeraHalwai ops team.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const handleAction = async (decision: "confirm" | "decline") => {
    if (submitting) return;
    setSubmitting(decision);
    try {
      respondToVendorToken(token, decision);
      setResult(decision);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FFFDF8_0%,#F8F2E8_100%)] pb-12">
      <Navbar />
      <div className="mx-auto max-w-[1180px] px-4 pt-8 md:px-6 xl:px-8">
        <section className="rounded-[36px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)] md:p-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Vendor Confirmation</p>
          <h1 className="mt-3 text-[40px] font-black tracking-[-0.05em] text-[#171511]">
            Review this booking and respond
          </h1>
          <p className="mt-4 max-w-[760px] text-[15px] leading-[1.8] text-[#6C6053]">
            Please review the event basics, selected menu, venue details, and customer note. Confirm only if your team can execute the booking exactly as requested.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Event">{order.eventType}</StatCard>
            <StatCard label="Date">{order.eventDate}</StatCard>
            <StatCard label="Guests">{String(order.guests)}</StatCard>
            <StatCard label="Package">{`${order.packageName} · ${formatCurrency(order.pricePerPlate)}/plate`}</StatCard>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Section title="Selected menu">
                <div className="space-y-4">
                  {order.menuSummary.groupedCategories.map((group) => (
                    <div key={group.label} className="rounded-[24px] border border-[#ECE2D6] bg-[#FCFAF7] px-5 py-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[16px] font-black text-[#171511]">{group.label}</p>
                        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">
                          {group.items.length} items
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={`${group.label}-${item.name}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[#E2D8CC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3F352D]"
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? "bg-[#1F7A3F]" : "bg-[#B54532]"}`} />
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Venue details">
                <div className="grid gap-4 md:grid-cols-2">
                  <StatCard label="Venue">{order.venue.venueName}</StatCard>
                  <StatCard label="Location">{`${order.venue.city} · ${order.venue.pincode}`}</StatCard>
                  <StatCard label="Address">{order.venue.address}</StatCard>
                  <StatCard label="Customer note">{order.menuSummary.catererNote || "No special note added."}</StatCard>
                </div>
              </Section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[28px] border border-[#E7DED2] bg-[#FCFAF7] px-5 py-5">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Support</p>
                <p className="mt-3 text-[15px] leading-[1.8] text-[#65594D]">
                  If you need clarification before confirming, contact the MeraHalwai ops team directly.
                </p>
                <a
                  href="tel:+919000011111"
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E6D9CB] bg-white px-5 text-[13px] font-bold text-[#3E352C]"
                >
                  <Phone className="h-4 w-4" />
                  Call Support
                </a>
              </div>

              <div className="rounded-[28px] border border-[#E7DED2] bg-white px-5 py-5 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Respond</p>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    disabled={!!submitting || !!result}
                    onClick={() => void handleAction("confirm")}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[14px] font-bold text-white disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    disabled={!!submitting || !!result}
                    onClick={() => void handleAction("decline")}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E7B8B8] bg-[#FFF4F4] px-5 text-[14px] font-bold text-[#B54545] disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Decline Booking
                  </button>
                </div>
                {result ? (
                  <div className="mt-4 rounded-[22px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-4 text-[14px] leading-[1.7] text-[#65594D]">
                    {result === "confirm"
                      ? "You have confirmed this booking. The MeraHalwai ops team has been notified and will continue payment follow-up."
                      : "You have declined this booking. The ops team has been alerted for reassignment."}
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold leading-[1.7] text-[#171511]">{children}</p>
    </div>
  );
}
