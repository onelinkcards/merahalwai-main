"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminLinkButton, AdminPanel, AdminSelect } from "@/components/admin/AdminUi";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";
import { getAdminDisplayStatus, type AdminDisplayStatus } from "@/data/mockAdmin";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";

export default function AdminOrdersPage() {
  const { state } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminDisplayStatus | "all">("all");

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.orders.filter((order) => {
      if (status !== "all" && getAdminDisplayStatus(order.status) !== status) return false;
      if (!normalized) return true;

      return [order.id, order.customer.name, order.customer.phone, order.vendorName]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, state.orders, status]);

  return (
    <AdminShell title="Booking Requests" description="Simple booking queue for confirmation, payment follow-up, and closure.">
      <AdminPanel title="Filters" eyebrow="Search" description="Keep the queue simple and searchable.">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Search</span>
            <div className="flex h-11 items-center gap-3 rounded-[12px] border border-[#CBD5E1] bg-white px-4">
              <Search className="h-4 w-4 text-[#64748B]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-[14px] font-medium text-[#0F172A] outline-none"
                placeholder="Order ID, customer, phone, vendor"
              />
            </div>
          </label>

          <AdminSelect label="Status" value={status} onChange={(event) => setStatus(event.target.value as AdminDisplayStatus | "all")}>
            <option value="all">All statuses</option>
            <option value="notConfirmed">Not Confirmed</option>
            <option value="paymentPending">Payment Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </AdminSelect>
        </div>
      </AdminPanel>

      <div className="mt-6 space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="rounded-[22px] border border-[#D9E1EC] bg-white px-5 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 xl:grid-cols-[160px_minmax(0,1.15fr)_minmax(0,1fr)_150px_170px_150px_140px] xl:items-center">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-[#0F172A]">{order.id}</p>
                <p className="mt-1 text-[12px] text-[#64748B]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
              </div>

              <div className="min-w-0">
                <p className="text-[17px] font-bold text-[#0F172A]">{order.customer.name}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">{order.customer.phone}</p>
              </div>

              <div className="min-w-0">
                <p className="text-[16px] font-bold text-[#0F172A]">{order.vendorName}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  {order.eventType} · {order.guests} guests · {order.packageName}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Status</p>
                <div className="mt-2">
                  <AdminOrderStatusBadge status={order.status} compact />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Payment</p>
                <div className="mt-2">
                  <AdminPaymentStatusBadge status={order.paymentStatus} compact />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Customer Total</p>
                <p className="mt-2 text-[16px] font-bold text-[#0F172A]">
                  {formatCurrency(getCustomerFacingBillSummary(order.bill).customerGrandTotal)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <AdminLinkButton href={`/admin/orders/${order.id}`} variant="ghost">
                  Open
                </AdminLinkButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
