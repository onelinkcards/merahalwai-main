"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/data/mockAccount";
import { getAdminOrderById, type AdminOrderRecord } from "@/data/mockAdmin";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  UtensilsCrossed,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type PayClientProps = { orderId: string };

export default function PayClient({ orderId }: PayClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [tastingDate, setTastingDate] = useState("");
  const [tastingTime, setTastingTime] = useState("");
  const [tastingBooked, setTastingBooked] = useState(false);
  const [tastingError, setTastingError] = useState("");
  const order: AdminOrderRecord | null = getAdminOrderById(orderId);
  const razorpayKey =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_live_SZTkZ0kcr1wMAN";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const invoiceLines = order
    ? [
        { label: "Base Amount", value: order.bill.baseAmount },
        { label: "Auto Add-ons", value: order.bill.autoAddOns },
        { label: "Optional Add-ons", value: order.bill.optionalAddOns },
        { label: "Water", value: order.bill.water },
        { label: "Subtotal", value: order.bill.subtotal },
        { label: "GST (18%)", value: order.bill.gst },
        { label: "Convenience Fee", value: order.bill.convenienceFee },
      ]
    : [];

  const advanceAmount = order ? Math.round(order.bill.finalTotal * 0.3) : 0;
  const balanceAtProperty = order ? Math.max(order.bill.finalTotal - advanceAmount, 0) : 0;
  const minDate = new Date().toISOString().split("T")[0];
  const tastingSlots = [
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
  ];

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] px-4 py-10 text-[#111827]">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-[24px] border border-[#DDE6F3] bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#2F6FED]">Payment</p>
          <h1 className="mt-3 text-[28px] font-black text-[#0F172A]">Order not found</h1>
          <p className="mt-3 max-w-[460px] text-[15px] leading-[1.7] text-[#475467]">
            This payment link is invalid or the booking record is unavailable.
          </p>
          <Link
            href="/caterers"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#1F4BB2] px-5 text-[13px] font-semibold text-white"
          >
            Back to Caterers
          </Link>
        </div>
      </div>
    );
  }

  const handlePay = () => {
    if (isLoading || paid) return;
    if (!window.Razorpay) return;
    setIsLoading(true);

    const options = {
      key: razorpayKey,
      amount: Math.round(advanceAmount * 100),
      currency: "INR",
      name: "MeraHalwai",
      description: `30% advance payment for ${order.vendorName}`,
      prefill: {
        name: order.customer.name,
        email: order.customer.email,
        contact: order.customer.phone.replace(/\D/g, ""),
      },
      notes: {
        order_id: order.id,
        package: order.packageName,
      },
      theme: { color: "#EC9925" },
      handler: () => {
        setPaid(true);
        setIsLoading(false);
      },
      modal: {
        ondismiss: () => setIsLoading(false),
      },
    };

    const instance = new window.Razorpay(options);
    instance.open();
  };

  const handleScheduleTasting = () => {
    if (!paid) return;
    if (!tastingDate || !tastingTime) {
      setTastingError("Please select date and time.");
      return;
    }
    setTastingError("");
    setTastingBooked(true);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FCFAF6_0%,#F7F0E6_55%,#F4EBDD_100%)] px-4 py-8 text-[#111827]">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#E7DCCB] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(35,25,20,0.08)] sm:px-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">Payment Link</p>
            <h1 className="mt-2 text-[26px] font-black tracking-[-0.02em] text-[#151310]">
              {order.vendorName}
            </h1>
            <p className="mt-2 text-[14px] text-[#5F564D]">
              Order {order.id} · {order.packageName} · {order.guests} guests
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://wa.me/919876543210"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#CEE5D9] bg-white px-3 text-[12px] font-semibold text-[#1B9C52]"
            >
              <MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
              WhatsApp
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E5DACD] bg-white px-3 text-[12px] font-semibold text-[#4D4338]"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
            <Link
              href="/caterers"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E5DACD] bg-white px-3 text-[12px] font-semibold text-[#4D4338]"
            >
              Back
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="rounded-[24px] border border-[#E8D7C1] bg-[linear-gradient(180deg,#FFF8EF_0%,#FFFDF9_100%)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#8A6A4B]">
            Payment Split (Post Confirmation)
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EFE4D6]">
            <div className="h-full w-[30%] rounded-full bg-[linear-gradient(90deg,#EC9925_0%,#8A3E1D_100%)]" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E1C9AA] bg-[linear-gradient(145deg,#FFF0D8_0%,#FFE3BF_100%)] px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#8A3E1D]">30% Pay Now</p>
              <p className="mt-1 text-[24px] font-black text-[#20150E]">{formatCurrency(advanceAmount)}</p>
              <p className="text-[11px] text-[#7C5634]">Pay now via secure Razorpay link.</p>
            </div>
            <div className="rounded-xl border border-[#ECE5DB] bg-[#FAF7F2] px-3 py-3 opacity-70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#7E756B]">70% At Property</p>
              <p className="mt-1 text-[24px] font-black text-[#575047]">{formatCurrency(balanceAtProperty)}</p>
              <p className="text-[11px] text-[#7E756B]">Pay offline at event venue.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[20px] border border-[#E7DCCB] bg-white p-6 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">Booking Summary</p>
            <div className="mt-4 space-y-3 text-[15px] text-[#1B1713]">
              <SummaryRow label="Customer" value={order.customer.name} />
              <SummaryRow label="Event" value={`${order.eventType} · ${order.eventDate}`} />
              <SummaryRow label="Time" value={order.eventTime} />
              <SummaryRow label="Food Preference" value={order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg"} />
              <SummaryRow label="Venue" value={`${order.venue.venueName}, ${order.venue.city}`} />
              <SummaryRow label="Contact" value={order.customer.phone} />
            </div>
          </section>

          <aside className="rounded-[20px] border border-[#E7DCCB] bg-white p-6 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">Pay Now</p>
            <div className="mt-4 rounded-[16px] bg-[#F8F1E6] px-4 py-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">30% Due Now</p>
              <p className="mt-2 text-[30px] font-black text-[#1C1814]">
                {formatCurrency(advanceAmount)}
              </p>
              <p className="mt-2 text-[12px] text-[#6B5A49]">Remaining at property: {formatCurrency(balanceAtProperty)}</p>
            </div>
            <button
              type="button"
              onClick={handlePay}
              disabled={isLoading || paid}
              className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] text-[14px] font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"
            >
              {paid ? "Advance Paid" : isLoading ? "Opening Razorpay..." : "Pay 30% Now"}
            </button>
            <p className="mt-3 text-[12px] text-[#6B5A49]">
              Secure checkout via Razorpay. Remaining 70% is paid at property in offline mode.
            </p>
          </aside>
        </div>

        <section className="rounded-[20px] border border-[#E7DCCB] bg-white p-6 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E9D7C1] bg-[#FFF7EC] px-3 py-1.5">
                <UtensilsCrossed className="h-4 w-4 text-[#8A3E1D]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8A3E1D]">
                  Food Tasting & Venue Visit
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <h3 className="text-[24px] font-black text-[#1B1713]">Schedule Your Visit</h3>
                <span className="inline-flex items-center rounded-full border border-[#A9E6C2] bg-[#E9FBF1] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0F9F59]">
                  FREE
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-6 text-[#6B5A49]">
                After 30% payment, you can schedule a tasting + venue visit slot with the caterer.
              </p>

              <div className="mt-4 rounded-2xl border border-[#ECDFCF] bg-[#FFFCF8] px-4 py-3">
                <p className="text-[12px] font-semibold text-[#5B4A38]">Important Note</p>
                <p className="mt-1 text-[13px] text-[#6D5B4A]">
                  Complimentary tasting includes <span className="font-semibold text-[#8A3E1D]">1 sample plate only</span>. Additional samples may be chargeable.
                </p>
              </div>

              <div className="mt-3 rounded-2xl border border-[#E8DCCF] bg-[#FAF7F2] px-4 py-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#7D6A57]">Recommended Placement</p>
                <p className="mt-1 text-[13px] text-[#655646]">
                  This scheduler appears on payment confirmation page, so user sees it at the exact post-payment moment.
                </p>
              </div>
            </div>

            <div className={"rounded-2xl border p-4 " + (paid ? "border-[#E4D3BF] bg-[#FFF9F2]" : "border-[#ECE4DA] bg-[#FAF8F5] opacity-80")}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7F6A54]">Select Visit Slot</p>

              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="mb-1 inline-flex items-center gap-2 text-[12px] font-semibold text-[#5D4D3D]">
                    <CalendarDays className="h-4 w-4 text-[#8A3E1D]" />
                    Visit Date
                  </span>
                  <input
                    type="date"
                    value={tastingDate}
                    min={minDate}
                    onChange={(event) => {
                      setTastingDate(event.target.value);
                      setTastingBooked(false);
                    }}
                    disabled={!paid}
                    className="h-11 w-full rounded-xl border border-[#DCCCB7] bg-white px-3 text-[13px] font-medium text-[#2B241D] outline-none transition focus:border-[#8A3E1D]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 inline-flex items-center gap-2 text-[12px] font-semibold text-[#5D4D3D]">
                    <Clock3 className="h-4 w-4 text-[#8A3E1D]" />
                    Preferred Time
                  </span>
                  <select
                    value={tastingTime}
                    onChange={(event) => {
                      setTastingTime(event.target.value);
                      setTastingBooked(false);
                    }}
                    disabled={!paid}
                    className="h-11 w-full rounded-xl border border-[#DCCCB7] bg-white px-3 text-[13px] font-medium text-[#2B241D] outline-none transition focus:border-[#8A3E1D]"
                  >
                    <option value="">Select time slot</option>
                    {tastingSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleScheduleTasting}
                  disabled={!paid}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 text-[13px] font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:bg-[#D8D3CB]"
                >
                  <MapPin className="h-4 w-4" />
                  Schedule Food Test & Visit
                </button>
              </div>

              {!paid ? (
                <p className="mt-2 text-[12px] text-[#8A6A4B]">Unlocks after 30% payment is completed.</p>
              ) : null}
              {tastingError ? <p className="mt-2 text-[12px] font-semibold text-[#B42318]">{tastingError}</p> : null}
              {tastingBooked ? (
                <div className="mt-3 rounded-xl border border-[#CFE9D7] bg-[#F2FBF6] px-3 py-2">
                  <p className="text-[12px] font-semibold text-[#157347]">
                    Visit request saved for {formatReadableDate(tastingDate)} · {tastingTime}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#E7DCCB] bg-white p-6 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">Invoice Preview</p>
              <h2 className="mt-2 text-[20px] font-bold text-[#1C1814]">Booking Invoice</h2>
            </div>
            <div className="rounded-full bg-[#F5ECE0] px-3 py-1 text-[12px] font-semibold text-[#8A3E1D]">
              Status: {paid ? "Paid" : "Pending"}
            </div>
          </div>
          <div className="mt-5 space-y-2 text-[14px] text-[#5C5247]">
            {invoiceLines.map((line) => (
              <div key={line.label} className="flex items-center justify-between">
                <span>{line.label}</span>
                <span className="font-semibold text-[#1C1814]">{formatCurrency(line.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[16px] bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 py-4 text-white">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80">Total</p>
            <p className="mt-2 text-[24px] font-black">{formatCurrency(order.bill.finalTotal)}</p>
            <p className="mt-2 text-[12px] text-white/85">
              Advance now: {formatCurrency(advanceAmount)} · Pay at property: {formatCurrency(balanceAtProperty)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0E7DB] pb-2">
      <span className="text-[13px] font-semibold text-[#7B6D5F]">{label}</span>
      <span className="text-[14px] font-semibold text-[#1A1612]">{value}</span>
    </div>
  );
}

function formatReadableDate(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
