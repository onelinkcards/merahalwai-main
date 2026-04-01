import { MASTER_MENU, getVendorDetailBySlug } from "@/data/vendors";
import { getMenuItemImageUrl, shortMenuDescription } from "@/data/menuItemImages";
import type {
  BookingCategoryKey,
  BookingStore,
  CategorySelectionSummary,
  FoodPreference,
  PackageTier,
  WaterType,
} from "@/store/bookingStore";

type CategoryRule = {
  minRequired: number;
  includedCount: number;
  maxSelectableCount: number;
};

type RawMenuItem = {
  name: string;
  isVeg: boolean;
};

export type BookingMenuItem = {
  key: string;
  name: string;
  image: string;
  description: string;
  isVeg: boolean;
  sourceCategory: string;
  isDefault: boolean;
  selected: boolean;
  isAddOn: boolean;
};

export type BookingMenuGroup = CategorySelectionSummary & {
  helperText: string;
  items: BookingMenuItem[];
};

export type ReviewMenuGroup = {
  categoryKey: BookingCategoryKey;
  label: string;
  items: { key: string; name: string; isVeg: boolean; isAddOn: boolean }[];
};

export type WaterOption = {
  id: WaterType;
  label: string;
  pricePerPax: number;
  helperText: string;
};

const CATEGORY_ORDER: BookingCategoryKey[] = [
  "soupsDrinks",
  "starters",
  "mainCourse",
  "riceBreads",
  "desserts",
];

const CATEGORY_LABELS: Record<BookingCategoryKey, string> = {
  soupsDrinks: "Soups / Drinks",
  starters: "Starters",
  mainCourse: "Main Course",
  riceBreads: "Rice & Breads",
  desserts: "Desserts",
};

const PACKAGE_RULES: Record<PackageTier, Record<BookingCategoryKey, CategoryRule>> = {
  bronze: {
    soupsDrinks: { minRequired: 0, includedCount: 1, maxSelectableCount: 1 },
    starters: { minRequired: 1, includedCount: 2, maxSelectableCount: 3 },
    mainCourse: { minRequired: 2, includedCount: 3, maxSelectableCount: 4 },
    riceBreads: { minRequired: 1, includedCount: 2, maxSelectableCount: 2 },
    desserts: { minRequired: 1, includedCount: 1, maxSelectableCount: 2 },
  },
  silver: {
    soupsDrinks: { minRequired: 0, includedCount: 1, maxSelectableCount: 2 },
    starters: { minRequired: 2, includedCount: 4, maxSelectableCount: 5 },
    mainCourse: { minRequired: 3, includedCount: 4, maxSelectableCount: 6 },
    riceBreads: { minRequired: 1, includedCount: 2, maxSelectableCount: 3 },
    desserts: { minRequired: 1, includedCount: 1, maxSelectableCount: 2 },
  },
  gold: {
    soupsDrinks: { minRequired: 0, includedCount: 2, maxSelectableCount: 2 },
    starters: { minRequired: 2, includedCount: 5, maxSelectableCount: 6 },
    mainCourse: { minRequired: 3, includedCount: 5, maxSelectableCount: 8 },
    riceBreads: { minRequired: 1, includedCount: 2, maxSelectableCount: 4 },
    desserts: { minRequired: 1, includedCount: 1, maxSelectableCount: 5 },
  },
};

const DRINK_ITEMS: RawMenuItem[] = [
  { name: "Rose Sharbat", isVeg: true },
  { name: "Mango Lassi", isVeg: true },
  { name: "Fresh Lime Soda", isVeg: true },
  { name: "Masala Chaas", isVeg: true },
  { name: "Jaljeera", isVeg: true },
  { name: "Cold Coffee", isVeg: true },
];

function sourceToGroup(categoryName: string): BookingCategoryKey {
  const lower = categoryName.toLowerCase();
  if (lower.includes("drink") || lower.includes("soup")) return "soupsDrinks";
  if (lower.includes("starter")) return "starters";
  if (
    lower.includes("main") ||
    lower.includes("dal") ||
    lower.includes("legume") ||
    lower.includes("kadhi")
  ) {
    return "mainCourse";
  }
  if (lower.includes("rice") || lower.includes("bread") || lower.includes("accompaniment") || lower.includes("side")) {
    return "riceBreads";
  }
  return "desserts";
}

