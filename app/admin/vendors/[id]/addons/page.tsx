"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminPanel,
  AdminSelect,
  AdminTableCard,
} from "@/components/admin/AdminUi";

export default function VendorAddonsPage() {
  const params = useParams<{ id: string }>();
  const { state, updateVendor } = useAdmin();
  const vendor = useMemo(() => state.vendors.find((entry) => entry.id === params?.id) ?? null, [params?.id, state.vendors]);
  const [saving, setSaving] = useState(false);

  if (!vendor) {
    return (
      <AdminShell title="Vendor not found" description="The selected vendor could not be loaded.">
        <AdminEmptyState title="Vendor record unavailable" body="Add-on and water configuration cannot load for this vendor." />
      </AdminShell>
    );
  }

  const save = async () => {
    if (saving) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 220));
    setSaving(false);
  };

  return (
    <AdminShell
      title={`Add-ons & Water · ${vendor.name}`}
      description="Configure optional add-ons and water settings exactly as they should appear in booking customization."
      actions={
        <button
          type="button"
          onClick={() => void save()}
          className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white"
        >
          {saving ? "Saving..." : "Save Add-on Config"}
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <AdminTableCard title="Optional Add-ons" eyebrow="Customer-facing Extras">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  <tr>
                    <th className="px-5 py-4">Add-on</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Price / Pax</th>
                    <th className="px-5 py-4">Sort</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF4] text-[14px] text-[#0F172A]">
                  {vendor.addons.map((addon) => (
                    <tr key={addon.id}>
                      <td className="px-5 py-4">
                        <div className="min-w-[180px]">
                          <p className="font-semibold">{addon.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={addon.isVeg ? "veg" : "nonveg"}
                          onChange={(event) =>
                            updateVendor(vendor.id, {
                              addons: vendor.addons.map((entry) =>
                                entry.id === addon.id ? { ...entry, isVeg: event.target.value === "veg" } : entry
                              ),
                            })
                          }
                          className="h-10 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold text-[#0F172A]"
                        >
                          <option value="veg">Veg</option>
                          <option value="nonveg">Non-Veg</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          value={String(addon.pricePerPax)}
                          onChange={(event) =>
                            updateVendor(vendor.id, {
                              addons: vendor.addons.map((entry) =>
                                entry.id === addon.id ? { ...entry, pricePerPax: Number(event.target.value) || 0 } : entry
                              ),
                            })
                          }
                          className="h-10 w-[120px] rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#64748B]"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <input
                          value={String(addon.sortOrder)}
                          onChange={(event) =>
                            updateVendor(vendor.id, {
                              addons: vendor.addons.map((entry) =>
                                entry.id === addon.id ? { ...entry, sortOrder: Number(event.target.value) || 0 } : entry
                              ),
                            })
                          }
                          className="h-10 w-[90px] rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#64748B]"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            updateVendor(vendor.id, {
                              addons: vendor.addons.map((entry) =>
                                entry.id === addon.id ? { ...entry, enabled: !entry.enabled } : entry
                              ),
                            })
                          }
                          className={`inline-flex h-9 items-center justify-center rounded-[10px] px-3 text-[12px] font-bold transition ${
                            addon.enabled ? "bg-[#0F172A] text-white" : "border border-[#CBD5E1] bg-white text-[#475569]"
                          }`}
                        >
                          {addon.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableCard>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <AdminPanel eyebrow="Water" title="Water Configuration">
            <div className="space-y-4">
              <AdminSelect
                label="Water Mode"
                value={vendor.water.mode}
                onChange={(event) =>
                  updateVendor(vendor.id, {
                    water: { ...vendor.water, mode: event.target.value as typeof vendor.water.mode },
                  })
                }
              >
                <option value="ro">RO</option>
                <option value="packaged">Packaged</option>
                <option value="both">Both</option>
              </AdminSelect>
              <AdminInput
                label="RO Price / Pax"
                value={String(vendor.water.roPricePerPax)}
                onChange={(event) =>
                  updateVendor(vendor.id, {
                    water: { ...vendor.water, roPricePerPax: Number(event.target.value) || 0 },
                  })
                }
              />
              <AdminInput
                label="Packaged Price / Pax"
                value={String(vendor.water.packagedPricePerPax)}
                onChange={(event) =>
                  updateVendor(vendor.id, {
                    water: { ...vendor.water, packagedPricePerPax: Number(event.target.value) || 0 },
                  })
                }
              />
              <AdminSelect
                label="Default Selection"
                value={vendor.water.defaultSelection}
                onChange={(event) =>
                  updateVendor(vendor.id, {
                    water: { ...vendor.water, defaultSelection: event.target.value as typeof vendor.water.defaultSelection },
                  })
                }
              >
                <option value="ro">RO</option>
                <option value="packaged">Packaged</option>
              </AdminSelect>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Preview" title="Customer Display">
            <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Water Mode</p>
              <p className="mt-2 text-[15px] font-semibold text-[#0F172A]">
                {vendor.water.mode === "both"
                  ? "RO + Packaged"
                  : vendor.water.mode === "ro"
                    ? "RO Water"
                    : "Packaged Bottles"}
              </p>
              <p className="mt-2 text-[13px] text-[#64748B]">
                Default: {vendor.water.defaultSelection === "ro" ? "RO" : "Packaged"}
              </p>
            </div>

            <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Enabled Add-ons</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {vendor.addons.filter((addon) => addon.enabled).map((addon) => (
                  <span
                    key={addon.id}
                    className="inline-flex rounded-full border border-[#D9E1EC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#334155]"
                  >
                    {addon.name} · ₹{addon.pricePerPax}/pax
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <AdminButton onClick={() => void save()}>{saving ? "Saving..." : "Save Add-on Config"}</AdminButton>
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
