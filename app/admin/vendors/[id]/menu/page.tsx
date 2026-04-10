"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import type { BookingCategoryKey, PackageTier } from "@/store/bookingStore";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminPanel,
  AdminSelect,
  AdminTableCard,
} from "@/components/admin/AdminUi";

const TIERS: PackageTier[] = ["bronze", "silver", "gold"];

export default function VendorMenuManagerPage() {
  const params = useParams<{ id: string }>();
  const { state, updateVendor } = useAdmin();
  const vendor = useMemo(() => state.vendors.find((entry) => entry.id === params?.id) ?? null, [params?.id, state.vendors]);
  const [activeTier, setActiveTier] = useState<PackageTier>("bronze");
  const [activeCategory, setActiveCategory] = useState<BookingCategoryKey>("soupsDrinks");
  const [saving, setSaving] = useState(false);

  const current = vendor ? vendor.packages[activeTier] : null;
  const categoryTabs = useMemo(() => (current ? current.categoryRules.map((rule) => rule.categoryKey) : []), [current]);

  useEffect(() => {
    if (!categoryTabs.length) return;
    setActiveCategory(categoryTabs[0]);
  }, [activeTier, categoryTabs]);

  if (!vendor || !current) {
    return (
      <AdminShell title="Vendor not found" description="The selected vendor could not be loaded.">
        <AdminEmptyState title="Vendor record unavailable" body="Menu configuration cannot load until a valid vendor record exists." />
      </AdminShell>
    );
  }

  const updatePackage = (partial: Partial<typeof current>) => {
    updateVendor(vendor.id, {
      packages: {
        ...vendor.packages,
        [activeTier]: { ...current, ...partial },
      },
    });
  };

  const updateRule = (
    key: BookingCategoryKey,
    field: "minRequired" | "includedCount" | "maxSelectableCount",
    value: number
  ) => {
    updatePackage({
      categoryRules: current.categoryRules.map((rule) =>
        rule.categoryKey === key ? { ...rule, [field]: value } : rule
      ),
    });
  };

  const toggleMenuItem = (
    key: BookingCategoryKey,
    itemId: string,
    field: "available" | "defaultSelected" | "autoAddonCapable"
  ) => {
    updatePackage({
      menuItems: {
        ...current.menuItems,
        [key]: current.menuItems[key].map((item) =>
          item.id === itemId ? { ...item, [field]: !item[field] } : item
        ),
      },
    });
  };

  const updateMenuItem = (
    key: BookingCategoryKey,
    itemId: string,
    partial: Partial<(typeof current.menuItems)[BookingCategoryKey][number]>
  ) => {
    updatePackage({
      menuItems: {
        ...current.menuItems,
        [key]: current.menuItems[key].map((item) => (item.id === itemId ? { ...item, ...partial } : item)),
      },
    });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 220));
    setSaving(false);
  };

  const allItems = Object.values(current.menuItems).flat();

  return (
    <AdminShell
      title={`Menu Manager · ${vendor.name}`}
      description="Control package pricing, category selection rules, available dishes, and default customer menu state from one internal editor."
      actions={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save()}
            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#0F172A] px-4 text-[13px] font-bold text-white"
          >
            {saving ? "Saving..." : "Save Menu Config"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <AdminPanel eyebrow="Package Tiers" title="Select Package">
          <div className="flex flex-wrap gap-3">
            {TIERS.map((tier) => {
              const pkg = vendor.packages[tier];
              const active = tier === activeTier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setActiveTier(tier)}
                  className={`rounded-[14px] border px-4 py-3 text-left transition ${
                    active
                      ? "border-[#0F172A] bg-[#0F172A] text-white"
                      : "border-[#D9E1EC] bg-white text-[#0F172A]"
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-70">{pkg.name}</p>
                  <p className="mt-2 text-[18px] font-black tracking-[-0.03em]">₹{pkg.pricePerPlate}/plate</p>
                </button>
              );
            })}
          </div>
        </AdminPanel>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <AdminPanel eyebrow="Package Settings" title={`${current.name} Settings`}>
              <div className="grid gap-4 md:grid-cols-2">
                <AdminInput label="Package Name" value={current.name} onChange={(event) => updatePackage({ name: event.target.value })} />
                <AdminInput
                  label="Price Per Plate"
                  value={String(current.pricePerPlate)}
                  onChange={(event) => updatePackage({ pricePerPlate: Number(event.target.value) || 0 })}
                />
                <AdminInput label="Short Note" value={current.shortNote} onChange={(event) => updatePackage({ shortNote: event.target.value })} />
                <AdminInput
                  label="Customer Label"
                  value={current.customerLabel}
                  onChange={(event) => updatePackage({ customerLabel: event.target.value })}
                />
                <AdminSelect
                  label="Enabled"
                  value={current.enabled ? "yes" : "no"}
                  onChange={(event) => updatePackage({ enabled: event.target.value === "yes" })}
                >
                  <option value="yes">Enabled</option>
                  <option value="no">Disabled</option>
                </AdminSelect>
              </div>
            </AdminPanel>

            <AdminPanel
              eyebrow="Category Rules"
              title="Selection Limits"
              description="These values directly control how many items a customer can select in each category."
            >
              <div className="space-y-4">
                {current.categoryRules.map((rule) => (
                  <div key={rule.categoryKey} className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-bold text-[#0F172A]">{rule.label}</p>
                        <p className="mt-1 text-[13px] text-[#64748B]">{rule.categoryKey}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <AdminInput
                        label="Min Required"
                        value={String(rule.minRequired)}
                        onChange={(event) => updateRule(rule.categoryKey, "minRequired", Number(event.target.value) || 0)}
                      />
                      <AdminInput
                        label="Included Count"
                        value={String(rule.includedCount)}
                        onChange={(event) => updateRule(rule.categoryKey, "includedCount", Number(event.target.value) || 0)}
                      />
                      <AdminInput
                        label="Max Selectable"
                        value={String(rule.maxSelectableCount)}
                        onChange={(event) =>
                          updateRule(rule.categoryKey, "maxSelectableCount", Number(event.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminTableCard title="Menu Items" eyebrow="Per-category Availability">
              <div className="border-b border-[#E8EDF4] px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {categoryTabs.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveCategory(key)}
                      className={`rounded-[10px] px-3 py-2 text-[12px] font-bold transition ${
                        activeCategory === key
                          ? "bg-[#0F172A] text-white"
                          : "border border-[#CBD5E1] bg-white text-[#475569]"
                      }`}
                    >
                      {current.categoryRules.find((rule) => rule.categoryKey === key)?.label ?? key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                    <tr>
                      <th className="px-5 py-4">Item</th>
                      <th className="px-5 py-4">Subtitle</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Available</th>
                      <th className="px-5 py-4">Default</th>
                      <th className="px-5 py-4">Add-on</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EDF4] text-[14px] text-[#0F172A]">
                    {current.menuItems[activeCategory].map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4">
                          <input
                            value={item.name}
                            onChange={(event) => updateMenuItem(activeCategory, item.id, { name: event.target.value })}
                            className="h-10 w-full min-w-[180px] rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:border-[#64748B]"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            value={item.subtitle}
                            onChange={(event) => updateMenuItem(activeCategory, item.id, { subtitle: event.target.value })}
                            className="h-10 w-full min-w-[180px] rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#475569] outline-none focus:border-[#64748B]"
                            placeholder="Subtitle"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={item.isVeg ? "veg" : "nonveg"}
                            onChange={(event) => updateMenuItem(activeCategory, item.id, { isVeg: event.target.value === "veg" })}
                            className="h-10 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none"
                          >
                            <option value="veg">Veg</option>
                            <option value="nonveg">Non-Veg</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <TogglePill active={item.available} onClick={() => toggleMenuItem(activeCategory, item.id, "available")} label="Available" />
                        </td>
                        <td className="px-5 py-4">
                          <TogglePill active={item.defaultSelected} onClick={() => toggleMenuItem(activeCategory, item.id, "defaultSelected")} label="Default" />
                        </td>
                        <td className="px-5 py-4">
                          <TogglePill active={item.autoAddonCapable} onClick={() => toggleMenuItem(activeCategory, item.id, "autoAddonCapable")} label="Add-on" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminTableCard>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <AdminPanel eyebrow="Preview" title="Current Package Snapshot">
              <div className="space-y-3">
                <SummaryRow label="Available Items" value={String(allItems.filter((item) => item.available).length)} />
                <SummaryRow label="Default Items" value={String(allItems.filter((item) => item.defaultSelected).length)} />
                <SummaryRow label="Add-on Capable" value={String(allItems.filter((item) => item.autoAddonCapable).length)} />
                <SummaryRow
                  label="Active Category"
                  value={current.categoryRules.find((rule) => rule.categoryKey === activeCategory)?.label ?? activeCategory}
                />
              </div>
            </AdminPanel>

            <AdminPanel eyebrow="Pricing" title="Auto Add-on Pricing">
              <div className="space-y-4">
                <AdminInput
                  label="Veg per item / pax"
                  value={String(current.autoAddonPricing.vegPerItemPerPax)}
                  onChange={(event) =>
                    updatePackage({
                      autoAddonPricing: {
                        ...current.autoAddonPricing,
                        vegPerItemPerPax: Number(event.target.value) || 0,
                      },
                    })
                  }
                />
                <AdminInput
                  label="Non-Veg per item / pax"
                  value={String(current.autoAddonPricing.nonVegPerItemPerPax)}
                  onChange={(event) =>
                    updatePackage({
                      autoAddonPricing: {
                        ...current.autoAddonPricing,
                        nonVegPerItemPerPax: Number(event.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </AdminPanel>

            <AdminPanel eyebrow="Actions" title="Save Config">
              <p className="text-[14px] leading-[1.7] text-[#5B6574]">
                Menu availability and category rules should stay aligned with the customer customize step.
              </p>
              <div className="mt-4">
                <AdminButton onClick={() => void save()}>{saving ? "Saving..." : "Save Menu Config"}</AdminButton>
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function TogglePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center rounded-[10px] px-3 text-[12px] font-bold transition ${
        active ? "bg-[#0F172A] text-white" : "border border-[#CBD5E1] bg-white text-[#475569]"
      }`}
    >
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px]">
      <span className="font-medium text-[#64748B]">{label}</span>
      <span className="font-semibold text-[#0F172A]">{value}</span>
    </div>
  );
}
