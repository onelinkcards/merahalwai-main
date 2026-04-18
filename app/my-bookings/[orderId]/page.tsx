"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  FileText,
  MapPin,
  MessageCircleMore,
  PencilLine,
  PhoneCall,
  UserRound,
} from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import CustomerPaymentSplit from "@/components/booking/CustomerPaymentSplit";
import StatusBadge from "@/components/account/StatusBadge";
import {
  formatCurrency,
  formatDateTime,
  getDemoOrderById,
  getMergedOrders,
  type DemoOrder,
} from "@/data/mockAccount";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { getSupportTelHref, getSupportWhatsappHref } from "@/lib/supportContact";
import { useBookingStore } from "@/store/bookingStore";

export default function MyBookingDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";
  const store = useBookingStore();
  const order = useMemo<DemoOrder | null>(() => {
    return getMergedOrders(store).find((entry) => entry.id === orderId) ?? getDemoOrderById(orderId);
  }, [orderId, store]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { bookingValue, upfrontTotal, remainingAmount } = order
    ? getCustomerFacingBillSummary(order.bill)
    : {
        bookingValue: 0,
        upfrontTotal: 0,
        remainingAmount: 0,
      };

  if (!order) {
    return (
      <AccountShell
        active="orders"
        title="Order not found"
        description="The requested booking could not be located."
        mobileBackHref="/my-bookings"
      >
        <div className="rounded-[20px] border border-[#EAE4DB] bg-white px-6 py-12 text-center">
          <p className="text-[14px] text-[#6D645A]">Try opening an order from the My Orders page.</p>
          <Link
            href="/my-bookings"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-5 text-[13px] font-semibold text-white"
          >
            Back to Orders
          </Link>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      active="orders"
      title="Order Details"
      description="Track booking progress, menu summary, and billing."
      mobileBackHref="/my-bookings"
      actions={
        <div className="flex flex-wrap gap-2">
          {order.payNowEnabled ? (
            <Link
              href={`/pay/${order.id}`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EB8B23_0%,#C86E17_48%,#682C13_100%)] px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(104,44,19,0.16)]"
            >
              Pay 30% Now
            </Link>
          ) : null}
          {order.invoiceAvailable ? (
            <Link
              href={`/invoice/${order.id}`}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#E5D9CC] bg-white px-4 text-[12px] font-semibold text-[#3F382F]"
            >
              <FileText className="h-4 w-4" />
              View Invoice
            </Link>
          ) : null}
          <Link
            href="/my-bookings"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E5D9CC] bg-white px-4 text-[12px] font-semibold text-[#3F382F]"
          >
            Back to Orders
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <article className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.05)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">Order ID</p>
                <h2 className="mt-1 text-[24px] font-black tracking-[-0.02em] text-[#13100D]">{order.id}</h2>
                <p className="mt-1 text-[13px] text-[#6F645A]">{order.vendorName}</p>
              </div>
              <StatusBadge status={order.status} compact />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 xl:hidden">
              {order.payNowEnabled ? (
                <Link
                  href={`/pay/${order.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EB8B23_0%,#C86E17_48%,#682C13_100%)] px-4 text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(104,44,19,0.16)]"
                >
                  Pay 30% Now
                </Link>
              ) : null}
              {order.invoiceAvailable ? (
                <Link
                  href={`/invoice/${order.id}`}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#E5D9CC] bg-white px-4 text-[12px] font-semibold text-[#3F382F]"
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Link>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <SummaryCell icon={<CalendarDays className="h-4 w-4" />} label="Event" value={order.eventType} />
              <SummaryCell icon={<Clock3 className="h-4 w-4" />} label="Date & Time" value={formatDateTime(order.eventDate, order.eventTime)} />
              <SummaryCell icon={<MapPin className="h-4 w-4" />} label="Venue" value={`${order.venueName}, ${order.venueAddress}`} />
              <SummaryCell label="Guests & Package" value={`${order.guests} guests · ${order.packageName}`} />
            </div>
          </article>

          <article className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.05)]">
            <h3 className="text-[18px] font-black text-[#13100D]">Booking Timeline</h3>
            <div className="mt-4 space-y-3">
              {buildCompactTimeline(order).map((step, index) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold " +
                        (step.state === "done"
                          ? "bg-[#E8F7EE] text-[#1E7C3D]"
                          : step.state === "current"
                            ? "bg-[#FFF2DE] text-[#8A5B16]"
                            : step.state === "cancelled"
                              ? "bg-[#FEECEC] text-[#B54747]"
                              : "bg-[#F2F0EC] text-[#92877B]")
                      }
                    >
                      {index + 1}
                    </span>
                    {index < order.timeline.length - 1 ? <span className="mt-1 h-6 w-px bg-[#E5DDD2]" /> : null}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-[14px] font-semibold text-[#201B16]">{step.label}</p>
                    <p className="text-[12px] text-[#6C6158]">{step.helper}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.05)]">
            <h3 className="text-[18px] font-black text-[#13100D]">Menu Summary</h3>
            <div className="mt-3 space-y-2.5">
              {order.menuGroups.map((group) => {
                const expanded = openGroups[group.label] ?? false;
                return (
                  <div key={group.label} className="overflow-hidden rounded-[14px] border border-[#ECE6DE] bg-[#FCFAF7]">
                    <button
                      type="button"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [group.label]: !expanded }))}
                      className="flex w-full items-center justify-between px-3 py-3 text-left"
                    >
                      <span>
                        <span className="block text-[14px] font-bold text-[#181410]">{group.label}</span>
                        <span className="text-[11px] text-[#796E63]">{group.items.length} selected</span>
                      </span>
                      <ChevronDown className={"h-4 w-4 text-[#7D7D85] transition-transform " + (expanded ? "rotate-180" : "")} />
                    </button>
                    {expanded ? (
                      <div className="border-t border-[#ECE6DE] px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <span
                              key={group.label + item.name}
                              className="inline-flex items-center gap-2 rounded-full border border-[#E5DFD6] bg-white px-2.5 py-1 text-[11px] font-medium text-[#3F3A33]"
                            >
                              <span className={"h-2 w-2 rounded-full " + (item.isVeg ? "bg-[#1F7A3F]" : "bg-[#B54532]")} />
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.05)]">
            <h3 className="text-[18px] font-black text-[#13100D]">Customer</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <SummaryCell icon={<UserRound className="h-4 w-4" />} label="Name" value={order.customer.fullName} />
              <SummaryCell icon={<PhoneCall className="h-4 w-4" />} label="Phone" value={order.customer.phone} />
              <SummaryCell label="Email" value={order.customer.email} />
              <SummaryCell label="WhatsApp" value={order.customer.whatsapp} />
            </div>
          </article>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <article className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7D6F]">Bill Summary</p>
            <div className="mt-3 space-y-2 text-[13px] text-[#5E554B]">
              <AmountRow label="Base Amount" value={order.bill.baseAmount} />
              <AmountRow label="Optional Add-ons" value={order.bill.optionalAddOns} />
              <AmountRow label="Water" value={order.bill.water} />
              <AmountRow label="Booking Value" value={bookingValue} />
            </div>
            <div className="mt-3">
              <CustomerPaymentSplit
                advanceAmount={upfrontTotal}
                remainingAmount={remainingAmount}
                compact
                title="Payment Terms"
              />
            </div>
            <div className="mt-3 space-y-2">
              {order.invoiceAvailable ? (
                <Link
                  href={`/invoice/${order.id}`}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#E6D8C9] bg-white text-[12px] font-semibold text-[#3E352C]"
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Link>
              ) : null}
              {order.payNowEnabled ? (
                <Link
                  href={`/pay/${order.id}`}
                  className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#EB8B23_0%,#C86E17_48%,#682C13_100%)] text-[12px] font-semibold text-white shadow-[0_12px_24px_rgba(104,44,19,0.16)]"
                >
                  Pay 30% Now
                </Link>
              ) : null}
              <Link
                href="/my-bookings"
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-[#E5D9CC] bg-white text-[12px] font-semibold text-[#3F382F]"
              >
                <PencilLine className="h-4 w-4" />
                Back to Orders
              </Link>
            </div>
          </article>

          <article className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7D6F]">Support</p>
            <div className="mt-3 space-y-2">
              <a
                href={getSupportTelHref()}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#E5D9CC] bg-white text-[12px] font-semibold text-[#3F382F]"
              >
                <PhoneCall className="h-4 w-4" />
                Call Us
              </a>
              <a
                href={getSupportWhatsappHref()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#D0E8DA] bg-white text-[12px] font-semibold text-[#147D45]"
              >
                <MessageCircleMore className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
                WhatsApp Support
              </a>
            </div>
          </article>
        </aside>
      </div>
    </AccountShell>
  );
}

function SummaryCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-[#ECE6DE] bg-[#FCFAF7] px-3 py-2.5">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#867A6F]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold text-[#1E1914]">{value}</p>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-semibold text-[#1A1612]">{formatCurrency(value)}</span>
    </div>
  );
}

function buildCompactTimeline(order: DemoOrder) {
  const isPending = order.status === "slotHeld" || order.status === "pendingConfirmation";
  const isPayment = order.status === "paymentPending";
  const isDone = order.status === "paymentDone" || order.status === "confirmed";
  const isCancelled = order.status === "cancelled";

  return [
    {
      label: "Booking Request Sent",
      helper: "Your booking request has been submitted to MeraHalwai.",
      state: "done" as const,
    },
    {
      label: "Pending Confirmation",
      helper: "We are validating availability with the caterer.",
      state: isPending ? ("current" as const) : isCancelled ? ("cancelled" as const) : ("done" as const),
    },
    {
      label: "Payment Link",
      helper: "30% advance payment is shared after confirmation.",
      state: isPayment ? ("current" as const) : isDone ? ("done" as const) : ("upcoming" as const),
    },
    {
      label: "Booking Confirmed",
      helper: "Your order is confirmed once the payment step is completed.",
      state: isDone ? ("done" as const) : isCancelled ? ("cancelled" as const) : ("upcoming" as const),
    },
  ];
}
