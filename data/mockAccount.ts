import { getVendorDetailBySlug } from "@/data/vendors";
import { calculateBill } from "@/lib/calculateBill";
import type { PackageTier, BookingStore } from "@/store/bookingStore";

export type DemoOrderStatus =
  | "slotHeld"
  | "pendingConfirmation"
  | "confirmed"
  | "paymentPending"
  | "paymentDone"
  | "cancelled";

export type DemoTimelineState = "done" | "current" | "upcoming" | "cancelled";

export type DemoAddress = {
  id: string;
  label: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  house?: string;
  latitude?: number;
  longitude?: number;
};

export type DemoAccountUser = {
  id: string;
  authProvider: "google" | "otp";
  fullName: string;
  firstName: string;
  email: string;
  phone: string;
  whatsapp: string;
  mobileVerified: boolean;
  profilePhotoUrl?: string;
  whatsappUpdates: boolean;
  emailInvoices: boolean;
  preferredCity: string;
  commonEventType: string;
  commonGuestRange: string;
  savedAddresses: DemoAddress[];
  defaultAddressId: string | null;
  profileComplete: boolean;
  addressComplete: boolean;
  onboardingComplete: boolean;
};

export type DemoOrder = {
  id: string;
  invoiceNumber?: string;
  vendorSlug: string;
  vendorName: string;
  vendorImage: string;
  packageName: string;
  packageTier: PackageTier;
  packagePricePerPlate?: number;
  status: DemoOrderStatus;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  total: number;
  venueName: string;
  venueAddress: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  invoiceAvailable: boolean;
  trackEnabled: boolean;
  payNowEnabled: boolean;
  paymentStatus: "Pending" | "Paid" | "Cancelled";
  slotHoldEndsAt?: string;
  bill: {
    baseAmount: number;
    autoAddOns: number;
    optionalAddOns: number;
    water: number;
    subtotal: number;
    gst: number;
    convenienceFee: number;
    finalTotal: number;
  };
  menuGroups: Array<{
    label: string;
    items: Array<{ name: string; isVeg: boolean }>;
  }>;
  optionalAddOns: string[];
  waterSelection: string;
  specialNote: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    whatsapp: string;
  };
  timeline: Array<{
    label: string;
    helper: string;
    at?: string;
    state: DemoTimelineState;
  }>;
};

export const DEMO_LOGIN_PHONE = "9876543210";
export const DEMO_LOGIN_OTP = "123456";

export function buildDemoUser(user: DemoAccountUser): DemoAccountUser {
  const firstName = user.fullName.trim().split(/\s+/)[0] ?? user.firstName ?? "Guest";
  const defaultAddressId = user.defaultAddressId ?? user.savedAddresses[0]?.id ?? null;
  const profileComplete =
    Boolean(user.fullName.trim()) &&
    Boolean(user.email.trim()) &&
    Boolean(user.phone.trim()) &&
    user.mobileVerified;
  const addressComplete = user.savedAddresses.length > 0;

  return {
    ...user,
    firstName,
    defaultAddressId,
    profileComplete,
    addressComplete,
    onboardingComplete: profileComplete && addressComplete,
  };
}

export const DEMO_USER: DemoAccountUser = buildDemoUser({
  id: "mh-demo-priya",
  authProvider: "google",
  fullName: "Priya Sharma",
  firstName: "Priya",
  email: "priya@example.com",
  phone: "+91 9876543210",
  whatsapp: "+91 9876543210",
  mobileVerified: true,
  profilePhotoUrl: "",
  whatsappUpdates: true,
  emailInvoices: true,
  preferredCity: "Jaipur",
  commonEventType: "Wedding",
  commonGuestRange: "100–150 guests",
  savedAddresses: [
    {
      id: "home-1",
      label: "Home Venue",
      venueName: "Sharma Residence Lawn",
      address: "112, Vaishali Enclave, Near Nursery Circle",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302021",
    },
    {
      id: "hall-1",
      label: "Frequent Hall",
      venueName: "Royal Orchid Banquet",
      address: "Civil Lines Extension, Near Collectorate Circle",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302006",
    },
  ],
  defaultAddressId: "home-1",
  profileComplete: true,
  addressComplete: true,
  onboardingComplete: true,
});

