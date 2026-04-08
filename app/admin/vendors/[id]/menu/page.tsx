"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import type { BookingCategoryKey, PackageTier } from "@/store/bookingStore";

const TIERS: PackageTier[] = ["bronze", "silver", "gold"];

export default function VendorMenuManagerPage() {
  const params = useParams<{ id: string }>();
  const { state, updateVendor } = useAdmin();
  const vendor = useMemo(() => state.vendors.find((entry) => entry.id === params?.id) ?? null, [params?.id, state.vendors]);
  const [activeTier, setActiveTier] = useState<PackageTier>("bronze");
  const [activeCategory, setActiveCategory] = useState<BookingCategoryKey>("soupsDrinks");
  const [saving, setSaving] = useState(false);

  const current = vendor ? vendor.packages[activeTier] : null;
  const categoryTabs = useMemo(
    () => (current ? current.categoryRules.map((rule) => rule.categoryKey) : []),
    [current]
  );

  useEffect(() => {
    if (!categoryTabs.length) return;
    setActiveCategory(categoryTabs[0]);
  }, [activeTier, categoryTabs]);

  if (!vendor || !current) {
    return (
      <AdminShell title="Vendor not found" description="The selected vendor could not be loaded.">
        <div className="rounded-[24px] border border-[#E6E6E6] bg-white px-6 py-14 text-center shadow-[0_12px_26px_rgba(0,0,0,0.06)]">
          Vendor record unavailable.
        </div>
      </AdminShell>
    );
  }

  const updateRule = (key: BookingCategoryKey, field: "minRequired" | "includedCount" | "maxSelectableCount", value: number) => {
    const nextPackages = {
      ...vendor.packages,
      [activeTier]: {
        ...current,
        categoryRules: current.categoryRules.map((rule) =>
          rule.categoryKey === key ? { ...rule, [field]: value } : rule
        ),
      },
    };
    updateVendor(vendor.id, { packages: nextPackages });
  };

  const toggleMenuItem = (key: BookingCategoryKey, itemId: string, field: "available" | "defaultSelected" | "autoAddonCapable") => {
    const nextPackages = {
      ...vendor.packages,
      [activeTier]: {
        ...current,
        menuItems: {
          ...current.menuItems,
          [key]: current.menuItems[key].map((item) => (item.id === itemId ? { ...item, [field]: !item[field] } : item)),
        },
      },
    };
    updateVendor(vendor.id, { packages: nextPackages });
  };

  const updateMenuItem = (key: BookingCategoryKey, itemId: string, partial: Partial<typeof current.menuItems[BookingCategoryKey][number]>) => {
    const nextPackages = {
      ...vendor.packages,
      [activeTier]: {
        ...current,
        menuItems: {
          ...current.menuItems,
          [key]: current.menuItems[key].map((item) => (item.id === itemId ? { ...item, ...partial } : item)),
        },
      },
    };
    updateVendor(vendor.id, { packages: nextPackages });
  };

  const save = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setSaving(false);
  };

  return (
    <AdminShell
      title={`Menu Manager · ${vendor.name}`}
      description="Configure package pricing, category locking rules, item availability, default menu state, and auto add-on pricing exactly as the customer menu builder needs it."
      actions={
        <button
          type="button"
          onClick={() => void save()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-[13px] font-bold text-white"
        >
          {saving ? "Saving..." : "Save Menu Config"}
        </button>
      }
    >
      <section className="rounded-[24px] border border-[#E6E6E6] bg-white p-6 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap gap-3">
          {TIERS.map((tier) => {
            const item = vendor.packages[tier];
            const active = tier === activeTier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(tier)}
                className={`rounded-full px-5 py-3 text-[13px] font-bold transition ${
                  active ? "bg-[#111111] text-white" : "border border-[#E6E6E6] bg-white text-[#111111]"
                }`}
              >
                {item.name} · ₹{item.pricePerPlate}/plate
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel title="Package Settings">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Package Name"
                value={current.name}
                onChange={(value) =>
                  updateVendor(vendor.id, {
                    packages: {
                      ...vendor.packages,
                      [activeTier]: { ...current, name: value },
                    },
                  })
                }
              />
              <Field
                label="Price Per Plate"
                value={String(current.pricePerPlate)}
                onChange={(value) =>
                  updateVendor(vendor.id, {
                    packages: {
                      ...vendor.packages,
                      [activeTier]: { ...current, pricePerPlate: Number(value) || 0 },
                    },
                  })
                }
              />
              <Field
                label="Short Note"
                value={current.shortNote}
                onChange={(value) =>
                  updateVendor(vendor.id, {
                    packages: {
                      ...vendor.packages,
                      [activeTier]: { ...current, shortNote: value },
                    },
                  })
                }
              />
              <Field
                label="Customer Label"
                value={current.customerLabel}
                onChange={(value) =>
                  updateVendor(vendor.id, {
                    packages: {
                      ...vendor.packages,
                      [activeTier]: { ...current, customerLabel: value },
                    },
                  })
                }
              />
            </div>
          </Panel>

          <Panel title="Category Locking Rules">
            <div className="space-y-4">
              {current.categoryRules.map((rule) => (
                <div key={rule.categoryKey} className="rounded-[24px] border border-[#ECE2D6] bg-[#FCFAF7] p-4">
                  <p className="text-[16px] font-black text-[#171511]">{rule.label}</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-3">
                    <Field label="Min Required" value={String(rule.minRequired)} onChange={(value) => updateRule(rule.categoryKey, "minRequired", Number(value) || 0)} />
                    <Field label="Included Count" value={String(rule.includedCount)} onChange={(value) => updateRule(rule.categoryKey, "includedCount", Number(value) || 0)} />
                    <Field label="Max Selectable" value={String(rule.maxSelectableCount)} onChange={(value) => updateRule(rule.categoryKey, "maxSelectableCount", Number(value) || 0)} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Menu Items">
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold ${
                    activeCategory === key ? "bg-[#111111] text-white" : "border border-[#E6E6E6] bg-white text-[#111111]"
                  }`}
                >
                  {current.categoryRules.find((rule) => rule.categoryKey === key)?.label ?? key}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {current.menuItems[activeCategory].map((item) => (
                <div key={item.id} className="grid gap-3 rounded-[18px] border border-[#E6E6E6] bg-[#F9F9F9] px-4 py-4 md:grid-cols-[minmax(0,1fr)_repeat(3,120px)] md:items-center">
                  <div className="space-y-2">
                    <input
                      value={item.name}
                      onChange={(event) => updateMenuItem(activeCategory, item.id, { name: event.target.value })}
                      className="h-10 w-full rounded-[12px] border border-[#E1E1E1] bg-white px-3 text-[14px] font-semibold text-[#111111]"
                    />
                    <input
                      value={item.subtitle}
                      onChange={(event) => updateMenuItem(activeCategory, item.id, { subtitle: event.target.value })}
                      className="h-9 w-full rounded-[12px] border border-[#E1E1E1] bg-white px-3 text-[12px] text-[#555555]"
                      placeholder="Subtitle"
                    />
                  </div>

                  <select
                    value={item.isVeg ? "veg" : "nonveg"}
                    onChange={(event) => updateMenuItem(activeCategory, item.id, { isVeg: event.target.value === "veg" })}
                    className="h-10 rounded-[12px] border border-[#E1E1E1] bg-white px-3 text-[12px] font-semibold text-[#111111]"
                  >
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                  </select>

                  {[
                    ["available", "Available"],
                    ["defaultSelected", "Default"],
                    ["autoAddonCapable", "Add-on"],
                  ].map(([field, label]) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleMenuItem(activeCategory, item.id, field as "available" | "defaultSelected" | "autoAddonCapable")}
                      className={`inline-flex h-10 items-center justify-center rounded-full text-[12px] font-bold ${
                        item[field as "available" | "defaultSelected" | "autoAddonCapable"]
                          ? "bg-[#111111] text-white"
                          : "border border-[#E1E1E1] bg-white text-[#111111]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Panel title="Auto Add-on Pricing">
            <div className="space-y-4">
              <Field
                label="Veg per item / pax"
                value={String(current.autoAddonPricing.vegPerItemPerPax)}
                onChange={(value) =>
                  updateVendor(vendor.id, {
                    packages: {
                      ...vendor.packages,
                      [activeTier]: {
                        ...current,
                        autoAddonPricing: {
                          ...current.autoAddonPricing,
                          vegPerItemPerPax: Number(value) || 0,
                        },
                      },
                    },
                  })
                }
              />
              <Field
                label="Non-Veg per item / pax"
                value={String(current.autoAddonPricing.nonVegPerItemPerPax)}
                onChange={(value) =>
                  updateVendor(vendor.id, {
                    packages: {
                      ...vendor.packages,
                      [activeTier]: {
                        ...current,
                        autoAddonPricing: {
                          ...current.autoAddonPricing,
                          nonVegPerItemPerPax: Number(value) || 0,
                        },
                      },
                    },
                  })
                }
              />
            </div>
          </Panel>

          <Panel title="Preview Summary">
            <div className="space-y-3 text-[14px] text-[#555555]">
              <PreviewRow label="Items available" value={String(Object.values(current.menuItems).flat().filter((item) => item.available).length)} />
              <PreviewRow label="Default selected" value={String(Object.values(current.menuItems).flat().filter((item) => item.defaultSelected).length)} />
              <PreviewRow label="Add-on capable" value={String(Object.values(current.menuItems).flat().filter((item) => item.autoAddonCapable).length)} />
            </div>
          </Panel>
        </aside>
      </div>
    </AdminShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[24px] border border-[#E6E6E6] bg-white p-6 shadow-[0_12px_26px_rgba(0,0,0,0.06)]">
      <h2 className="text-[22px] font-black tracking-[-0.04em] text-[#111111]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#111111]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-[14px] border border-[#E6E6E6] bg-white px-4 text-[14px] font-medium text-[#111111] outline-none focus:border-[#111111]"
      />
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-[#E6E6E6] bg-[#F9F9F9] px-4 py-3">
      <span className="font-semibold text-[#5A5A5A]">{label}</span>
      <span className="font-black text-[#111111]">{value}</span>
    </div>
  );
}
