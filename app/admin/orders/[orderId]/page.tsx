"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Plus,
  ReceiptText,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  AdminButton,
  AdminEmptyState,
  AdminInfoGrid,
  AdminPanel,
  AdminTableCard,
  AdminTextarea,
} from "@/components/admin/AdminUi";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";
  const {
    state,
    notifyVendor,
    confirmVendor,
    sendPaymentLink,
    markPaymentDone,
    confirmBooking,
    cancelOrder,
    addInternalNote,
  } = useAdmin();
  const [newNote, setNewNote] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  const order = useMemo(() => state.orders.find((entry) => entry.id === orderId) ?? null, [state.orders, orderId]);

  const paymentLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/pay/${orderId}`;
  }, [orderId]);

  const vendorLink = useMemo(() => {
    if (typeof window === "undefined" || !order) return "";
    return `${window.location.origin}/vendor-order/${order.vendorToken}`;
  }, [order]);

  const paymentMessage = useMemo(() => {
    if (!order) return "";
    const advanceAmount = Math.round(order.bill.finalTotal * 0.3);
    const balanceAmount = Math.max(order.bill.finalTotal - advanceAmount, 0);
    return [
      `Hi ${order.customer.name},`,
      `Your booking with ${order.vendorName} is ready for the payment stage.`,
      `Order ID: ${order.id}`,
      `Package: ${order.packageName}`,
      `Guests: ${order.guests}`,
      `30% to pay now: ${formatCurrency(advanceAmount)}`,
      `70% to pay at property: ${formatCurrency(balanceAmount)}`,
      `Payment page: ${paymentLink}`,
      `Thank you for choosing MeraHalwai.`,
    ].join("\n");
  }, [order, paymentLink]);

  if (!order) {
    return (
      <AdminShell title="Order not found" description="The requested booking record could not be located.">
        <AdminEmptyState title="Order unavailable" body="This order ID does not exist in the current admin state." />
      </AdminShell>
    );
  }

  const canMarkPaid = Boolean(paymentReference.trim() || order.paymentReference);

  return (
    <AdminShell
      title={`Order ${order.id}`}
      description="Full internal operations view for one booking request, including customer details, event basics, billing, vendor workflow, and notes."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link
            href={`/pay/${order.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
          >
            <ReceiptText className="h-4 w-4" />
            Payment Page
          </Link>
          <a
            href={`https://wa.me/${order.customer.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(paymentMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Share Payment
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <AdminPanel
            eyebrow="Booking Request"
            title={order.vendorName}
            description="Primary order snapshot for daily ops handling."
          >
            <div className="flex flex-col gap-5 border-b border-[#E8EDF4] pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[30px] font-black tracking-[-0.05em] text-[#0F172A]">{order.id}</p>
                  <AdminOrderStatusBadge status={order.status} />
                  <AdminPaymentStatusBadge status={order.paymentStatus} />
                </div>
                <p className="mt-3 text-[14px] leading-[1.75] text-[#5B6574]">
                  Created on {new Date(order.createdAt).toLocaleString("en-IN")} · Slot hold:{" "}
                  {order.slotHoldEndsAt ? new Date(order.slotHoldEndsAt).toLocaleString("en-IN") : "Not active"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <QuickStat label="Package" value={order.packageName} />
                <QuickStat label="Final Total" value={formatCurrency(order.bill.finalTotal)} />
                <QuickStat label="Guests" value={`${order.guests}`} />
                <QuickStat label="Vendor Response" value={order.vendorResponseStatus} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Customer</p>
                <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{order.customer.name}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">{order.customer.phone}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">{order.customer.email}</p>
              </div>
              <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Event</p>
                <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{order.eventType}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {order.eventDate} · {order.eventTime}
                </p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg"}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Venue</p>
                <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{order.venue.venueName}</p>
                <p className="mt-1 text-[13px] leading-[1.7] text-[#64748B]">
                  {order.venue.address}, {order.venue.city}
                </p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Actions" title="Process Controls">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => notifyVendor(order.id)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
              >
                <Send className="h-4 w-4" />
                Notify Vendor
              </button>
              <button
                type="button"
                onClick={() => confirmVendor(order.id)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
              >
                <CheckCheck className="h-4 w-4" />
                Mark Vendor Confirmed
              </button>
              <button
                type="button"
                onClick={() => sendPaymentLink(order.id)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
              >
                <MessageCircle className="h-4 w-4" />
                Mark Payment Link Sent
              </button>
              <button
                type="button"
                onClick={() => confirmBooking(order.id)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white"
              >
                <ShieldCheck className="h-4 w-4" />
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => cancelOrder(order.id)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#E5C5CA] bg-[#FFF5F6] px-4 text-[13px] font-bold text-[#B42318]"
              >
                <XCircle className="h-4 w-4" />
                Cancel Booking
              </button>
            </div>

            <div className="mt-5 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Vendor Link</p>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#5B6574]">
                Share the tokenized vendor confirmation URL only after ops review.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={vendorLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[12px] font-bold text-[#0F172A]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(vendorLink)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[12px] font-bold text-[#0F172A]"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <a
                  href={`tel:${order.vendorPhone.replace(/\s+/g, "")}`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[12px] font-bold text-[#0F172A]"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </div>
            </div>
          </AdminPanel>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <AdminPanel eyebrow="Customer & Venue" title="Captured Booking Details">
              <AdminInfoGrid
                columns={3}
                items={[
                  { label: "Customer Name", value: order.customer.name },
                  { label: "Phone", value: order.customer.phone },
                  { label: "WhatsApp", value: order.customer.whatsapp },
                  { label: "Email", value: order.customer.email },
                  { label: "Auth Type", value: order.customer.authType.toUpperCase() },
                  { label: "Customer Profile", value: "Open profile", helper: `/admin/customers/${order.customerId}` },
                  { label: "Event Type", value: order.eventType },
                  { label: "Event Date", value: order.eventDate },
                  { label: "Event Time", value: order.eventTime },
                  { label: "Guests", value: `${order.guests}` },
                  { label: "Food Preference", value: order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg" },
                  { label: "Package", value: `${order.packageName} · ${formatCurrency(order.pricePerPlate)}/plate` },
                  { label: "Venue", value: order.venue.venueName },
                  { label: "Address", value: order.venue.address },
                  { label: "City / State", value: `${order.venue.city}, ${order.venue.state} · ${order.venue.pincode}` },
                ]}
              />
            </AdminPanel>

            <AdminPanel eyebrow="Menu" title="Selected Menu Summary">
              <div className="space-y-4">
                {order.menuSummary.groupedCategories.map((group) => (
                  <div key={group.label} className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-bold text-[#0F172A]">{group.label}</p>
                      <span className="rounded-full border border-[#D7E3F4] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                        {group.items.length} items
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={`${group.label}-${item.name}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#D9E1EC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#0F172A]"
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? "bg-[#15803D]" : "bg-[#B42318]"}`} />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Auto Add-ons</p>
                  <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">
                    {order.menuSummary.autoAddOnItems.join(", ") || "None"}
                  </p>
                </div>
                <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Optional Add-ons</p>
                  <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">
                    {order.menuSummary.optionalAddOns.join(", ") || "None"}
                  </p>
                </div>
                <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Water</p>
                  <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{order.menuSummary.waterSelection}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Customer Note</p>
                <p className="mt-2 text-[14px] leading-[1.75] text-[#334155]">
                  {order.menuSummary.catererNote || "No note added by customer."}
                </p>
              </div>
            </AdminPanel>

            <AdminTableCard title="Timeline" eyebrow="Activity Log">
              <div className="divide-y divide-[#E8EDF4]">
                {order.activity.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#0F172A]">{item.label}</p>
                      <p className="mt-1 text-[13px] leading-[1.7] text-[#64748B]">{item.helper}</p>
                    </div>
                    <div className="shrink-0 text-[12px] text-[#64748B] md:text-right">
                      <p className="font-semibold uppercase tracking-[0.14em] text-[#475569]">{item.actor}</p>
                      <p className="mt-1">{new Date(item.at).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminTableCard>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <AdminPanel eyebrow="Billing" title="Bill Summary">
              <div className="space-y-3 text-[14px]">
                {[
                  ["Base Amount", order.bill.baseAmount],
                  ["Auto Add-ons", order.bill.autoAddOns],
                  ["Optional Add-ons", order.bill.optionalAddOns],
                  ["Water", order.bill.water],
                  ["Subtotal", order.bill.subtotal],
                  ["GST (18%)", order.bill.gst],
                  ["Convenience Fee", order.bill.convenienceFee],
                ].map(([label, amount]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-3">
                    <span className="text-[#64748B]">{label}</span>
                    <span className="font-semibold text-[#0F172A]">{formatCurrency(Number(amount))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[16px] bg-[#0F172A] px-4 py-4 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Final Total</p>
                <p className="mt-2 text-[28px] font-black tracking-[-0.04em]">{formatCurrency(order.bill.finalTotal)}</p>
              </div>

              <div className="mt-5 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Payment Reference</p>
                <input
                  value={paymentReference || order.paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                  className="mt-3 h-11 w-full rounded-[12px] border border-[#CBD5E1] bg-white px-3.5 text-[14px] font-medium text-[#0F172A] outline-none focus:border-[#64748B] focus:ring-2 focus:ring-[#E2E8F0]"
                  placeholder="Enter bank or Razorpay reference"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!canMarkPaid) return;
                    markPaymentDone(order.id, paymentReference || order.paymentReference || "MANUAL-REF");
                    setPaymentReference("");
                  }}
                  disabled={!canMarkPaid}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Mark Payment Done
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/invoice/${order.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
                >
                  Open Invoice
                </Link>
              </div>
            </AdminPanel>

            <AdminPanel eyebrow="Notes" title="Internal Notes">
              <div className="space-y-3">
                {order.internalNotes.map((note) => (
                  <div key={note.id} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                    <p className="text-[14px] font-medium leading-[1.7] text-[#0F172A]">{note.note}</p>
                    <p className="mt-2 text-[12px] text-[#64748B]">
                      {note.author} · {new Date(note.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <AdminTextarea
                  label="Add Note"
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="Add internal remark, escalation note, or vendor coordination detail"
                  className="min-h-[110px]"
                />
                <div className="mt-3 flex justify-end">
                  <AdminButton
                    onClick={() => {
                      if (!newNote.trim()) return;
                      addInternalNote(order.id, newNote);
                      setNewNote("");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </AdminButton>
                </div>
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
      <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{value}</p>
    </div>
  );
}
