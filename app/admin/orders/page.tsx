"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminButton, AdminLinkButton, AdminPanel, AdminSelect } from "@/components/admin/AdminUi";
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
    <AdminShell
      title="Booking Requests"
      description="Simple queue for confirming bookings, sending payment links, and closing orders."
      actions={
        <AdminButton variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </AdminButton>
      }
    >
      <AdminPanel title="Filters" eyebrow="Controls" description="Use only the filters needed right now.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
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

          <SelectField label="Status" value={status} onChange={(value) => setStatus(value as AdminDisplayStatus | "all")}>
            <option value="all">All statuses</option>
            <option value="notConfirmed">Not Confirmed</option>
            <option value="paymentPending">Payment Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </SelectField>
        </div>
      </AdminPanel>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Not Confirmed", state.orders.filter((order) => getAdminDisplayStatus(order.status) === "notConfirmed").length],
          ["Payment Pending", state.orders.filter((order) => getAdminDisplayStatus(order.status) === "paymentPending").length],
          ["Confirmed", state.orders.filter((order) => getAdminDisplayStatus(order.status) === "confirmed").length],
          ["Cancelled", state.orders.filter((order) => getAdminDisplayStatus(order.status) === "cancelled").length],
        ].map(([label, count]) => (
          <div key={String(label)} className="rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
              <p className="text-[20px] font-black tracking-[-0.04em] text-[#0F172A]">{count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <AdminPanel title={`${filteredOrders.length} matching bookings`} eyebrow="Bookings">
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{order.id}</p>
                    <p className="mt-2 text-[18px] font-black tracking-[-0.03em] text-[#0F172A]">{order.customer.name}</p>
                    <p className="mt-1 text-[12px] text-[#64748B]">{order.customer.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <AdminOrderStatusBadge status={order.status} compact />
                    <AdminPaymentStatusBadge status={order.paymentStatus} compact />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Vendor</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#0F172A]">{order.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Booking</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#0F172A]">{order.eventType}</p>
                    <p className="text-[12px] text-[#64748B]">
                      {order.guests} guests · {order.packageName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Created</p>
                    <p className="mt-1 text-[13px] text-[#334155]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Customer Total</p>
                    <p className="mt-1 text-[16px] font-bold text-[#0F172A]">
                      {formatCurrency(getCustomerFacingBillSummary(order.bill).customerGrandTotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <AdminLinkButton href={`/admin/orders/${order.id}`} variant="secondary" className="h-9 px-3.5">
                    View Details
                  </AdminLinkButton>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <AdminSelect label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </AdminSelect>
  );
}
