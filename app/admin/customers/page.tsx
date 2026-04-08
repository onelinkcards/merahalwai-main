"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminCustomersPage() {
  const { state } = useAdmin();
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return state.customers;
    return state.customers.filter((customer) =>
      [customer.name, customer.phone, customer.email].join(" ").toLowerCase().includes(normalized)
    );
  }, [query, state.customers]);

  return (
    <AdminShell
      title="Customers"
      description="View customer accounts, saved addresses, booking history, spend, and internal support context."
    >
      <section className="rounded-[24px] border border-[#E3E8F0] bg-white p-5 shadow-[0_12px_26px_rgba(0,0,0,0.06)]">
        <label className="block max-w-[420px]">
          <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#2F6FED]">Search Customers</span>
          <div className="flex h-11 items-center gap-3 rounded-[14px] border border-[#E3E8F0] bg-white px-4">
            <Search className="h-4 w-4 text-[#7B8694]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-[14px] font-medium text-[#1C2430] outline-none"
              placeholder="Customer name, phone, or email"
            />
          </div>
        </label>
      </section>

      <section className="mt-6 space-y-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-[18px] border border-[#E3E8F0] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <p className="text-[16px] font-bold text-[#1C2430]">{customer.name}</p>
                <p className="text-[12px] text-[#6B7480]">{customer.phone}</p>
                <p className="text-[12px] text-[#6B7480]">{customer.email}</p>
              </div>
              <div className="min-w-[160px] text-[12px] text-[#6B7480]">
                Auth: {customer.authType.toUpperCase()}
              </div>
              <div className="min-w-[160px] text-[12px] text-[#6B7480]">
                Orders: {customer.totalOrders}
              </div>
              <div className="min-w-[160px] text-[12px] text-[#6B7480]">
                Spend: {formatCurrency(customer.lifetimeSpend)}
              </div>
              <div className="min-w-[140px]">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${customer.status === "active" ? "bg-[#E6F7ED] text-[#1F7A3F]" : "bg-[#FFF1F1] text-[#B54545]"}`}>
                  {customer.status}
                </span>
              </div>
              <Link href={`/admin/customers/${customer.id}`} className="rounded-full border border-[#D7E3F4] px-3 py-2 text-[12px] font-bold text-[#2F6FED]">
                View
              </Link>
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