export function createOtpDemoUser(phone: string = DEMO_LOGIN_PHONE): DemoAccountUser {
  return buildDemoUser({
    id: "mh-demo-otp-user",
    authProvider: "otp",
    fullName: "",
    firstName: "Guest",
    email: "",
    phone: "+91 " + phone,
    whatsapp: "+91 " + phone,
    mobileVerified: true,
    profilePhotoUrl: "",
    whatsappUpdates: true,
    emailInvoices: true,
    preferredCity: "Jaipur",
    commonEventType: "Wedding",
    commonGuestRange: "100–150 guests",
    savedAddresses: [],
    defaultAddressId: null,
    profileComplete: false,
    addressComplete: false,
    onboardingComplete: false,
  });
}

export function createGoogleRegisterDemoUser(): DemoAccountUser {
  return buildDemoUser({
    id: "mh-demo-google-register",
    authProvider: "google",
    fullName: "Priya Sharma",
    firstName: "Priya",
    email: "priya@example.com",
    phone: "",
    whatsapp: "",
    mobileVerified: false,
    profilePhotoUrl: "",
    whatsappUpdates: true,
    emailInvoices: true,
    preferredCity: "Jaipur",
    commonEventType: "Wedding",
    commonGuestRange: "100–150 guests",
    savedAddresses: [],
    defaultAddressId: null,
    profileComplete: false,
    addressComplete: false,
    onboardingComplete: false,
  });
}

const baseCustomer = {
  fullName: DEMO_USER.fullName,
  phone: DEMO_USER.phone,
  email: DEMO_USER.email,
  whatsapp: DEMO_USER.whatsapp,
};

const order = (input: Omit<DemoOrder, "vendorName" | "vendorImage" | "locality"> & { vendorSlug: string }) => {
  const vendor = getVendorDetailBySlug(input.vendorSlug);
  return {
    ...input,
    vendorName: vendor?.name ?? input.vendorSlug,
    vendorImage: vendor?.images[0] ?? "",
    locality: vendor?.location ?? "Jaipur",
  } satisfies DemoOrder;
};

