"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminButton, AdminPanel, AdminSelect } from "@/components/admin/AdminUi";
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
      description="Operational vendor list for onboarding, activation, package setup, menu configuration, and add-on control."
      actions={
        <Link href="/admin/vendors/new">
          <AdminButton>Add New Vendor</AdminButton>
        </Link>
      }
    >
      <AdminPanel title="Vendor filters" eyebrow="Search & Segment">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block md:col-span-1">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Search</span>
            <div className="flex h-11 items-center gap-3 rounded-[12px] border border-[#CBD5E1] bg-white px-4">
              <Search className="h-4 w-4 text-[#64748B]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-[14px] font-medium text-[#0F172A] outline-none"
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
      </AdminPanel>

      <div className="mt-6 space-y-4">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="rounded-[22px] border border-[#D9E1EC] bg-white px-5 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_180px_120px_120px_260px] xl:items-center">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-[#0F172A]">{vendor.name}</p>
                <p className="mt-1 text-[13px] text-[#64748B]">{vendor.locality}, {vendor.city}</p>
                <p className="mt-2 text-[12px] text-[#64748B]">
                  {vendor.menuType === "veg_only" ? "Veg Only" : "Veg + Non-Veg"} · {Object.values(vendor.packages).filter((pkg) => pkg.enabled).length} packages
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Status</p>
                <span className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${vendor.status === "active" ? "border-[#B7E4C7] bg-[#ECFDF3] text-[#166534]" : "border-[#D7DEE8] bg-[#F8FAFC] text-[#475569]"}`}>
                  {vendor.status}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Rating</p>
                <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{vendor.displayedRating.toFixed(1)}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">Orders</p>
                <p className="mt-2 text-[16px] font-bold text-[#0F172A]">{vendor.totalOrders}</p>
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Link href={`/admin/vendors/${vendor.id}/edit`}><AdminButton variant="secondary">Edit</AdminButton></Link>
                <Link href={`/admin/vendors/${vendor.id}/menu`}><AdminButton variant="secondary">Menu</AdminButton></Link>
                <Link href={`/admin/vendors/${vendor.id}/addons`}><AdminButton variant="secondary">Add-ons</AdminButton></Link>
              </div>
            </div>
          </div>
        ))}
      </div>
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
    <AdminSelect label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </AdminSelect>
  );
}
