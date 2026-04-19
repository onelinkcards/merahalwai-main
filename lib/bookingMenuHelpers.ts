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
  requiredCount: number;
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

export type MenuPreviewSection = {
  title: string;
  items: { name: string; isVeg: boolean }[];
  more: number;
};

export type WaterOption = {
  id: WaterType;
  label: string;
  pricePerPax: number;
  helperText: string;
  variants?: Array<{ label: string; pricePerPax: number }>;
};

const CATEGORY_ORDER: BookingCategoryKey[] = [
  "soups",
  "vegStarters",
  "nonVegStarters",
  "vegMainCourse",
  "nonVegMainCourse",
  "dalKadhiLegumes",
  "riceBiryani",
  "indianBreads",
  "accompaniments",
  "desserts",
];

const CATEGORY_LABELS: Record<BookingCategoryKey, string> = {
  soups: "Soups",
  vegStarters: "Veg Starters",
  nonVegStarters: "Non-Veg Starters",
  vegMainCourse: "Veg Main Course",
  nonVegMainCourse: "Non-Veg Main Course",
  dalKadhiLegumes: "Dal / Kadhi / Legumes",
  riceBiryani: "Rice / Biryani",
  indianBreads: "Indian Breads",
  accompaniments: "Accompaniments",
  desserts: "Desserts",
};

const PACKAGE_RULES: Record<PackageTier, Record<BookingCategoryKey, CategoryRule>> = {
  bronze: {
    soups: { requiredCount: 1 },
    vegStarters: { requiredCount: 2 },
    nonVegStarters: { requiredCount: 1 },
    vegMainCourse: { requiredCount: 2 },
    nonVegMainCourse: { requiredCount: 1 },
    dalKadhiLegumes: { requiredCount: 1 },
    riceBiryani: { requiredCount: 1 },
    indianBreads: { requiredCount: 1 },
    accompaniments: { requiredCount: 1 },
    desserts: { requiredCount: 1 },
  },
  silver: {
    soups: { requiredCount: 1 },
    vegStarters: { requiredCount: 2 },
    nonVegStarters: { requiredCount: 2 },
    vegMainCourse: { requiredCount: 2 },
    nonVegMainCourse: { requiredCount: 1 },
    dalKadhiLegumes: { requiredCount: 1 },
    riceBiryani: { requiredCount: 1 },
    indianBreads: { requiredCount: 1 },
    accompaniments: { requiredCount: 1 },
    desserts: { requiredCount: 1 },
  },
  gold: {
    soups: { requiredCount: 1 },
    vegStarters: { requiredCount: 3 },
    nonVegStarters: { requiredCount: 2 },
    vegMainCourse: { requiredCount: 3 },
    nonVegMainCourse: { requiredCount: 2 },
    dalKadhiLegumes: { requiredCount: 1 },
    riceBiryani: { requiredCount: 1 },
    indianBreads: { requiredCount: 2 },
    accompaniments: { requiredCount: 1 },
    desserts: { requiredCount: 2 },
  },
};

const ADMIN_STATE_KEY = "mh_admin_state_v1";

function canUseBrowser() {
  return typeof window !== "undefined";
}

function readPlatformMenuConfig(): null | {
  menuCategories?: Array<{
    key: BookingCategoryKey;
    label: string;
    position: number;
    items: Array<{ name: string; isVeg: boolean }>;
  }>;
  categoryRequiredCounts?: Partial<Record<PackageTier, Partial<Record<BookingCategoryKey | "soupsDrinks" | "starters" | "mainCourse" | "riceBreads", number>>>>;
  optionalAddOnGroups?: Array<{ key: string; title: string; items: string[] }>;
  water?: {
    roPricePerPax?: number;
    packagedBottlePrices?: Record<string, number>;
  };
} {
  if (!canUseBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { settings?: { platformMenu?: unknown } };
    return (parsed.settings?.platformMenu as ReturnType<typeof readPlatformMenuConfig>) ?? null;
  } catch {
    return null;
  }
}

function sourceToGroup(categoryName: string): BookingCategoryKey {
  const alias: Record<string, BookingCategoryKey> = {
    soups: "soups",
    "veg starters": "vegStarters",
    "non-veg starters": "nonVegStarters",
    "veg main course": "vegMainCourse",
    "non-veg main course": "nonVegMainCourse",
    "dal / kadhi / legumes": "dalKadhiLegumes",
    "rice / biryani": "riceBiryani",
    "indian breads": "indianBreads",
    accompaniments: "accompaniments",
    desserts: "desserts",
  };

  return alias[categoryName.toLowerCase()] ?? "desserts";
}

function itemKey(categoryKey: BookingCategoryKey, itemName: string) {
  return `${categoryKey}::${itemName}`;
}

