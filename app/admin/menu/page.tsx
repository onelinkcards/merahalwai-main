"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  AdminButton,
  AdminInput,
  AdminPanel,
  AdminTableCard,
} from "@/components/admin/AdminUi";
import type { BookingCategoryKey, PackageTier } from "@/store/bookingStore";

const TIERS: PackageTier[] = ["bronze", "silver", "gold"];
const CATEGORY_ORDER: Array<{ key: BookingCategoryKey; label: string }> = [
  { key: "soupsDrinks", label: "Soups / Drinks" },
  { key: "starters", label: "Starters" },
  { key: "mainCourse", label: "Main Course" },
  { key: "riceBreads", label: "Rice & Breads" },
  { key: "desserts", label: "Desserts" },
];

export default function AdminPlatformMenuPage() {
  const { state, saveSettings } = useAdmin();
  const [saving, setSaving] = useState(false);

  const platformMenu = state.settings.platformMenu;
  const optionalAddOns = useMemo(
    () => platformMenu.optionalAddOns.length ? platformMenu.optionalAddOns : state.vendors[0]?.addons ?? [],
    [platformMenu.optionalAddOns, state.vendors]
  );

  const updateRequiredCount = (tier: PackageTier, categoryKey: BookingCategoryKey, value: number) => {
    saveSettings({
      platformMenu: {
        ...platformMenu,
        categoryRequiredCounts: {
          ...platformMenu.categoryRequiredCounts,
          [tier]: {
            ...platformMenu.categoryRequiredCounts[tier],
            [categoryKey]: value,
          },
        },
      },
    });
  };

  const updateAddonPrice = (addonId: string, value: number) => {
    saveSettings({
      platformMenu: {
        ...platformMenu,
        optionalAddOns: optionalAddOns.map((addon) =>
          addon.id === addonId ? { ...addon, pricePerPax: value } : addon
        ),
      },
    });
  };

  const updateWaterPrice = (key: string, value: number) => {
    saveSettings({
      platformMenu: {
        ...platformMenu,
        water: {
          ...platformMenu.water,
          packagedBottlePrices: {
            ...platformMenu.water.packagedBottlePrices,
            [key]: value,
          },
        },
      },
    });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setSaving(false);
  };

  return (
    <AdminShell
      title="Platform Menu"
      description="Manage shared category counts, optional add-ons, and water pricing."
      actions={<AdminButton onClick={() => void save()}>{saving ? "Saving..." : "Save Platform Menu"}</AdminButton>}
    >
      <div className="space-y-6">
        <AdminPanel
          eyebrow="Category Logic"
          title="Required Item Count per Package"
          description="Set only the required item count for each category."
        >
          <div className="space-y-5">
            {TIERS.map((tier) => (
              <div key={tier} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[15px] font-bold text-[#0F172A]">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Package
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {CATEGORY_ORDER.map((category) => (
                    <AdminInput
                      key={`${tier}-${category.key}`}
                      label={category.label}
                      value={String(platformMenu.categoryRequiredCounts[tier][category.key])}
                      onChange={(event) =>
                        updateRequiredCount(tier, category.key, Number(event.target.value) || 0)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <AdminTableCard title="Optional Add-ons Pricing" eyebrow="Customer-facing Extras">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  <tr>
                    <th className="px-5 py-4">Add-on</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Price / Pax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF4] text-[14px] text-[#0F172A]">
                  {optionalAddOns.map((addon) => (
                    <tr key={addon.id}>
                      <td className="px-5 py-4 font-semibold">{addon.name}</td>
                      <td className="px-5 py-4">{addon.isVeg ? "Veg" : "Non-Veg"}</td>
                      <td className="px-5 py-4">
                        <input
                          value={String(addon.pricePerPax)}
                          onChange={(event) => updateAddonPrice(addon.id, Number(event.target.value) || 0)}
                          className="h-10 w-[140px] rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#2563EB]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminTableCard>

          <AdminPanel
            eyebrow="Water Pricing"
            title="RO + Packaged Bottles"
            description="RO is free. Set packaged bottle pricing here."
          >
            <div className="space-y-4">
              <AdminInput
                label="RO Water Price / Pax"
                value={String(platformMenu.water.roPricePerPax)}
                onChange={(event) =>
                  saveSettings({
                    platformMenu: {
                      ...platformMenu,
                      water: {
                        ...platformMenu.water,
                        roPricePerPax: Number(event.target.value) || 0,
                      },
                    },
                  })
                }
              />
              {Object.entries(platformMenu.water.packagedBottlePrices).map(([key, value]) => (
                <AdminInput
                  key={key}
                  label={`${key} Bottle Price / Pax`}
                  value={String(value)}
                  onChange={(event) => updateWaterPrice(key, Number(event.target.value) || 0)}
                />
              ))}
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
