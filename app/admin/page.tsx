"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Clock3, Handshake, WalletCards } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
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
      tone: "bg-[#F4BE5B]",
    },
    {
      label: "Vendor follow-up",
      value: state.orders.filter((order) => ["vendorNotified", "vendorDeclined"].includes(order.status)).length,
      tone: "bg-[#CC7D32]",
    },
    {
      label: "Payment follow-up",
      value: state.orders.filter((order) => ["paymentLinkSent", "paymentPending"].includes(order.status)).length,
      tone: "bg-[#8A3E1D]",
    },
    {
      label: "Confirmed",
      value: state.orders.filter((order) => ["paymentDone", "bookingConfirmed"].includes(order.status)).length,
      tone: "bg-[#2F7D5B]",
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
      description="Track booking requests, vendor confirmations, payments, and recent activity in one view."
      actions={
        <>
          <Link
            href="/admin/vendors/new"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E3E8F0] bg-white px-5 text-[12px] font-bold text-[#1C2430]"
          >
            Add Vendor
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#2F6FED] px-5 text-[12px] font-bold text-white"
          >
            Open Orders
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ClipboardList} label="New Requests" value={String(newRequests)} helper="Needs review" />
        <MetricCard icon={Clock3} label="Slot Held" value={String(slotHeld)} helper="Watch expiries" />
        <MetricCard icon={Handshake} label="Vendor Follow-up" value={String(pendingVendor)} helper="Awaiting response" />
        <MetricCard icon={WalletCards} label="Revenue Closed" value={formatCurrency(confirmedRevenue)} helper="Paid + confirmed" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="space-y-6">
          <article className="grid gap-6 rounded-[26px] border border-[#E3E8F0] bg-white p-6 shadow-[0_16px_34px_rgba(16,24,40,0.08)] lg:grid-cols-2">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2F6FED]">Booking Trend</p>
              <h2 className="mt-2 text-[24px] font-black tracking-[-0.04em] text-[#1C2430]">Requests in the last 7 days</h2>
              <div className="mt-6 flex items-end gap-3">
                {recentDays.map((day) => (
                  <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-[160px] w-full items-end rounded-[18px] bg-[#F3F6FB] p-2">
                      <div
                        className="w-full rounded-[12px] bg-[linear-gradient(180deg,#5B8CFF_0%,#2F6FED_70%,#1F4FD6_100%)]"
                        style={{ height: `${Math.max((day.count / maxDayCount) * 100, day.count ? 18 : 8)}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#6B7480]">{day.label}</span>
                    <span className="text-[14px] font-black text-[#1C2430]">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2F6FED]">Status Mix</p>
              <h2 className="mt-2 text-[24px] font-black tracking-[-0.04em] text-[#1C2430]">What needs attention right now</h2>
              <div className="mt-6 space-y-4">
                {statusBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-[14px] font-semibold text-[#2E3640]">{item.label}</span>
                      <span className="text-[14px] font-black text-[#1C2430]">{item.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#EDF1F7]">
                      <div
                        className="h-3 rounded-full bg-[#2F6FED]"
                        style={{ width: `${Math.max((item.value / maxStatusValue) * 100, item.value ? 16 : 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-[26px] border border-[#E3E8F0] bg-white shadow-[0_16px_34px_rgba(16,24,40,0.08)]">
            <div className="flex items-center justify-between border-b border-[#E9EDF4] px-6 py-5">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2F6FED]">Recent Orders</p>
                <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1C2430]">Latest booking requests</h2>
              </div>
              <Link href="/admin/orders" className="text-[13px] font-bold text-[#2F6FED]">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#F3F6FB] text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7480]">
                  <tr>
                    {["Order ID", "Customer", "Vendor", "Event", "Status", "Payment", "Total"].map((label) => (
                      <th key={label} className="px-6 py-4">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F6]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-[14px] text-[#3A4550]">
                      <td className="px-6 py-5 font-bold text-[#1C2430]">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-[#2F6FED]">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#1C2430]">{order.customer.name}</p>
                        <p className="text-[12px] text-[#7B8694]">{order.customer.phone}</p>
                      </td>
                      <td className="px-6 py-5">{order.vendorName}</td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#1C2430]">{order.eventType}</p>
                        <p className="text-[12px] text-[#7B8694]">{formatDate(order.eventDate)}</p>
                      </td>
                      <td className="px-6 py-5"><AdminOrderStatusBadge status={order.status} compact /></td>
                      <td className="px-6 py-5"><AdminPaymentStatusBadge status={order.paymentStatus} compact /></td>
                      <td className="px-6 py-5 font-bold text-[#1C2430]">{formatCurrency(order.bill.finalTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[26px] border border-[#E3E8F0] bg-white p-6 shadow-[0_16px_34px_rgba(16,24,40,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2F6FED]">Action Queue</p>
                <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1C2430]">Handle these next</h2>
              </div>
              <span className="rounded-full border border-[#E3E8F0] bg-[#F3F6FB] px-3 py-1 text-[12px] font-bold text-[#1C2430]">
                {actionQueue.length} open
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {actionQueue.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-[20px] border border-[#E3E8F0] bg-[#F7FAFF] p-4 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#7B8694]">{order.id}</p>
                      <p className="mt-1 text-[17px] font-black text-[#1C2430]">{order.vendorName}</p>
                      <p className="mt-1 text-[13px] text-[#6B7480]">
                        {order.eventType} · {order.guests} guests
                      </p>
                    </div>
                    <AdminOrderStatusBadge status={order.status} compact />
                  </div>
                  <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-bold text-[#2F6FED]">
                    Open order
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[26px] border border-[#E3E8F0] bg-white p-6 shadow-[0_16px_34px_rgba(16,24,40,0.08)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2F6FED]">Quick Actions</p>
            <div className="mt-5 grid gap-3">
              <ActionLink href="/admin/orders" label="Open booking requests" />
              <ActionLink href="/admin/vendors/new" label="Add a new vendor" />
              <ActionLink href="/admin/invoices" label="Review invoices" />
              <ActionLink href="/admin/reports" label="Open reports" />
            </div>
          </article>
        </div>
      </section>
    </AdminShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-[22px] border border-[#E3E8F0] bg-white p-5 shadow-[0_12px_28px_rgba(16,24,40,0.08)]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2F6FED] text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7480]">{label}</p>
      <p className="mt-2 text-[30px] font-black tracking-[-0.04em] text-[#1C2430]">{value}</p>
      <p className="mt-2 text-[13px] font-medium text-[#6B7480]">{helper}</p>
    </article>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-[16px] border border-[#E3E8F0] bg-[#F7FAFF] px-4 py-3 text-[14px] font-semibold text-[#1C2430] transition hover:bg-white"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-[#2F6FED]" />
    </Link>
  );
}
