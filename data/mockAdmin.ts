"use client";

import { DEMO_ORDERS, DEMO_USER, type DemoAddress, type DemoOrder } from "@/data/mockAccount";
import { VENDORS, getVendorDetailBySlug } from "@/data/vendors";
import type { BookingCategoryKey, FoodPreference, PackageTier } from "@/store/bookingStore";

export type AdminRole = "admin";
export type AdminOrderStatus =
  | "bookingRequestSubmitted"
  | "slotHeld"
  | "pendingAdminReview"
  | "vendorNotified"
  | "vendorConfirmed"
  | "vendorDeclined"
  | "paymentLinkSent"
  | "paymentPending"
  | "paymentDone"
  | "bookingConfirmed"
  | "cancelled"
  | "expired";

export type AdminPaymentStatus = "notStarted" | "linkSent" | "pending" | "paid" | "cancelled";
export type AdminAuthType = "google" | "otp";
export type VendorResponseStatus = "awaiting" | "confirmed" | "declined";
export type VendorMenuType = "veg_only" | "veg_and_non_veg";
export type CustomerAddressLabel = "Home" | "Work" | "Other";

export type AdminCategoryConfig = {
  categoryKey: BookingCategoryKey;
  label: string;
  minRequired: number;
  includedCount: number;
  maxSelectableCount: number;
};

export type AdminMenuItem = {
  id: string;
  name: string;
  image: string;
  subtitle: string;
  isVeg: boolean;
  available: boolean;
  defaultSelected: boolean;
  autoAddonCapable: boolean;
  sortOrder: number;
};

export type AdminVendorPackageConfig = {
  id: PackageTier;
  name: string;
  enabled: boolean;
  pricePerPlate: number;
  shortNote: string;
  customerLabel: string;
  categoryRules: AdminCategoryConfig[];
  menuItems: Record<BookingCategoryKey, AdminMenuItem[]>;
  autoAddonPricing: {
    vegPerItemPerPax: number;
    nonVegPerItemPerPax: number;
  };
};

export type AdminOptionalAddon = {
  id: string;
  name: string;
  isVeg: boolean;
  pricePerPax: number;
  enabled: boolean;
  sortOrder: number;
};

export type AdminWaterConfig = {
  enabled: boolean;
  mode: "ro" | "packaged" | "both";
  roPricePerPax: number;
  packagedPricePerPax: number;
  defaultSelection: "ro" | "packaged";
};

export type AdminVendorRecord = {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  locality: string;
  eventSpecialization: string[];
  coverPhoto: string;
  gallery: string[];
  menuType: VendorMenuType;
  paxSlabs: string[];
  shortDescription: string;
  about: string;
  displayedRating: number;
  googlePlaceId?: string;
  googleReviewsEnabled?: boolean;
  status: "active" | "inactive";
  totalOrders: number;
  lastUpdated: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    holderName: string;
    ifsc: string;
    cancelledChequeUrl: string;
  };
  packages: Record<PackageTier, AdminVendorPackageConfig>;
  addons: AdminOptionalAddon[];
  water: AdminWaterConfig;
};

export type AdminCustomerAddress = DemoAddress & {
  label: CustomerAddressLabel;
};

export type AdminCustomerRecord = {
  id: string;
  name: string;
  firstName: string;
  phone: string;
  email: string;
  whatsapp: string;
  authType: AdminAuthType;
  totalOrders: number;
  lifetimeSpend: number;
  lastBooking: string;
  status: "active" | "blocked";
  savedAddresses: AdminCustomerAddress[];
  notes: string;
};

export type AdminOrderActivity = {
  id: string;
  actor: string;
  label: string;
  helper: string;
  at: string;
};

export type AdminInternalNote = {
  id: string;
  author: string;
  note: string;
  createdAt: string;
};

export type AdminOrderRecord = {
  id: string;
  createdAt: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    whatsapp: string;
    authType: AdminAuthType;
  };
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  vendorWhatsapp: string;
  vendorSlug: string;
  vendorLocation: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  foodPreference: FoodPreference;
  packageTier: PackageTier;
  packageName: string;
  pricePerPlate: number;
  total: number;
  bill: DemoOrder["bill"];
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  slotHoldEndsAt: string | null;
  vendorToken: string;
  vendorResponseStatus: VendorResponseStatus;
  vendorLastNotifiedAt: string | null;
  vendorLastRespondedAt: string | null;
  paymentLinkSentAt: string | null;
  paymentReference: string;
  paymentNotes: string;
  venue: {
    venueName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    latitude?: number;
    longitude?: number;
  };
  menuSummary: {
    groupedCategories: DemoOrder["menuGroups"];
    autoAddOnItems: string[];
    optionalAddOns: string[];
    waterSelection: string;
    catererNote: string;
  };
  activity: AdminOrderActivity[];
  internalNotes: AdminInternalNote[];
  invoiceNumber: string | null;
  invoiceAvailable: boolean;
};

export type AdminInvoiceRecord = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  vendorName: string;
  amount: number;
  gst: number;
  createdDate: string;
  paymentStatus: AdminPaymentStatus;
};

export type AdminCouponRecord = {
  id: string;
  code: string;
  type: "flat" | "percentage";
  value: number;
  minOrderValue: number;
  usage: number;
  expiry: string;
  status: "active" | "inactive";
  validFrom: string;
  validTill: string;
  applicablePackages: PackageTier[];
};

export type AdminTemplateRecord = {
  id: string;
  name: string;
  triggerEvent: string;
  channel: "email" | "whatsapp" | "sms";
  body: string;
  lastUpdated: string;
  group: "booking" | "vendor" | "payment" | "emailTemplates" | "whatsappTemplates";
};

export type AdminSettings = {
  platformName: string;
  defaultCity: string;
  supportEmail: string;
  supportPhone: string;
  adminNotificationEmail: string;
  gstRate: number;
  convenienceFee: number;
  slotHoldDurationMinutes: number;
  paymentReminderHours: number;
  paymentLinkProvider: string;
  paymentLinkEnabled: boolean;
  categoryMaster: Array<{ key: BookingCategoryKey; label: string }>;
  paxSlabMaster: string[];
};

