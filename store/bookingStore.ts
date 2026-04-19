import { create } from "zustand";

export type PackageTier = "bronze" | "silver" | "gold";
export type OrderStatus = "pending" | "confirmed" | "paid" | "completed" | "cancelled";
export type WaterType = "ro" | "packaged" | "both" | "none";
export type FoodPreference = "" | "veg" | "veg_nonveg";
export type BookingCategoryKey =
  | "soups"
  | "vegStarters"
  | "nonVegStarters"
  | "vegMainCourse"
  | "nonVegMainCourse"
  | "dalKadhiLegumes"
  | "riceBiryani"
  | "indianBreads"
  | "accompaniments"
  | "desserts";

export type CategorySelectionSummary = {
  categoryKey: BookingCategoryKey;
  label: string;
  minRequired: number;
  includedCount: number;
  maxSelectableCount: number;
  selectedCount: number;
  extraSelectedCount: number;
};

export interface BookingStore {
  vendorSlug: string;
  vendorName: string;
  vendorPhone: string;
  vendorImage: string;

  selectedPackage: PackageTier | null;
  pricePerPlate: number;
  foodPreference: FoodPreference;

  selectedItems: string[];
  addOnItems: string[];
  addOnSelections: Record<string, string[]>;
  autoAddOnItems: string[];
  categorySelectionSummary: CategorySelectionSummary[];

  guestCount: number;
  guestSlab: string;

  eventType: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venuePincode: string;
  venueState: string;
  specialNote: string;

  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerWhatsapp: string;
  whatsappOptIn: boolean;

  waterType: WaterType;
  waterLabel: string;
  waterVariant: string;
  waterPricePerPax: number;
  waterTotal: number;

  couponCode: string;
  couponDiscount: number;

  orderId: string;
  orderStatus: OrderStatus;
  bookingTimestamp: string;

  baseTotal: number;
  addOnTotal: number;
  gstAmount: number;
  convenienceFee: number;
  grandTotal: number;

  otpPhone: string;

  setField: <K extends keyof BookingStore>(key: K, value: BookingStore[K]) => void;
  setMany: (partial: Partial<BookingStore>) => void;
  setBulk: (partial: Partial<BookingStore>) => void;
  reset: () => void;
}

const initial: BookingStore = {
  vendorSlug: "",
  vendorName: "",
  vendorPhone: "",
  vendorImage: "",

  selectedPackage: null,
  pricePerPlate: 0,
  foodPreference: "",

  selectedItems: [],
  addOnItems: [],
  addOnSelections: {},
  autoAddOnItems: [],
  categorySelectionSummary: [],

  guestCount: 0,
  guestSlab: "",

  eventType: "",
  eventDate: "",
  eventTime: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  venuePincode: "",
  venueState: "Rajasthan",
  specialNote: "",

  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerWhatsapp: "",
  whatsappOptIn: true,

  waterType: "none",
  waterLabel: "",
  waterVariant: "",
  waterPricePerPax: 0,
  waterTotal: 0,

  couponCode: "",
  couponDiscount: 0,

  orderId: "",
  orderStatus: "pending",
  bookingTimestamp: "",

  baseTotal: 0,
  addOnTotal: 0,
  gstAmount: 0,
  convenienceFee: 0,
  grandTotal: 0,

  otpPhone: "",

  setField: () => {},
  setMany: () => {},
  setBulk: () => {},
  reset: () => {},
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...initial,

  setField: (key, value) => set((state) => ({ ...state, [key]: value })),

  setMany: (partial) => set((state) => ({ ...state, ...partial })),

  setBulk: (partial) => set((state) => ({ ...state, ...partial })),

  reset: () => set({ ...initial }),
}));
