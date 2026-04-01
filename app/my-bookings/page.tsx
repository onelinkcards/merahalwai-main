"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import StatusBadge from "@/components/account/StatusBadge";
import { formatCurrency, formatDateTime, getMergedOrders, type DemoOrder } from "@/data/mockAccount";
import { useBookingStore } from "@/store/bookingStore";

type FilterKey = "all" | "active" | "pending" | "confirmed" | "completed" | "cancelled";

const tabs: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function matchesFilter(order: DemoOrder, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "active") {
    return ["slotHeld", "pendingConfirmation", "confirmed", "paymentPending"].includes(order.status);
  }
  if (filter === "pending") {
    return ["slotHeld", "pendingConfirmation", "paymentPending"].includes(order.status);
  }
  if (filter === "confirmed") {
    return order.status === "confirmed";
  }
  if (filter === "completed") {
    return order.status === "paymentDone";
  }
  return order.status === "cancelled";
}

export default function MyOrdersPage() {
  const store = useBookingStore();
  const orders = getMergedOrders(store);
  const [activeTab, setActiveTab] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const lowered = query.toLowerCase().trim();
    return orders.filter((order) => {
      if (!matchesFilter(order, activeTab)) return false;
      if (!lowered) return true;
      return (
        order.id.toLowerCase().includes(lowered) ||
        order.vendorName.toLowerCase().includes(lowered) ||
        order.status.toLowerCase().includes(lowered)
      );
    });
  }, [activeTab, orders, query]);

  return (
    <AccountShell
      active="orders"
      title="My Orders"
      description="All your booking requests in one simple list."
    >
      <div className="space-y-5">
        <section className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "inline-flex h-10 items-center rounded-full border px-4 text-[13px] font-semibold whitespace-nowrap transition-all " +
                      (activeTab === tab.key
                        ? "border-[#EC9925] bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] text-white shadow-[0_14px_28px_rgba(138,62,29,0.14)]"
                        : "border-[#E7E8EC] bg-white text-[#5B5B63] hover:bg-[#FFF9F2]")
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-[340px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A28D79]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order or vendor"
                className="h-11 w-full rounded-[18px] border border-[#E7D5C4] bg-[#FFF9F2] pl-11 pr-4 text-[14px] font-medium text-[#3A271C] outline-none focus:border-[#EC9925] focus:bg-white"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/my-bookings/${order.id}`}
              className="group block rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,12,14,0.05)] transition-all hover:border-[#E7D5C4] hover:bg-[#FFFCF8] md:px-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[19px] font-black tracking-[-0.03em] text-[#111111]">{order.vendorName}</p>
                    <span className="rounded-full border border-[#E7DCCF] bg-[#FFF9F2] px-3 py-1 text-[11px] font-medium text-[#6F645B]">
                      {order.packageName}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#6E6E75]">
                    <span>Order ID {order.id}</span>
                    <span className="text-[#C7B7A8]">•</span>
                    <span>{order.eventType}</span>
                    <span className="text-[#C7B7A8]">•</span>
                    <span>{order.guests} guests</span>
                  </div>

                  <p className="mt-2 text-[14px] text-[#66666D]">{formatDateTime(order.eventDate, order.eventTime)}</p>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <StatusBadge status={order.status} compact />
                  <div className="flex items-center gap-3">
                    <p className="text-[18px] font-black text-[#111111]">{formatCurrency(order.total)}</p>
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#8A3E1D]">
                      View details
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  {order.invoiceAvailable ? (
                    <span className="text-[12px] font-semibold text-[#8A3E1D]">Invoice available</span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}

          {!filtered.length ? (
            <div className="rounded-[28px] border border-dashed border-[#E2E3E8] bg-white px-6 py-12 text-center text-[#6B6B73] shadow-[0_16px_40px_rgba(12,12,14,0.04)]">
              No orders match your current filters.
            </div>
          ) : null}
        </section>
      </div>
    </AccountShell>
  );
}
