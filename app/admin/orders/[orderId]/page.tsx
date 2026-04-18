"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  WalletCards,
  XCircle,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  AdminButton,
  AdminEmptyState,
  AdminInfoGrid,
  AdminLinkButton,
  AdminPanel,
  AdminTableCard,
} from "@/components/admin/AdminUi";
import { formatCurrency } from "@/data/mockAccount";
import { buildCommissionInvoice, getCommissionInvoiceRows } from "@/lib/commissionInvoice";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
      <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{value}</p>
    </div>
  );
}

function WhatsAppAction({
  label,
  helper,
  onClick,
  disabled = false,
}: {
  label: string;
  helper: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-start gap-3 rounded-[14px] border border-[#BBF7D0] bg-[#ECFDF5] px-4 py-3 text-left text-[#166534] transition hover:border-[#86EFAC] hover:bg-[#DCFCE7] disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
    >
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#16A34A]">
        <MessageCircle className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-bold">{label}</span>
        <span className="mt-1 block text-[12px] leading-[1.55] text-inherit">{helper}</span>
      </span>
    </button>
  );
}

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
    logCommunication,
  } = useAdmin();
  const order = useMemo(() => state.orders.find((entry) => entry.id === orderId) ?? null, [state.orders, orderId]);
  const vendor = useMemo(
    () => state.vendors.find((entry) => entry.id === order?.vendorId || entry.slug === order?.vendorSlug) ?? null,
    [state.vendors, order]
  );
  const billSummary = useMemo(() => (order ? getCustomerFacingBillSummary(order.bill) : null), [order]);
  const commissionInvoice = useMemo(
    () => (order && vendor ? buildCommissionInvoice(order, vendor) : null),
    [order, vendor]
  );
  const commissionRows = useMemo(
    () => (order && vendor ? getCommissionInvoiceRows(order, vendor) : []),
    [order, vendor]
  );

  const paymentLink = useMemo(() => {
    if (!order || typeof window === "undefined") return "";
    return `${window.location.origin}/pay/${order.id}`;
  }, [order]);

  const vendorConfirmationLink = useMemo(() => {
    if (!order || typeof window === "undefined") return "";
    return `${window.location.origin}/vendor-order/${order.vendorToken}`;
  }, [order]);

  if (!order || !billSummary) {
    return (
      <AdminShell title="Order not found" description="The requested booking record could not be located.">
        <AdminEmptyState title="Order unavailable" body="This order ID does not exist in the current admin state." />
      </AdminShell>
    );
  }

  const customerNotifyMessage = [
    `Hi ${order.customer.name},`,
    `Your booking request ${order.id} with Mera Halwai is in process.`,
    `We are confirming vendor availability and reviewing the booking now.`,
    `We will notify you shortly with the next update.`,
  ].join("\n");

  const customerPaymentMessage = [
    `Hi ${order.customer.name},`,
    `Your booking ${order.id} has been accepted and is ready for payment.`,
    `Vendor: ${order.vendorName}`,
    `Package: ${order.packageName}`,
    `Guests: ${order.guests}`,
    `30% now (incl. 18% tax): ${formatCurrency(billSummary.upfrontTotal)}`,
    `70% at event: ${formatCurrency(billSummary.remainingAmount)}`,
    `Taxes (if applicable) as per vendor invoice.`,
    `Payment link: ${paymentLink}`,
  ].join("\n");

  const customerVendorInfoMessage = [
    `Hi ${order.customer.name},`,
    `Your booking ${order.id} is confirmed.`,
    `Vendor: ${order.vendorName}`,
    `Vendor contact: ${order.vendorPhone}`,
    `Venue: ${order.venue.venueName}`,
    `Location: ${order.venue.address}, ${order.venue.city}`,
  ].join("\n");

  const vendorNotifyMessage = [
    `Hi ${order.vendorName},`,
    `A new Mera Halwai booking requires your attention.`,
    `Order ID: ${order.id}`,
    `Event: ${order.eventType}`,
    `Date: ${order.eventDate}`,
    `Time: ${order.eventTime}`,
    `Guests: ${order.guests}`,
    `Package: ${order.packageName}`,
    `Confirmation link: ${vendorConfirmationLink}`,
    `Customer contact details will be shared only after payment confirmation.`,
  ].join("\n");

  const vendorCustomerDetailsMessage = [
    `Hi ${order.vendorName},`,
    `Payment is confirmed for booking ${order.id}.`,
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `WhatsApp: ${order.customer.whatsapp}`,
    `Email: ${order.customer.email}`,
    `Venue: ${order.venue.venueName}`,
    `Address: ${order.venue.address}, ${order.venue.city}`,
  ].join("\n");

  const openWhatsapp = (phone: string, message: string, beforeOpen?: () => void) => {
    beforeOpen?.();
    const number = digitsOnly(phone);
    if (!number) return;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <AdminShell
      title={`Order ${order.id}`}
      description="Simple booking operations view for customer updates, vendor follow-up, payment sharing, and final confirmation."
      actions={
        <div className="flex flex-wrap gap-3">
          <AdminLinkButton href="/admin/orders" variant="secondary" className="h-10 px-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </AdminLinkButton>
          <AdminLinkButton href={`/pay/${order.id}`} variant="secondary" className="h-10 px-4">
            <ReceiptText className="mr-2 h-4 w-4" />
            Customer Payment Page
          </AdminLinkButton>
        </div>
      }
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <AdminPanel
            eyebrow="Booking Request"
            title={order.vendorName}
            description="Customer booking snapshot and current order state."
            className="self-start"
          >
            <div className="grid gap-5 border-b border-[#E2E8F0] pb-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[28px] font-black tracking-[-0.05em] text-[#0F172A]">{order.id}</p>
                  <AdminOrderStatusBadge status={order.status} />
                  <AdminPaymentStatusBadge status={order.paymentStatus} />
                </div>
                <p className="text-[14px] leading-[1.75] text-[#64748B]">
                  Created on {formatDateTime(order.createdAt)} · Customer total {formatCurrency(billSummary.customerGrandTotal)}
                </p>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Customer</p>
                    <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{order.customer.name}</p>
                    <p className="mt-1 text-[13px] text-[#64748B]">{order.customer.phone}</p>
                    <p className="mt-1 text-[13px] text-[#64748B]">{order.customer.email}</p>
                  </div>
                  <div className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Event</p>
                    <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{order.eventType}</p>
                    <p className="mt-1 text-[13px] text-[#64748B]">{order.eventDate} · {order.eventTime}</p>
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:self-start">
                <QuickStat label="Package" value={order.packageName} />
                <QuickStat label="Guests" value={`${order.guests}`} />
                <QuickStat label="Customer Total" value={formatCurrency(billSummary.customerGrandTotal)} />
                <QuickStat label="Vendor Status" value={order.vendorResponseStatus} />
              </div>
            </div>
          </AdminPanel>
          <AdminPanel eyebrow="Customer & Venue" title="Captured Booking Details">
            <AdminInfoGrid
              columns={3}
              items={[
                { label: "Customer Name", value: order.customer.name },
                { label: "Phone", value: order.customer.phone },
                { label: "WhatsApp", value: order.customer.whatsapp },
                { label: "Email", value: order.customer.email },
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

            <div className="mt-5 grid gap-4 md:grid-cols-2">
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
          </AdminPanel>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <AdminPanel eyebrow="Actions" title="Booking Actions" description="Send WhatsApp updates, track payment, and close the booking.">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Customer WhatsApp</p>
                <div className="mt-3 space-y-3">
                  <WhatsAppAction
                    label="Notify Customer"
                    helper="Booking is under review and confirmation is in progress."
                    onClick={() =>
                      openWhatsapp(order.customer.whatsapp, customerNotifyMessage, () =>
                        logCommunication(order.id, {
                          label: "Customer notified",
                          helper: `Processing update shared with ${order.customer.name}`,
                          tone: "neutral",
                        })
                      )
                    }
                  />
                  <WhatsAppAction
                    label="Send Payment Link"
                    helper="Shares the 30% payment link with the customer."
                    onClick={() =>
                      openWhatsapp(order.customer.whatsapp, customerPaymentMessage, () => sendPaymentLink(order.id))
                    }
                  />
                  <WhatsAppAction
                    label="Send Vendor Information"
                    helper="Shares vendor name, phone, and venue details after confirmation."
                    onClick={() =>
                      openWhatsapp(order.customer.whatsapp, customerVendorInfoMessage, () =>
                        logCommunication(order.id, {
                          label: "Vendor details shared",
                          helper: `Vendor information shared with ${order.customer.name}`,
                          tone: "success",
                        })
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Vendor WhatsApp</p>
                <div className="mt-3 space-y-3">
                  <WhatsAppAction
                    label="Send Booking To Vendor"
                    helper="Sends only booking basics and the vendor confirmation link. Customer contact details stay hidden until payment is confirmed."
                    onClick={() =>
                      openWhatsapp(order.vendorWhatsapp, vendorNotifyMessage, () => notifyVendor(order.id))
                    }
                  />
                  <WhatsAppAction
                    label="Send Customer Details To Vendor"
                    helper="Shares customer name, phone, WhatsApp, and email after payment is marked received."
                    onClick={() =>
                      openWhatsapp(order.vendorWhatsapp, vendorCustomerDetailsMessage, () =>
                        logCommunication(order.id, {
                          label: "Customer details shared with vendor",
                          helper: `Customer contact information released to ${order.vendorName} after payment confirmation`,
                          tone: "success",
                        })
                      )
                    }
                  />
                </div>
              </div>

              <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Booking Controls</p>
                <div className="mt-3 grid gap-3">
                  <AdminButton variant="secondary" onClick={() => confirmVendor(order.id)} className="h-10 w-full">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Vendor Confirmed
                  </AdminButton>
                  <AdminButton
                    variant="secondary"
                    onClick={() => markPaymentDone(order.id, order.paymentReference || `MANUAL-${order.id}`)}
                    className="h-10 w-full"
                  >
                    <WalletCards className="mr-2 h-4 w-4" />
                    Payment Received
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    onClick={() => confirmBooking(order.id)}
                    disabled={order.paymentStatus !== "paid"}
                    className="h-10 w-full border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Final Confirm
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => cancelOrder(order.id)} className="h-10 w-full">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </AdminButton>
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Billing" title="Bill Summary">
            <div className="space-y-3 text-[14px]">
              {[
                ["Base Amount", billSummary.baseAmount],
                ["Optional Add-ons", billSummary.optionalAddOnAmount],
                ["Water", billSummary.waterAmount],
                ["Booking Value", billSummary.bookingValue],
                ["30% Now (Incl. Tax)", billSummary.upfrontTotal],
                ["70% At Event", billSummary.remainingAmount],
              ].map(([label, amount]) => (
                <div key={String(label)} className="flex items-center justify-between gap-3">
                  <span className="text-[#64748B]">{label}</span>
                  <span className="font-semibold text-[#0F172A]">{formatCurrency(Number(amount))}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[16px] border border-[#BFDBFE] bg-[#2563EB] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">Customer Total</p>
              <p className="mt-2 text-[28px] font-black tracking-[-0.04em] text-white">{formatCurrency(billSummary.customerGrandTotal)}</p>
            </div>

            {commissionInvoice ? (
              <div className="mt-5 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Commission Invoice</p>
                <div className="mt-3 space-y-2.5 text-[13px]">
                  {commissionRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <span className="text-[#64748B]">{row.label}</span>
                      <span className="font-semibold text-[#0F172A]">{row.value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[12px] text-[#64748B]">Invoice No. {commissionInvoice.invoiceNumber}</p>
                <AdminLinkButton
                  href={`/admin/orders/${order.id}/commission-invoice`}
                  variant="secondary"
                  className="mt-3 h-10 w-full"
                >
                  <ReceiptText className="mr-2 h-4 w-4" />
                  Open Commission Invoice
                </AdminLinkButton>
              </div>
            ) : null}
          </AdminPanel>

          <AdminTableCard title="Timeline" eyebrow="Activity Log">
            <div className="divide-y divide-[#E8EDF4]">
              {order.activity.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-semibold text-[#0F172A]">{item.label}</p>
                    <span className="text-[12px] font-medium text-[#64748B]">{item.actor}</span>
                  </div>
                  <p className="text-[13px] leading-[1.7] text-[#64748B]">{item.helper}</p>
                  <p className="text-[12px] text-[#64748B]">{formatDateTime(item.at)}</p>
                </div>
              ))}
            </div>
          </AdminTableCard>
        </div>
      </div>
    </AdminShell>
  );
}