export const DEMO_ORDERS: DemoOrder[] = [
  order({
    id: "MH240031",
    invoiceNumber: "INV-240031",
    vendorSlug: "rajputana-grand-caterers",
    packageName: "Silver",
    packageTier: "silver",
    packagePricePerPlate: 933,
    status: "pendingConfirmation",
    eventType: "Wedding",
    eventDate: "2026-04-28",
    eventTime: "7:30 PM",
    guests: 100,
    total: 111960,
    venueName: "Anokha Greens",
    venueAddress: "Tonk Road Extension, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302018",
    invoiceAvailable: false,
    trackEnabled: true,
    payNowEnabled: false,
    paymentStatus: "Pending",
    bill: {
      baseAmount: 92300,
      autoAddOns: 1180,
      optionalAddOns: 920,
      water: 480,
      subtotal: 94880,
      gst: 17078,
      convenienceFee: 2,
      finalTotal: 111960,
    },
    menuGroups: [
      { label: "Soups / Drinks", items: [{ name: "Tomato Shorba", isVeg: true }] },
      {
        label: "Starters",
        items: [
          { name: "Paneer Tikka", isVeg: true },
          { name: "Veg Manchurian", isVeg: true },
          { name: "Chicken Tikka", isVeg: false },
        ],
      },
      {
        label: "Main Course",
        items: [
          { name: "Dal Makhani", isVeg: true },
          { name: "Shahi Paneer", isVeg: true },
          { name: "Chicken Curry", isVeg: false },
        ],
      },
      {
        label: "Rice & Breads",
        items: [
          { name: "Veg Biryani", isVeg: true },
          { name: "Butter Naan", isVeg: true },
        ],
      },
      { label: "Desserts", items: [{ name: "Gulab Jamun", isVeg: true }] },
    ],
    optionalAddOns: ["Mocktail", "Extra Raita"],
    waterSelection: "Packaged Bottles",
    specialNote: "Need one Jain counter near the bridal side seating.",
    customer: baseCustomer,
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", at: "31 Mar, 10:25 AM", state: "done" },
      { label: "Slot Held", helper: "Tentative slot blocked for coordination", at: "31 Mar, 10:27 AM", state: "done" },
      { label: "Pending Confirmation", helper: "We are confirming with the caterer", at: "31 Mar, 10:28 AM", state: "current" },
      { label: "Vendor Confirmed", helper: "Awaiting vendor-side approval", state: "upcoming" },
      { label: "Payment Link Sent", helper: "Payment step unlocks after confirmation", state: "upcoming" },
      { label: "Booking Confirmed", helper: "Final confirmation after payment stage", state: "upcoming" },
    ],
  }),
  order({
    id: "MH240032",
    vendorSlug: "keemti-gupta-halwai",
    packageName: "Bronze",
    packageTier: "bronze",
    packagePricePerPlate: 560,
    status: "slotHeld",
    eventType: "Birthday",
    eventDate: "2026-04-16",
    eventTime: "6:00 PM",
    guests: 50,
    total: 32860,
    venueName: "Aurum Party Hall",
    venueAddress: "Mansarovar Link Road, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302020",
    invoiceAvailable: false,
    trackEnabled: true,
    payNowEnabled: false,
    paymentStatus: "Pending",
    slotHoldEndsAt: "2026-03-31T23:59:59+05:30",
    bill: {
      baseAmount: 24600,
      autoAddOns: 1145,
      optionalAddOns: 1380,
      water: 720,
      subtotal: 27845,
      gst: 5012,
      convenienceFee: 3,
      finalTotal: 32860,
    },
    menuGroups: [
      { label: "Starters", items: [{ name: "Paneer Pakora", isVeg: true }, { name: "Hara Bhara Kabab", isVeg: true }] },
      {
        label: "Main Course",
        items: [
          { name: "Dal Tadka", isVeg: true },
          { name: "Paneer Butter Masala", isVeg: true },
        ],
      },
      { label: "Rice & Breads", items: [{ name: "Jeera Rice", isVeg: true }, { name: "Tandoori Roti", isVeg: true }] },
      { label: "Desserts", items: [{ name: "Rasgulla", isVeg: true }] },
    ],
    optionalAddOns: ["Ice Cream"],
    waterSelection: "Packaged Bottles",
    specialNote: "Need extra kids-friendly snack setup.",
    customer: baseCustomer,
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", at: "31 Mar, 9:42 AM", state: "done" },
      { label: "Slot Held", helper: "Your slot is temporarily reserved", at: "31 Mar, 9:45 AM", state: "current" },
      { label: "Pending Confirmation", helper: "Next step starts after slot review", state: "upcoming" },
      { label: "Vendor Confirmed", helper: "Vendor confirmation will appear here", state: "upcoming" },
      { label: "Booking Confirmed", helper: "Final confirmation after review", state: "upcoming" },
    ],
  }),
  order({
    id: "MH240033",
    invoiceNumber: "INV-240033",
    vendorSlug: "new-masala-gully",
    packageName: "Gold",
    packageTier: "gold",
    packagePricePerPlate: 1493,
    status: "confirmed",
    eventType: "Corporate",
    eventDate: "2026-05-04",
    eventTime: "1:00 PM",
    guests: 150,
    total: 235400,
    venueName: "ITC Business Lawn",
    venueAddress: "Malviya Institutional Area, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302017",
    invoiceAvailable: true,
    trackEnabled: true,
    payNowEnabled: false,
    paymentStatus: "Pending",
    bill: {
      baseAmount: 179300,
      autoAddOns: 11600,
      optionalAddOns: 6600,
      water: 1900,
      subtotal: 199400,
      gst: 35892,
      convenienceFee: 108,
      finalTotal: 235400,
    },
    menuGroups: [
      { label: "Soups / Drinks", items: [{ name: "Fresh Lime Soda", isVeg: true }, { name: "Sweet Corn Soup", isVeg: true }] },
      {
        label: "Starters",
        items: [
          { name: "Chicken Malai Tikka", isVeg: false },
          { name: "Paneer Tikka", isVeg: true },
          { name: "Fish Fry", isVeg: false },
        ],
      },
      {
        label: "Main Course",
        items: [
          { name: "Butter Chicken", isVeg: false },
          { name: "Mutton Rogan Josh", isVeg: false },
          { name: "Paneer Lababdar", isVeg: true },
          { name: "Dal Makhani", isVeg: true },
        ],
      },
      {
        label: "Rice & Breads",
        items: [
          { name: "Chicken Biryani", isVeg: false },
          { name: "Garlic Naan", isVeg: true },
        ],
      },
      { label: "Desserts", items: [{ name: "Kulfi", isVeg: true }, { name: "Shahi Tukda", isVeg: true }] },
    ],
    optionalAddOns: ["Mocktail", "Falooda"],
    waterSelection: "Packaged Bottles",
    specialNote: "Need service counters aligned with office stage entry.",
    customer: baseCustomer,
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", at: "30 Mar, 5:10 PM", state: "done" },
      { label: "Pending Confirmation", helper: "Review completed by operations", at: "30 Mar, 5:40 PM", state: "done" },
      { label: "Vendor Confirmed", helper: "The caterer has confirmed this booking", at: "30 Mar, 7:15 PM", state: "done" },
      { label: "Confirmed", helper: "Your booking has been confirmed", at: "30 Mar, 7:18 PM", state: "current" },
      { label: "Payment Link Sent", helper: "Payment link will be shared closer to the event", state: "upcoming" },
      { label: "Booking Confirmed", helper: "Final coordination remains open", state: "upcoming" },
    ],
  }),
  order({
    id: "MH240034",
    invoiceNumber: "INV-240034",
    vendorSlug: "shree-sai-fast-food",
    packageName: "Bronze",
    packageTier: "bronze",
    packagePricePerPlate: 520,
    status: "paymentDone",
    eventType: "Satsang",
    eventDate: "2026-04-08",
    eventTime: "11:30 AM",
    guests: 80,
    total: 54280,
    venueName: "Govind Dham Hall",
    venueAddress: "Malviya Nagar Sector 9, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302017",
    invoiceAvailable: true,
    trackEnabled: true,
    payNowEnabled: false,
    paymentStatus: "Paid",
    bill: {
      baseAmount: 43200,
      autoAddOns: 620,
      optionalAddOns: 780,
      water: 1100,
      subtotal: 45700,
      gst: 8226,
      convenienceFee: 354,
      finalTotal: 54280,
    },
    menuGroups: [
      { label: "Starters", items: [{ name: "Veg Cutlet", isVeg: true }, { name: "Paneer Pakora", isVeg: true }] },
      {
        label: "Main Course",
        items: [
          { name: "Dal Fry", isVeg: true },
          { name: "Aloo Gobi", isVeg: true },
        ],
      },
      { label: "Rice & Breads", items: [{ name: "Jeera Rice", isVeg: true }, { name: "Poori", isVeg: true }] },
      { label: "Desserts", items: [{ name: "Suji Halwa", isVeg: true }] },
    ],
    optionalAddOns: ["Extra Papad"],
    waterSelection: "RO Water",
    specialNote: "Keep service simple and quick after bhajan session.",
    customer: baseCustomer,
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", at: "29 Mar, 2:15 PM", state: "done" },
      { label: "Vendor Confirmed", helper: "The caterer accepted the request", at: "29 Mar, 3:20 PM", state: "done" },
      { label: "Payment Link Sent", helper: "Payment link shared on WhatsApp", at: "29 Mar, 3:40 PM", state: "done" },
      { label: "Payment Done", helper: "Payment received successfully", at: "29 Mar, 4:02 PM", state: "current" },
      { label: "Booking Confirmed", helper: "The event is fully confirmed", at: "29 Mar, 4:10 PM", state: "done" },
    ],
  }),
  order({
    id: "MH240035",
    vendorSlug: "rajputana-grand-caterers",
    packageName: "Silver",
    packageTier: "silver",
    packagePricePerPlate: 933,
    status: "cancelled",
    eventType: "Anniversary",
    eventDate: "2026-05-18",
    eventTime: "7:00 PM",
    guests: 120,
    total: 124900,
    venueName: "The Heritage Court",
    venueAddress: "Ajmer Road, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302026",
    invoiceAvailable: false,
    trackEnabled: false,
    payNowEnabled: false,
    paymentStatus: "Cancelled",
    bill: {
      baseAmount: 101500,
      autoAddOns: 1800,
      optionalAddOns: 1700,
      water: 490,
      subtotal: 105490,
      gst: 18988,
      convenienceFee: 422,
      finalTotal: 124900,
    },
    menuGroups: [
      { label: "Starters", items: [{ name: "Paneer Tikka", isVeg: true }, { name: "Chicken Tikka", isVeg: false }] },
      {
        label: "Main Course",
        items: [
          { name: "Dal Makhani", isVeg: true },
          { name: "Chicken Curry", isVeg: false },
        ],
      },
      { label: "Desserts", items: [{ name: "Kulfi", isVeg: true }] },
    ],
    optionalAddOns: ["Mocktail"],
    waterSelection: "Packaged Bottles",
    specialNote: "No stage decor needed from catering team.",
    customer: baseCustomer,
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", at: "28 Mar, 11:05 AM", state: "done" },
      { label: "Pending Confirmation", helper: "Vendor review was in progress", at: "28 Mar, 11:30 AM", state: "done" },
      { label: "Cancelled", helper: "This booking was cancelled", at: "29 Mar, 8:15 PM", state: "cancelled" },
    ],
  }),
  order({
    id: "MH240036",
    invoiceNumber: "INV-240036",
    vendorSlug: "saffron-feast-caterers",
    packageName: "Silver",
    packageTier: "silver",
    packagePricePerPlate: 820,
    status: "paymentPending",
    eventType: "Reception",
    eventDate: "2026-04-25",
    eventTime: "8:00 PM",
    guests: 90,
    total: 91860,
    venueName: "Amber Leaf Banquet",
    venueAddress: "Civil Lines Extension, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302006",
    invoiceAvailable: true,
    trackEnabled: true,
    payNowEnabled: true,
    paymentStatus: "Pending",
    bill: {
      baseAmount: 73800,
      autoAddOns: 940,
      optionalAddOns: 1560,
      water: 720,
      subtotal: 77020,
      gst: 13864,
      convenienceFee: 976,
      finalTotal: 91860,
    },
    menuGroups: [
      { label: "Soups / Drinks", items: [{ name: "Masala Chaas", isVeg: true }] },
      {
        label: "Starters",
        items: [
          { name: "Paneer Tikka", isVeg: true },
          { name: "Hara Bhara Kabab", isVeg: true },
        ],
      },
      {
        label: "Main Course",
        items: [
          { name: "Shahi Paneer", isVeg: true },
          { name: "Dal Makhani", isVeg: true },
          { name: "Mix Veg", isVeg: true },
        ],
      },
      { label: "Rice & Breads", items: [{ name: "Veg Pulao", isVeg: true }, { name: "Butter Naan", isVeg: true }] },
      { label: "Desserts", items: [{ name: "Gajar Halwa", isVeg: true }] },
    ],
    optionalAddOns: ["Falooda"],
    waterSelection: "Packaged Bottles",
    specialNote: "Need dessert counter near entry foyer.",
    customer: baseCustomer,
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", at: "31 Mar, 8:05 AM", state: "done" },
      { label: "Vendor Confirmed", helper: "The caterer has confirmed this booking", at: "31 Mar, 9:15 AM", state: "done" },
      { label: "Payment Link Sent", helper: "Payment link sent, waiting for payment", at: "31 Mar, 9:18 AM", state: "current" },
      { label: "Payment Done", helper: "Payment will reflect here after completion", state: "upcoming" },
      { label: "Booking Confirmed", helper: "Final lock after payment", state: "upcoming" },
    ],
  }),
];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string, time?: string) {
  return `${formatDisplayDate(date)}${time ? ` · ${time}` : ""}`;
}