function itemKey(categoryKey: BookingCategoryKey, itemName: string) {
  return `${categoryKey}::${itemName}`;
}

function normalizeFoodPreference(vendorIsVeg: boolean, foodPreference?: FoodPreference) {
  if (vendorIsVeg) return "veg" as const;
  return foodPreference === "veg" ? "veg" : "veg_nonveg";
}

function shouldIncludeItem(vendorIsVeg: boolean, foodPreference: FoodPreference | undefined, isVeg: boolean) {
  const resolved = normalizeFoodPreference(vendorIsVeg, foodPreference);
  if (resolved === "veg") return isVeg;
  return true;
}

function vendorPackageDefaults(slug: string, packageId: string) {
  const vendor = getVendorDetailBySlug(slug);
  const pkg = vendor?.packages.find((entry) => entry.id === packageId);
  const defaultNames = new Map<BookingCategoryKey, Set<string>>();

  if (!pkg) return defaultNames;

  for (const category of pkg.categories) {
    const groupKey = sourceToGroup(category.name);
    const existing = defaultNames.get(groupKey) ?? new Set<string>();
    for (const item of category.items) {
      if (item.isDefault) existing.add(item.name);
    }
    defaultNames.set(groupKey, existing);
  }

  return defaultNames;
}

function pushUnique(items: RawMenuItem[], nextItem: RawMenuItem) {
  if (items.some((item) => item.name === nextItem.name)) return;
  items.push(nextItem);
}

function buildSourceMenu(slug: string, packageId: PackageTier, foodPreference?: FoodPreference) {
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor) {
    return CATEGORY_ORDER.map((categoryKey) => ({
      categoryKey,
      label: CATEGORY_LABELS[categoryKey],
      rule: PACKAGE_RULES[packageId][categoryKey],
      items: [] as BookingMenuItem[],
    }));
  }

  const defaultMap = vendorPackageDefaults(slug, packageId);
  const grouped = new Map<BookingCategoryKey, RawMenuItem[]>(
    CATEGORY_ORDER.map((categoryKey) => [categoryKey, []])
  );
  const masterSources: Record<string, BookingCategoryKey> = {
    Soups: "soupsDrinks",
    Starters: "starters",
    "Main Course": "mainCourse",
    "Dal & Legumes": "mainCourse",
    Rice: "riceBreads",
    "Indian Breads": "riceBreads",
    "Sides & Accompaniments": "riceBreads",
    "Sweets / Desserts": "desserts",
  };

  for (const item of DRINK_ITEMS) {
    if (shouldIncludeItem(vendor.isVeg, foodPreference, item.isVeg)) {
      grouped.get("soupsDrinks")?.push(item);
    }
  }

  for (const category of MASTER_MENU) {
    const categoryKey = masterSources[category.name];
    if (!categoryKey) continue;
    for (const item of category.items) {
      if (!shouldIncludeItem(vendor.isVeg, foodPreference, item.isVeg)) continue;
      pushUnique(grouped.get(categoryKey) ?? [], item);
    }
  }

  const pkg = vendor.packages.find((entry) => entry.id === packageId);
  if (pkg) {
    for (const category of pkg.categories) {
      const categoryKey = sourceToGroup(category.name);
      for (const item of category.items) {
        if (!shouldIncludeItem(vendor.isVeg, foodPreference, item.isVeg)) continue;
        pushUnique(grouped.get(categoryKey) ?? [], { name: item.name, isVeg: item.isVeg });
      }
    }
  }

  return CATEGORY_ORDER.map((categoryKey) => {
    const rule = PACKAGE_RULES[packageId][categoryKey];
    const defaults = defaultMap.get(categoryKey) ?? new Set<string>();
    const items = (grouped.get(categoryKey) ?? [])
      .map((item) => ({
        key: itemKey(categoryKey, item.name),
        name: item.name,
        image: getMenuItemImageUrl(item.name),
        description: shortMenuDescription(item.name),
        isVeg: item.isVeg,
        sourceCategory: categoryKey,
        isDefault: defaults.has(item.name),
        selected: false,
        isAddOn: false,
      }))
      .sort((left, right) => {
        if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1;
        if (left.isVeg !== right.isVeg) return left.isVeg ? -1 : 1;
        return left.name.localeCompare(right.name);
      });

    return {
      categoryKey,
      label: CATEGORY_LABELS[categoryKey],
      rule,
      items,
    };
  });
}

