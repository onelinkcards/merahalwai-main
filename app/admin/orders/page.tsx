"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
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

      return [
        order.id,
        order.customer.name,
        order.customer.phone,
        order.vendorName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [eventType, foodPreference, packageTier, paymentStatus, query, state.orders, status]);

  const eventOptions = [...new Set(state.orders.map((order) => order.eventType))];

  return (
    <AdminShell
      title="Booking Requests"
      description="Manage booking requests, vendor confirmations, and payment follow-up in one queue."
      actions={
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E3E8F0] bg-white px-4 text-[12px] font-bold text-[#1C2430]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      }
    >
      <section className="rounded-[24px] border border-[#E3E8F0] bg-white p-5 shadow-[0_12px_26px_rgba(0,0,0,0.06)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#2F6FED]">Search</span>
            <div className="flex h-11 items-center gap-3 rounded-[14px] border border-[#E3E8F0] bg-white px-4">
              <Search className="h-4 w-4 text-[#7B8694]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-[14px] font-medium text-[#1C2430] outline-none"
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
      </section>

      <section className="mt-6 rounded-[24px] border border-[#E3E8F0] bg-white p-5 shadow-[0_12px_26px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9EDF4] pb-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#2F6FED]">Operational Queue</p>
            <h2 className="mt-2 text-[22px] font-black tracking-[-0.04em] text-[#1C2430]">{filteredOrders.length} matching orders</h2>
          </div>
          <p className="rounded-full border border-[#E3E8F0] bg-[#F6F8FB] px-3 py-1 text-[12px] font-semibold text-[#5A6470]">
            Desktop + mobile filters use the same state model
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-[18px] border border-[#E6EAF1] bg-[#F9FBFF] px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[220px]">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2F6FED]">{order.id}</p>
                  <p className="mt-2 text-[16px] font-bold text-[#1C2430]">{order.customer.name}</p>
                  <p className="text-[12px] text-[#6B7480]">{order.customer.phone}</p>
                </div>
                <div className="min-w-[220px]">
                  <p className="text-[13px] font-semibold text-[#1C2430]">{order.vendorName}</p>
                  <p className="text-[12px] text-[#6B7480]">{order.eventType} · {order.eventDate}</p>
                  <p className="text-[12px] text-[#6B7480]">{order.guests} guests · {order.packageName}</p>
                </div>
                <div className="min-w-[200px]">
                  <p className="text-[12px] text-[#6B7480]">Food preference</p>
                  <p className="text-[13px] font-semibold text-[#1C2430]">
                    {order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg"}
                  </p>
                  <p className="mt-2 text-[12px] text-[#6B7480]">Created {new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="min-w-[200px]">
                  <p className="text-[12px] text-[#6B7480]">Total</p>
                  <p className="text-[18px] font-black text-[#1C2430]">{formatCurrency(order.bill.finalTotal)}</p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <AdminOrderStatusBadge status={order.status} compact />
                  <AdminPaymentStatusBadge status={order.paymentStatus} compact />
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-[#D7E3F4] bg-white px-4 text-[12px] font-bold text-[#2F6FED]"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
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
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#2F6FED]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[14px] border border-[#E3E8F0] bg-white px-4 text-[14px] font-medium text-[#1C2430] outline-none transition focus:border-[#2F6FED]"
      >
        {children}
      </select>
    </label>
  );
}
