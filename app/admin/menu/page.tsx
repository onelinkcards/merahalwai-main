"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { MASTER_MENU, MASTER_MENU_ADDON_GROUPS } from "@/data/vendors";
import { AdminButton, AdminInput, AdminPanel } from "@/components/admin/AdminUi";
import type { BookingCategoryKey, PackageTier } from "@/store/bookingStore";

const TIERS: PackageTier[] = ["bronze", "silver", "gold"];

type EditableCategory = {
  key: BookingCategoryKey;
  label: string;
  position: number;
  items: Array<{ name: string; isVeg: boolean }>;
};

type EditableAddonGroup = {
  key: string;
  title: string;
  items: string[];
};

const DEFAULT_MENU_CATEGORIES: EditableCategory[] = MASTER_MENU.map((category, index) => ({
  key: ({
    Soups: "soups",
    "Veg Starters": "vegStarters",
    "Non-Veg Starters": "nonVegStarters",
    "Veg Main Course": "vegMainCourse",
    "Non-Veg Main Course": "nonVegMainCourse",
    "Dal / Kadhi / Legumes": "dalKadhiLegumes",
    "Rice / Biryani": "riceBiryani",
    "Indian Breads": "indianBreads",
    Accompaniments: "accompaniments",
    Desserts: "desserts",
  } as Record<string, BookingCategoryKey>)[category.name],
  label: category.name,
  position: index + 1,
  items: category.items.map((item) => ({ name: item.name, isVeg: item.isVeg })),
}));

const DEFAULT_ADDON_GROUPS: EditableAddonGroup[] = MASTER_MENU_ADDON_GROUPS.map((group) => ({
  key: group.key,
  title: group.title,
  items: [...group.items],
}));

const OPTIONAL_ADDON_NAMES = [
  "Soft Drink",
  "Buttermilk / Chaas",
  "Sweet Lassi",
  "Salted Lassi",
  "Mocktail",
  "Ice Cream",
  "Falooda",
  "Kulfi Counter",
  "Extra Raita",
  "Extra Papad",
  "Chaat Counter",
  "Live Counter",
  "Tea / Coffee Counter",
] as const;

function buildDefaultOptionalAddonPricing(existing: Array<{
  id: string;
  name: string;
  isVeg: boolean;
  enabled: boolean;
  pricePerPax: number;
}> = []) {
  const priceMap = new Map(existing.map((item) => [item.name, item]));
  return OPTIONAL_ADDON_NAMES.map((name, index) => {
    const matched = priceMap.get(name);
    return {
      id: matched?.id ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      isVeg: matched?.isVeg ?? true,
      enabled: matched?.enabled ?? true,
      pricePerPax: matched?.pricePerPax ?? 0,
      sortOrder: index + 1,
    };
  });
}