export function getPackageCategoryRules(packageId: PackageTier) {
  return PACKAGE_RULES[packageId];
}

export function getDefaultMenuKeys(slug: string, packageId: PackageTier, foodPreference?: FoodPreference): string[] {
  const groups = buildSourceMenu(slug, packageId, foodPreference);
  const selected: string[] = [];

  for (const group of groups) {
    const preferred = group.items.filter((item) => item.isDefault);
    const remaining = group.items.filter((item) => !item.isDefault);
    const seedItems = [...preferred, ...remaining].slice(0, group.rule.includedCount);
    selected.push(...seedItems.map((item) => item.key));
  }

  return selected;
}

export function normalizeSelectedItems(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  foodPreference?: FoodPreference
) {
  const groups = buildSourceMenu(slug, packageId, foodPreference);
  const normalized: string[] = [];

  for (const group of groups) {
    const allowedKeys = new Set(group.items.map((item) => item.key));
    const inGroup = selectedKeys.filter(
      (key, index) => selectedKeys.indexOf(key) === index && allowedKeys.has(key)
    );
    normalized.push(...inGroup.slice(0, group.rule.maxSelectableCount));
  }

  return normalized;
}

function selectedExtrasMap(selectedKeys: string[], groups: ReturnType<typeof buildSourceMenu>) {
  const extraSet = new Set<string>();

  for (const group of groups) {
    const selectedInGroup = selectedKeys.filter((key) => key.startsWith(`${group.categoryKey}::`));
    for (const key of selectedInGroup.slice(group.rule.includedCount)) {
      extraSet.add(key);
    }
  }

  return extraSet;
}

export function getCategorySelectionSummary(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  foodPreference?: FoodPreference
): CategorySelectionSummary[] {
  const normalized = normalizeSelectedItems(slug, packageId, selectedKeys, foodPreference);
  const groups = buildSourceMenu(slug, packageId, foodPreference);

  return groups.map((group) => {
    const selectedCount = normalized.filter((key) => key.startsWith(`${group.categoryKey}::`)).length;
    return {
      categoryKey: group.categoryKey,
      label: group.label,
      minRequired: group.rule.minRequired,
      includedCount: group.rule.includedCount,
      maxSelectableCount: group.rule.maxSelectableCount,
      selectedCount,
      extraSelectedCount: Math.max(0, selectedCount - group.rule.includedCount),
    };
  });
}

function helperCopy(summary: CategorySelectionSummary) {
  if (summary.selectedCount < summary.minRequired) {
    return `Select at least ${summary.minRequired}`;
  }
  if (summary.extraSelectedCount > 0) {
    return `${summary.extraSelectedCount} extra item${summary.extraSelectedCount > 1 ? "s" : ""} will be charged`;
  }
  return `${summary.includedCount} included · Max ${summary.maxSelectableCount}`;
}

export function buildBookingMenuGroups(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  foodPreference?: FoodPreference
): BookingMenuGroup[] {
  const normalized = normalizeSelectedItems(slug, packageId, selectedKeys, foodPreference);
  const groups = buildSourceMenu(slug, packageId, foodPreference);
  const extraSet = selectedExtrasMap(normalized, groups);

  return getCategorySelectionSummary(slug, packageId, normalized, foodPreference).map((summary) => {
    const source = groups.find((group) => group.categoryKey === summary.categoryKey);
    return {
      ...summary,
      helperText: helperCopy(summary),
      items:
        source?.items.map((item) => ({
          ...item,
          selected: normalized.includes(item.key),
          isAddOn: extraSet.has(item.key),
        })) ?? [],
    };
  });
}

