import { getVendorTypeFromBronzePrice, normalizeEventLabel } from "@/data/vendorFilterOptions";

export type Vendor = {
  id: number;
  slug: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  isVeg: boolean;
  verified: boolean;
  cuisines: string[];
  eventTypes: string[];
  specialisations: string[];
  minPax: number;
  maxPax: number;
  priceVeg: number;
  description: string;
  images: string[];
};

const ADMIN_STATE_KEY = "mh_admin_state_v1";

type BrowserAdminMenuItem = {
  name: string;
  isVeg: boolean;
  defaultSelected: boolean;
};

type BrowserAdminCategoryRule = {
  categoryKey: string;
  label: string;
};

type BrowserAdminPackage = {
  id: string;
  name: string;
  pricePerPlate: number;
  shortNote?: string;
  customerLabel?: string;
  menuItems?: Record<string, BrowserAdminMenuItem[]>;
  categoryRules?: BrowserAdminCategoryRule[];
};

type BrowserAdminAddon = {
  name: string;
  isVeg: boolean;
  pricePerPax: number;
  enabled: boolean;
};

type BrowserAdminWater = {
  enabled?: boolean;
  mode?: "ro" | "packaged" | "both";
  roPricePerPax?: number;
  packagedPricePerPax?: number;
  defaultSelection?: "ro" | "packaged";
};

type BrowserAdminVendor = {
  id: string;
  slug: string;
  name: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  pincode?: string;
  locality?: string;
  eventSpecialization?: string[];
  coverPhoto?: string;
  gallery?: string[];
  menuType?: "veg_only" | "veg_and_non_veg";
  shortDescription?: string;
  about?: string;
  displayedRating?: number;
  googlePlaceId?: string;
  totalOrders?: number;
  packages?: Record<string, BrowserAdminPackage>;
  addons?: BrowserAdminAddon[];
  water?: BrowserAdminWater;
};