function getConfiguredMenuCategories() {
  const platformMenu = readPlatformMenuConfig();
  const configured = platformMenu?.menuCategories;
  if (configured?.length) {
    return [...configured]
      .sort((left, right) => left.position - right.position)
      .filter((category) => category.key && category.label && Array.isArray(category.items));
  }

  return MASTER_MENU.map((category, index) => ({
    key: sourceToGroup(category.name),
    label: category.name,
    position: index + 1,
    items: category.items.map((item) => ({ name: item.name, isVeg: item.isVeg })),
  }));
}

export function getConfiguredAddOnGroups() {
  const platformMenu = readPlatformMenuConfig();
  return platformMenu?.optionalAddOnGroups?.length ? platformMenu.optionalAddOnGroups : [];
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
  const defaultNames = new Set<string>();

  if (!pkg) return defaultNames;

  for (const category of pkg.categories) {
    for (const item of category.items) {
      if (item.isDefault) defaultNames.add(item.name);
    }
  }

  return defaultNames;
}

function pushUnique(items: RawMenuItem[], nextItem: RawMenuItem) {
  if (items.some((item) => item.name === nextItem.name)) return;
  items.push(nextItem);
}

function buildSourceMenu(slug: string, packageId: PackageTier, foodPreference?: FoodPreference) {
  const packageRules = getPackageCategoryRules(packageId);
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor) {
    return CATEGORY_ORDER.map((categoryKey) => ({
      categoryKey,
      label: CATEGORY_LABELS[categoryKey],
      rule: packageRules[categoryKey],
      items: [] as BookingMenuItem[],
    }));
  }

  const defaultMap = vendorPackageDefaults(slug, packageId);
  const grouped = new Map<BookingCategoryKey, RawMenuItem[]>(
    CATEGORY_ORDER.map((categoryKey) => [categoryKey, []])
  );

  for (const category of getConfiguredMenuCategories()) {
    const categoryKey = category.key;
    if (!categoryKey) continue;
    for (const item of category.items) {
      if (!shouldIncludeItem(vendor.isVeg, foodPreference, item.isVeg)) continue;
      pushUnique(grouped.get(categoryKey) ?? [], item);
    }
  }

  return CATEGORY_ORDER.map((categoryKey) => {
    const rule = packageRules[categoryKey];
    const defaults = defaultMap;
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
  }).filter((group) => group.items.length > 0);
}

export function buildMenuPreviewGroups(
  slug: string,
  packageId: PackageTier,
  foodPreference?: FoodPreference,
  previewLimit = 4
) {
  return buildSourceMenu(slug, packageId, foodPreference)
    .map((group) => ({
      title: group.label,
      items: group.items.slice(0, previewLimit).map((item) => ({
        name: item.name,
        isVeg: item.isVeg,
      })),
      more: Math.max(group.items.length - previewLimit, 0),
    }))
    .filter((group) => group.items.length > 0);
}

export function buildFullMenuPreviewSections(
  slug: string,
  foodPreference?: FoodPreference,
  previewLimit = 4
): MenuPreviewSection[] {
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor) return [];

  return getConfiguredMenuCategories().map((category) => {
    const items = category.items.filter((item) =>
      shouldIncludeItem(vendor.isVeg, foodPreference, item.isVeg)
    );

    return {
      title: category.label,
      items: items.slice(0, previewLimit).map((item) => ({
        name: item.name,
        isVeg: item.isVeg,
      })),
      more: Math.max(items.length - previewLimit, 0),
    };
  }).filter((category) => category.items.length > 0);
}

export function getPackageCategoryRules(packageId: PackageTier) {
  const platformMenu = readPlatformMenuConfig();
  const configured = platformMenu?.categoryRequiredCounts?.[packageId];
  if (!configured) return PACKAGE_RULES[packageId];

  return {
    soups: { requiredCount: configured.soups ?? configured.soupsDrinks ?? PACKAGE_RULES[packageId].soups.requiredCount },
    vegStarters: { requiredCount: configured.vegStarters ?? configured.starters ?? PACKAGE_RULES[packageId].vegStarters.requiredCount },
    nonVegStarters: { requiredCount: configured.nonVegStarters ?? configured.starters ?? PACKAGE_RULES[packageId].nonVegStarters.requiredCount },
    vegMainCourse: { requiredCount: configured.vegMainCourse ?? configured.mainCourse ?? PACKAGE_RULES[packageId].vegMainCourse.requiredCount },
    nonVegMainCourse: { requiredCount: configured.nonVegMainCourse ?? configured.mainCourse ?? PACKAGE_RULES[packageId].nonVegMainCourse.requiredCount },
    dalKadhiLegumes: { requiredCount: configured.dalKadhiLegumes ?? configured.mainCourse ?? PACKAGE_RULES[packageId].dalKadhiLegumes.requiredCount },
    riceBiryani: { requiredCount: configured.riceBiryani ?? configured.riceBreads ?? PACKAGE_RULES[packageId].riceBiryani.requiredCount },
    indianBreads: { requiredCount: configured.indianBreads ?? configured.riceBreads ?? PACKAGE_RULES[packageId].indianBreads.requiredCount },
    accompaniments: { requiredCount: configured.accompaniments ?? configured.riceBreads ?? PACKAGE_RULES[packageId].accompaniments.requiredCount },
    desserts: { requiredCount: configured.desserts ?? PACKAGE_RULES[packageId].desserts.requiredCount },
  };
}

