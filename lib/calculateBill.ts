import type { BookingStore, PackageTier } from "@/store/bookingStore";
import { getVendorDetailBySlug } from "@/data/vendors";
import { getAutoAddonItems, getWaterOptions } from "@/lib/bookingMenuHelpers";

const CONVENIENCE_FEE_RATE = 0.02;
const GST_RATE = 0.18;

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

function menuAddOnTotal(
  slug: string,
  packageId: PackageTier,
  selectedKeys: string[],
  guestCount: number,
  foodPreference?: BookingStore["foodPreference"]
) {
  const vendor = getVendorDetailBySlug(slug);
  if (!vendor || !vendor.autoAddonPricing) return 0;

  return getAutoAddonItems(slug, packageId, selectedKeys, foodPreference).reduce((total, item) => {
    const rate = item.isVeg
      ? vendor.autoAddonPricing.vegPerItemPerPax
      : vendor.autoAddonPricing.nonVegPerItemPerPax;
    return total + rate * guestCount;
  }, 0);
}

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
  const option = getWaterOptions(slug).find((entry) => entry.id === waterType);
  return option ? option.pricePerPax * guestCount : 0;
}

export function calculateBill(state: Partial<BookingStore>): BillBreakdown {
  const guestCount = Math.max(0, state.guestCount ?? 0);
  const pricePerPlate = state.pricePerPlate ?? 0;
  const baseAmount = Math.round(guestCount * pricePerPlate);

  const slug = state.vendorSlug ?? "";
  const packageId: PackageTier = state.selectedPackage ?? "silver";
  const selectedItems = state.selectedItems ?? [];
  const autoAddOnAmount = slug
    ? menuAddOnTotal(slug, packageId, selectedItems, guestCount, state.foodPreference)
    : 0;
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