export type AdminSystemActivity = {
  id: string;
  label: string;
  helper: string;
  at: string;
  tone: "neutral" | "success" | "warning" | "danger";
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  avatar: string;
  lastLogin: string;
};

export type AdminSession = {
  userId: string;
  email: string;
  role: AdminRole;
  name: string;
  loggedInAt: string;
};

export type AdminState = {
  admins: AdminUser[];
  vendors: AdminVendorRecord[];
  customers: AdminCustomerRecord[];
  orders: AdminOrderRecord[];
  invoices: AdminInvoiceRecord[];
  coupons: AdminCouponRecord[];
  templates: AdminTemplateRecord[];
  settings: AdminSettings;
  activityFeed: AdminSystemActivity[];
};

export const ADMIN_EMAIL = "admin@merahalwai.com";
export const ADMIN_PASSWORD = "admin123";
const ADMIN_STATE_KEY = "mh_admin_state_v1";
const ADMIN_SESSION_KEY = "mh_admin_session_v1";

function canUseBrowser() {
  return typeof window !== "undefined";
}

function iso(date: string) {
  return new Date(date).toISOString();
}

const categoryLabelMap: Record<BookingCategoryKey, string> = {
  soupsDrinks: "Soups / Drinks",
  starters: "Starters",
  mainCourse: "Main Course",
  riceBreads: "Rice & Breads",
  desserts: "Desserts",
};

const packageCategoryDefaults: Record<PackageTier, AdminCategoryConfig[]> = {
  bronze: [
    { categoryKey: "soupsDrinks", label: "Soups / Drinks", minRequired: 0, includedCount: 1, maxSelectableCount: 1 },
    { categoryKey: "starters", label: "Starters", minRequired: 1, includedCount: 2, maxSelectableCount: 3 },
    { categoryKey: "mainCourse", label: "Main Course", minRequired: 2, includedCount: 3, maxSelectableCount: 4 },
    { categoryKey: "riceBreads", label: "Rice & Breads", minRequired: 1, includedCount: 2, maxSelectableCount: 2 },
    { categoryKey: "desserts", label: "Desserts", minRequired: 1, includedCount: 1, maxSelectableCount: 2 },
  ],
  silver: [
    { categoryKey: "soupsDrinks", label: "Soups / Drinks", minRequired: 0, includedCount: 1, maxSelectableCount: 2 },
    { categoryKey: "starters", label: "Starters", minRequired: 2, includedCount: 4, maxSelectableCount: 5 },
    { categoryKey: "mainCourse", label: "Main Course", minRequired: 3, includedCount: 4, maxSelectableCount: 6 },
    { categoryKey: "riceBreads", label: "Rice & Breads", minRequired: 1, includedCount: 2, maxSelectableCount: 3 },
    { categoryKey: "desserts", label: "Desserts", minRequired: 1, includedCount: 1, maxSelectableCount: 2 },
  ],
  gold: [
    { categoryKey: "soupsDrinks", label: "Soups / Drinks", minRequired: 0, includedCount: 2, maxSelectableCount: 2 },
    { categoryKey: "starters", label: "Starters", minRequired: 2, includedCount: 5, maxSelectableCount: 6 },
    { categoryKey: "mainCourse", label: "Main Course", minRequired: 3, includedCount: 5, maxSelectableCount: 8 },
    { categoryKey: "riceBreads", label: "Rice & Breads", minRequired: 1, includedCount: 2, maxSelectableCount: 4 },
    { categoryKey: "desserts", label: "Desserts", minRequired: 1, includedCount: 1, maxSelectableCount: 5 },
  ],
};

function getSeedAdmins(): AdminUser[] {
  return [
    {
      id: "mh-super-admin",
      name: "MeraHalwai Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      avatar: "MA",
      lastLogin: iso("2026-04-01T09:05:00+05:30"),
    },
  ];
}