export function getDefaultMenuKeys(slug: string, packageId: PackageTier, foodPreference?: FoodPreference): string[] {
  const groups = buildSourceMenu(slug, packageId, foodPreference);
  const selected: string[] = [];

  for (const group of groups) {
    const preferred = group.items.filter((item) => item.isDefault);
    const remaining = group.items.filter((item) => !item.isDefault);
    const seedItems = [...preferred, ...remaining].slice(0, group.rule.requiredCount);
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
    normalized.push(...inGroup.slice(0, group.rule.requiredCount));
  }

  return normalized;
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
      minRequired: group.rule.requiredCount,
      includedCount: group.rule.requiredCount,
      maxSelectableCount: group.rule.requiredCount,
      selectedCount,
      extraSelectedCount: 0,
    };
  });
}

function helperCopy(summary: CategorySelectionSummary) {
  if (summary.selectedCount < summary.minRequired) {
    return `Select ${summary.minRequired} item${summary.minRequired > 1 ? "s" : ""}`;
  }
  return "Required selection complete";
}

export function buildBookingMenuGroups(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  foodPreference?: FoodPreference
): BookingMenuGroup[] {
  const normalized = normalizeSelectedItems(slug, packageId, selectedKeys, foodPreference);
  const groups = buildSourceMenu(slug, packageId, foodPreference);

  return getCategorySelectionSummary(slug, packageId, normalized, foodPreference).map((summary) => {
    const source = groups.find((group) => group.categoryKey === summary.categoryKey);
    return {
      ...summary,
      helperText: helperCopy(summary),
      items:
        source?.items.map((item) => ({
          ...item,
          selected: normalized.includes(item.key),
          isAddOn: false,
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
  void slug;
  void packageId;
  void selectedKeys;
  void foodPreference;
  return [];
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
  const vendorWater = (vendor?.water ?? {}) as {
    pricePerPax?: number;
    roPricePerPax?: number;
    packagedPricePerPax?: number;
  };
  const platformMenu = readPlatformMenuConfig();
  const packagedBottlePrices = platformMenu?.water?.packagedBottlePrices ?? {
    "200ml": 4,
    "330ml": 7,
    "500ml": 10,
    "1 ltr": 18,
  };
  const packagedDefaultRate =
    Number(packagedBottlePrices["500ml"]) || vendorWater.packagedPricePerPax || vendorWater.pricePerPax || 10;
  const roRate = Math.max(0, Number(platformMenu?.water?.roPricePerPax ?? vendorWater.roPricePerPax ?? 0));

  return [
    {
      id: "ro",
      label: "RO Water",
      pricePerPax: roRate,
      helperText: roRate > 0 ? `₹${roRate}/guest` : "₹0 / guest",
    },
    {
      id: "packaged",
      label: "Packaged Bottles",
      pricePerPax: packagedDefaultRate,
      helperText: "Choose packaged bottle size",
      variants: Object.entries(packagedBottlePrices).map(([label, pricePerPax]) => ({
        label,
        pricePerPax: Number(pricePerPax) || 0,
      })),
    },
  ];
}

export function getWaterSelectionPrice(
  slug: string,
  waterType: WaterType,
  waterVariant?: string
) {
  if (!slug || waterType === "none") return 0;
  const options = getWaterOptions(slug);

  const getOptionPrice = (type: "ro" | "packaged") => {
    const option = options.find((entry) => entry.id === type);
    if (!option) return 0;
    if (type === "packaged" && waterVariant && option.variants?.length) {
      return option.variants.find((variant) => variant.label === waterVariant)?.pricePerPax ?? option.pricePerPax;
    }
    return option.pricePerPax;
  };

  if (waterType === "both") {
    return getOptionPrice("ro") + getOptionPrice("packaged");
  }

  if (waterType === "ro") return getOptionPrice("ro");
  if (waterType === "packaged") return getOptionPrice("packaged");
  return 0;
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
    selected_addon_selections: state.addOnSelections,
    water_selected: state.waterType,
    water_variant: state.waterVariant,
    caterer_note: state.specialNote,
    coupon_code: state.couponCode,
  };
}

export function meetsCategoryMinimums(summary: CategorySelectionSummary[]) {
  return summary.every((item) => item.selectedCount >= item.minRequired);
}
