export const EVENT_OPTIONS = [
  "Birthday Party",
  "Wedding",
  "Haldi Ceremony",
  "Mehendi Ceremony",
  "Roka Ceremony",
  "Wedding Anniversary",
  "Baby Shower",
  "Retirement Party",
  "Corporate Event",
  "Kitty Party",
  "Get-Together",
  "Small Gathering",
  "Satsang",
  "Funeral Gathering",
  "Breakup Party",
] as const;

export const SERVICE_OPTIONS = [
  {
    value: "all",
    label: "All Services",
    tagline: "Show every caterer",
    matches: [] as string[],
  },
  {
    value: "wedding",
    label: "Wedding Catering",
    tagline: "Shaadi bookings and grand setups",
    matches: ["Wedding", "Haldi Ceremony", "Mehendi Ceremony", "Roka Ceremony"],
  },
  {
    value: "birthday",
    label: "Birthday Parties",
    tagline: "Birthday events and house parties",
    matches: ["Birthday Party", "Get-Together", "Small Gathering", "Kitty Party"],
  },
  {
    value: "baby-shower",
    label: "Baby Shower & Pooja",
    tagline: "Baby shower and spiritual gatherings",
    matches: ["Baby Shower", "Satsang"],
  },
  {
    value: "corporate",
    label: "Corporate Events",
    tagline: "Office functions and formal events",
    matches: ["Corporate Event"],
  },
  {
    value: "anniversary",
    label: "Anniversary Celebrations",
    tagline: "Anniversary and family celebrations",
    matches: ["Wedding Anniversary"],
  },
  {
    value: "retirement",
    label: "Retirement Parties",
    tagline: "Retirement and farewell functions",
    matches: ["Retirement Party"],
  },
] as const;

export const BUDGET_OPTIONS = [
  {
    value: "all",
    label: "All Budgets",
    tagline: "Any starting price",
  },
  {
    value: "under-500",
    label: "Under ₹500 / plate",
    tagline: "Simple & affordable options",
  },
  {
    value: "500-800",
    label: "₹500 – ₹800 / plate",
    tagline: "Best value for money",
  },
  {
    value: "800-1200",
    label: "₹800 – ₹1200 / plate",
    tagline: "Popular for weddings & large gatherings",
  },
  {
    value: "1200-plus",
    label: "₹1200+ / plate",
    tagline: "Premium weddings & grand events",
  },
] as const;

export const VENDOR_TYPE_OPTIONS = [
  {
    value: "all",
    label: "All Caterers",
    tagline: "Browse the full vendor list",
    badge: "",
  },
  {
    value: "luxury",
    label: "Luxury Caterers",
    tagline: "Premium weddings & grand events",
    badge: "Premium",
  },
  {
    value: "elite",
    label: "Elite Caterers",
    tagline: "Popular for weddings & large gatherings",
    badge: "Top Rated",
  },
  {
    value: "value",
    label: "Value Caterers",
    tagline: "Best value for money",
    badge: "Best Value",
  },
  {
    value: "budget",
    label: "Budget Caterers",
    tagline: "Simple & affordable options",
    badge: "Affordable",
  },
] as const;

export const SPECIALISATION_OPTIONS = [
  "Luxury Setup",
  "Live Counter",
  "Best Value",
  "Affordable",
  "Pure Veg Only",
  "Top Rated",
  "Outdoor Events",
] as const;

export type EventOption = (typeof EVENT_OPTIONS)[number];
export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
export type BudgetOption = (typeof BUDGET_OPTIONS)[number];
export type VendorTypeOption = (typeof VENDOR_TYPE_OPTIONS)[number];

export function normalizeEventLabel(value: string) {
  const normalized = value.trim().toLowerCase();
  const map: Record<string, string> = {
    birthday: "Birthday Party",
    "birthday party": "Birthday Party",
    wedding: "Wedding",
    haldi: "Haldi Ceremony",
    "haldi ceremony": "Haldi Ceremony",
    mehendi: "Mehendi Ceremony",
    "mehendi ceremony": "Mehendi Ceremony",
    mehndi: "Mehendi Ceremony",
    roka: "Roka Ceremony",
    "roka ceremony": "Roka Ceremony",
    anniversary: "Wedding Anniversary",
    "wedding anniversary": "Wedding Anniversary",
    "baby shower": "Baby Shower",
    retirement: "Retirement Party",
    "retirement party": "Retirement Party",
    corporate: "Corporate Event",
    "corporate event": "Corporate Event",
    "corporate event / office party": "Corporate Event",
    kitty: "Kitty Party",
    "kitty party": "Kitty Party",
    "get-together / friends party": "Get-Together",
    "get-together": "Get-Together",
    "small gathering": "Small Gathering",
    "small gathering (under 75 pax)": "Small Gathering",
    satsang: "Satsang",
    "satsang / pooja": "Satsang",
    "funeral bhoj": "Funeral Gathering",
    "funeral gathering": "Funeral Gathering",
    "break-up party": "Breakup Party",
    "breakup party": "Breakup Party",
    engagement: "Roka Ceremony",
    "destination events": "Wedding",
  };
  return map[normalized] ?? value;
}

export function getVendorTypeFromBronzePrice(bronzePrice: number) {
  if (bronzePrice >= 1200) return "luxury";
  if (bronzePrice >= 800) return "elite";
  if (bronzePrice >= 500) return "value";
  return "budget";
}

export function getVendorBadgeFromBronzePrice(bronzePrice: number) {
  const type = getVendorTypeFromBronzePrice(bronzePrice);
  const match = VENDOR_TYPE_OPTIONS.find((option) => option.value === type);
  return match?.badge ?? "";
}

export function budgetMatchesPrice(
  budget: string,
  bronzePrice: number
) {
  if (budget === "all") return true;
  if (budget === "under-500") return bronzePrice < 500;
  if (budget === "500-800") return bronzePrice >= 500 && bronzePrice < 800;
  if (budget === "800-1200") return bronzePrice >= 800 && bronzePrice < 1200;
  if (budget === "1200-plus") return bronzePrice >= 1200;
  return true;
}
