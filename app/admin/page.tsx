"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Handshake,
  WalletCards,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminButton,
  AdminMetricCard,
  AdminPanel,
  AdminTableCard,
} from "@/components/admin/AdminUi";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatCurrency } from "@/data/mockAccount";
import { useAdmin } from "@/components/admin/AdminProvider";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default function AdminDashboardPage() {
  const { state } = useAdmin();

  const newRequests = state.orders.filter((order) =>
    ["bookingRequestSubmitted", "pendingAdminReview"].includes(order.status)
  ).length;
  const slotHeld = state.orders.filter((order) => order.status === "slotHeld").length;
  const pendingVendor = state.orders.filter((order) =>
    ["vendorNotified", "vendorDeclined"].includes(order.status)
  ).length;
  const confirmedRevenue = state.orders
    .filter((order) => ["paymentDone", "bookingConfirmed"].includes(order.status))
    .reduce((sum, order) => sum + order.bill.finalTotal, 0);

  const actionQueue = state.orders
    .filter((order) =>
      ["bookingRequestSubmitted", "slotHeld", "vendorDeclined", "paymentPending", "paymentLinkSent"].includes(order.status)
    )
    .slice(0, 5);

  const recentOrders = [...state.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const statusBreakdown = [
    {
      label: "New requests",
      value: state.orders.filter((order) => order.status === "bookingRequestSubmitted").length,
    },
    {
      label: "Vendor follow-up",
      value: state.orders.filter((order) => ["vendorNotified", "vendorDeclined"].includes(order.status)).length,
    },
    {
      label: "Payment follow-up",
      value: state.orders.filter((order) => ["paymentLinkSent", "paymentPending"].includes(order.status)).length,
    },
    {
      label: "Confirmed",
      value: state.orders.filter((order) => ["paymentDone", "bookingConfirmed"].includes(order.status)).length,
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
          <Link href="/admin/vendors/new">
            <AdminButton variant="secondary">Add Vendor</AdminButton>
          </Link>
          <Link href="/admin/orders">
            <AdminButton>Open Queue</AdminButton>
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={ClipboardList} label="New Requests" value={String(newRequests)} helper="Needs review" tone="blue" />
        <AdminMetricCard icon={Clock3} label="Slot Held" value={String(slotHeld)} helper="Watch expiries" tone="amber" />
        <AdminMetricCard icon={Handshake} label="Vendor Follow-up" value={String(pendingVendor)} helper="Awaiting response" tone="slate" />
        <AdminMetricCard icon={WalletCards} label="Revenue Closed" value={formatCurrency(confirmedRevenue)} helper="Paid + confirmed" tone="green" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <div className="space-y-6">
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
                        className="w-full rounded-[10px] bg-[#0F172A]"
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
              <p className="text-[13px] font-semibold text-[#475569]">Queue composition</p>
              <div className="mt-5 space-y-4">
                {statusBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-[14px] font-medium text-[#334155]">{item.label}</span>
                      <span className="text-[14px] font-bold text-[#0F172A]">{item.value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#E9EEF5]">
                      <div
                        className="h-2.5 rounded-full bg-[#334155]"
                        style={{ width: `${Math.max((item.value / maxStatusValue) * 100, item.value ? 16 : 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminPanel>

          <AdminTableCard
            title="Recent booking requests"
            eyebrow="Latest"
            action={
              <Link href="/admin/orders">
                <AdminButton variant="ghost">View all</AdminButton>
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  <tr>
                    {["Order ID", "Customer", "Vendor", "Event", "Status", "Payment", "Total"].map((label) => (
                      <th key={label} className="px-5 py-4">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF4]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-[14px] text-[#334155]">
                      <td className="px-5 py-4 font-bold text-[#0F172A]">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-[#1D4ED8]">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#0F172A]">{order.customer.name}</p>
                        <p className="text-[12px] text-[#64748B]">{order.customer.phone}</p>
                      </td>
                      <td className="px-5 py-4">{order.vendorName}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#0F172A]">{order.eventType}</p>
                        <p className="text-[12px] text-[#64748B]">{formatDate(order.eventDate)}</p>
                      </td>
                      <td className="px-5 py-4"><AdminOrderStatusBadge status={order.status} compact /></td>
                      <td className="px-5 py-4"><AdminPaymentStatusBadge status={order.paymentStatus} compact /></td>
                      <td className="px-5 py-4 font-bold text-[#0F172A]">{formatCurrency(order.bill.finalTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableCard>
        </div>

        <div className="space-y-6">
          <AdminPanel title="Action queue" eyebrow="Priority" description="Orders that need manual handling next.">
            <div className="space-y-3">
              {actionQueue.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-[18px] border border-[#D9E1EC] bg-[#F8FAFC] px-4 py-4 transition hover:border-[#BFC9D9] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{order.id}</p>
                      <p className="mt-1 text-[16px] font-bold text-[#0F172A]">{order.vendorName}</p>
                      <p className="mt-1 text-[13px] text-[#64748B]">
                        {order.eventType} · {order.guests} guests
                      </p>
                    </div>
                    <AdminOrderStatusBadge status={order.status} compact />
                  </div>
                  <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-[#0F172A]">
                    Open order
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Quick actions" eyebrow="Shortcuts">
            <div className="grid gap-3">
              <Link href="/admin/orders"><AdminButton variant="secondary" className="w-full">Open booking requests</AdminButton></Link>
              <Link href="/admin/vendors/new"><AdminButton variant="secondary" className="w-full">Add new vendor</AdminButton></Link>
              <Link href="/admin/invoices"><AdminButton variant="secondary" className="w-full">Review invoices</AdminButton></Link>
              <Link href="/admin/reports"><AdminButton variant="secondary" className="w-full">Open reports</AdminButton></Link>
            </div>
          </AdminPanel>

          <AdminPanel title="Payments" eyebrow="Follow-up">
            <div className="space-y-3">
              {state.orders
                .filter((order) => ["paymentLinkSent", "paymentPending"].includes(order.status))
                .slice(0, 4)
                .map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                    <div>
                      <p className="text-[13px] font-bold text-[#0F172A]">{order.id}</p>
                      <p className="text-[12px] text-[#64748B]">{order.customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-[#0F172A]">{formatCurrency(order.bill.finalTotal)}</p>
                      <AdminPaymentStatusBadge status={order.paymentStatus} compact />
                    </div>
                  </div>
                ))}
            </div>
          </AdminPanel>
        </div>
      </section>
    </AdminShell>
  );
}
