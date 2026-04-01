"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, MessageCircleMore, PhoneCall } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import StatusBadge from "@/components/account/StatusBadge";
import {
  formatCurrency,
  formatDateTime,
  getDemoOrderById,
  getMergedOrders,
  type DemoOrder,
} from "@/data/mockAccount";
import { useBookingStore } from "@/store/bookingStore";

export default function MyBookingDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";
  const store = useBookingStore();
  const order = useMemo<DemoOrder | null>(() => {
    return getMergedOrders(store).find((entry) => entry.id === orderId) ?? getDemoOrderById(orderId);
  }, [orderId, store]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  if (!order) {
    return (
      <AccountShell
        active="orders"
        title="Order not found"
        description="The requested booking could not be located in the demo account."
      >
        <div className="rounded-[28px] border border-[#E7E8EC] bg-white px-6 py-14 text-center shadow-[0_16px_40px_rgba(12,12,14,0.05)]">
          <p className="text-[16px] text-[#6D6D75]">Try opening an order from the My Orders page.</p>
          <Link
            href="/my-bookings"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-5 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(138,62,29,0.14)]"
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
      title={order.vendorName}
      description="Review your booking progress, selected menu, billing summary, and available support actions."
      actions={
        <Link
          href="/my-bookings"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#E2E3E8] bg-white px-4 text-[13px] font-semibold text-[#2B2B30]"
        >
          Back to Orders
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-6">
          <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9797A0]">Order Summary</p>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#111111]">
                  Order {order.id}
                </h2>
                <p className="mt-2 text-[14px] text-[#66666D]">{order.packageName} package · {order.eventType}</p>
              </div>
              <StatusBadge status={order.status} withHelper />
            </div>

            <div className="mt-6 grid gap-4 text-[14px] text-[#585860] md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Vendor</p>
                <p className="mt-2 font-semibold text-[#111111]">{order.vendorName}</p>
                <p className="mt-1 text-[#7B7B84]">{order.locality}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Event</p>
                <p className="mt-2 font-semibold text-[#111111]">{order.eventType}</p>
                <p className="mt-1 text-[#7B7B84]">{formatDateTime(order.eventDate, order.eventTime)}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Venue</p>
                <p className="mt-2 font-semibold text-[#111111]">{order.venueName}</p>
                <p className="mt-1 text-[#7B7B84]">{order.venueAddress}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Guests</p>
                <p className="mt-2 font-semibold text-[#111111]">{order.guests} guests</p>
                <p className="mt-1 text-[#7B7B84]">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
            <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Booking Timeline</h3>
            <div className="mt-6 space-y-4">
              {order.timeline.map((step, index) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-full border text-[12px] font-black " +
                        (step.state === "done"
                          ? "border-[#7BB38A] bg-[#EDF8F0] text-[#226E39]"
                          : step.state === "current"
                            ? "border-[#D9B86C] bg-[#FFF8EA] text-[#8A5D14]"
                            : step.state === "cancelled"
                              ? "border-[#E2B7B7] bg-[#FFF3F3] text-[#B64545]"
                              : "border-[#E8E8ED] bg-[#F8F8FA] text-[#AAAAAF]")
                      }
                    >
                      {index + 1}
                    </span>
                    {index < order.timeline.length - 1 ? (
                      <span className="mt-2 h-12 w-px bg-[#E9E1D7]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <p className="text-[16px] font-black text-[#111111]">{step.label}</p>
                    <p className="mt-1 text-[14px] leading-[1.7] text-[#66666D]">{step.helper}</p>
                    {step.at ? <p className="mt-1 text-[12px] font-medium text-[#8B8B93]">{step.at}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Menu Summary</h3>
              <p className="text-[13px] font-medium text-[#7D7D85]">
                {order.menuGroups.reduce((count, group) => count + group.items.length, 0)} selected items
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {order.menuGroups.map((group) => {
                const expanded = openGroups[group.label] ?? false;
                return (
                  <div key={group.label} className="overflow-hidden rounded-[22px] border border-[#ECECF0] bg-[#F8F8FA]">
                    <button
                      type="button"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [group.label]: !expanded }))}
                      className="flex w-full items-center justify-between px-4 py-4 text-left"
                    >
                      <span>
                        <span className="block text-[16px] font-black text-[#111111]">{group.label}</span>
                        <span className="mt-1 block text-[12px] font-medium text-[#7D7D85]">
                          {group.items.length} selected
                        </span>
                      </span>
                      <ChevronDown className={"h-4 w-4 text-[#7D7D85] transition-transform " + (expanded ? "rotate-180" : "")} />
                    </button>
                    {expanded ? (
                      <div className="border-t border-[#ECECF0] px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <span
                              key={group.label + item.name}
                              className="inline-flex items-center gap-2 rounded-full border border-[#E2E3E8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3F3F45]"
                            >
                              <span
                                className={
                                  "h-2.5 w-2.5 rounded-full " + (item.isVeg ? "bg-[#1F7A3F]" : "bg-[#B54532]")
                                }
                              />
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

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Optional Add-ons</p>
                <p className="mt-2 text-[14px] text-[#111111]">{order.optionalAddOns.join(", ") || "None selected"}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Water</p>
                <p className="mt-2 text-[14px] text-[#111111]">{order.waterSelection}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Special Note</p>
                <p className="mt-2 text-[14px] text-[#111111]">{order.specialNote || "No special note added."}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
            <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Customer Details</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Name</p>
                <p className="mt-2 text-[15px] font-semibold text-[#111111]">{order.customer.fullName}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Phone</p>
                <p className="mt-2 text-[15px] font-semibold text-[#111111]">{order.customer.phone}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">Email</p>
                <p className="mt-2 text-[15px] font-semibold text-[#111111]">{order.customer.email}</p>
              </div>
              <div className="rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9797A0]">WhatsApp</p>
                <p className="mt-2 text-[15px] font-semibold text-[#111111]">{order.customer.whatsapp}</p>
              </div>
            </div>
          </article>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9797A0]">Bill Summary</p>
            <div className="mt-5 space-y-3 text-[14px] text-[#585860]">
              <div className="flex items-center justify-between">
                <span>Base Amount</span>
                <span>{formatCurrency(order.bill.baseAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto Add-ons</span>
                <span>{formatCurrency(order.bill.autoAddOns)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Optional Add-ons</span>
                <span>{formatCurrency(order.bill.optionalAddOns)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Water</span>
                <span>{formatCurrency(order.bill.water)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST (18%)</span>
                <span>{formatCurrency(order.bill.gst)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Convenience Fee</span>
                <span>{formatCurrency(order.bill.convenienceFee)}</span>
              </div>
            </div>
            <div className="mt-5 rounded-[22px] bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 py-4 text-white shadow-[0_18px_36px_rgba(138,62,29,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Final Total</p>
              <p className="mt-2 text-[30px] font-black tracking-[-0.03em]">{formatCurrency(order.bill.finalTotal)}</p>
            </div>

            <div className="mt-5 space-y-3">
              {order.invoiceAvailable ? (
                <Link
                  href={`/invoice/${order.id}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-5 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(138,62,29,0.14)]"
                >
                  Download Invoice
                </Link>
              ) : null}
              {order.payNowEnabled ? (
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#E7D5C4] bg-white px-5 text-[13px] font-semibold text-[#8A3E1D]"
                >
                  Pay Now
                </button>
              ) : null}
            </div>

            <p className="mt-4 text-[12px] leading-[1.7] text-[#7D7D86]">
              Secure · No Payment Now unless payment is requested · Slot hold remains visible after submission
            </p>
          </article>

          <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)]">
            <h3 className="text-[20px] font-black tracking-[-0.03em] text-[#111111]">Support</h3>
            <div className="mt-5 space-y-3">
              <a
                href="tel:+919876543210"
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#E2E3E8] bg-white px-4 text-[13px] font-semibold text-[#2A2A2E]"
              >
                <PhoneCall className="h-4 w-4" />
                Call Us
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#E2E3E8] bg-white px-4 text-[13px] font-semibold text-[#2A2A2E]"
              >
                <MessageCircleMore className="h-4 w-4" />
                WhatsApp Support
              </a>
            </div>
          </article>
        </aside>
      </div>
    </AccountShell>
  );
}