export default function AdminPlatformMenuPage() {
  const { state, saveSettings } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [newItems, setNewItems] = useState<Record<BookingCategoryKey, string>>({} as Record<BookingCategoryKey, string>);

  const platformMenu = state.settings.platformMenu;

  const [menuCategories, setMenuCategories] = useState<EditableCategory[]>(
    platformMenu.menuCategories?.length ? platformMenu.menuCategories : DEFAULT_MENU_CATEGORIES
  );
  const [addonGroups, setAddonGroups] = useState<EditableAddonGroup[]>(
    platformMenu.optionalAddOnGroups?.length ? platformMenu.optionalAddOnGroups : DEFAULT_ADDON_GROUPS
  );
  const [addOnPricing, setAddOnPricing] = useState(
    platformMenu.optionalAddOns.length
      ? buildDefaultOptionalAddonPricing(platformMenu.optionalAddOns)
      : buildDefaultOptionalAddonPricing(state.vendors[0]?.addons ?? [])
  );

  useEffect(() => {
    setMenuCategories(platformMenu.menuCategories?.length ? platformMenu.menuCategories : DEFAULT_MENU_CATEGORIES);
    setAddonGroups(platformMenu.optionalAddOnGroups?.length ? platformMenu.optionalAddOnGroups : DEFAULT_ADDON_GROUPS);
    setAddOnPricing(
      platformMenu.optionalAddOns.length
        ? buildDefaultOptionalAddonPricing(platformMenu.optionalAddOns)
        : buildDefaultOptionalAddonPricing(state.vendors[0]?.addons ?? [])
    );
  }, [platformMenu, state.vendors]);

  const sortedCategories = useMemo(
    () => [...menuCategories].sort((left, right) => left.position - right.position),
    [menuCategories]
  );

  const updateCategory = (key: BookingCategoryKey, partial: Partial<EditableCategory>) => {
    setMenuCategories((current) =>
      current.map((category) => (category.key === key ? { ...category, ...partial } : category))
    );
  };

  const updateRequiredCount = (tier: PackageTier, categoryKey: BookingCategoryKey, value: number) => {
    saveSettings({
      platformMenu: {
        ...platformMenu,
        menuCategories,
        optionalAddOnGroups: addonGroups,
        optionalAddOns: addOnPricing,
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

  const addCategoryItem = (key: BookingCategoryKey) => {
    const raw = (newItems[key] ?? "").trim();
    if (!raw) return;
    const normalized = raw.toLowerCase();
    const isVeg = !(normalized.endsWith(" [non-veg]") || normalized.endsWith(" [nonveg]"));
    const nextItem = {
      name: raw.replace(/\s+\[(non-veg|nonveg|veg)\]$/i, "").trim(),
      isVeg,
    };
    updateCategory(key, {
      items: [...(menuCategories.find((category) => category.key === key)?.items ?? []), nextItem],
    });
    setNewItems((current) => ({ ...current, [key]: "" }));
  };

  const removeCategoryItem = (key: BookingCategoryKey, itemName: string) => {
    updateCategory(key, {
      items: (menuCategories.find((category) => category.key === key)?.items ?? []).filter(
        (item) => item.name !== itemName
      ),
    });
  };

  const updateAddonPrice = (addonId: string, value: number) => {
    setAddOnPricing((current) =>
      current.map((addon) => (addon.id === addonId ? { ...addon, pricePerPax: value } : addon))
    );
  };

  const updateAddonGroup = (groupKey: string, partial: Partial<EditableAddonGroup>) => {
    setAddonGroups((current) =>
      current.map((group) => (group.key === groupKey ? { ...group, ...partial } : group))
    );
  };

  const updateAddonGroupItems = (groupKey: string, raw: string) => {
    updateAddonGroup(groupKey, {
      items: raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  };

  const updateWaterPrice = (key: string, value: number) => {
    saveSettings({
      platformMenu: {
        ...platformMenu,
        menuCategories,
        optionalAddOnGroups: addonGroups,
        optionalAddOns: addOnPricing,
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
    saveSettings({
      platformMenu: {
        ...platformMenu,
        menuCategories: menuCategories
          .map((category) => ({
            ...category,
            label: category.label.trim(),
            items: category.items.filter((item) => item.name.trim()),
          }))
          .sort((left, right) => left.position - right.position),
        optionalAddOns: addOnPricing,
        optionalAddOnGroups: addonGroups.map((group) => ({
          ...group,
          title: group.title.trim(),
          items: group.items.filter(Boolean),
        })),
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 180));
    setSaving(false);
  };

  return (
    <AdminShell
      title="Platform Menu"
      description="Edit categories, order, menu items, add-ons, and pricing for the shared platform menu."
      actions={<AdminButton onClick={() => void save()}>{saving ? "Saving..." : "Save Platform Menu"}</AdminButton>}
    >
      <div className="space-y-6">
        <AdminPanel
          eyebrow="Category Logic"
          title="Package Selection Counts"
          description="Set how many items a customer must select in each category for bronze, silver, and gold."
        >
          <div className="space-y-5">
            {TIERS.map((tier) => (
              <div key={tier} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-[15px] font-bold text-[#0F172A]">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Package
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {sortedCategories.map((category) => (
                    <AdminInput
                      key={`${tier}-${category.key}`}
                      label={category.label}
                      value={String(platformMenu.categoryRequiredCounts[tier][category.key] ?? 0)}
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AdminPanel
            eyebrow="Optional Add-ons"
            title="Extras Beyond The Menu"
            description="Beverages, dessert add-ons, extras, and premium / event add-ons are billed separately."
          >
            <div className="space-y-4">
              {addonGroups.map((group) => (
                <div key={group.key} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <AdminInput
                    label="Group Title"
                    value={group.title}
                    onChange={(event) => updateAddonGroup(group.key, { title: event.target.value })}
                  />
                  <div className="mt-4">
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                      Items
                    </label>
                    <textarea
                      value={group.items.join("\n")}
                      onChange={(event) => updateAddonGroupItems(group.key, event.target.value)}
                      className="min-h-[130px] w-full rounded-[14px] border border-[#CBD5E1] bg-white px-4 py-3 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>

          <div className="space-y-6">
            <AdminPanel
              eyebrow="Pricing"
              title="Optional Add-ons Pricing"
              description="Edit per-pax pricing for every separately billed optional add-on."
            >
              <div className="space-y-3">
                {addOnPricing.map((addon) => (
                  <div key={addon.id} className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <p className="text-[13px] font-bold text-[#0F172A]">{addon.name}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#64748B]">
                      {addon.isVeg ? "Veg" : "Non-Veg"}
                    </p>
                    <div className="mt-3">
                      <AdminInput
                        label="Price / Pax"
                        value={String(addon.pricePerPax)}
                        onChange={(event) => updateAddonPrice(addon.id, Number(event.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel
              eyebrow="Water Pricing"
              title="RO + Packaged Bottles"
              description="Water remains separate from optional add-ons. RO stays free and packaged bottles are priced below."
            >
              <div className="space-y-4">
                <AdminInput
                  label="RO Water Price / Pax"
                  value={String(platformMenu.water.roPricePerPax)}
                  onChange={(event) =>
                    saveSettings({
                      platformMenu: {
                        ...platformMenu,
                        menuCategories,
                        optionalAddOnGroups: addonGroups,
                        optionalAddOns: addOnPricing,
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

        <AdminPanel
          eyebrow="Category Items"
          title="Master Menu"
          description="Edit category titles and items. Click an item chip to remove it. Add [non-veg] after a new item if it is non-veg."
        >
          <div className="space-y-4">
            {sortedCategories.map((category, index) => (
              <div key={category.key} className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="grid gap-4 md:grid-cols-[96px_minmax(0,1fr)]">
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                      Order
                    </label>
                    <div className="flex h-11 items-center justify-center rounded-[14px] border border-[#CBD5E1] bg-white text-[14px] font-bold text-[#0F172A]">
                      {index + 1}
                    </div>
                  </div>
                  <AdminInput
                    label="Category Title"
                    value={category.label}
                    onChange={(event) => updateCategory(category.key, { label: event.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                    Items
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <button
                        key={`${category.key}-${item.name}`}
                        type="button"
                        onClick={() => removeCategoryItem(category.key, item.name)}
                        className={`rounded-full border px-3 py-2 text-[12px] font-semibold transition ${
                          item.isVeg
                            ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                            : "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={newItems[category.key] ?? ""}
                    onChange={(event) => setNewItems((current) => ({ ...current, [category.key]: event.target.value }))}
                    placeholder="Add item name, or add [non-veg]"
                    className="h-11 w-full rounded-[14px] border border-[#CBD5E1] bg-white px-4 text-[13px] text-[#0F172A] outline-none focus:border-[#2563EB]"
                  />
                  <AdminButton onClick={() => addCategoryItem(category.key)}>Add Item</AdminButton>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
