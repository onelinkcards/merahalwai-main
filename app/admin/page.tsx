"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  ClipboardList,
  Clock3,
  Handshake,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminLinkButton,
  AdminMetricCard,
  AdminPanel,
} from "@/components/admin/AdminUi";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatCurrency } from "@/data/mockAccount";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { useAdmin } from "@/components/admin/AdminProvider";
import { getAdminDisplayStatus } from "@/data/mockAdmin";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default function AdminDashboardPage() {
  const { state } = useAdmin();

  const notConfirmed = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "notConfirmed").length;
  const paymentPending = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "paymentPending").length;
  const confirmedCount = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "confirmed").length;
  const confirmedRevenue = state.orders
    .filter((order) => getAdminDisplayStatus(order.status) === "confirmed")
    .reduce((sum, order) => sum + getCustomerFacingBillSummary(order.bill).customerGrandTotal, 0);

  const actionQueue = state.orders
    .filter((order) => ["notConfirmed", "paymentPending"].includes(getAdminDisplayStatus(order.status)))
    .slice(0, 5);

  const recentOrders = [...state.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const statusBreakdown = [
    {
      label: "Not confirmed",
      value: notConfirmed,
    },
    {
      label: "Payment pending",
      value: paymentPending,
    },
    {
      label: "Confirmed",
      value: confirmedCount,
    },
  ];

  const maxStatusValue = Math.max(...statusBreakdown.map((item) => item.value), 1);
  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const count = state.orders.filter((order) => order.createdAt.slice(0, 10) === key).length;
    return {
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      count,
    };
  });
  const maxDayCount = Math.max(...recentDays.map((day) => day.count), 1);

  return (
    <AdminShell
      title="Dashboard"
      description="Daily operating view for incoming bookings, vendor follow-ups, payments, and live workload."
      actions={
        <>
          <AdminLinkButton href="/admin/vendors/new" variant="secondary" className="h-9 px-3.5">Add Vendor</AdminLinkButton>
          <AdminLinkButton href="/admin/orders" variant="secondary" className="h-9 px-3.5">Booking Requests</AdminLinkButton>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={ClipboardList} label="Not Confirmed" value={String(notConfirmed)} helper="Requires ops action" tone="amber" />
        <AdminMetricCard icon={Clock3} label="Payment Pending" value={String(paymentPending)} helper="Customer payment is pending" tone="blue" />
        <AdminMetricCard icon={Handshake} label="Confirmed Orders" value={String(confirmedCount)} helper="Payment and confirmation completed" tone="green" />
        <AdminMetricCard icon={WalletCards} label="Closed Revenue" value={formatCurrency(confirmedRevenue)} helper="Paid customer totals" tone="slate" />
      </section>

      <section className="mt-6 min-w-0 space-y-6">
        <AdminPanel
          title="Booking activity"
          eyebrow="Trend"
          description="Request volume and queue mix for the last 7 days."
          className="grid gap-6 lg:grid-cols-2"
        >
          <div>
            <p className="text-[13px] font-semibold text-[#475569]">Incoming requests</p>
            <div className="mt-5 flex items-end gap-3">
              {recentDays.map((day) => (
                <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-[148px] w-full items-end rounded-[16px] bg-[#F8FAFC] p-2">
                    <div
                      className="w-full rounded-[10px] bg-gradient-to-t from-[#2563EB] to-[#6366F1]"
                      style={{ height: `${Math.max((day.count / maxDayCount) * 100, day.count ? 18 : 8)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748B]">{day.label}</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">{day.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-[#475569]">Status mix</p>
            <div className="mt-5 space-y-4">
              {statusBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-[14px] font-medium text-[#334155]">{item.label}</span>
                    <span className="text-[14px] font-bold text-[#0F172A]">{item.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#6366F1]"
                      style={{ width: `${Math.max((item.value / maxStatusValue) * 100, item.value ? 16 : 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Recent booking requests"
          eyebrow="Latest"
          action={<AdminLinkButton href="/admin/orders" variant="ghost" className="h-9 px-3.5">View all</AdminLinkButton>}
        >
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition hover:border-[#BFDBFE] hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{order.id}</p>
                    <p className="mt-2 text-[18px] font-black tracking-[-0.03em] text-[#0F172A]">{order.customer.name}</p>
                    <p className="mt-1 text-[12px] text-[#64748B]">{order.customer.phone}</p>
                  </div>
                  <AdminOrderStatusBadge status={order.status} compact />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Vendor</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#0F172A]">{order.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Event</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#0F172A]">{order.eventType}</p>
                    <p className="text-[12px] text-[#64748B]">{formatDate(order.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Payment</p>
                    <div className="mt-1"><AdminPaymentStatusBadge status={order.paymentStatus} compact /></div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Total</p>
                    <p className="mt-1 text-[16px] font-bold text-[#0F172A]">
                      {formatCurrency(getCustomerFacingBillSummary(order.bill).customerGrandTotal)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#2563EB]">
                  View details
                  <ArrowRight className="h-4 w-4" />
                </p>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6">
            <AdminPanel title="Needs action" eyebrow="Priority" description="Orders that need handling next." className="min-w-0">
              <div className="space-y-3">
                {actionQueue.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 transition hover:border-[#BFDBFE] hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{order.id}</p>
                        <p className="mt-1 text-[16px] font-bold text-[#0F172A]">{order.vendorName}</p>
                        <p className="mt-1 text-[13px] text-[#64748B]">
                          {order.eventType} · {order.guests} guests
                        </p>
                      </div>
                      <AdminOrderStatusBadge status={order.status} compact />
                    </div>
                    <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-[#2563EB]">
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </p>
                  </Link>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title="Quick actions" eyebrow="Shortcuts" className="min-w-0">
              <div className="grid gap-3">
                <AdminLinkButton href="/admin/orders" variant="secondary" className="h-9 w-full">Booking Requests</AdminLinkButton>
                <AdminLinkButton href="/admin/vendors/new" variant="secondary" className="h-9 w-full">Add Vendor</AdminLinkButton>
                <AdminLinkButton href="/admin/invoices" variant="secondary" className="h-9 w-full">Commission Invoices</AdminLinkButton>
                <AdminLinkButton href="/admin/notifications" variant="secondary" className="h-9 w-full">Notifications</AdminLinkButton>
              </div>
            </AdminPanel>
          </div>

          <div className="min-w-0 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <AdminPanel title="Notifications" eyebrow="Feed" className="min-w-0">
              <div className="space-y-3">
                {state.activityFeed.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#EFF6FF] text-[#2563EB]">
                      <BellRing className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#0F172A]">{item.label}</p>
                      <p className="mt-1 text-[12px] leading-[1.6] text-[#64748B]">{item.helper}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title="Commission invoices" eyebrow="Vendor billing" className="min-w-0">
              <div className="space-y-3">
                {state.orders
                  .filter((order) => order.invoiceAvailable)
                  .slice(0, 3)
                  .map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}/commission-invoice`}
                      className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 transition hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#0F172A]">{order.id}</p>
                        <p className="truncate text-[12px] text-[#64748B]">{order.vendorName}</p>
                      </div>
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF2FF] text-[#6366F1]">
                        <ReceiptText className="h-4 w-4" />
                      </span>
                    </Link>
                  ))}
              </div>
            </AdminPanel>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
