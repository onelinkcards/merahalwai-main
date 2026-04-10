"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminButton, AdminPanel } from "@/components/admin/AdminUi";
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
      description="Customer accounts, address book, auth type, spend history, and support context."
    >
      <AdminPanel title="Search customers" eyebrow="Lookup">
        <label className="block max-w-[420px]">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Search</span>
          <div className="flex h-11 items-center gap-3 rounded-[12px] border border-[#CBD5E1] bg-white px-4">
            <Search className="h-4 w-4 text-[#64748B]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-[14px] font-medium text-[#0F172A] outline-none"
              placeholder="Customer name, phone, or email"
            />
          </div>
        </label>
      </AdminPanel>

      <div className="mt-6 space-y-4">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-[22px] border border-[#D9E1EC] bg-white px-5 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_160px_160px_180px_140px] xl:items-center">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-[#0F172A]">{customer.name}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">{customer.phone}</p>
                <p className="text-[13px] text-[#64748B]">{customer.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Auth</p>
                <p className="mt-2 text-[14px] font-semibold uppercase text-[#0F172A]">{customer.authType}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Orders</p>
                <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{customer.totalOrders}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Lifetime Spend</p>
                <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{formatCurrency(customer.lifetimeSpend)}</p>
              </div>
              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${customer.status === "active" ? "border-[#B7E4C7] bg-[#ECFDF3] text-[#166534]" : "border-[#F1C7CE] bg-[#FFF1F3] text-[#BE123C]"}`}>
                  {customer.status}
                </span>
                <Link href={`/admin/customers/${customer.id}`}>
                  <AdminButton variant="ghost">View</AdminButton>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
