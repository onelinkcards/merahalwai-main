import type { BookingStore } from "@/store/bookingStore";
import { getVendorDetailBySlug } from "@/data/vendors";
import { getWaterOptions } from "@/lib/bookingMenuHelpers";

const CONVENIENCE_FEE_RATE = 0.02;
export const GST_RATE = 0.18;
const ADVANCE_PAYMENT_RATE = 0.3;

export type BillBreakdown = {
  baseAmount: number;
  autoAddOnAmount: number;
  optionalAddOnAmount: number;
  waterAmount: number;
  addOnTotal: number;
  preTax: number;
  couponDiscount: number;
  subtotal: number;
  gstAmount: number;
  convenienceFee: number;
  grandTotal: number;
};

type CustomerFacingBillSource = {
  baseAmount?: number;
  optionalAddOns?: number;
  optionalAddOnAmount?: number;
  water?: number;
  waterAmount?: number;
  subtotal?: number;
};

export type CustomerFacingBillSummary = {
  baseAmount: number;
  optionalAddOnAmount: number;
  waterAmount: number;
  bookingValue: number;
  upfrontBase: number;
  upfrontGst: number;
  upfrontTotal: number;
  remainingAmount: number;
  customerGrandTotal: number;
};

function optionalAddOnTotal(slug: string, addOnNames: string[], guestCount: number) {
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor?.addons?.length || !addOnNames.length) return 0;

  return addOnNames.reduce((total, itemName) => {
    const addon = vendor.addons.find((item) => item.name === itemName);
    return total + (addon ? addon.pricePerPax * guestCount : 0);
  }, 0);
}

function waterTotal(slug: string, waterType: BookingStore["waterType"], guestCount: number) {
  if (!slug || !waterType) return 0;
  const options = getWaterOptions(slug);

  if (waterType === "both") {
    return options
      .filter((entry) => entry.id === "ro" || entry.id === "packaged")
      .reduce((total, option) => total + option.pricePerPax * guestCount, 0);
  }

  const option = options.find((entry) => entry.id === waterType);
  return option ? option.pricePerPax * guestCount : 0;
}

export function calculateBill(state: Partial<BookingStore>): BillBreakdown {
  const guestCount = Math.max(0, state.guestCount ?? 0);
  const pricePerPlate = state.pricePerPlate ?? 0;
  const baseAmount = Math.round(guestCount * pricePerPlate);

  const slug = state.vendorSlug ?? "";
  const autoAddOnAmount = 0;
  const optionalAddOnAmount = slug
    ? optionalAddOnTotal(slug, state.addOnItems ?? [], guestCount)
    : 0;
  const waterAmount = slug ? waterTotal(slug, state.waterType ?? "none", guestCount) : 0;
  const addOnTotal = autoAddOnAmount + optionalAddOnAmount;

  const couponDiscount = Math.max(0, state.couponDiscount ?? 0);
  const preTax = Math.max(0, baseAmount + addOnTotal + waterAmount - couponDiscount);
  const gstAmount = Math.round(preTax * GST_RATE);
  const convenienceFee = Math.round(preTax * CONVENIENCE_FEE_RATE);
  const grandTotal = preTax + gstAmount + convenienceFee;

  return {
    baseAmount,
    autoAddOnAmount: Math.round(autoAddOnAmount),
    optionalAddOnAmount: Math.round(optionalAddOnAmount),
    waterAmount: Math.round(waterAmount),
    addOnTotal: Math.round(addOnTotal),
    preTax,
    couponDiscount,
    subtotal: preTax,
    gstAmount,
    convenienceFee,
    grandTotal,
  };
}

export function getCustomerFacingBillSummary(
  source: BillBreakdown | CustomerFacingBillSource
): CustomerFacingBillSummary {
  const baseAmount = Math.max(0, Math.round(source.baseAmount ?? 0));
  const optionalAddOnAmount = Math.max(
    0,
    Math.round(
      "optionalAddOnAmount" in source
        ? (source.optionalAddOnAmount ?? 0)
        : (source.optionalAddOns ?? 0)
    )
  );
  const waterAmount = Math.max(
    0,
    Math.round("waterAmount" in source ? (source.waterAmount ?? 0) : (source.water ?? 0))
  );
  const bookingValue = Math.max(
    0,
    Math.round(source.subtotal ?? baseAmount + optionalAddOnAmount + waterAmount)
  );
  const upfrontBase = Math.round(bookingValue * ADVANCE_PAYMENT_RATE);
  const upfrontGst = Math.round(upfrontBase * GST_RATE);
  const upfrontTotal = upfrontBase + upfrontGst;
  const remainingAmount = Math.max(0, bookingValue - upfrontBase);
  const customerGrandTotal = bookingValue + upfrontGst;

  return {
    baseAmount,
    optionalAddOnAmount,
    waterAmount,
    bookingValue,
    upfrontBase,
    upfrontGst,
    upfrontTotal,
    remainingAmount,
    customerGrandTotal,
  };
}