export function getOrderStatusMeta(status: DemoOrderStatus) {
  const map: Record<
    DemoOrderStatus,
    {
      label: string;
      helper: string;
      chipClass: string;
      softClass: string;
    }
  > = {
    slotHeld: {
      label: "Slot Held",
      helper: "Your slot is temporarily reserved",
      chipClass: "border-[#E0B85B] bg-[#FFF7E2] text-[#9A6700]",
      softClass: "bg-[#FFF9EC] text-[#8B6400]",
    },
    pendingConfirmation: {
      label: "Pending Confirmation",
      helper: "We are confirming with the caterer",
      chipClass: "border-[#D9B86C] bg-[#FFF8EA] text-[#8A5D14]",
      softClass: "bg-[#FFF8EE] text-[#8A5D14]",
    },
    confirmed: {
      label: "Confirmed",
      helper: "Your booking has been confirmed",
      chipClass: "border-[#86B98F] bg-[#EDF8F0] text-[#1F7A3F]",
      softClass: "bg-[#EEF9F2] text-[#1F7A3F]",
    },
    paymentPending: {
      label: "Payment Pending",
      helper: "Payment link sent, waiting for payment",
      chipClass: "border-[#D8A96F] bg-[#FFF5E8] text-[#8A4D12]",
      softClass: "bg-[#FFF4EA] text-[#8A4D12]",
    },
    paymentDone: {
      label: "Payment Done",
      helper: "Payment received successfully",
      chipClass: "border-[#6EB57D] bg-[#EAF7ED] text-[#166534]",
      softClass: "bg-[#ECF8EF] text-[#166534]",
    },
    cancelled: {
      label: "Cancelled",
      helper: "This booking was cancelled",
      chipClass: "border-[#E4B0B0] bg-[#FFF1F1] text-[#B54545]",
      softClass: "bg-[#FFF3F3] text-[#B54545]",
    },
  };

  return map[status];
}