function buildMenuItems(
  packageTier: PackageTier,
  vendorSlug: string,
  menuType: VendorMenuType
): Record<BookingCategoryKey, AdminMenuItem[]> {
  const vendor = getVendorDetailBySlug(vendorSlug);
  const pkg = vendor?.packages.find((entry) => entry.id === packageTier);
  const categories = ((pkg?.categories ?? []) as Array<{
    name: string;
    items: Array<{ name: string; isVeg: boolean; isDefault: boolean }>;
  }>).map((category) => ({
    name: category.name,
    items: category.items.map((item) => ({ ...item })),
  }));

  const result: Record<BookingCategoryKey, AdminMenuItem[]> = {
    soupsDrinks: [],
    starters: [],
    mainCourse: [],
    riceBreads: [],
    desserts: [],
  };

  const alias: Record<string, BookingCategoryKey> = {
    soups: "soupsDrinks",
    "welcome drinks": "soupsDrinks",
    "soups / drinks": "soupsDrinks",
    starters: "starters",
    "veg starters": "starters",
    "non-veg starters": "starters",
    "main course": "mainCourse",
    "veg main course": "mainCourse",
    "non-veg main course": "mainCourse",
    "dal / kadhi / legumes": "mainCourse",
    "rice & breads": "riceBreads",
    "rice / biryani": "riceBreads",
    "indian breads": "riceBreads",
    desserts: "desserts",
  };

  const imageFallback = categories.flatMap((category) => category.items).map((item) => item.name);

  categories.forEach((category, categoryIndex) => {
    const key = alias[category.name.toLowerCase()] ?? (category.name.toLowerCase().includes("rice") || category.name.toLowerCase().includes("bread")
      ? "riceBreads"
      : category.name.toLowerCase().includes("dessert")
        ? "desserts"
        : category.name.toLowerCase().includes("starter")
          ? "starters"
          : category.name.toLowerCase().includes("main")
            ? "mainCourse"
            : "soupsDrinks");

    category.items.forEach((item, itemIndex) => {
      if (menuType === "veg_only" && !item.isVeg) return;
      result[key].push({
        id: `${packageTier}-${key}-${itemIndex}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: item.name,
        image: vendor?.images[(itemIndex + categoryIndex) % (vendor.images.length || 1)] ?? "",
        subtitle: `${categoryLabelMap[key]} · ${item.isVeg ? "Veg" : "Non-Veg"}`,
        isVeg: item.isVeg,
        available: true,
        defaultSelected: item.isDefault,
        autoAddonCapable: true,
        sortOrder: itemIndex,
      });
    });
  });

  for (const key of Object.keys(result) as BookingCategoryKey[]) {
    if (result[key].length > 0) continue;
    const fallbackName = imageFallback[0] ?? `${categoryLabelMap[key]} Special`;
    result[key] = [
      {
        id: `${packageTier}-${key}-fallback`,
        name: fallbackName,
        image: vendor?.images[0] ?? "",
        subtitle: `${categoryLabelMap[key]} · House Special`,
        isVeg: true,
        available: true,
        defaultSelected: true,
        autoAddonCapable: true,
        sortOrder: 0,
      },
    ];
  }

  return result;
}

function buildVendorRecord(slug: string): AdminVendorRecord {
  const detail = getVendorDetailBySlug(slug);
  const listing = VENDORS.find((entry) => entry.slug === slug);
  if (!detail || !listing) {
    throw new Error(`Vendor not found: ${slug}`);
  }

  const menuType: VendorMenuType = detail.isVeg ? "veg_only" : "veg_and_non_veg";
  const orderCount = DEMO_ORDERS.filter((order) => order.vendorSlug === slug).length;

  const packageConfig = detail.packages.reduce((acc, pkg) => {
    const tier = pkg.id as PackageTier;
    acc[tier] = {
      id: tier,
      name: pkg.name,
      enabled: true,
      pricePerPlate: pkg.pricePerPlate,
      shortNote: pkg.description,
      customerLabel: tier === "bronze" ? "Small events" : tier === "silver" ? "Most popular" : "Premium",
      categoryRules: packageCategoryDefaults[tier].map((rule) => ({ ...rule })),
      menuItems: buildMenuItems(tier, slug, menuType),
      autoAddonPricing: {
        vegPerItemPerPax: detail.autoAddonPricing.vegPerItemPerPax,
        nonVegPerItemPerPax: detail.autoAddonPricing.nonVegPerItemPerPax,
      },
    };
    return acc;
  }, {} as Record<PackageTier, AdminVendorPackageConfig>);

  return {
    id: slug,
    slug,
    name: detail.name,
    ownerName: `${detail.name.split(" ")[0]} Hospitality Team`,
    phone: detail.phone,
    whatsapp: detail.phone,
    email: `${slug.replace(/-/g, ".")}@merahalwai-demo.com`,
    address: detail.location,
    city: "Jaipur",
    pincode: "302001",
    locality: listing.location,
    eventSpecialization: detail.eventTypes.slice(0, 3),
    coverPhoto: detail.images[0] ?? "",
    gallery: [...detail.images],
    menuType,
    paxSlabs: ["50-100", "100-200", "200-500", "500-1000", "1000+"],
    shortDescription: listing.description,
    about: detail.about,
    displayedRating: detail.rating,
    googlePlaceId: "",
    googleReviewsEnabled: true,
    status: "active",
    totalOrders: orderCount,
    lastUpdated: iso("2026-03-31T17:00:00+05:30"),
    bankInfo: {
      bankName: "HDFC Bank",
      accountNumber: `XXXXXX${1000 + listing.id}`,
      holderName: detail.name,
      ifsc: "HDFC0001234",
      cancelledChequeUrl: detail.images[1] ?? detail.images[0] ?? "",
    },
    packages: packageConfig,
    addons: detail.addons.map((addon, index) => ({
      id: `${slug}-addon-${index + 1}`,
      name: addon.name,
      isVeg: addon.isVeg,
      pricePerPax: addon.pricePerPax,
      enabled: true,
      sortOrder: index,
    })),
    water: {
      enabled: true,
      mode: detail.water.mode === "packaged" ? "packaged" : "both",
      roPricePerPax: 8,
      packagedPricePerPax: detail.water.pricePerPax,
      defaultSelection: detail.water.mode === "packaged" ? "packaged" : "ro",
    },
  };
}

const seedCustomerProfiles: Array<Omit<AdminCustomerRecord, "totalOrders" | "lifetimeSpend" | "lastBooking">> = [
  {
    id: "cust-priya",
    name: DEMO_USER.fullName,
    firstName: DEMO_USER.firstName,
    phone: DEMO_USER.phone,
    email: DEMO_USER.email,
    whatsapp: DEMO_USER.whatsapp,
    authType: "google",
    status: "active",
    savedAddresses: DEMO_USER.savedAddresses.map((address) => ({ ...address, label: "Home" })),
    notes: "Prefers WhatsApp updates for wedding bookings.",
  },
  {
    id: "cust-ankit",
    name: "Ankit Soni",
    firstName: "Ankit",
    phone: "+91 9988776611",
    email: "ankit.soni@example.com",
    whatsapp: "+91 9988776611",
    authType: "otp",
    status: "active",
    savedAddresses: [
      {
        id: "ankit-office",
        label: "Work",
        venueName: "Soni Corporate Hub",
        address: "MI Road Business Tower, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
      },
    ],
    notes: "Corporate client, usually books weekday lunch events.",
  },
  {
    id: "cust-sunita",
    name: "Sunita Agarwal",
    firstName: "Sunita",
    phone: "+91 9811002200",
    email: "sunita.agarwal@example.com",
    whatsapp: "+91 9811002200",
    authType: "google",
    status: "active",
    savedAddresses: [
      {
        id: "sunita-home",
        label: "Home",
        venueName: "Agarwal Farmhouse",
        address: "Jagatpura Bypass, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302017",
      },
    ],
    notes: "Usually requests live dessert counters.",
  },
  {
    id: "cust-raghav",
    name: "Raghav Bhandari",
    firstName: "Raghav",
    phone: "+91 9829012345",
    email: "raghav.bhandari@example.com",
    whatsapp: "+91 9829012345",
    authType: "otp",
    status: "active",
    savedAddresses: [
      {
        id: "raghav-work",
        label: "Work",
        venueName: "Bhandari Logistics Ground",
        address: "Sitapura Industrial Area, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302022",
      },
    ],
    notes: "Needs quick confirmation because of corporate approvals.",
  },
  {
    id: "cust-kashish",
    name: "Kashish Jain",
    firstName: "Kashish",
    phone: "+91 9818171717",
    email: "kashish.jain@example.com",
    whatsapp: "+91 9818171717",
    authType: "google",
    status: "active",
    savedAddresses: [
      {
        id: "kashish-banquet",
        label: "Other",
        venueName: "Pearl Palace Banquet",
        address: "Bani Park Extension, Jaipur",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302016",
      },
    ],
    notes: "Prefers elegant buffet presentation and soft dessert service.",
  },
];

function buildSeedOrders(customers: AdminCustomerRecord[], vendors: AdminVendorRecord[]): AdminOrderRecord[] {
  const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]));
  const vendorBySlug = Object.fromEntries(vendors.map((vendor) => [vendor.slug, vendor]));
  const assignments: Array<{
    sourceId: string;
    customerId: string;
    status: AdminOrderStatus;
    paymentStatus: AdminPaymentStatus;
    createdAt: string;
    slotHoldEndsAt: string | null;
    vendorLastNotifiedAt: string | null;
    vendorLastRespondedAt: string | null;
    paymentLinkSentAt: string | null;
    paymentReference: string;
    paymentNotes: string;
    invoiceAvailable: boolean;
    invoiceNumber: string | null;
    foodPreference: FoodPreference;
    activity: Omit<AdminOrderActivity, "id">[];
    internalNotes: Omit<AdminInternalNote, "id">[];
  }> = [
    {
      sourceId: "MH240031",
      customerId: "cust-priya",
      status: "bookingRequestSubmitted",
      paymentStatus: "notStarted",
      createdAt: iso("2026-04-01T09:10:00+05:30"),
      slotHoldEndsAt: iso("2026-04-01T11:10:00+05:30"),
      vendorLastNotifiedAt: null,
      vendorLastRespondedAt: null,
      paymentLinkSentAt: null,
      paymentReference: "",
      paymentNotes: "",
      invoiceAvailable: false,
      invoiceNumber: null,
      foodPreference: "veg_nonveg",
      activity: [
        {
          actor: "Customer",
          label: "Booking request submitted",
          helper: "Wedding booking request submitted from customer flow",
          at: iso("2026-04-01T09:10:00+05:30"),
        },
        {
          actor: "System",
          label: "Slot held",
          helper: "Temporary slot hold started for 2 hours",
          at: iso("2026-04-01T09:11:00+05:30"),
        },
      ],
      internalNotes: [
        {
          author: "Admin Desk",
          note: "Call vendor if no action within 30 minutes.",
          createdAt: iso("2026-04-01T09:15:00+05:30"),
        },
      ],
    },
    {
      sourceId: "MH240032",
      customerId: "cust-ankit",
      status: "slotHeld",
      paymentStatus: "notStarted",
      createdAt: iso("2026-04-01T08:20:00+05:30"),
      slotHoldEndsAt: iso("2026-04-01T10:20:00+05:30"),
      vendorLastNotifiedAt: null,
      vendorLastRespondedAt: null,
      paymentLinkSentAt: null,
      paymentReference: "",
      paymentNotes: "",
      invoiceAvailable: false,
      invoiceNumber: null,
      foodPreference: "veg",
      activity: [
        {
          actor: "Customer",
          label: "Booking request submitted",
          helper: "Birthday booking request submitted",
          at: iso("2026-04-01T08:20:00+05:30"),
        },
        {
          actor: "System",
          label: "Slot held",
          helper: "Slot hold active while ops team reviews availability",
          at: iso("2026-04-01T08:21:00+05:30"),
        },
      ],
      internalNotes: [],
    },
    {
      sourceId: "MH240033",
      customerId: "cust-sunita",
      status: "pendingAdminReview",
      paymentStatus: "notStarted",
      createdAt: iso("2026-03-31T18:10:00+05:30"),
      slotHoldEndsAt: iso("2026-04-01T12:10:00+05:30"),
      vendorLastNotifiedAt: null,
      vendorLastRespondedAt: null,
      paymentLinkSentAt: null,
      paymentReference: "",
      paymentNotes: "",
      invoiceAvailable: false,
      invoiceNumber: null,
      foodPreference: "veg_nonveg",
      activity: [
        {
          actor: "System",
          label: "Pending admin review",
          helper: "Ops needs to verify vendor availability and note live counter request",
          at: iso("2026-03-31T18:30:00+05:30"),
        },
      ],
      internalNotes: [
        {
          author: "Admin Desk",
          note: "Customer asked for dessert service near stage.",
          createdAt: iso("2026-03-31T19:00:00+05:30"),
        },
      ],
    },
    {
      sourceId: "MH240034",
      customerId: "cust-raghav",
      status: "vendorNotified",
      paymentStatus: "notStarted",
      createdAt: iso("2026-03-31T14:45:00+05:30"),
      slotHoldEndsAt: iso("2026-04-01T14:45:00+05:30"),
      vendorLastNotifiedAt: iso("2026-03-31T15:10:00+05:30"),
      vendorLastRespondedAt: null,
      paymentLinkSentAt: null,
      paymentReference: "",
      paymentNotes: "",
      invoiceAvailable: false,
      invoiceNumber: null,
      foodPreference: "veg_nonveg",
      activity: [
        {
          actor: "Admin Desk",
          label: "Vendor notified",
          helper: "Vendor link copied and WhatsApp reminder sent",
          at: iso("2026-03-31T15:10:00+05:30"),
        },
      ],
      internalNotes: [
        {
          author: "Admin Desk",
          note: "Awaiting final confirmation from vendor team lead.",
          createdAt: iso("2026-03-31T15:15:00+05:30"),
        },
      ],
    },
    {
      sourceId: "MH240035",
      customerId: "cust-kashish",
      status: "vendorDeclined",
      paymentStatus: "cancelled",
      createdAt: iso("2026-03-30T11:00:00+05:30"),
      slotHoldEndsAt: null,
      vendorLastNotifiedAt: iso("2026-03-30T11:20:00+05:30"),
      vendorLastRespondedAt: iso("2026-03-30T12:15:00+05:30"),
      paymentLinkSentAt: null,
      paymentReference: "",
      paymentNotes: "Vendor declined due to date conflict.",
      invoiceAvailable: false,
      invoiceNumber: null,
      foodPreference: "veg_nonveg",
      activity: [
        {
          actor: "Vendor",
          label: "Vendor declined",
          helper: "Vendor team marked the date unavailable through token link",
          at: iso("2026-03-30T12:15:00+05:30"),
        },
      ],
      internalNotes: [
        {
          author: "Admin Desk",
          note: "Need reassignment to alternative premium vendor.",
          createdAt: iso("2026-03-30T12:20:00+05:30"),
        },
      ],
    },
    {
      sourceId: "MH240036",
      customerId: "cust-priya",
      status: "paymentPending",
      paymentStatus: "pending",
      createdAt: iso("2026-03-31T08:05:00+05:30"),
      slotHoldEndsAt: iso("2026-04-01T08:05:00+05:30"),
      vendorLastNotifiedAt: iso("2026-03-31T08:35:00+05:30"),
      vendorLastRespondedAt: iso("2026-03-31T09:00:00+05:30"),
      paymentLinkSentAt: iso("2026-03-31T09:18:00+05:30"),
      paymentReference: "",
      paymentNotes: "Payment reminder due in 12 hours.",
      invoiceAvailable: true,
      invoiceNumber: "INV-240036",
      foodPreference: "veg",
      activity: [
        {
          actor: "Vendor",
          label: "Vendor confirmed",
          helper: "Vendor accepted the booking through token confirmation link",
          at: iso("2026-03-31T09:00:00+05:30"),
        },
        {
          actor: "Admin Desk",
          label: "Payment link sent",
          helper: "Customer payment request generated",
          at: iso("2026-03-31T09:18:00+05:30"),
        },
      ],
      internalNotes: [],
    },
  ];

  return assignments.map((assignment) => {
    const source = DEMO_ORDERS.find((entry) => entry.id === assignment.sourceId);
    if (!source) {
      throw new Error(`Demo order not found: ${assignment.sourceId}`);
    }
    const customer = customerById[assignment.customerId];
    const vendor = vendorBySlug[source.vendorSlug];
    const packageConfig = vendor.packages[source.packageTier];
    const activity = assignment.activity.map((item, index) => ({
      id: `${source.id}-activity-${index + 1}`,
      ...item,
    }));
    const internalNotes = assignment.internalNotes.map((item, index) => ({
      id: `${source.id}-note-${index + 1}`,
      ...item,
    }));

    return {
      id: source.id,
      createdAt: assignment.createdAt,
      customerId: customer.id,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        whatsapp: customer.whatsapp,
        authType: customer.authType,
      },
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorWhatsapp: vendor.whatsapp,
      vendorSlug: vendor.slug,
      vendorLocation: vendor.locality,
      eventType: source.eventType,
      eventDate: source.eventDate,
      eventTime: source.eventTime,
      guests: source.guests,
      foodPreference: assignment.foodPreference,
      packageTier: source.packageTier,
      packageName: source.packageName,
      pricePerPlate: packageConfig.pricePerPlate,
      total: source.total,
      bill: source.bill,
      status: assignment.status,
      paymentStatus: assignment.paymentStatus,
      slotHoldEndsAt: assignment.slotHoldEndsAt,
      vendorToken: `vendor-${source.id.toLowerCase()}-${vendor.slug}`,
      vendorResponseStatus:
        assignment.status === "vendorConfirmed" ||
        assignment.status === "paymentLinkSent" ||
        assignment.status === "paymentPending" ||
        assignment.status === "paymentDone" ||
        assignment.status === "bookingConfirmed"
          ? "confirmed"
          : assignment.status === "vendorDeclined"
            ? "declined"
            : "awaiting",
      vendorLastNotifiedAt: assignment.vendorLastNotifiedAt,
      vendorLastRespondedAt: assignment.vendorLastRespondedAt,
      paymentLinkSentAt: assignment.paymentLinkSentAt,
      paymentReference: assignment.paymentReference,
      paymentNotes: assignment.paymentNotes,
      venue: {
        venueName: source.venueName,
        address: source.venueAddress,
        city: source.city,
        state: source.state,
        pincode: source.pincode,
        landmark: "",
      },
      menuSummary: {
        groupedCategories: source.menuGroups,
        autoAddOnItems: source.optionalAddOns.slice(0, 1),
        optionalAddOns: source.optionalAddOns,
        waterSelection: source.waterSelection,
        catererNote: source.specialNote,
      },
      activity,
      internalNotes,
      invoiceNumber: assignment.invoiceNumber,
      invoiceAvailable: assignment.invoiceAvailable,
    } satisfies AdminOrderRecord;
  });
}

function buildCustomersFromOrders(orderSeed: ReturnType<typeof buildSeedOrders>): AdminCustomerRecord[] {
  return seedCustomerProfiles.map((customer) => {
    const orders = orderSeed.filter((order) => order.customerId === customer.id);
    return {
      ...customer,
      totalOrders: orders.length,
      lifetimeSpend: orders.reduce((sum, order) => sum + order.total, 0),
      lastBooking: orders[0]?.createdAt ?? iso("2026-03-01T10:00:00+05:30"),
    };
  });
}

function buildSeedState(): AdminState {
  const vendors = VENDORS.slice(0, 8).map((vendor) => buildVendorRecord(vendor.slug));
  const provisionalCustomers = seedCustomerProfiles.map((customer) => ({
    ...customer,
    totalOrders: 0,
    lifetimeSpend: 0,
    lastBooking: iso("2026-03-01T10:00:00+05:30"),
  }));
  const orders = buildSeedOrders(provisionalCustomers, vendors);
  const customers = buildCustomersFromOrders(orders);

  const invoices = orders
    .filter((order) => order.invoiceAvailable && order.invoiceNumber)
    .map((order) => ({
      id: `invoice-${order.id}`,
      invoiceNumber: order.invoiceNumber ?? `INV-${order.id}`,
      orderId: order.id,
      customerName: order.customer.name,
      vendorName: order.vendorName,
      amount: order.bill.finalTotal,
      gst: order.bill.gst,
      createdDate: order.createdAt,
      paymentStatus: order.paymentStatus,
    }));

  const coupons: AdminCouponRecord[] = [
    {
      id: "coupon-wed2500",
      code: "WED2500",
      type: "flat",
      value: 2500,
      minOrderValue: 50000,
      usage: 24,
      expiry: "2026-04-30",
      status: "active",
      validFrom: "2026-04-01",
      validTill: "2026-04-30",
      applicablePackages: ["silver", "gold"],
    },
    {
      id: "coupon-summer8",
      code: "SUMMER8",
      type: "percentage",
      value: 8,
      minOrderValue: 30000,
      usage: 11,
      expiry: "2026-05-15",
      status: "active",
      validFrom: "2026-04-01",
      validTill: "2026-05-15",
      applicablePackages: ["bronze", "silver", "gold"],
    },
  ];

  const templates: AdminTemplateRecord[] = [
    {
      id: "tpl-booking-request",
      name: "Booking request received",
      triggerEvent: "Booking request submitted",
      channel: "whatsapp",
      body: "Hi {{name}}, your booking request for {{vendor}} has been received. Our team is reviewing it now.",
      lastUpdated: iso("2026-03-30T10:30:00+05:30"),
      group: "booking",
    },
    {
      id: "tpl-vendor-notified",
      name: "Vendor notified",
      triggerEvent: "Vendor notified",
      channel: "email",
      body: "Vendor confirmation request sent for order {{order_id}}.",
      lastUpdated: iso("2026-03-29T18:20:00+05:30"),
      group: "vendor",
    },
    {
      id: "tpl-payment-link",
      name: "Payment link sent",
      triggerEvent: "Payment Link Sent",
      channel: "whatsapp",
      body: "Your payment link for order {{order_id}} is ready. Complete payment to confirm your booking.",
      lastUpdated: iso("2026-03-28T13:10:00+05:30"),
      group: "payment",
    },
    {
      id: "tpl-booking-confirmed",
      name: "Booking confirmed",
      triggerEvent: "Booking confirmed",
      channel: "email",
      body: "Your MeraHalwai booking is confirmed. Invoice and event summary are attached.",
      lastUpdated: iso("2026-03-27T11:00:00+05:30"),
      group: "emailTemplates",
    },
  ];

  const settings: AdminSettings = {
    platformName: "MeraHalwai",
    defaultCity: "Jaipur",
    supportEmail: "support@merahalwai.com",
    supportPhone: "+91 90000 11111",
    adminNotificationEmail: "ops@merahalwai.com",
    gstRate: 18,
    convenienceFee: 499,
    slotHoldDurationMinutes: 120,
    paymentReminderHours: 12,
    paymentLinkProvider: "Razorpay",
    paymentLinkEnabled: true,
    categoryMaster: [
      { key: "soupsDrinks", label: "Soups / Drinks" },
      { key: "starters", label: "Starters" },
      { key: "mainCourse", label: "Main Course" },
      { key: "riceBreads", label: "Rice & Breads" },
      { key: "desserts", label: "Desserts" },
    ],
    paxSlabMaster: ["1-50", "50-100", "100-200", "200-500", "500-1000", "1000+"],
  };

  const activityFeed: AdminSystemActivity[] = [
    {
      id: "activity-1",
      label: "Vendor link copied",
      helper: "Rajputana Grand Caterers link copied for order MH240034",
      at: iso("2026-04-01T09:35:00+05:30"),
      tone: "neutral",
    },
    {
      id: "activity-2",
      label: "Payment reminder pending",
      helper: "Order MH240036 needs a payment follow-up within 3 hours",
      at: iso("2026-04-01T09:10:00+05:30"),
      tone: "warning",
    },
    {
      id: "activity-3",
      label: "Vendor declined booking",
      helper: "Order MH240035 needs reassignment urgently",
      at: iso("2026-03-30T12:15:00+05:30"),
      tone: "danger",
    },
  ];

  return {
    admins: getSeedAdmins(),
    vendors,
    customers,
    orders,
    invoices,
    coupons,
    templates,
    settings,
    activityFeed,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeAdminState(state: AdminState, fallback: AdminState): AdminState {
  const next = clone(state);

  next.admins = (next.admins.length ? next.admins : fallback.admins).slice(0, 1).map((admin, index) => ({
    ...admin,
    id: admin.id || fallback.admins[0].id,
    name: admin.name || fallback.admins[0].name,
    email: admin.email || fallback.admins[0].email,
    password: admin.password || fallback.admins[0].password,
    avatar: admin.avatar || fallback.admins[0].avatar,
    lastLogin: admin.lastLogin || fallback.admins[0].lastLogin,
    role: "admin" as const,
  }));

  return next;
}

export function getAdminStatusMeta(status: AdminOrderStatus) {
  const map: Record<
    AdminOrderStatus,
    { label: string; chipClass: string; helper: string }
  > = {
    bookingRequestSubmitted: {
      label: "Booking Request Submitted",
      chipClass: "border-[#E8D7BA] bg-[#FFF8EC] text-[#9A6700]",
      helper: "Customer has submitted the request and awaits review.",
    },
    slotHeld: {
      label: "Slot Held",
      chipClass: "border-[#E0B85B] bg-[#FFF7E2] text-[#9A6700]",
      helper: "Slot is temporarily reserved while ops reviews it.",
    },
    pendingAdminReview: {
      label: "Pending Admin Review",
      chipClass: "border-[#D9B86C] bg-[#FFF8EA] text-[#8A5D14]",
      helper: "Ops needs to review and assign the next action.",
    },
    vendorNotified: {
      label: "Vendor Notified",
      chipClass: "border-[#B9D4EC] bg-[#EFF7FF] text-[#165A8A]",
      helper: "Vendor confirmation link has been shared.",
    },
    vendorConfirmed: {
      label: "Vendor Confirmed",
      chipClass: "border-[#86B98F] bg-[#EDF8F0] text-[#1F7A3F]",
      helper: "Vendor has accepted the booking.",
    },
    vendorDeclined: {
      label: "Vendor Declined",
      chipClass: "border-[#E4B0B0] bg-[#FFF1F1] text-[#B54545]",
      helper: "Vendor declined the booking. Reassign urgently.",
    },
    paymentLinkSent: {
      label: "Payment Link Sent",
      chipClass: "border-[#D8A96F] bg-[#FFF5E8] text-[#8A4D12]",
      helper: "Customer payment link is shared and awaiting action.",
    },
    paymentPending: {
      label: "Payment Pending",
      chipClass: "border-[#D8A96F] bg-[#FFF5E8] text-[#8A4D12]",
      helper: "Vendor confirmed, payment follow-up is pending.",
    },
    paymentDone: {
      label: "Payment Done",
      chipClass: "border-[#6EB57D] bg-[#EAF7ED] text-[#166534]",
      helper: "Payment received successfully.",
    },
    bookingConfirmed: {
      label: "Booking Confirmed",
      chipClass: "border-[#7FBA92] bg-[#ECF8F0] text-[#166534]",
      helper: "The booking is fully confirmed and ready for execution.",
    },
    cancelled: {
      label: "Cancelled",
      chipClass: "border-[#E4B0B0] bg-[#FFF1F1] text-[#B54545]",
      helper: "This order has been cancelled.",
    },
    expired: {
      label: "Expired",
      chipClass: "border-[#D7D7DD] bg-[#F3F4F7] text-[#6D6D75]",
      helper: "Slot hold expired before confirmation.",
    },
  };

  return map[status];
}

export function getAdminPaymentMeta(status: AdminPaymentStatus) {
  const map: Record<AdminPaymentStatus, { label: string; chipClass: string }> = {
    notStarted: { label: "Not Started", chipClass: "border-[#E4E4E9] bg-[#F7F7FA] text-[#6D6D75]" },
    linkSent: { label: "Link Sent", chipClass: "border-[#D8A96F] bg-[#FFF5E8] text-[#8A4D12]" },
    pending: { label: "Pending", chipClass: "border-[#D8A96F] bg-[#FFF5E8] text-[#8A4D12]" },
    paid: { label: "Paid", chipClass: "border-[#6EB57D] bg-[#EAF7ED] text-[#166534]" },
    cancelled: { label: "Cancelled", chipClass: "border-[#E4B0B0] bg-[#FFF1F1] text-[#B54545]" },
  };

  return map[status];
}

function readStorage<T>(key: string, fallback: T): T {
  if (!canUseBrowser()) return clone(fallback);
  const raw = window.localStorage.getItem(key);
  if (!raw) return clone(fallback);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return clone(fallback);
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getAdminState(): AdminState {
  const fallback = buildSeedState();
  return normalizeAdminState(readStorage(ADMIN_STATE_KEY, fallback), fallback);
}

export function persistAdminState(next: AdminState) {
  writeStorage(ADMIN_STATE_KEY, next);
}

export function resetAdminState() {
  const fresh = buildSeedState();
  persistAdminState(fresh);
  return fresh;
}

export function getAdminSession(): AdminSession | null {
  if (!canUseBrowser()) return null;
  const session = readStorage<AdminSession | null>(ADMIN_SESSION_KEY, null);
  if (!session) return null;
  return {
    ...session,
    role: "admin",
  };
}

export function persistAdminSession(session: AdminSession | null) {
  if (!canUseBrowser()) return;
  if (!session) {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    return;
  }
  writeStorage(ADMIN_SESSION_KEY, session);
}

export function authenticateAdmin(email: string, password: string) {
  const state = getAdminState();
  const adminIndex = state.admins.findIndex(
    (entry) => entry.email.toLowerCase() === email.trim().toLowerCase() && entry.password === password
  );
  if (adminIndex < 0) {
    throw new Error("Invalid email or password");
  }
  const admin = state.admins[adminIndex];
  const now = new Date().toISOString();
  state.admins[adminIndex] = {
    ...admin,
    lastLogin: now,
  };
  persistAdminState(state);

  const session: AdminSession = {
    userId: admin.id,
    email: admin.email,
    role: "admin",
    name: admin.name,
    loggedInAt: now,
  };
  persistAdminSession(session);
  return session;
}

export function getAdminUserFromSession(session: AdminSession | null) {
  if (!session) return null;
  const state = getAdminState();
  return state.admins.find((admin) => admin.id === session.userId) ?? state.admins[0] ?? null;
}

export function mutateAdminState(
  updater: (draft: AdminState) => AdminState | void
): AdminState {
  const state = getAdminState();
  const draft = clone(state);
  const maybeNext = updater(draft);
  const next = maybeNext ? maybeNext : draft;
  persistAdminState(next);
  return next;
}

function appendFeedItem(state: AdminState, item: Omit<AdminSystemActivity, "id">) {
  state.activityFeed = [
    {
      id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...item,
    },
    ...state.activityFeed,
  ].slice(0, 25);
}

function updateInvoiceForOrder(state: AdminState, order: AdminOrderRecord) {
  const existingIndex = state.invoices.findIndex((invoice) => invoice.orderId === order.id);
  if (!order.invoiceAvailable || !order.invoiceNumber) {
    if (existingIndex >= 0) {
      state.invoices.splice(existingIndex, 1);
    }
    return;
  }
  const invoice: AdminInvoiceRecord = {
    id: `invoice-${order.id}`,
    invoiceNumber: order.invoiceNumber,
    orderId: order.id,
    customerName: order.customer.name,
    vendorName: order.vendorName,
    amount: order.bill.finalTotal,
    gst: order.bill.gst,
    createdDate: order.paymentLinkSentAt ?? order.createdAt,
    paymentStatus: order.paymentStatus,
  };
  if (existingIndex >= 0) {
    state.invoices[existingIndex] = invoice;
  } else {
    state.invoices.unshift(invoice);
  }
}

function findOrder(state: AdminState, orderId: string) {
  return state.orders.find((order) => order.id === orderId) ?? null;
}

export function notifyVendor(orderId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "vendorNotified";
    order.vendorLastNotifiedAt = now;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Vendor notified",
      helper: "Vendor confirmation link shared over WhatsApp",
      at: now,
    });
    appendFeedItem(state, {
      label: "Vendor notified",
      helper: `${order.vendorName} notified for order ${order.id}`,
      at: now,
      tone: "neutral",
    });
  });
}

export function confirmVendor(orderId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "vendorConfirmed";
    order.vendorResponseStatus = "confirmed";
    order.vendorLastRespondedAt = now;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Vendor confirmed",
      helper: "Vendor confirmed availability for this event",
      at: now,
    });
    appendFeedItem(state, {
      label: "Vendor confirmed",
      helper: `${order.vendorName} confirmed order ${order.id}`,
      at: now,
      tone: "success",
    });
  });
}

export function declineVendor(orderId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "vendorDeclined";
    order.vendorResponseStatus = "declined";
    order.paymentStatus = "cancelled";
    order.vendorLastRespondedAt = now;
    order.slotHoldEndsAt = null;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Vendor declined",
      helper: "Vendor marked the booking unavailable",
      at: now,
    });
    appendFeedItem(state, {
      label: "Vendor declined",
      helper: `${order.vendorName} declined order ${order.id}`,
      at: now,
      tone: "danger",
    });
  });
}

export function sendPaymentLink(orderId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "paymentPending";
    order.paymentStatus = "pending";
    order.paymentLinkSentAt = now;
    order.invoiceAvailable = true;
    order.invoiceNumber = order.invoiceNumber ?? `INV-${order.id}`;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Payment link sent",
      helper: "Payment request shared with customer",
      at: now,
    });
    updateInvoiceForOrder(state, order);
    appendFeedItem(state, {
      label: "Payment link sent",
      helper: `Payment link sent for order ${order.id}`,
      at: now,
      tone: "warning",
    });
  });
}

export function markPaymentDone(orderId: string, reference: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "paymentDone";
    order.paymentStatus = "paid";
    order.paymentReference = reference;
    order.invoiceAvailable = true;
    order.invoiceNumber = order.invoiceNumber ?? `INV-${order.id}`;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Payment received",
      helper: `Payment marked done with reference ${reference}`,
      at: now,
    });
    updateInvoiceForOrder(state, order);
    appendFeedItem(state, {
      label: "Payment done",
      helper: `Payment captured for order ${order.id}`,
      at: now,
      tone: "success",
    });
  });
}

export function confirmBooking(orderId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "bookingConfirmed";
    order.paymentStatus = order.paymentStatus === "paid" ? "paid" : order.paymentStatus;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Booking confirmed",
      helper: "Booking moved to confirmed state",
      at: now,
    });
    appendFeedItem(state, {
      label: "Booking confirmed",
      helper: `${order.id} moved to final confirmed state`,
      at: now,
      tone: "success",
    });
  });
}

export function cancelOrder(orderId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order) return;
    const now = new Date().toISOString();
    order.status = "cancelled";
    order.paymentStatus = "cancelled";
    order.slotHoldEndsAt = null;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Order cancelled",
      helper: "Order cancelled from admin panel",
      at: now,
    });
    appendFeedItem(state, {
      label: "Order cancelled",
      helper: `${order.id} cancelled by ${actor}`,
      at: now,
      tone: "danger",
    });
  });
}

export function reassignVendor(orderId: string, vendorId: string, actor = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    const vendor = state.vendors.find((entry) => entry.id === vendorId);
    if (!order || !vendor) return;
    const now = new Date().toISOString();
    order.vendorId = vendor.id;
    order.vendorSlug = vendor.slug;
    order.vendorName = vendor.name;
    order.vendorPhone = vendor.phone;
    order.vendorWhatsapp = vendor.whatsapp;
    order.vendorLocation = vendor.locality;
    order.vendorResponseStatus = "awaiting";
    order.status = "pendingAdminReview";
    order.vendorLastNotifiedAt = null;
    order.vendorLastRespondedAt = null;
    order.vendorToken = `vendor-${order.id.toLowerCase()}-${vendor.slug}`;
    order.activity.unshift({
      id: `${order.id}-activity-${Date.now()}`,
      actor,
      label: "Vendor reassigned",
      helper: `Vendor changed to ${vendor.name}`,
      at: now,
    });
    appendFeedItem(state, {
      label: "Vendor reassigned",
      helper: `Order ${order.id} moved to ${vendor.name}`,
      at: now,
      tone: "warning",
    });
  });
}

export function addInternalNote(orderId: string, note: string, author = "Admin Desk") {
  return mutateAdminState((state) => {
    const order = findOrder(state, orderId);
    if (!order || !note.trim()) return;
    order.internalNotes.unshift({
      id: `${order.id}-note-${Date.now()}`,
      author,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    });
  });
}

export function updateVendorRecord(vendorId: string, partial: Partial<AdminVendorRecord>) {
  return mutateAdminState((state) => {
    const index = state.vendors.findIndex((vendor) => vendor.id === vendorId);
    if (index < 0) return;
    state.vendors[index] = {
      ...state.vendors[index],
      ...partial,
      lastUpdated: new Date().toISOString(),
    };
  });
}

export function createVendorRecord(input: AdminVendorRecord) {
  return mutateAdminState((state) => {
    state.vendors.unshift({
      ...input,
      lastUpdated: new Date().toISOString(),
    });
  });
}

export function updateCouponRecord(couponId: string, partial: Partial<AdminCouponRecord>) {
  return mutateAdminState((state) => {
    const index = state.coupons.findIndex((coupon) => coupon.id === couponId);
    if (index < 0) return;
    state.coupons[index] = { ...state.coupons[index], ...partial };
  });
}

export function createCouponRecord(coupon: AdminCouponRecord) {
  return mutateAdminState((state) => {
    state.coupons.unshift(coupon);
  });
}

export function updateSettingsRecord(partial: Partial<AdminSettings>) {
  return mutateAdminState((state) => {
    state.settings = { ...state.settings, ...partial };
  });
}

export function updateTemplateRecord(templateId: string, partial: Partial<AdminTemplateRecord>) {
  return mutateAdminState((state) => {
    const index = state.templates.findIndex((template) => template.id === templateId);
    if (index < 0) return;
    state.templates[index] = { ...state.templates[index], ...partial, lastUpdated: new Date().toISOString() };
  });
}

export function getAdminOrderById(orderId: string) {
  return getAdminState().orders.find((order) => order.id === orderId) ?? null;
}

export function getVendorOrderByToken(token: string) {
  return getAdminState().orders.find((order) => order.vendorToken === token) ?? null;
}

export function respondToVendorToken(token: string, response: "confirm" | "decline") {
  const state = getAdminState();
  const order = state.orders.find((entry) => entry.vendorToken === token);
  if (!order) {
    throw new Error("This vendor confirmation link is invalid or has expired.");
  }

  if (response === "confirm") {
    return confirmVendor(order.id, "Vendor");
  }
  return declineVendor(order.id, "Vendor");
}