function canUseBrowser() {
  return typeof window !== "undefined";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readAdminVendorsFromBrowser(): BrowserAdminVendor[] {
  if (!canUseBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_STATE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { vendors?: BrowserAdminVendor[] };
    return Array.isArray(parsed.vendors) ? parsed.vendors : [];
  } catch {
    return [];
  }
}

function deriveVendorCuisines(menuType: BrowserAdminVendor["menuType"]) {
  return menuType === "veg_only"
    ? ["North Indian", "Rajasthani", "Desserts"]
    : ["North Indian", "Mughlai", "Rajasthani"];
}

function deriveVendorSpecialisations(vendor: BrowserAdminVendor) {
  const derived = new Set<string>();
  if (vendor.menuType === "veg_only") derived.add("Pure Veg Only");
  const bronzePrice = Object.values(vendor.packages ?? {})
    .map((pkg) => pkg.pricePerPlate)
    .filter((price) => Number.isFinite(price))
    .sort((a, b) => a - b)[0] ?? 300;
  const vendorType = getVendorTypeFromBronzePrice(bronzePrice);
  if (vendorType === "luxury") derived.add("Luxury Setup");
  if (vendorType === "elite") derived.add("Top Rated");
  if (vendorType === "value") derived.add("Best Value");
  if (vendorType === "budget") derived.add("Affordable");
  if ((vendor.eventSpecialization ?? []).some((entry) => normalizeEventLabel(entry) === "Corporate Event")) derived.add("Outdoor Events");
  if ((vendor.eventSpecialization ?? []).some((entry) => normalizeEventLabel(entry) === "Wedding")) derived.add("Live Counter");
  if (derived.size === 0) derived.add(vendor.menuType === "veg_only" ? "Affordable" : "Live Counter");
  return Array.from(derived).slice(0, 3);
}

function mapAdminVendorToListing(vendor: BrowserAdminVendor, index: number): Vendor {
  const packagePrices = Object.values(vendor.packages ?? {})
    .map((pkg) => pkg.pricePerPlate)
    .filter((price) => Number.isFinite(price));
  const priceVeg = packagePrices.length ? Math.min(...packagePrices) : 300;
  const locationParts = [vendor.locality, vendor.city].filter(Boolean);
  const images = [vendor.coverPhoto, ...(vendor.gallery ?? [])].filter(Boolean) as string[];

  return {
    id: 10_000 + index,
    slug: vendor.slug,
    name: vendor.name,
    location: locationParts.join(", ") || "Jaipur",
    rating: vendor.displayedRating || 4.5,
    reviews: Math.max(24, (vendor.totalOrders ?? 0) * 4 || 24),
    isVeg: vendor.menuType === "veg_only",
    verified: true,
    cuisines: deriveVendorCuisines(vendor.menuType),
    eventTypes: vendor.eventSpecialization?.length
      ? vendor.eventSpecialization.map((entry) => normalizeEventLabel(entry))
      : ["Wedding", "Birthday Party"],
    specialisations: deriveVendorSpecialisations(vendor),
    minPax: 10,
    maxPax: 2000,
    priceVeg,
    description: vendor.shortDescription || vendor.about || "Structured packages with menu customization and verified service.",
    images: images.length ? images : [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=1400&q=80&auto=format&fit=crop",
    ],
  };
}

export function getFrontendVendors(): Vendor[] {
  const map = new Map(VENDORS.map((vendor) => [vendor.slug, clone(vendor)]));
  readAdminVendorsFromBrowser().forEach((vendor, index) => {
    if (!vendor.slug || !vendor.name) return;
    map.set(vendor.slug, mapAdminVendorToListing(vendor, index));
  });
  return Array.from(map.values());
}

export const VENDORS: Vendor[] = [
  {
    id: 1,
    slug: "keemti-gupta-halwai",
    name: "Keemti Gupta Halwai",
    location: "Mansarovar, Jaipur",
    rating: 4.2,
    reviews: 89,
    isVeg: true,
    verified: true,
    cuisines: ["Rajasthani", "North Indian"],
    eventTypes: ["Wedding", "Birthday Party", "Anniversary"],
    specialisations: ["Live Counter", "Royal Setup", "Traditional Sweets"],
    minPax: 50,
    maxPax: 2000,
    priceVeg: 300,
    description:
      "Classic Jaipur flavors with polished service teams and rich festive presentation.",
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    slug: "new-masala-gully",
    name: "New Masala Gully",
    location: "Vaishali Nagar, Jaipur",
    rating: 4.5,
    reviews: 143,
    isVeg: false,
    verified: true,
    cuisines: ["Mughlai", "Punjabi", "North Indian"],
    eventTypes: ["Wedding", "Corporate", "Engagement"],
    specialisations: ["Theme Catering", "Live Grill", "Premium Service"],
    minPax: 80,
    maxPax: 1200,
    priceVeg: 420,
    description:
      "Bold Mughlai menus, curated counters, and high-capacity execution for large events.",
    images: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543353071-087092ec393a?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 3,
    slug: "shree-sai-fast-food",
    name: "Shree Sai Fast Food",
    location: "Malviya Nagar, Jaipur",
    rating: 4.1,
    reviews: 64,
    isVeg: true,
    verified: true,
    cuisines: ["South Indian", "Continental", "North Indian"],
    eventTypes: ["Birthday Party", "Corporate", "Satsang"],
    specialisations: ["Quick Service", "Budget Friendly", "Snack Counters"],
    minPax: 25,
    maxPax: 700,
    priceVeg: 260,
    description:
      "Fast and reliable catering for compact gatherings with crowd-friendly menu options.",
    images: [
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 4,
    slug: "rajputana-grand-caterers",
    name: "Rajputana Grand Caterers",
    location: "C-Scheme, Jaipur",
    rating: 4.8,
    reviews: 211,
    isVeg: false,
    verified: true,
    cuisines: ["Rajasthani", "Mughlai", "Punjabi"],
    eventTypes: ["Wedding", "Engagement", "Destination Events"],
    specialisations: ["Royal Setup", "Destination Events", "Premium Service"],
    minPax: 100,
    maxPax: 2500,
    priceVeg: 560,
    description:
      "Grand wedding specialists delivering regal spreads, luxury service, and flawless flow.",
    images: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 5,
    slug: "royal-rasoi-collective",
    name: "Royal Rasoi Collective",
    location: "Jagatpura, Jaipur",
    rating: 4.6,
    reviews: 128,
    isVeg: false,
    verified: true,
    cuisines: ["North Indian", "Rajasthani", "Continental"],
    eventTypes: ["Wedding", "Corporate", "Engagement"],
    specialisations: ["Luxury Buffet", "Live Counter", "Premium Service"],
    minPax: 120,
    maxPax: 1800,
    priceVeg: 480,
    description:
      "A polished full-service team for weddings and formal events with wide-format buffet setups.",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543353071-087092ec393a?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 6,
    slug: "saffron-feast-caterers",
    name: "Saffron Feast Caterers",
    location: "Civil Lines, Jaipur",
    rating: 4.7,
    reviews: 156,
    isVeg: true,
    verified: true,
    cuisines: ["Punjabi", "North Indian", "Desserts"],
    eventTypes: ["Wedding", "Anniversary", "Corporate"],
    specialisations: ["Royal Setup", "Traditional Sweets", "Premium Service"],
    minPax: 90,
    maxPax: 1600,
    priceVeg: 520,
    description:
      "Warm North Indian menus with refined sweets counters and well-managed event service teams.",
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 7,
    slug: "chokha-chowka-events",
    name: "Chokha Chowka Events",
    location: "Tonk Road, Jaipur",
    rating: 4.3,
    reviews: 97,
    isVeg: true,
    verified: true,
    cuisines: ["Rajasthani", "Chaat", "North Indian"],
    eventTypes: ["Wedding", "Birthday Party", "Satsang"],
    specialisations: ["Traditional Sweets", "Budget Friendly", "Live Counter"],
    minPax: 60,
    maxPax: 950,
    priceVeg: 340,
    description:
      "A strong pick for festive Jaipur menus, snack counters, and family events with local flavor.",
    images: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2e8c5?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 8,
    slug: "darbar-dining-company",
    name: "Darbar Dining Company",
    location: "Bani Park, Jaipur",
    rating: 4.4,
    reviews: 118,
    isVeg: false,
    verified: true,
    cuisines: ["Mughlai", "Punjabi", "North Indian"],
    eventTypes: ["Wedding", "Corporate", "Destination Events"],
    specialisations: ["Live Grill", "Theme Catering", "Premium Service"],
    minPax: 100,
    maxPax: 1400,
    priceVeg: 450,
    description:
      "Balanced Mughlai and Punjabi event menus with strong execution for larger banquet functions.",
    images: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543353071-087092ec393a?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
    ],
  },
  {
    id: 9,
    slug: "pink-city-feast-co",
    name: "Pink City Feast Co.",
    location: "Vidyadhar Nagar, Jaipur",
    rating: 4.5,
    reviews: 134,
    isVeg: true,
    verified: true,
    cuisines: ["South Indian", "Continental", "North Indian"],
    eventTypes: ["Corporate", "Birthday Party", "Wedding Anniversary"],
    specialisations: ["Quick Service", "Snack Counters", "Corporate Caterer"],
    minPax: 40,
    maxPax: 850,
    priceVeg: 380,
    description:
      "Flexible multi-cuisine catering for modern city events, office parties, and polished private functions.",
    images: [
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=900&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80&auto=format&fit=crop",
    ],
  },
];

export const VENDOR_DETAILS = {
  "keemti-gupta-halwai": {
    slug: "keemti-gupta-halwai",
    name: "Keemti Gupta Halwai",
    tagline: "Pioneers of Authentic Rajasthani Cuisine Since 1985",
    location: "Plot 14, Near Mansarovar Metro, Jaipur",
    phone: "+91 98765 43210",
    rating: 4.2,
    reviewsCount: 89,
    totalBookings: 340,
    yearsActive: 39,
    isVeg: false,
    verified: true,
    fssaiNo: "12345678901234",
    about:
      "Keemti Gupta Halwai has been the heart of Jaipur celebrations for nearly four decades. From intimate family gatherings to grand royal wedding feasts, we bring authentic Rajasthani flavours with freshness and precision. Our team of 40+ trained cooks has served 300+ events across Jaipur.",
    cuisines: ["North Indian", "Rajasthani", "Mughlai", "Chaat"],
    specialisations: ["Live Counter", "Royal Setup", "Premium / Luxury"],
    eventTypes: [
      "Wedding",
      "Birthday Party",
      "Corporate Event / Office Party",
      "Wedding Anniversary",
      "Satsang / Pooja",
      "Retirement Party",
    ],
    minPax: 50,
    maxPax: 2000,
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1400&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1400&q=80&auto=format&fit=crop",
    ],
    highlights: [
      { icon: "ShieldCheck", label: "FSSAI Certified" },
      { icon: "Users", label: "340+ Events" },
      { icon: "Star", label: "4.2 Rating" },
      { icon: "Clock", label: "Since 1985" },
      { icon: "ChefHat", label: "40+ Cooks" },
      { icon: "Award", label: "MH Verified" },
    ],
    packages: [
      {
        id: "bronze",
        name: "Bronze",
        pricePerPlate: 300,
        color: "#CD7F32",
        bgColor: "#FDF4EC",
        borderColor: "#CD7F32",
        description: "Best for small gatherings & budget events",
        paxRange: "50-500 guests",
        baseLimit: 8,
        maxLimit: 12,
        categories: [
          {
            name: "Soups",
            items: [
              { name: "Tomato Shorba", isVeg: true, isDefault: true },
              { name: "Sweet Corn Soup", isVeg: true, isDefault: false },
            ],
          },
          {
            name: "Starters",
            items: [
              { name: "Paneer Tikka", isVeg: true, isDefault: true },
              { name: "Veg Manchurian", isVeg: true, isDefault: true },
              { name: "Hara Bhara Kabab", isVeg: true, isDefault: false },
              { name: "Chicken Tikka", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Main Course",
            items: [
              { name: "Dal Tadka", isVeg: true, isDefault: true },
              { name: "Paneer Butter Masala", isVeg: true, isDefault: true },
              { name: "Shahi Paneer", isVeg: true, isDefault: false },
              { name: "Dal Makhani", isVeg: true, isDefault: false },
              { name: "Chicken Curry", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Rice & Breads",
            items: [
              { name: "Steamed Rice", isVeg: true, isDefault: true },
              { name: "Butter Naan", isVeg: true, isDefault: true },
              { name: "Tandoori Roti", isVeg: true, isDefault: false },
              { name: "Veg Biryani", isVeg: true, isDefault: false },
            ],
          },
          {
            name: "Desserts",
            items: [
              { name: "Gulab Jamun", isVeg: true, isDefault: true },
              { name: "Rasgulla", isVeg: true, isDefault: true },
              { name: "Kheer", isVeg: true, isDefault: false },
              { name: "Gajar Ka Halwa", isVeg: true, isDefault: false },
            ],
          },
        ],
      },
      {
        id: "silver",
        name: "Silver",
        pricePerPlate: 500,
        color: "#6B6B6B",
        bgColor: "#F5F5F5",
        borderColor: "#8B8B8B",
        description: "Ideal for weddings & mid-scale events",
        paxRange: "50-500 guests",
        baseLimit: 12,
        maxLimit: 18,
        categories: [
          {
            name: "Soups",
            items: [
              { name: "Tomato Shorba", isVeg: true, isDefault: true },
              { name: "Sweet Corn Soup", isVeg: true, isDefault: true },
              { name: "Lemon Coriander Soup", isVeg: true, isDefault: false },
            ],
          },
          {
            name: "Starters",
            items: [
              { name: "Paneer Tikka", isVeg: true, isDefault: true },
              { name: "Veg Manchurian", isVeg: true, isDefault: true },
              { name: "Hara Bhara Kabab", isVeg: true, isDefault: true },
              { name: "Dahi Ke Sholay", isVeg: true, isDefault: false },
              { name: "Chicken Tikka", isVeg: false, isDefault: true },
              { name: "Seekh Kebab", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Main Course",
            items: [
              { name: "Dal Tadka", isVeg: true, isDefault: true },
              { name: "Paneer Butter Masala", isVeg: true, isDefault: true },
              { name: "Shahi Paneer", isVeg: true, isDefault: true },
              { name: "Dal Makhani", isVeg: true, isDefault: true },
              { name: "Mix Veg", isVeg: true, isDefault: false },
              { name: "Chicken Curry", isVeg: false, isDefault: true },
              { name: "Mutton Rogan Josh", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Rice & Breads",
            items: [
              { name: "Steamed Rice", isVeg: true, isDefault: true },
              { name: "Butter Naan", isVeg: true, isDefault: true },
              { name: "Tandoori Roti", isVeg: true, isDefault: true },
              { name: "Veg Biryani", isVeg: true, isDefault: true },
              { name: "Chicken Biryani", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Desserts",
            items: [
              { name: "Gulab Jamun", isVeg: true, isDefault: true },
              { name: "Rasgulla", isVeg: true, isDefault: true },
              { name: "Kheer", isVeg: true, isDefault: true },
              { name: "Gajar Ka Halwa", isVeg: true, isDefault: false },
              { name: "Kulfi", isVeg: true, isDefault: false },
            ],
          },
        ],
      },
      {
        id: "gold",
        name: "Gold",
        pricePerPlate: 800,
        color: "#D4A017",
        bgColor: "#FFFBEC",
        borderColor: "#D4A017",
        description: "Grand weddings & premium events",
        paxRange: "100-2000 guests",
        baseLimit: 15,
        maxLimit: 25,
        categories: [
          {
            name: "Welcome Drinks",
            items: [
              { name: "Rose Sharbat", isVeg: true, isDefault: true },
              { name: "Mango Lassi", isVeg: true, isDefault: true },
              { name: "Fresh Lime Soda", isVeg: true, isDefault: false },
            ],
          },
          {
            name: "Soups",
            items: [
              { name: "Tomato Shorba", isVeg: true, isDefault: true },
              { name: "Sweet Corn Soup", isVeg: true, isDefault: true },
              { name: "Lemon Coriander Soup", isVeg: true, isDefault: true },
            ],
          },
          {
            name: "Starters",
            items: [
              { name: "Paneer Tikka", isVeg: true, isDefault: true },
              { name: "Veg Manchurian", isVeg: true, isDefault: true },
              { name: "Hara Bhara Kabab", isVeg: true, isDefault: true },
              { name: "Dahi Ke Sholay", isVeg: true, isDefault: true },
              { name: "Chicken Tikka", isVeg: false, isDefault: true },
              { name: "Seekh Kebab", isVeg: false, isDefault: true },
              { name: "Fish Tikka", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Main Course",
            items: [
              { name: "Dal Tadka", isVeg: true, isDefault: true },
              { name: "Paneer Butter Masala", isVeg: true, isDefault: true },
              { name: "Shahi Paneer", isVeg: true, isDefault: true },
              { name: "Dal Makhani", isVeg: true, isDefault: true },
              { name: "Mix Veg", isVeg: true, isDefault: true },
              { name: "Kadai Paneer", isVeg: true, isDefault: false },
              { name: "Chicken Curry", isVeg: false, isDefault: true },
              { name: "Mutton Rogan Josh", isVeg: false, isDefault: true },
              { name: "Butter Chicken", isVeg: false, isDefault: false },
            ],
          },
          {
            name: "Rice & Breads",
            items: [
              { name: "Steamed Rice", isVeg: true, isDefault: true },
              { name: "Butter Naan", isVeg: true, isDefault: true },
              { name: "Tandoori Roti", isVeg: true, isDefault: true },
              { name: "Veg Biryani", isVeg: true, isDefault: true },
              { name: "Chicken Biryani", isVeg: false, isDefault: true },
              { name: "Laccha Paratha", isVeg: true, isDefault: false },
            ],
          },
          {
            name: "Desserts",
            items: [
              { name: "Gulab Jamun", isVeg: true, isDefault: true },
              { name: "Rasgulla", isVeg: true, isDefault: true },
              { name: "Kheer", isVeg: true, isDefault: true },
              { name: "Gajar Ka Halwa", isVeg: true, isDefault: true },
              { name: "Kulfi", isVeg: true, isDefault: true },
              { name: "Shahi Tukda", isVeg: true, isDefault: false },
            ],
          },
        ],
      },
    ],
    autoAddonPricing: {
      vegPerItemPerPax: 30,
      nonVegPerItemPerPax: 45,
    },
    addons: [
      { name: "Soft Drink", isVeg: true, pricePerPax: 30 },
      { name: "Buttermilk / Chaas", isVeg: true, pricePerPax: 30 },
      { name: "Sweet Lassi", isVeg: true, pricePerPax: 45 },
      { name: "Salted Lassi", isVeg: true, pricePerPax: 40 },
      { name: "Mocktail", isVeg: true, pricePerPax: 70 },
      { name: "Extra Raita", isVeg: true, pricePerPax: 20 },
      { name: "Extra Papad", isVeg: true, pricePerPax: 15 },
      { name: "Ice Cream", isVeg: true, pricePerPax: 40 },
      { name: "Falooda", isVeg: true, pricePerPax: 55 },
      { name: "Kulfi Counter", isVeg: true, pricePerPax: 85 },
      { name: "Chaat Counter", isVeg: true, pricePerPax: 120 },
      { name: "Live Counter", isVeg: true, pricePerPax: 150 },
      { name: "Tea / Coffee Counter", isVeg: true, pricePerPax: 60 },
    ],
    water: {
      mode: "packaged",
      type: "Packaged Water",
      pricePerBottle: 20,
      pricePerPax: 15,
    },
    reviews: [
      {
        id: 1,
        name: "Priya Sharma",
        initials: "PS",
        rating: 5,
        event: "Wedding",
        date: "Feb 2026",
        text: "Absolutely fantastic. The Dal Baati was exceptional and the live chaat counter was the highlight of our wedding!",
      },
      {
        id: 2,
        name: "Rahul Gupta",
        initials: "RG",
        rating: 4,
        event: "Corporate Event",
        date: "Jan 2026",
        text: "Very professional team. Food was hot, fresh and served on time. Silver package was perfect for our 200-person office party.",
      },
      {
        id: 3,
        name: "Sunita Agarwal",
        initials: "SA",
        rating: 4,
        event: "Birthday Party",
        date: "Dec 2025",
        text: "Great value for money. Bronze package had more than enough variety for our 80-person birthday celebration.",
      },
    ],
  },
} as const;

export type VendorDetailFull = (typeof VENDOR_DETAILS)["keemti-gupta-halwai"];

function getAdminVendorBySlug(slug: string) {
  return readAdminVendorsFromBrowser().find((vendor) => vendor.slug === slug) ?? null;
}

function getStaticVendorDetailBySlug(slug: string): VendorDetailFull | null {
  if (!slug) return null;
  try {
    const direct = VENDOR_DETAILS[slug as keyof typeof VENDOR_DETAILS];
    if (direct) {
      return clone(direct) as VendorDetailFull;
    }
    const v = VENDORS.find((x) => x.slug === slug);
    if (!v) return null;

    const detail = clone(VENDOR_DETAILS["keemti-gupta-halwai"]) as Record<string, unknown>;

    const base = v.priceVeg;
    const silver = Math.round((base * 500) / 300);
    const gold = Math.round((base * 800) / 300);

    const pkgs = detail.packages as unknown as Array<Record<string, unknown> & { id: string; pricePerPlate: number }>;
    detail.packages = pkgs.map((pkg) => {
      const nextPrice: number =
        pkg.id === "bronze" ? base : pkg.id === "silver" ? silver : pkg.id === "gold" ? gold : pkg.pricePerPlate;
      return { ...pkg, pricePerPlate: nextPrice };
    }) as unknown as VendorDetailFull["packages"];

    detail.slug = v.slug;
    detail.name = v.name;
    detail.tagline = v.cuisines.slice(0, 2).join(" & ") + " · Trusted catering";
    detail.location = v.location.includes("Jaipur") ? v.location : v.location + ", Jaipur";
    detail.phone = "+91 98765 43210";
    detail.rating = v.rating;
    detail.reviewsCount = v.reviews;
    detail.totalBookings = 120 + v.id * 95;
    detail.yearsActive = 10 + v.id * 5;
    detail.isVeg = v.isVeg;
    detail.about = v.description;
    detail.cuisines = [...v.cuisines];
    detail.specialisations = [...v.specialisations];
    detail.eventTypes = mapListingEventTypesToDetail(v.eventTypes);
    detail.minPax = v.minPax;
    detail.maxPax = v.maxPax;
    detail.images = [...v.images];
    detail.highlights = [
      { icon: "ShieldCheck", label: "FSSAI Certified" },
      { icon: "Users", label: `${Math.min(900, 80 + v.reviews * 8)}+ Events` },
      { icon: "Star", label: `${v.rating} Rating` },
      { icon: "Clock", label: `Since ${2010 + v.id}` },
      { icon: "ChefHat", label: "25+ Cooks" },
      { icon: "Award", label: "MH Verified" },
    ];
    detail.reviews = [
      {
        id: 1,
        name: "Aarav M.",
        initials: "AM",
        rating: 5,
        event: v.eventTypes[0] ?? "Wedding",
        date: "Feb 2026",
        text: `Excellent spread and service from ${v.name}. Guests loved the mains and desserts.`,
      },
      {
        id: 2,
        name: "Neha K.",
        initials: "NK",
        rating: 4,
        event: v.eventTypes[1] ?? "Party",
        date: "Jan 2026",
        text: "On-time setup, polite staff, and generous portions. Would book again.",
      },
      {
        id: 3,
        name: "Vikram S.",
        initials: "VS",
        rating: 5,
        event: "Family Event",
        date: "Dec 2025",
        text: "Transparent pricing and tasty food. The team handled our guest count smoothly.",
      },
    ];

    return detail as VendorDetailFull;
  } catch {
    return null;
  }
}

function mapAdminVendorToDetail(vendor: BrowserAdminVendor): VendorDetailFull {
  const templateSlug = vendor.menuType === "veg_only" ? "keemti-gupta-halwai" : "rajputana-grand-caterers";
  const template = clone(
    getStaticVendorDetailBySlug(templateSlug) ?? VENDOR_DETAILS["keemti-gupta-halwai"]
  ) as Record<string, unknown>;

  const listing = mapAdminVendorToListing(vendor, 0);

  template.slug = vendor.slug;
  template.name = vendor.name;
  template.tagline = vendor.shortDescription || `${listing.cuisines.slice(0, 2).join(" & ")} catering for structured bookings`;
  template.location = [vendor.locality, vendor.city, "Rajasthan"].filter(Boolean).join(", ") || "Jaipur, Rajasthan";
  template.phone = vendor.phone || vendor.whatsapp || "+91 90000 11111";
  template.rating = vendor.displayedRating || 4.5;
  template.reviewsCount = Math.max(24, (vendor.totalOrders ?? 0) * 4 || 24);
  template.totalBookings = Math.max(vendor.totalOrders ?? 0, 12);
  template.yearsActive = 8;
  template.isVeg = vendor.menuType === "veg_only";
  template.about = vendor.about || vendor.shortDescription || String(template.about || "");
  template.cuisines = listing.cuisines;
  template.specialisations = listing.specialisations;
  template.eventTypes = vendor.eventSpecialization?.length ? vendor.eventSpecialization : (template.eventTypes as string[]);
  template.minPax = 10;
  template.maxPax = 2000;
  template.images = listing.images;
  template.highlights = [
    { icon: "ShieldCheck", label: "MH Verified" },
    { icon: "Users", label: `${Math.max(vendor.totalOrders ?? 0, 12)}+ Bookings` },
    { icon: "Star", label: `${template.rating} Rating` },
    { icon: "Clock", label: "Structured Packages" },
    { icon: "ChefHat", label: template.isVeg ? "Veg Menu" : "Veg & Non-Veg" },
    { icon: "Award", label: vendor.googlePlaceId ? "Google Reviews Ready" : "Admin Managed" },
  ];

  template.packages = (template.packages as VendorDetailFull["packages"]).map((pkg) => {
    const adminPackage = vendor.packages?.[pkg.id];
    if (!adminPackage) return pkg;
    const categorySource = adminPackage.categoryRules?.length
      ? adminPackage.categoryRules
      : Object.keys(adminPackage.menuItems ?? {}).map((categoryKey) => ({
          categoryKey,
          label: categoryKey,
        }));
    return {
      ...pkg,
      name: adminPackage.name || pkg.name,
      pricePerPlate: adminPackage.pricePerPlate || pkg.pricePerPlate,
      description: adminPackage.shortNote || adminPackage.customerLabel || pkg.description,
      categories: categorySource.map((category) => ({
        name: category.label,
        items: (adminPackage.menuItems?.[category.categoryKey] ?? []).map((item) => ({
          name: item.name,
          isVeg: item.isVeg,
          isDefault: item.defaultSelected,
        })),
      })),
    };
  });

  template.addons = (vendor.addons ?? [])
    .filter((addon) => addon.enabled)
    .map((addon) => ({
      name: addon.name,
      isVeg: addon.isVeg,
      pricePerPax: addon.pricePerPax,
    }));

  template.water = {
    mode: vendor.water?.mode === "ro" ? "ro" : vendor.water?.mode === "packaged" ? "packaged" : "packaged",
    type:
      vendor.water?.mode === "ro"
        ? "RO Water"
        : vendor.water?.mode === "both"
          ? "RO / Packaged Water"
          : "Packaged Water",
    pricePerBottle: vendor.water?.packagedPricePerPax ?? 20,
    pricePerPax:
      vendor.water?.defaultSelection === "ro"
        ? vendor.water?.roPricePerPax ?? 8
        : vendor.water?.packagedPricePerPax ?? 15,
  };

  return template as VendorDetailFull;
}

function mapListingEventTypesToDetail(raw: string[]): string[] {
  const map: Record<string, string> = {
    Corporate: "Corporate Event / Office Party",
    Satsang: "Satsang / Pooja",
    Engagement: "Wedding Anniversary",
    "Destination Events": "Wedding",
    Anniversary: "Wedding Anniversary",
  };
  const out: string[] = [];
  for (const e of raw) {
    out.push(map[e] ?? e);
  }
  const uniq = [...new Set(out)];
  return uniq.length ? uniq : ["Wedding", "Birthday Party"];
}

export function getVendorDetailBySlug(slug: string): VendorDetailFull | null {
  const adminVendor = getAdminVendorBySlug(slug);
  if (adminVendor) {
    return mapAdminVendorToDetail(adminVendor);
  }
  return getStaticVendorDetailBySlug(slug);
}

export const MASTER_MENU = [
  {
    name: "Soups",
    items: [
      { name: "Tomato Soup", isVeg: true },
      { name: "Sweet Corn Soup", isVeg: true },
      { name: "Veg Clear Soup", isVeg: true },
      { name: "Lemon Coriander Soup", isVeg: true },
      { name: "Hot & Sour Veg Soup", isVeg: true },
      { name: "Manchow Veg Soup", isVeg: true },
      { name: "Chicken Sweet Corn Soup", isVeg: false },
      { name: "Chicken Clear Soup", isVeg: false },
      { name: "Chicken Lemon Coriander Soup", isVeg: false },
      { name: "Chicken Hot & Sour Soup", isVeg: false },
      { name: "Chicken Manchow Soup", isVeg: false },
    ],
  },
  {
    name: "Veg Starters",
    items: [
      { name: "Paneer Tikka", isVeg: true },
      { name: "Paneer Malai Tikka", isVeg: true },
      { name: "Achari Paneer Tikka", isVeg: true },
      { name: "Paneer Pakora", isVeg: true },
      { name: "Hara Bhara Kabab", isVeg: true },
      { name: "Veg Cutlet", isVeg: true },
      { name: "Veg Spring Roll", isVeg: true },
      { name: "Veg Manchurian Dry", isVeg: true },
      { name: "Crispy Corn", isVeg: true },
      { name: "Baby Corn Fry", isVeg: true },
      { name: "Mushroom Tikka", isVeg: true },
      { name: "Cheese Corn Balls", isVeg: true },
      { name: "Aloo Tikki", isVeg: true },
      { name: "Dahi ke Kabab", isVeg: true },
    ],
  },
  {
    name: "Non-Veg Starters",
    items: [
      { name: "Chicken Tikka", isVeg: false },
      { name: "Chicken Malai Tikka", isVeg: false },
      { name: "Chicken Seekh Kabab", isVeg: false },
      { name: "Chicken Pakora", isVeg: false },
      { name: "Chicken 65", isVeg: false },
      { name: "Chicken Reshmi Kabab", isVeg: false },
      { name: "Fish Finger", isVeg: false },
      { name: "Fish Fry", isVeg: false },
      { name: "Fish Tikka", isVeg: false },
      { name: "Mutton Seekh Kabab", isVeg: false },
    ],
  },
  {
    name: "Veg Main Course",
    items: [
      { name: "Paneer Butter Masala", isVeg: true },
      { name: "Shahi Paneer", isVeg: true },
      { name: "Kadai Paneer", isVeg: true },
      { name: "Palak Paneer", isVeg: true },
      { name: "Matar Paneer", isVeg: true },
      { name: "Paneer Lababdar", isVeg: true },
      { name: "Paneer Do Pyaza", isVeg: true },
      { name: "Paneer Tikka Masala", isVeg: true },
      { name: "Paneer Pasanda", isVeg: true },
      { name: "Paneer Methi Malai", isVeg: true },
      { name: "Achari Paneer", isVeg: true },
      { name: "Handi Paneer", isVeg: true },
      { name: "Malai Kofta", isVeg: true },
      { name: "Veg Kofta Curry", isVeg: true },
      { name: "Mix Veg", isVeg: true },
      { name: "Veg Jalfrezi", isVeg: true },
      { name: "Dum Aloo", isVeg: true },
      { name: "Aloo Matar", isVeg: true },
      { name: "Aloo Gobi", isVeg: true },
      { name: "Chole Masala", isVeg: true },
      { name: "Mushroom Masala", isVeg: true },
      { name: "Bhindi Masala", isVeg: true },
      { name: "Sarson ka Saag", isVeg: true },
      { name: "Tawa Veg", isVeg: true },
    ],
  },
  {
    name: "Non-Veg Main Course",
    items: [
      { name: "Butter Chicken", isVeg: false },
      { name: "Chicken Curry", isVeg: false },
      { name: "Chicken Kadai", isVeg: false },
      { name: "Chicken Handi", isVeg: false },
      { name: "Chicken Masala", isVeg: false },
      { name: "Chicken Do Pyaza", isVeg: false },
      { name: "Mutton Curry", isVeg: false },
      { name: "Mutton Rogan Josh", isVeg: false },
      { name: "Mutton Masala", isVeg: false },
      { name: "Fish Curry", isVeg: false },
      { name: "Fish Masala", isVeg: false },
      { name: "Fish Hara Masala", isVeg: false },
    ],
  },
  {
    name: "Dal / Kadhi / Legumes",
    items: [
      { name: "Dal Tadka", isVeg: true },
      { name: "Dal Fry", isVeg: true },
      { name: "Dal Makhani", isVeg: true },
      { name: "Jain Dal", isVeg: true },
      { name: "Masoor Dal", isVeg: true },
      { name: "Urad Dal", isVeg: true },
      { name: "Chana Dal", isVeg: true },
      { name: "Rajma Masala", isVeg: true },
      { name: "Chole", isVeg: true },
      { name: "Kala Chana", isVeg: true },
      { name: "Kadhi Pakoda", isVeg: true },
      { name: "Punjabi Kadhi", isVeg: true },
    ],
  },
  {
    name: "Rice / Biryani",
    items: [
      { name: "Steamed Rice", isVeg: true },
      { name: "Jeera Rice", isVeg: true },
      { name: "Veg Pulao", isVeg: true },
      { name: "Veg Dum Biryani", isVeg: true },
      { name: "Kashmiri Pulao", isVeg: true },
      { name: "Ghee Rice", isVeg: true },
      { name: "Lemon Rice", isVeg: true },
      { name: "Curd Rice", isVeg: true },
      { name: "Bisi Bele Bath", isVeg: true },
      { name: "Zarda / Meethe Chawal", isVeg: true },
      { name: "Chicken Biryani", isVeg: false },
      { name: "Mutton Biryani", isVeg: false },
      { name: "Egg Biryani", isVeg: false },
    ],
  },
  {
    name: "Indian Breads",
    items: [
      { name: "Phulka / Chapati", isVeg: true },
      { name: "Tandoori Roti", isVeg: true },
      { name: "Butter Tandoori Roti", isVeg: true },
      { name: "Plain Naan", isVeg: true },
      { name: "Butter Naan", isVeg: true },
      { name: "Garlic Naan", isVeg: true },
      { name: "Kulcha", isVeg: true },
      { name: "Missi Roti", isVeg: true },
      { name: "Lachha Paratha", isVeg: true },
      { name: "Rumali Roti", isVeg: true },
      { name: "Poori", isVeg: true },
      { name: "Bhakri", isVeg: true },
      { name: "Makki di Roti", isVeg: true },
    ],
  },
  {
    name: "Accompaniments",
    items: [
      { name: "Plain Raita", isVeg: true },
      { name: "Boondi Raita", isVeg: true },
      { name: "Mix Veg Raita", isVeg: true },
      { name: "Curd", isVeg: true },
      { name: "Green Salad", isVeg: true },
      { name: "Onion Salad", isVeg: true },
      { name: "Papad", isVeg: true },
      { name: "Green Chutney", isVeg: true },
      { name: "Mint Chutney", isVeg: true },
      { name: "Pickle", isVeg: true },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Gulab Jamun", isVeg: true },
      { name: "Rasgulla", isVeg: true },
      { name: "Jalebi", isVeg: true },
      { name: "Gajar Halwa", isVeg: true },
      { name: "Suji Halwa", isVeg: true },
      { name: "Kheer", isVeg: true },
      { name: "Ras Malai", isVeg: true },
      { name: "Moong Dal Halwa", isVeg: true },
      { name: "Kulfi", isVeg: true },
    ],
  },
] as const;