export function getAutoAddonItems(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  foodPreference?: FoodPreference
) {
  const normalized = normalizeSelectedItems(slug, packageId, selectedKeys, foodPreference);
  const groups = buildSourceMenu(slug, packageId, foodPreference);
  const extras = selectedExtrasMap(normalized, groups);

  return groups.flatMap((group) =>
    group.items
      .filter((item) => extras.has(item.key))
      .map((item) => ({
        key: item.key,
        name: item.name,
        isVeg: item.isVeg,
        categoryKey: group.categoryKey,
        label: group.label,
      }))
  );
}

export function groupMenuItemsForReview(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  foodPreference?: FoodPreference
): ReviewMenuGroup[] {
  return buildBookingMenuGroups(slug, packageId, selectedKeys, foodPreference)
    .map((group) => ({
      categoryKey: group.categoryKey,
      label: group.label,
      items: group.items
        .filter((item) => item.selected)
        .map((item) => ({
          key: item.key,
          name: item.name,
          isVeg: item.isVeg,
          isAddOn: item.isAddOn,
        })),
    }))
    .filter((group) => group.items.length > 0);
}

export function getMenuItemsForCategory(
  slug: string,
  packageId: PackageTier,
  categoryKey: BookingCategoryKey,
  foodPreference?: FoodPreference
) {
  return buildSourceMenu(slug, packageId, foodPreference).find((group) => group.categoryKey === categoryKey)?.items ?? [];
}

export function getMenuItemMeta(
  slug: string,
  packageId: PackageTier,
  key: string,
  foodPreference?: FoodPreference
) {
  const groups = buildSourceMenu(slug, packageId, foodPreference);
  for (const group of groups) {
    const found = group.items.find((item) => item.key === key);
    if (found) return found;
  }
  return null;
}

export function getWaterOptions(slug: string): WaterOption[] {
  const vendor = getVendorDetailBySlug(slug);
  const packagedRate = vendor?.water?.pricePerPax ?? 15;
  const roRate = Math.max(0, Math.round(packagedRate * 0.55));

  return [
    {
      id: "ro",
      label: "RO Water",
      pricePerPax: roRate,
      helperText: roRate > 0 ? `₹${roRate}/guest` : "Included if arranged at venue",
    },
    {
      id: "packaged",
      label: "Packaged Bottles",
      pricePerPax: packagedRate,
      helperText: `₹${packagedRate}/guest`,
    },
  ];
}

export function buildBookingDraftPayload(state: BookingStore) {
  const selectedPackage = (state.selectedPackage ?? "silver") as PackageTier;
  const categorySelectionSummary = getCategorySelectionSummary(
    state.vendorSlug,
    selectedPackage,
    state.selectedItems,
    state.foodPreference
  );
  const autoAddonItems = getAutoAddonItems(
    state.vendorSlug,
    selectedPackage,
    state.selectedItems,
    state.foodPreference
  );

  return {
    vendor_id: state.vendorSlug,
    package_id: selectedPackage,
    food_preference: state.foodPreference,
    guests: state.guestCount,
    event_type: state.eventType,
    event_date: state.eventDate,
    event_time: state.eventTime,
    venue_name: state.venueName,
    venue_address: state.venueAddress,
    city: state.venueCity,
    pincode: state.venuePincode,
    state: state.venueState,
    customer: {
      full_name: state.customerName,
      phone: state.customerPhone,
      email: state.customerEmail,
      whatsapp: state.customerWhatsapp,
      whatsapp_opt_in: state.whatsappOptIn,
    },
    selected_menu_items: state.selectedItems,
    category_selection_summary: categorySelectionSummary.map((summary) => ({
      category_key: summary.categoryKey,
      label: summary.label,
      min_required: summary.minRequired,
      included_count: summary.includedCount,
      max_selectable_count: summary.maxSelectableCount,
      selected_count: summary.selectedCount,
      extra_selected_count: summary.extraSelectedCount,
    })),
    auto_addon_items: autoAddonItems,
    selected_addons: state.addOnItems,
    water_selected: state.waterType,
    caterer_note: state.specialNote,
    coupon_code: state.couponCode,
  };
}

export function meetsCategoryMinimums(summary: CategorySelectionSummary[]) {
  return summary.every((item) => item.selectedCount >= item.minRequired);
}
