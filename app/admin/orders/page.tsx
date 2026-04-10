"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AdminButton,
  AdminPanel,
  AdminSelect,
  AdminTableCard,
} from "@/components/admin/AdminUi";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";
import type { AdminOrderStatus } from "@/data/mockAdmin";
import type { FoodPreference, PackageTier } from "@/store/bookingStore";

export default function AdminOrdersPage() {
  const { state } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminOrderStatus | "all">("all");
  const [eventType, setEventType] = useState("all");
  const [packageTier, setPackageTier] = useState<PackageTier | "all">("all");
  const [foodPreference, setFoodPreference] = useState<FoodPreference | "all">("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (eventType !== "all" && order.eventType !== eventType) return false;
      if (packageTier !== "all" && order.packageTier !== packageTier) return false;
      if (foodPreference !== "all" && order.foodPreference !== foodPreference) return false;
      if (paymentStatus !== "all" && order.paymentStatus !== paymentStatus) return false;
      if (!normalized) return true;

      return [order.id, order.customer.name, order.customer.phone, order.vendorName]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [eventType, foodPreference, packageTier, paymentStatus, query, state.orders, status]);

  const eventOptions = [...new Set(state.orders.map((order) => order.eventType))];

  return (
    <AdminShell
      title="Booking Requests"
      description="Single queue for booking requests, review work, vendor assignment, and payment progression."
      actions={
        <AdminButton variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </AdminButton>
      }
    >
      <AdminPanel title="Filters" eyebrow="Queue Controls" description="Search and narrow the operational queue.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

          <SelectField label="Status" value={status} onChange={(value) => setStatus(value as AdminOrderStatus | "all")}>
            <option value="all">All statuses</option>
            {[
              "bookingRequestSubmitted",
              "slotHeld",
              "pendingAdminReview",
              "vendorNotified",
              "vendorConfirmed",
              "vendorDeclined",
              "paymentLinkSent",
              "paymentPending",
              "paymentDone",
              "bookingConfirmed",
              "cancelled",
              "expired",
            ].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </SelectField>

          <SelectField label="Event Type" value={eventType} onChange={setEventType}>
            <option value="all">All events</option>
            {eventOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </SelectField>

          <SelectField label="Package" value={packageTier} onChange={(value) => setPackageTier(value as PackageTier | "all")}>
            <option value="all">All packages</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </SelectField>

          <SelectField label="Food Preference" value={foodPreference} onChange={(value) => setFoodPreference(value as FoodPreference | "all")}>
            <option value="all">All</option>
            <option value="veg">Pure Veg</option>
            <option value="veg_nonveg">Veg + Non-Veg</option>
          </SelectField>

          <SelectField label="Payment Status" value={paymentStatus} onChange={setPaymentStatus}>
            <option value="all">All</option>
            <option value="notStarted">Not Started</option>
            <option value="linkSent">Link Sent</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </SelectField>
        </div>
      </AdminPanel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AdminTableCard title={`${filteredOrders.length} matching orders`} eyebrow="Operational Queue">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                <tr>
                  {["Order", "Customer", "Booking", "Food", "Status", "Payment", "Total", "Action"].map((label) => (
                    <th key={label} className="px-5 py-4">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="text-[14px] text-[#334155]">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#0F172A]">{order.id}</p>
                      <p className="text-[12px] text-[#64748B]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F172A]">{order.customer.name}</p>
                      <p className="text-[12px] text-[#64748B]">{order.customer.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F172A]">{order.vendorName}</p>
                      <p className="text-[12px] text-[#64748B]">{order.eventType} · {order.guests} guests</p>
                      <p className="text-[12px] text-[#64748B]">{order.packageName}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-[#475569]">
                      {order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg"}
                    </td>
                    <td className="px-5 py-4"><AdminOrderStatusBadge status={order.status} compact /></td>
                    <td className="px-5 py-4"><AdminPaymentStatusBadge status={order.paymentStatus} compact /></td>
                    <td className="px-5 py-4 font-bold text-[#0F172A]">{formatCurrency(order.bill.finalTotal)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <AdminButton variant="ghost" className="h-9 px-3">Open</AdminButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminTableCard>

        <div className="space-y-6">
          <AdminPanel title="Queue notes" eyebrow="Behaviour">
            <div className="space-y-3">
              {[
                "Customer flow and admin queue stay synced to the same booking state.",
                "Vendor confirmation and payment follow-up remain separate actions.",
                "Use order detail for payment links, notes, and vendor contact.",
              ].map((item) => (
                <div key={item} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] leading-[1.6] text-[#475569]">
                  {item}
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Status counts" eyebrow="Snapshot">
            <div className="space-y-3">
              {[
                ["Submitted", state.orders.filter((order) => order.status === "bookingRequestSubmitted").length],
                ["Slot Held", state.orders.filter((order) => order.status === "slotHeld").length],
                ["Vendor Follow-up", state.orders.filter((order) => ["vendorNotified", "vendorDeclined"].includes(order.status)).length],
                ["Payment Pending", state.orders.filter((order) => ["paymentLinkSent", "paymentPending"].includes(order.status)).length],
              ].map(([label, count]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-white px-4 py-3">
                  <span className="text-[14px] font-medium text-[#334155]">{label}</span>
                  <span className="text-[14px] font-bold text-[#0F172A]">{count}</span>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
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
