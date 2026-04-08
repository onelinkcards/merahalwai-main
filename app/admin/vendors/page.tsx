"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminVendorsPage() {
  const { state } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [menuType, setMenuType] = useState<"all" | "veg_only" | "veg_and_non_veg">("all");

  const vendors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.vendors.filter((vendor) => {
      if (status !== "all" && vendor.status !== status) return false;
      if (menuType !== "all" && vendor.menuType !== menuType) return false;
      if (!normalized) return true;
      return [vendor.name, vendor.locality, vendor.city].join(" ").toLowerCase().includes(normalized);
    });
  }, [menuType, query, state.vendors, status]);

  return (
    <AdminShell
      title="Vendors"
      description="Manage caterer onboarding, operational status, package configuration, menu rules, add-ons, and vendor order history."
      actions={
        <Link
          href="/admin/vendors/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#2F6FED] px-5 text-[12px] font-bold text-white"
        >
          Add New Vendor
        </Link>
      }
    >
      <section className="rounded-[24px] border border-[#E3E8F0] bg-white p-5 shadow-[0_12px_26px_rgba(0,0,0,0.06)]">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block md:col-span-1">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#2F6FED]">Search</span>
            <div className="flex h-11 items-center gap-3 rounded-[14px] border border-[#E3E8F0] bg-white px-4">
              <Search className="h-4 w-4 text-[#7B8694]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-[14px] font-medium text-[#1C2430] outline-none"
                placeholder="Vendor name or locality"
              />
            </div>
          </label>
          <FilterSelect label="Status" value={status} onChange={(value) => setStatus(value as "all" | "active" | "inactive")}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>
          <FilterSelect label="Menu Type" value={menuType} onChange={(value) => setMenuType(value as "all" | "veg_only" | "veg_and_non_veg")}>
            <option value="all">All</option>
            <option value="veg_only">Veg Only</option>
            <option value="veg_and_non_veg">Veg + Non-Veg</option>
          </FilterSelect>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="rounded-[18px] border border-[#E3E8F0] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <p className="text-[16px] font-bold text-[#1C2430]">{vendor.name}</p>
                <p className="text-[12px] text-[#6B7480]">{vendor.locality}, {vendor.city}</p>
              </div>
              <div className="min-w-[200px] text-[12px] text-[#6B7480]">
                Menu: {vendor.menuType === "veg_only" ? "Veg Only" : "Veg + Non-Veg"}
              </div>
              <div className="min-w-[160px] text-[12px] text-[#6B7480]">
                Packages: {Object.values(vendor.packages).filter((pkg) => pkg.enabled).length}
              </div>
              <div className="min-w-[120px]">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${vendor.status === "active" ? "bg-[#E6F7ED] text-[#1F7A3F]" : "bg-[#FFF1F1] text-[#B54545]"}`}>
                  {vendor.status}
                </span>
              </div>
              <div className="min-w-[140px] text-[12px] text-[#6B7480]">
                Rating {vendor.displayedRating.toFixed(1)}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/vendors/${vendor.id}/edit`} className="rounded-full border border-[#D7E3F4] px-3 py-2 text-[12px] font-bold text-[#2F6FED]">
                  Edit
                </Link>
                <Link href={`/admin/vendors/${vendor.id}/menu`} className="rounded-full border border-[#D7E3F4] px-3 py-2 text-[12px] font-bold text-[#2F6FED]">
                  Menu
                </Link>
                <Link href={`/admin/vendors/${vendor.id}/addons`} className="rounded-full border border-[#D7E3F4] px-3 py-2 text-[12px] font-bold text-[#2F6FED]">
                  Add-ons
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}

function FilterSelect({
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
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#2F6FED]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[14px] border border-[#E3E8F0] bg-white px-4 text-[14px] font-medium text-[#1C2430] outline-none"
      >
        {children}
      </select>
    </label>
  );
}
