"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function VendorAddonsPage() {
  const params = useParams<{ id: string }>();
  const { state, updateVendor } = useAdmin();
  const vendor = useMemo(() => state.vendors.find((entry) => entry.id === params?.id) ?? null, [params?.id, state.vendors]);

  if (!vendor) {
    return (
      <AdminShell title="Vendor not found" description="The selected vendor could not be loaded.">
        <div className="rounded-[30px] border border-[#E7DED2] bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(24,20,16,0.05)]">
          Vendor record unavailable.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`Add-ons & Water · ${vendor.name}`}
      description="Configure optional add-ons, water rules, and customer display preview exactly as they should appear in the booking flow."
      actions={
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white"
        >
          Save Add-on Config
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">Optional Add-ons</h2>
          <div className="mt-5 space-y-4">
            {vendor.addons.map((addon) => (
              <div key={addon.id} className="grid gap-4 rounded-[24px] border border-[#ECE2D6] bg-[#FCFAF7] p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_120px] md:items-center">
                <div>
                  <p className="text-[16px] font-black text-[#171511]">{addon.name}</p>
                  <p className="mt-1 text-[13px] text-[#70655A]">{addon.isVeg ? "Veg" : "Non-Veg"} · ₹{addon.pricePerPax}/pax</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateVendor(vendor.id, {
                      addons: vendor.addons.map((entry) =>
                        entry.id === addon.id ? { ...entry, enabled: !entry.enabled } : entry
                      ),
                    })
                  }
                  className={`rounded-full px-4 py-3 text-[12px] font-bold ${addon.enabled ? "bg-[#1E1C19] text-white" : "border border-[#E6D9CB] bg-white text-[#4B4138]"}`}
                >
                  {addon.enabled ? "Enabled" : "Disabled"}
                </button>
                <input
                  value={String(addon.pricePerPax)}
                  onChange={(event) =>
                    updateVendor(vendor.id, {
                      addons: vendor.addons.map((entry) =>
                        entry.id === addon.id ? { ...entry, pricePerPax: Number(event.target.value) || 0 } : entry
                      ),
                    })
                  }
                  className="h-11 rounded-[18px] border border-[#E8DDD0] bg-white px-4 text-[14px] font-medium text-[#1A1815] outline-none"
                />
                <input
                  value={String(addon.sortOrder)}
                  onChange={(event) =>
                    updateVendor(vendor.id, {
                      addons: vendor.addons.map((entry) =>
                        entry.id === addon.id ? { ...entry, sortOrder: Number(event.target.value) || 0 } : entry
                      ),
                    })
                  }
                  className="h-11 rounded-[18px] border border-[#E8DDD0] bg-white px-4 text-[14px] font-medium text-[#1A1815] outline-none"
                />
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
            <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">Water Config</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">Water Mode</span>
                <select
                  value={vendor.water.mode}
                  onChange={(event) => updateVendor(vendor.id, { water: { ...vendor.water, mode: event.target.value as typeof vendor.water.mode } })}
                  className="h-12 w-full rounded-[20px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 text-[14px] font-medium text-[#1A1815] outline-none"
                >
                  <option value="ro">RO</option>
                  <option value="packaged">Packaged</option>
                  <option value="both">Both</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">RO Price / pax</span>
                <input
                  value={String(vendor.water.roPricePerPax)}
                  onChange={(event) => updateVendor(vendor.id, { water: { ...vendor.water, roPricePerPax: Number(event.target.value) || 0 } })}
                  className="h-12 w-full rounded-[20px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 text-[14px] font-medium text-[#1A1815] outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">Packaged Price / pax</span>
                <input
                  value={String(vendor.water.packagedPricePerPax)}
                  onChange={(event) => updateVendor(vendor.id, { water: { ...vendor.water, packagedPricePerPax: Number(event.target.value) || 0 } })}
                  className="h-12 w-full rounded-[20px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 text-[14px] font-medium text-[#1A1815] outline-none"
                />
              </label>
            </div>
          </article>

          <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
            <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">Customer Display Preview</h2>
            <div className="mt-5 rounded-[24px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-4">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">Water</p>
              <p className="mt-2 text-[15px] font-semibold text-[#171511]">
                {vendor.water.mode === "both" ? "RO + Packaged" : vendor.water.mode === "ro" ? "RO Water" : "Packaged Bottles"}
              </p>
              <p className="mt-4 text-[13px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">Enabled Add-ons</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {vendor.addons.filter((addon) => addon.enabled).map((addon) => (
                  <span key={addon.id} className="inline-flex rounded-full border border-[#E2D8CC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3F352D]">
                    {addon.name} · ₹{addon.pricePerPax}/pax
                  </span>
                ))}
              </div>
            </div>
          </article>
        </aside>
      </div>
    </AdminShell>
  );
}
