"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Plus,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";
  const {
    state,
    notifyVendor,
    confirmVendor,
    cancelOrder,
    addInternalNote,
  } = useAdmin();
  const [newNote, setNewNote] = useState("");

  const order = useMemo(
    () => state.orders.find((entry) => entry.id === orderId) ?? null,
    [state.orders, orderId]
  );

  const paymentLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/pay/${orderId}`;
  }, [orderId]);

  const whatsappMessage = useMemo(() => {
    if (!order) return "";
    const advanceAmount = Math.round(order.bill.finalTotal * 0.3);
    const balanceAmount = Math.max(order.bill.finalTotal - advanceAmount, 0);
    const summary = [
      `Hi ${order.customer.name},`,
      `Your booking is confirmed with ${order.vendorName}.`,
      `Package: ${order.packageName}`,
      `Guests: ${order.guests}`,
      `Total: ${formatCurrency(order.bill.finalTotal)}`,
      `Pay now (30%): ${formatCurrency(advanceAmount)}`,
      `Pay at property (70%): ${formatCurrency(balanceAmount)}`,
      `Invoice & payment link: ${paymentLink}`,
      `Please complete the 30% advance payment to secure the slot.`,
      `Thank you for choosing MeraHalwai.`,
    ];
    return summary.join("\n");
  }, [order, paymentLink]);

  if (!order) {
    return (
      <AdminShell title="Order not found" description="The requested booking record could not be located.">
        <div className="rounded-[30px] border border-[#E7DED2] bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(24,20,16,0.05)]">
          <p className="text-[18px] font-black text-[#171511]">Order unavailable</p>
          <Link
            href="/admin/orders"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white"
          >
            Back to Orders
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`Order ${order.id}`}
      description="Everything needed to process this booking request in one clean view."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <Link
            href={`/vendor-order/${order.vendorToken}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
          >
            <ExternalLink className="h-4 w-4" />
            Vendor Link
          </Link>
          <a
            href={`https://wa.me/${order.customer.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2F6FED] px-4 text-[12px] font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Send Payment Link
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_22px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-4 border-b border-[#EDF2F7] pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2F6FED]">Order</p>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.04em] text-[#0F172A]">{order.id}</h2>
                <p className="mt-2 text-[14px] leading-[1.7] text-[#4B5563]">
                  Created on {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AdminOrderStatusBadge status={order.status} />
                <AdminPaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCell label="Slot Hold">{order.slotHoldEndsAt ? new Date(order.slotHoldEndsAt).toLocaleString("en-IN") : "Not active"}</SummaryCell>
              <SummaryCell label="Vendor Response">{order.vendorResponseStatus}</SummaryCell>
              <SummaryCell label="Package">{order.packageName}</SummaryCell>
              <SummaryCell label="Final Total">{formatCurrency(order.bill.finalTotal)}</SummaryCell>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_22px_rgba(15,23,42,0.08)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2F6FED]">Vendor & Payment</p>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => notifyVendor(order.id)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
              >
                Notify Vendor
              </button>
              <button
                type="button"
                onClick={() => confirmVendor(order.id)}
                className="flex h-10 w-full items-center justify-center rounded-full bg-[#2F6FED] px-4 text-[12px] font-bold text-white"
              >
                Confirm Vendor
              </button>
              <Link
                href={`/pay/${order.id}`}
                className="flex h-10 w-full items-center justify-center rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
              >
                Open Payment Page
              </Link>
              <button
                type="button"
                onClick={() => cancelOrder(order.id)}
                className="flex h-10 w-full items-center justify-center rounded-full border border-[#F0C7C7] bg-[#FFF1F1] px-4 text-[12px] font-bold text-[#B54545]"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <InfoSection title="Customer Details" eyebrow="Customer">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard label="Name" value={order.customer.name} />
                <DetailCard label="Phone" value={order.customer.phone} actionHref={`tel:${order.customer.phone.replace(/\s+/g, "")}`} actionLabel="Call" />
                <DetailCard label="Email" value={order.customer.email} />
                <DetailCard label="WhatsApp" value={order.customer.whatsapp} actionHref={`https://wa.me/${order.customer.whatsapp.replace(/\D/g, "")}`} actionLabel="WhatsApp" />
                <DetailCard label="Login Method" value={order.customer.authType.toUpperCase()} />
                <DetailCard label="Profile" value="Open customer profile" actionHref={`/admin/customers/${order.customerId}`} actionLabel="View" />
              </div>
            </InfoSection>

            <InfoSection title="Event Basics" eyebrow="Captured in Basics">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DetailCard label="Event Type" value={order.eventType} />
                <DetailCard label="Event Date" value={order.eventDate} />
                <DetailCard label="Event Time" value={order.eventTime} />
                <DetailCard label="Guests" value={`${order.guests}`} />
                <DetailCard label="Food Preference" value={order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg"} />
                <DetailCard label="Package" value={`${order.packageName} · ${formatCurrency(order.pricePerPlate)}/plate`} />
              </div>
            </InfoSection>

            <InfoSection title="Venue / Address" eyebrow="Venue">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard label="Venue Name" value={order.venue.venueName} />
                <DetailCard label="Landmark" value={order.venue.landmark || "—"} />
                <DetailCard label="Address" value={order.venue.address} />
                <DetailCard label="City / Pincode" value={`${order.venue.city} · ${order.venue.pincode}`} />
                <DetailCard label="State" value={order.venue.state} />
                <DetailCard
                  label="Open Location"
                  value="View on map"
                  actionHref={`https://maps.google.com/?q=${encodeURIComponent(`${order.venue.address}, ${order.venue.city}`)}`}
                  actionLabel="Map"
                />
              </div>
            </InfoSection>

            <InfoSection title="Menu Summary" eyebrow="Selected Menu">
              <div className="space-y-4">
                {order.menuSummary.groupedCategories.map((group) => (
                  <div key={group.label} className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-bold text-[#0F172A]">{group.label}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                        {group.items.length} items
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={`${group.label}-${item.name}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1F2937]"
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? "bg-[#1F7A3F]" : "bg-[#B54532]"}`} />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="grid gap-4 md:grid-cols-3">
                  <DetailCard label="Auto Add-ons" value={order.menuSummary.autoAddOnItems.join(", ") || "None"} />
                  <DetailCard label="Optional Add-ons" value={order.menuSummary.optionalAddOns.join(", ") || "None"} />
                  <DetailCard label="Water" value={order.menuSummary.waterSelection} />
                </div>
                <DetailCard label="Caterer Note" value={order.menuSummary.catererNote || "No customer note added."} />
              </div>
            </InfoSection>

            <InfoSection title="Timeline / Activity" eyebrow="Audit Trail">
              <div className="space-y-4">
                {order.activity.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-[#0F172A]">{item.label}</p>
                        <p className="mt-1 text-[13px] leading-[1.7] text-[#475569]">{item.helper}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{item.actor}</p>
                        <p className="mt-1 text-[12px] text-[#64748B]">{new Date(item.at).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoSection>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <InfoSection title="Bill Summary" eyebrow="Billing">
              <div className="space-y-3 text-[14px] text-[#475569]">
                {[
                  ["Base Amount", order.bill.baseAmount],
                  ["Auto Add-ons", order.bill.autoAddOns],
                  ["Optional Add-ons", order.bill.optionalAddOns],
                  ["Water", order.bill.water],
                  ["Subtotal", order.bill.subtotal],
                  ["GST (18%)", order.bill.gst],
                  ["Convenience Fee", order.bill.convenienceFee],
                ].map(([label, amount]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <span>{label}</span>
                    <span className="font-semibold text-[#0F172A]">{formatCurrency(Number(amount))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[18px] bg-[#1F4BB2] px-5 py-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Final Total</p>
                <p className="mt-2 text-[28px] font-black tracking-[-0.03em]">{formatCurrency(order.bill.finalTotal)}</p>
              </div>
            </InfoSection>

            <InfoSection title="Vendor Assignment" eyebrow="Assignment">
              <div className="space-y-3">
                <DetailRow label="Assigned Vendor" value={order.vendorName} />
                <DetailRow label="Contact" value={order.vendorPhone} />
                <DetailRow label="Package" value={order.packageName} />
                <DetailRow label="Vendor Status" value={order.vendorResponseStatus} />
                <DetailRow label="Last Notified" value={order.vendorLastNotifiedAt ? new Date(order.vendorLastNotifiedAt).toLocaleString("en-IN") : "Not sent"} />
              </div>
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/vendor-order/${order.vendorToken}`)}
                  className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
                >
                  <Copy className="h-4 w-4" />
                  Copy Vendor Link
                </button>
                <a
                  href={`tel:${order.vendorPhone.replace(/\s+/g, "")}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
                >
                  <Phone className="h-4 w-4" />
                  Call Vendor
                </a>
              </div>
            </InfoSection>

            <InfoSection title="Internal Notes" eyebrow="Team Notes">
              <div className="space-y-3">
                {order.internalNotes.map((note) => (
                  <div key={note.id} className="rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-4">
                    <p className="text-[14px] font-semibold text-[#0F172A]">{note.note}</p>
                    <p className="mt-2 text-[12px] text-[#64748B]">{note.author} · {new Date(note.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                ))}
                <div className="rounded-[16px] border border-dashed border-[#D6E0F0] bg-[#F8FAFF] p-4">
                  <textarea
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    className="min-h-[96px] w-full resize-none bg-transparent text-[14px] text-[#0F172A] outline-none"
                    placeholder="Add admin note, vendor remark, or escalation detail"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newNote.trim()) return;
                        addInternalNote(order.id, newNote);
                        setNewNote("");
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2F6FED] px-4 text-[12px] font-bold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            </InfoSection>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function InfoSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2F6FED]">{eyebrow}</p>
      <h3 className="mt-2 text-[22px] font-black tracking-[-0.03em] text-[#0F172A]">{title}</h3>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function DetailCard({
  label,
  value,
  actionHref,
  actionLabel,
}: {
  label: string;
  value: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold leading-[1.7] text-[#0F172A]">{value}</p>
      {actionHref && actionLabel ? (
        <a
          href={actionHref}
          target={actionHref.startsWith("http") ? "_blank" : undefined}
          className="mt-3 inline-flex text-[13px] font-semibold text-[#1F4BB2]"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px]">
      <span className="font-semibold text-[#64748B]">{label}</span>
      <span className="text-right font-bold text-[#0F172A]">{value}</span>
    </div>
  );
}

function SummaryCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold leading-[1.6] text-[#0F172A]">{children}</p>
    </div>
  );
}
