"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/data/mockAccount";
import { getAdminOrderById, type AdminOrderRecord } from "@/data/mockAdmin";
import CustomerPaymentSplit from "@/components/booking/CustomerPaymentSplit";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { getSupportTelHref, getSupportWhatsappHref } from "@/lib/supportContact";
import {
  ArrowRight,
  MessageCircle,
  Phone,
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
  const order: AdminOrderRecord | null = getAdminOrderById(orderId);
  const razorpayKey =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_live_SZTkZ0kcr1wMAN";
  const razorpayCheckoutAmountPaise = 100;
  const {
    bookingValue,
    upfrontBase,
    upfrontGst,
    upfrontTotal: advanceAmount,
    remainingAmount: balanceAtProperty,
    customerGrandTotal,
  } = order
    ? getCustomerFacingBillSummary(order.bill)
    : {
        bookingValue: 0,
        upfrontBase: 0,
        upfrontGst: 0,
        upfrontTotal: 0,
        remainingAmount: 0,
        customerGrandTotal: 0,
      };

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
        { label: "Optional Add-ons", value: order.bill.optionalAddOns },
        { label: "Water", value: order.bill.water },
        { label: "Booking Value", value: bookingValue },
        { label: "30% Pay Now", value: upfrontBase },
        { label: "GST on Upfront", value: upfrontGst },
        { label: "70% At Property", value: balanceAtProperty },
      ]
    : [];
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
      amount: razorpayCheckoutAmountPaise,
      currency: "INR",
      name: "MeraHalwai",
      description: `30% advance + GST for ${order.vendorName}`,
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
              href={getSupportWhatsappHref()}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#CEE5D9] bg-white px-3 text-[12px] font-semibold text-[#1B9C52]"
            >
              <MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
              WhatsApp
            </a>
            <a
              href={getSupportTelHref()}
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

        <CustomerPaymentSplit
          advanceAmount={advanceAmount}
          remainingAmount={balanceAtProperty}
          title="Payment Terms"
          subtitle="Pay only the upfront amount online. The rest is settled directly at the event."
        />

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
              <p className="mt-2 text-[12px] text-[#6B5A49]">
                30% now (incl. 18% tax). 70% at event: {formatCurrency(balanceAtProperty)}
              </p>
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
              30% now (incl. 18% tax). 70% at event. Taxes (if applicable) as per vendor invoice.
            </p>
          </aside>
        </div>

        <section className="rounded-[20px] border border-[#E7DCCB] bg-white p-6 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">Invoice Preview</p>
              <h2 className="mt-2 text-[20px] font-black tracking-[-0.01em] text-[#1C1814]">Customer Billing Summary</h2>
              <p className="mt-1 text-[12px] text-[#7A6857]">
                Clear split between the online advance and the amount due at the event.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD8C3] bg-[#FFF8EE] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A3E1D]">
              <span className={"h-2.5 w-2.5 rounded-full " + (paid ? "bg-[#179B52]" : "bg-[#EB8B23]")} />
              {paid ? "Paid" : "Pending"}
            </div>
          </div>
          <div className="mt-5 rounded-[22px] border border-[#EEE2D2] bg-[linear-gradient(180deg,#FFFDF9_0%,#FFFAF4_100%)] p-4 sm:p-5">
            <CustomerPaymentSplit
              advanceAmount={advanceAmount}
              remainingAmount={balanceAtProperty}
              compact
              title="Customer Payment Split"
              className="shadow-none border-[#E7D8C8]"
            />

            <div className="mt-4 overflow-hidden rounded-[18px] border border-[#ECE0D2] bg-white">
              <div className="border-b border-[#F1E7DA] bg-[#FFFCF8] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A6A4B]">
                  Billing Breakdown
                </p>
              </div>
              <div className="divide-y divide-[#F3EBE0]">
                {invoiceLines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-[13px] text-[#5C5247]"
                  >
                    <span className="font-medium">{line.label}</span>
                    <span className="whitespace-nowrap text-[15px] font-bold text-[#1C1814]">
                      {formatCurrency(line.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[16px] bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
                    Customer Total
                  </p>
                  <p className="mt-2 text-[28px] font-black tracking-tight">{formatCurrency(customerGrandTotal)}</p>
                </div>
                <div className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90">
                  {paid ? "Paid" : "Pending"}
                </div>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-white/85">
                Booking value {formatCurrency(bookingValue)} · 30% now {formatCurrency(advanceAmount)} · 70% at event {formatCurrency(balanceAtProperty)}
              </p>
            </div>
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