export function getAllDemoOrders() {
  return DEMO_ORDERS;
}

export function getDemoOrderById(orderId: string) {
  return DEMO_ORDERS.find((order) => order.id === orderId) ?? null;
}

export function buildLiveOrderFromStore(store: Partial<BookingStore>): DemoOrder | null {
  if (!store.orderId || !store.vendorSlug || !store.vendorName || !store.selectedPackage) return null;

  const vendor = getVendorDetailBySlug(store.vendorSlug);
  const bill = calculateBill(store);
  const labelMap: Record<string, string> = {
    soupsDrinks: "Soups / Drinks",
    starters: "Starters",
    mainCourse: "Main Course",
    riceBreads: "Rice & Breads",
    desserts: "Desserts",
  };

  const grouped = Object.entries(
    (store.selectedItems ?? []).reduce<Record<string, Array<{ name: string; isVeg: boolean }>>>((acc, key) => {
      const [rawCategory, ...nameParts] = key.split("::");
      const label = labelMap[rawCategory] ?? rawCategory;
      acc[label] = acc[label] ?? [];
      acc[label].push({ name: nameParts.join("::"), isVeg: true });
      return acc;
    }, {})
  ).map(([label, items]) => ({ label, items }));

  const packageName =
    store.selectedPackage.charAt(0).toUpperCase() + store.selectedPackage.slice(1);
  const addOnSelections = store.addOnSelections ?? {};
  const formattedAddOns = (store.addOnItems ?? []).map((name) => {
    const chosen = addOnSelections[name];
    return chosen?.length ? `${name} (${chosen.join(", ")})` : name;
  });

  return {
    id: store.orderId,
    invoiceNumber:
      store.orderStatus === "paid" || store.orderStatus === "confirmed"
        ? `INV-${store.orderId}`
        : undefined,
    vendorSlug: store.vendorSlug,
    vendorName: store.vendorName,
    vendorImage: vendor?.images[0] ?? store.vendorImage ?? "",
    packageName,
    packageTier: store.selectedPackage,
    packagePricePerPlate: store.pricePerPlate ?? 0,
    status:
      store.orderStatus === "paid"
        ? "paymentDone"
        : store.orderStatus === "confirmed"
          ? "confirmed"
          : store.orderStatus === "cancelled"
            ? "cancelled"
            : "pendingConfirmation",
    eventType: store.eventType || "Event",
    eventDate: store.eventDate || new Date().toISOString().slice(0, 10),
    eventTime: store.eventTime || "7:00 PM",
    guests: store.guestCount ?? 0,
    total: store.grandTotal || bill.grandTotal,
    venueName: store.venueName || "Venue to be shared",
    venueAddress: store.venueAddress || "Address will be finalized in the next step",
    city: store.venueCity || "Jaipur",
    state: store.venueState || "Rajasthan",
    pincode: store.venuePincode || "302021",
    locality: vendor?.location ?? "Jaipur",
    invoiceAvailable: (store.orderStatus === "paid" || store.orderStatus === "confirmed") ?? false,
    trackEnabled: true,
    payNowEnabled: store.orderStatus === "pending",
    paymentStatus: store.orderStatus === "paid" ? "Paid" : "Pending",
    bill: {
      baseAmount: bill.baseAmount,
      autoAddOns: bill.autoAddOnAmount,
      optionalAddOns: bill.optionalAddOnAmount,
      water: bill.waterAmount,
      subtotal: bill.subtotal,
      gst: bill.gstAmount,
      convenienceFee: bill.convenienceFee,
      finalTotal: bill.grandTotal,
    },
    menuGroups: grouped,
    optionalAddOns: formattedAddOns,
    waterSelection: store.waterLabel || "Packaged Bottles",
    specialNote: store.specialNote || "",
    customer: {
      fullName: store.customerName || DEMO_USER.fullName,
      phone: store.customerPhone || DEMO_USER.phone,
      email: store.customerEmail || DEMO_USER.email,
      whatsapp: store.customerWhatsapp || DEMO_USER.whatsapp,
    },
    timeline: [
      { label: "Booking Request Sent", helper: "Your request reached the MeraHalwai team", state: "done", at: "Just now" },
      { label: "Pending Confirmation", helper: "We are confirming with the caterer", state: "current", at: "In progress" },
      { label: "Vendor Confirmed", helper: "Confirmation will appear here", state: "upcoming" },
      { label: "Payment Link Sent", helper: "Payment step comes after confirmation", state: "upcoming" },
      { label: "Booking Confirmed", helper: "Final confirmation after payment stage", state: "upcoming" },
    ],
  };
}

export function getMergedOrders(store?: Partial<BookingStore>) {
  const liveOrder = store ? buildLiveOrderFromStore(store) : null;
  if (!liveOrder) return DEMO_ORDERS;
  return [liveOrder, ...DEMO_ORDERS.filter((order) => order.id !== liveOrder.id)];
}
