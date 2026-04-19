"use client";

import Image, { type StaticImageData } from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Droplets,
  Edit3,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import bronzeIcon from "@/Group 8284.png";
import silverIcon from "@/silver.png";
import goldIcon from "@/gold.png";
import BookingStepper from "@/components/book/BookingStepper";
import { MASTER_MENU_ADDON_GROUPS, getVendorDetailBySlug } from "@/data/vendors";
import { hasAuthCookie } from "@/lib/authCookie";
import { calculateBill } from "@/lib/calculateBill";
import {
  buildBookingMenuGroups,
  getConfiguredAddOnGroups,
  getCategorySelectionSummary,
  getWaterSelectionPrice,
  getWaterOptions,
  meetsCategoryMinimums,
  normalizeSelectedItems,
} from "@/lib/bookingMenuHelpers";
import { VegDotInline } from "@/components/booking/VegDotInline";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";
import type { BookingCategoryKey, FoodPreference, PackageTier, WaterType } from "@/store/bookingStore";

const PACKAGE_META: Record<PackageTier, { icon: StaticImageData; title: string }> = {
  bronze: { icon: bronzeIcon, title: "Bronze" },
  silver: { icon: silverIcon, title: "Silver" },
  gold: { icon: goldIcon, title: "Gold" },
};

const ICE_CREAM_FLAVORS = ["Vanilla", "Chocolate", "Butterscotch", "Strawberry", "Kesar Pista"];

function packageTitle(value: PackageTier | null) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function foodPreferenceLabel(value: FoodPreference) {
  return value === "veg" ? "Pure Veg" : value === "veg_nonveg" ? "Veg + Non-Veg" : "";
}

function WaterBottleIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={"h-8 w-8 " + (active ? "text-[#2F6FD6]" : "text-[#7A97BF]")} fill="none">
      <rect x="18" y="4" width="12" height="6" rx="2.5" fill="currentColor" opacity="0.78" />
      <path
        d="M18 10.5h12v4.5c0 1.8.7 3.5 1.9 4.8l1.5 1.5c1.6 1.6 2.6 3.9 2.6 6.2v9.1c0 4.7-3.8 8.5-8.5 8.5h-8.9c-4.7 0-8.5-3.8-8.5-8.5V27.5c0-2.3.9-4.5 2.6-6.2l1.5-1.5c1.2-1.2 1.9-3 1.9-4.8v-4.5Z"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <path d="M15 29h18" stroke="currentColor" strokeWidth="2.2" opacity="0.28" />
    </svg>
  );
}

export default function BookCustomizeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useBookingStore();
  const setMany = useBookingStore((state) => state.setMany);
  const toast = useToastStore((state) => state.show);

  const slug = useMemo(() => {
    const queryVendor = searchParams.get("vendor");
    if (queryVendor && getVendorDetailBySlug(queryVendor)) return queryVendor;
    if (store.vendorSlug && getVendorDetailBySlug(store.vendorSlug)) return store.vendorSlug;
    return "";
  }, [searchParams, store.vendorSlug]);

  const vendor = useMemo(() => (slug ? getVendorDetailBySlug(slug) : null), [slug]);
  const selectedPackage = store.vendorSlug === slug && store.selectedPackage ? store.selectedPackage : null;
  const foodPreference = store.vendorSlug === slug ? store.foodPreference : "";

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(
    store.vendorSlug === slug ? store.addOnItems : []
  );
  const [selectedAddOnSelections, setSelectedAddOnSelections] = useState<Record<string, string[]>>(
    store.vendorSlug === slug ? store.addOnSelections : {}
  );
  const [waterType, setWaterType] = useState<WaterType>(
    store.vendorSlug === slug ? store.waterType : "none"
  );
  const [waterVariant, setWaterVariant] = useState(
    store.vendorSlug === slug ? store.waterVariant : ""
  );
  const [specialNote, setSpecialNote] = useState(store.vendorSlug === slug ? store.specialNote : "");
  const [openGroups, setOpenGroups] = useState<Record<BookingCategoryKey, boolean>>({
    soups: true,
    vegStarters: false,
    nonVegStarters: false,
    vegMainCourse: false,
    nonVegMainCourse: false,
    dalKadhiLegumes: false,
    riceBiryani: false,
    indianBreads: false,
    accompaniments: false,
    desserts: false,
  });
  const groupRefs = useRef<Partial<Record<BookingCategoryKey, HTMLDivElement | null>>>({});
  const [iceCreamModalOpen, setIceCreamModalOpen] = useState(false);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    if (!slug || !vendor) {
      router.replace("/caterers");
      return;
    }
    if (
      !selectedPackage ||
      !foodPreference ||
      !store.guestCount ||
      !store.eventDate ||
      !store.eventTime ||
      !store.eventType
    ) {
      router.replace("/book/basics?vendor=" + encodeURIComponent(slug));
    }
  }, [foodPreference, router, selectedPackage, slug, store.eventDate, store.eventTime, store.eventType, store.guestCount, vendor]);

  useEffect(() => {
    if (!slug || !vendor || !selectedPackage || !foodPreference) return;

    const keepExisting =
      store.vendorSlug === slug &&
      store.selectedPackage === selectedPackage &&
      store.foodPreference === foodPreference &&
      store.selectedItems.length;

    const nextItems = keepExisting
      ? normalizeSelectedItems(slug, selectedPackage, store.selectedItems, foodPreference)
      : [];

    setSelectedItems(nextItems);
  }, [foodPreference, selectedPackage, slug, store.foodPreference, store.selectedItems, store.selectedPackage, store.vendorSlug, vendor]);

  const activePackage = selectedPackage
    ? vendor?.packages.find((entry) => entry.id === selectedPackage) ?? null
    : null;

  const addonGroups = useMemo(() => {
    const configured = getConfiguredAddOnGroups();
    const source = configured.length ? configured : MASTER_MENU_ADDON_GROUPS;
    return source.map((group) => ({
      key: group.key,
      title: group.title,
      items: [...group.items].filter((item) => item !== "Water"),
    }));
  }, []);

  const groups = useMemo(
    () => (selectedPackage && foodPreference ? buildBookingMenuGroups(slug, selectedPackage, selectedItems, foodPreference) : []),
    [foodPreference, selectedItems, selectedPackage, slug]
  );
  const categorySummary = useMemo(
    () => (selectedPackage && foodPreference ? getCategorySelectionSummary(slug, selectedPackage, selectedItems, foodPreference) : []),
    [foodPreference, selectedItems, selectedPackage, slug]
  );
  const waterOptions = useMemo(() => getWaterOptions(slug), [slug]);
  const roWater = waterOptions.find((option) => option.id === "ro") ?? null;
  const packagedWater = waterOptions.find((option) => option.id === "packaged") ?? null;
  const hasRoWater = waterType === "ro" || waterType === "both";
  const hasPackagedWater = waterType === "packaged" || waterType === "both";
  const liveBill = useMemo(
    () =>
      calculateBill({
        vendorSlug: slug,
        selectedPackage,
        pricePerPlate: activePackage?.pricePerPlate ?? 0,
        guestCount: store.guestCount,
        selectedItems,
        addOnItems: selectedAddOns,
        waterType,
        waterVariant,
        couponDiscount: store.couponDiscount,
      }),
    [activePackage?.pricePerPlate, selectedAddOns, selectedItems, selectedPackage, slug, store.couponDiscount, store.guestCount, waterType, waterVariant]
  );

  const iceCreamFlavors = selectedAddOnSelections["Ice Cream"] ?? [];

  if (!vendor || !activePackage || !selectedPackage || !foodPreference) return null;

  const canContinue =
    meetsCategoryMinimums(categorySummary) &&
    waterType !== "none" &&
    (!hasPackagedWater || Boolean(waterVariant));
  const nextCta = hasAuthCookie() ? "Continue to Details" : "Continue to Login";
  const selectionState =
    waterType === "none"
      ? "Choose a water option to continue"
      : hasPackagedWater && !waterVariant
        ? "Select a packaged bottle size to continue"
        : canContinue
          ? "Selections complete"
          : "Finish required category selections";

  const persistDraft = () => {
    setMany({
      vendorSlug: slug,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorImage: vendor.images[0] ?? "",
      selectedPackage,
      pricePerPlate: activePackage.pricePerPlate,
      foodPreference,
      selectedItems,
      addOnItems: selectedAddOns,
      addOnSelections: selectedAddOnSelections,
      autoAddOnItems: [],
      categorySelectionSummary: categorySummary,
      specialNote,
      waterType,
      waterLabel:
        [
          hasRoWater ? roWater?.label ?? "RO Water" : "",
          hasPackagedWater
            ? `${packagedWater?.label ?? "Packaged Bottles"}${waterVariant ? ` · ${waterVariant}` : ""}`
            : "",
        ]
          .filter(Boolean)
          .join(" + "),
      waterVariant,
      waterPricePerPax: getWaterSelectionPrice(slug, waterType, waterVariant),
      waterTotal: liveBill.waterAmount,
      baseTotal: liveBill.baseAmount,
      addOnTotal: liveBill.addOnTotal + liveBill.waterAmount,
      gstAmount: liveBill.gstAmount,
      convenienceFee: liveBill.convenienceFee,
      grandTotal: liveBill.grandTotal,
    });
  };

  const toggleAddOn = (addonName: string) => {
    const active = selectedAddOns.includes(addonName);

    if (active) {
      setSelectedAddOns((current) => current.filter((item) => item !== addonName));
      setSelectedAddOnSelections((current) => {
        if (!current[addonName]) return current;
        const next = { ...current };
        delete next[addonName];
        return next;
      });
      if (addonName === "Ice Cream") setIceCreamModalOpen(false);
      return;
    }

    setSelectedAddOns((current) => [...current, addonName]);
    if (addonName === "Ice Cream") setIceCreamModalOpen(true);
  };

  const toggleIceCreamFlavor = (flavor: string) => {
    setSelectedAddOnSelections((current) => {
      const existing = current["Ice Cream"] ?? [];
      const nextFlavors = existing.includes(flavor)
        ? existing.filter((item) => item !== flavor)
        : [...existing, flavor];

      return {
        ...current,
        "Ice Cream": nextFlavors,
      };
    });
  };

  const onMenuToggle = (categoryKey: BookingCategoryKey, itemKey: string) => {
    const summary = categorySummary.find((item) => item.categoryKey === categoryKey);
    const isSelected = selectedItems.includes(itemKey);

    if (!summary) return;

    if (isSelected) {
      setSelectedItems((current) => current.filter((key) => key !== itemKey));
      return;
    }

    if (summary.selectedCount >= summary.maxSelectableCount) {
      toast(`You can select ${summary.maxSelectableCount} item(s) in ${summary.label}`);
      return;
    }

    setSelectedItems((current) => [...current, itemKey]);
  };

  const onContinue = () => {
    if (!canContinue) {
      if (waterType === "none") {
        toast("Select a water option to continue.");
        return;
      }
      if (hasPackagedWater && !waterVariant) {
        toast("Choose a bottle size for packaged bottles.");
        return;
      }
      const firstInvalid = categorySummary.find((item) => item.selectedCount < item.minRequired);
      if (firstInvalid) toast(`Select ${firstInvalid.minRequired} item(s) in ${firstInvalid.label}`);
      return;
    }

    setContinuing(true);
    persistDraft();
    router.push(
      hasAuthCookie()
        ? "/book/details"
        : `/login?redirect=${encodeURIComponent("/book/details")}`
    );
  };

  const toggleGroup = (categoryKey: BookingCategoryKey) => {
    const isCurrentlyOpen = openGroups[categoryKey];
    setOpenGroups((current) => {
      const next = Object.fromEntries(
        Object.keys(current).map((key) => [key, false])
      ) as Record<BookingCategoryKey, boolean>;
      if (!isCurrentlyOpen) next[categoryKey] = true;
      return next;
    });

    const target = groupRefs.current[categoryKey];
    if (target && !isCurrentlyOpen && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const absoluteTop = target.getBoundingClientRect().top + window.scrollY;
        const offset = window.innerWidth < 1024 ? 92 : 120;
        window.scrollTo({
          top: Math.max(0, absoluteTop - offset),
          behavior: "smooth",
        });
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4EF] pb-28">
      <BookingStepper current={2} />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-stone-100">
                <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-black text-stone-950">{vendor.name}</p>
                <p className="mt-1 text-[13px] text-stone-500">
                  {packageTitle(selectedPackage)} · ₹{activePackage.pricePerPlate}/plate · {store.guestCount} guests
                </p>
                <p className="mt-1 text-[12px] text-stone-500">
                  {foodPreferenceLabel(foodPreference)} · {store.eventType} · {store.eventDate} · {store.eventTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/book/basics?vendor=" + encodeURIComponent(slug) + "&mode=edit")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-200 px-4 text-[13px] font-semibold text-stone-700 transition hover:border-[#8A3E1D] hover:text-[#8A3E1D]"
            >
              <Edit3 className="h-4 w-4" />
              Edit Basics
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Step 2</p>
              <h1 className="mt-2 text-[28px] font-black leading-tight text-stone-950">Customize Your Menu</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-[1.75] text-stone-500">
                Choose your dishes for the selected package. Final bill will be shown on the review screen.
              </p>
              <div className="mt-5 rounded-[24px] border border-[#E8D5BF] bg-[linear-gradient(135deg,#FFFBF5_0%,#FFF7EC_100%)] p-4 shadow-[0_14px_30px_rgba(104,44,19,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-10 w-1.5 rounded-full bg-[linear-gradient(180deg,#EB8B23_0%,#682C13_100%)]" />
                  <div>
                    <p className="text-[14px] font-bold text-[#682C13]">{selectionState}</p>
                    <p className="mt-1 text-[13px] leading-[1.7] text-[#7A685A]">
                      Complete each required section before continuing. Final bill is shown on the review screen after your details are added.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Menu Builder</p>
                  <h2 className="mt-1 text-[22px] font-black text-stone-950">Menu Categories</h2>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {groups.map((group) => {
                  const open = openGroups[group.categoryKey];
                  const previewImage = group.items[0]?.image ?? vendor.images[0];
                  return (
                    <div
                      key={group.categoryKey}
                      ref={(node) => {
                        groupRefs.current[group.categoryKey] = node;
                      }}
                      className="overflow-hidden rounded-[24px] border border-[#E8DAC9] bg-[#FFFCF8] shadow-[0_14px_34px_rgba(138,62,29,0.04)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.categoryKey)}
                        className="flex w-full items-center justify-between gap-3 bg-[#FFFDF9] px-4 py-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative mt-0.5 h-12 w-12 overflow-hidden rounded-[16px] border border-[#F1D7B5] bg-white shadow-sm">
                            <Image src={previewImage} alt={group.label} fill className="object-cover" sizes="48px" />
                          </div>
                          <div>
                            <p className="text-[17px] font-black tracking-[-0.02em] text-stone-950">{group.label}</p>
                            <p className="mt-1 text-[13px] font-medium text-stone-500">{group.helperText}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-[#F0D4A8] bg-[#FFF0CF] px-3 py-1 text-[12px] font-bold text-[#8A3E1D] shadow-[0_8px_20px_rgba(235,139,35,0.08)]">
                            {group.selectedCount}/{group.minRequired}
                          </span>
                          <ChevronDown className={"h-4 w-4 text-[#8A3E1D] transition " + (open ? "rotate-180" : "")} />
                        </div>
                      </button>

                      {open ? (
                        <div className="grid grid-cols-1 gap-3 border-t border-[#F2E5D8] p-4 sm:grid-cols-2 lg:grid-cols-3">
                          {group.items.map((item) => {
                            const selected = item.selected;
                            const nextSummary = groups.find((entry) => entry.categoryKey === group.categoryKey);
                            const atMax = !selected && nextSummary
                              ? nextSummary.selectedCount >= nextSummary.maxSelectableCount
                              : false;

                            return (
                              <button
                                key={item.key}
                                type="button"
                                disabled={atMax}
                                onClick={() => onMenuToggle(group.categoryKey, item.key)}
                                className={
                                  "group flex items-center gap-3 rounded-[16px] border p-3 text-left transition " +
                                  (selected
                                    ? "border-[#8A3E1D] bg-[#FCF3EE]"
                                    : "border-stone-200 bg-white hover:border-stone-300") +
                                  (atMax ? " cursor-not-allowed opacity-45" : "")
                                }
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <VegDotInline isVeg={item.isVeg} size={12} />
                                    <p className="text-[13px] font-semibold leading-5 text-stone-950 sm:text-[14px]">{item.name}</p>
                                  </div>
                                </div>
                                  <span
                                    className={
                                      "inline-flex min-w-[84px] flex-shrink-0 items-center justify-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition " +
                                      (selected
                                        ? "bg-[#8A3E1D] text-white shadow-sm"
                                        : "border border-stone-200 bg-white text-stone-700")
                                    }
                                  >
                                    <span className={"transition-transform " + (selected ? "scale-110" : "scale-100")}>
                                      {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                    </span>
                                    {selected ? "Added" : "Add"}
                                  </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Optional Add-ons</p>
                  <h2 className="mt-1 text-[22px] font-black text-stone-950">Extras beyond the menu</h2>
                </div>
              </div>

              <div className="mt-5 space-y-6">
                {addonGroups.map((group) => {
                  const groupItems = vendor.addons.filter((addon) => group.items.includes(addon.name));
                  if (!groupItems.length) return null;
                  return (
                    <div key={group.key} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-1.5 rounded-full bg-[linear-gradient(180deg,#EB8B23_0%,#8A3E1D_100%)]" />
                        <p className="text-[17px] font-black tracking-[-0.02em] text-stone-950">{group.title}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {groupItems.map((addon) => {
                          const active = selectedAddOns.includes(addon.name);
                          const selectionLabel = selectedAddOnSelections[addon.name]?.join(", ");
                          return (
                            <button
                              key={addon.name}
                              type="button"
                              onClick={() => toggleAddOn(addon.name)}
                              className={
                                "flex min-h-[88px] items-center justify-between rounded-[18px] border px-4 py-3 text-left transition " +
                                (active
                                  ? "border-[#8A3E1D] bg-[#FCF3EE] shadow-[0_12px_24px_rgba(138,62,29,0.08)]"
                                  : "border-stone-200 bg-[#FCFBF9] hover:border-[#E6C49B]")
                              }
                            >
                              <div>
                                <p className="text-[14px] font-bold leading-5 text-stone-950">{addon.name}</p>
                                <p className="mt-1 text-[12px] font-medium text-stone-500">₹{addon.pricePerPax}/guest</p>
                                {selectionLabel ? (
                                  <p className="mt-1 text-[11px] font-semibold text-[#8A3E1D]">
                                    Flavours: {selectionLabel}
                                  </p>
                                ) : null}
                              </div>
                              <span
                                className={
                                  "inline-flex min-w-[72px] items-center justify-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition " +
                                  (active
                                    ? "bg-[#8A3E1D] text-white"
                                    : "border border-[#E4D6C8] bg-white text-stone-700")
                                }
                              >
                                {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                {active ? "Added" : "Add"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Water</p>
                  <h2 className="mt-1 text-[22px] font-black text-stone-950">Select Water Option</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {waterOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      const nextHasRo =
                        option.id === "ro" ? !hasRoWater : hasRoWater;
                      const nextHasPackaged =
                        option.id === "packaged" ? !hasPackagedWater : hasPackagedWater;

                      const nextWaterType: WaterType =
                        nextHasRo && nextHasPackaged
                          ? "both"
                          : nextHasRo
                            ? "ro"
                            : nextHasPackaged
                              ? "packaged"
                              : "none";

                      setWaterType(nextWaterType);
                      if (!nextHasPackaged) setWaterVariant("");
                    }}
                    className={
                      "relative overflow-hidden rounded-[18px] border px-4 py-4 text-left transition " +
                      (((option.id === "ro" && hasRoWater) || (option.id === "packaged" && hasPackagedWater))
                        ? "border-[#2F6FD6] bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF5FF_100%)] shadow-[0_12px_24px_rgba(47,111,214,0.10)]"
                        : "border-[#DDE6F2] bg-white hover:border-[#BFD4F4]")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#D6E4F7] bg-white shadow-sm">
                        <WaterBottleIcon active={(option.id === "ro" && hasRoWater) || (option.id === "packaged" && hasPackagedWater)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-stone-950">{option.label}</p>
                        <p className="mt-1 text-[12px] leading-5 text-stone-500">{option.helperText}</p>
                      </div>
                      <span
                        className={
                          "inline-flex h-8 items-center justify-center rounded-full px-3 text-[10px] font-bold uppercase tracking-[0.14em] " +
                          (((option.id === "ro" && hasRoWater) || (option.id === "packaged" && hasPackagedWater))
                            ? "bg-[#2F6FD6] text-white"
                            : "bg-[#F3F7FD] text-[#6E8DB6]")
                        }
                      >
                        {((option.id === "ro" && hasRoWater) || (option.id === "packaged" && hasPackagedWater)) ? "Selected" : "Choose"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {hasPackagedWater && packagedWater?.variants?.length ? (
                <div className="mt-4 rounded-[18px] border border-[#D7E3F4] bg-[#F9FCFF] p-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-[#2F6FD6]" />
                    <p className="text-[13px] font-bold text-[#2F6FD6]">Choose packaged bottle size</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    {packagedWater.variants.map((variant) => {
                      const active = waterVariant === variant.label;
                      return (
                        <button
                          key={variant.label}
                          type="button"
                          onClick={() => setWaterVariant(variant.label)}
                          className={
                            "inline-flex h-11 items-center justify-center rounded-[16px] border px-4 text-[12px] font-bold transition " +
                            (active
                              ? "border-[#2F6FD6] bg-[#2F6FD6] text-white shadow-[0_10px_20px_rgba(47,111,214,0.18)]"
                              : "border-[#CFE0F7] bg-white text-[#315B90] hover:border-[#2F6FD6]")
                          }
                        >
                          <span className="flex flex-col items-center leading-tight">
                            <span>{variant.label}</span>
                            <span className="mt-0.5 text-[10px] font-semibold opacity-80">₹{variant.pricePerPax}/guest</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Note for Caterer</p>
              <h2 className="mt-1 text-[22px] font-black text-stone-950">Anything we should note?</h2>
              <textarea
                value={specialNote}
                onChange={(event) => setSpecialNote(event.target.value.slice(0, 300))}
                placeholder="Allergies, live counter request, service preference, dietary restrictions..."
                className="mt-4 min-h-[120px] w-full rounded-[22px] border border-stone-200 bg-[#FCFBF9] px-4 py-4 text-[14px] text-stone-700 outline-none transition focus:border-[#8A3E1D] focus:bg-white"
              />
              <div className="mt-2 flex justify-between text-[12px] text-stone-500">
                <span>Short notes help the service team prepare better.</span>
                <span>{specialNote.length}/300</span>
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_28px_60px_rgba(35,25,20,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Booking Summary</p>
              <div className="mt-4 rounded-[24px] border border-stone-200 bg-[#FBF9F6] p-4">
                <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image src={PACKAGE_META[selectedPackage].icon} alt={selectedPackage} width={28} height={28} className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-stone-950">{PACKAGE_META[selectedPackage].title} Package</p>
                  <p className="text-[13px] text-stone-500">₹{activePackage.pricePerPlate}/plate · {store.guestCount} guests</p>
                  <p className="mt-1 text-[12px] text-stone-500">{foodPreferenceLabel(foodPreference)}</p>
                </div>
              </div>

                <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
                  {categorySummary.map((item) => (
                    <div key={item.categoryKey} className="flex items-center justify-between text-[13px]">
                      <span className="text-stone-500">{item.label}</span>
                      <span className="font-semibold text-stone-900">
                        {item.selectedCount}/{item.minRequired}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-[#F1D8B8] bg-[linear-gradient(135deg,#FFF7EA_0%,#FFFCF8_100%)] p-4 shadow-[0_12px_30px_rgba(235,139,35,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-bold text-[#6A3A1E]">{selectionState}</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#7A685A]">
                      Final bill is shown on the review screen after your details are added.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canContinue || continuing}
                onClick={onContinue}
                className={
                  "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[20px] text-[15px] font-bold transition " +
                  (canContinue
                    ? "bg-[#EB8B23] text-white hover:bg-[#8A3E1D]"
                    : "cursor-not-allowed bg-stone-200 text-stone-500")
                }
              >
                {continuing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {nextCta}
                {!continuing ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-18px_40px_rgba(35,25,20,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-stone-900">
              {packageTitle(selectedPackage)} · {store.guestCount} guests
            </p>
            <p className="text-[12px] font-medium text-[#8A3E1D]">{selectionState}</p>
          </div>
          <button
            type="button"
            disabled={!canContinue || continuing}
            onClick={onContinue}
            className={
              "flex h-12 items-center justify-center gap-2 rounded-[18px] px-5 text-[14px] font-bold transition " +
              (canContinue
                ? "bg-[linear-gradient(135deg,#F2B24C_0%,#EC9925_45%,#8A3E1D_100%)] text-white"
                : "cursor-not-allowed bg-stone-200 text-stone-500")
            }
          >
            {continuing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {continuing ? "Continuing..." : "Continue"}
          </button>
        </div>
      </div>

      {iceCreamModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(18,16,14,0.48)] p-4 sm:items-center">
          <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-[#E5DDD2] bg-white shadow-[0_30px_80px_rgba(20,18,15,0.24)]">
            <div className="flex items-center justify-between border-b border-[#EEE4D7] px-5 py-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-stone-500">Dessert Add-on</p>
                <h3 className="mt-1 text-[24px] font-black text-stone-950">Choose Ice Cream Flavours</h3>
              </div>
              <button
                type="button"
                onClick={() => setIceCreamModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:text-stone-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-[14px] leading-[1.75] text-stone-500">
                Pick the flavours you want to offer with the ice cream add-on.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {ICE_CREAM_FLAVORS.map((flavor) => {
                  const active = iceCreamFlavors.includes(flavor);
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => toggleIceCreamFlavor(flavor)}
                      className={
                        "inline-flex h-11 items-center justify-center rounded-full border px-4 text-[13px] font-bold transition " +
                        (active
                          ? "border-[#8A3E1D] bg-[#8A3E1D] text-white shadow-[0_12px_24px_rgba(138,62,29,0.16)]"
                          : "border-[#E5DED4] bg-[#FCFBF9] text-stone-700 hover:border-[#8A3E1D]")
                      }
                    >
                      {flavor}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-[20px] border border-[#EFE3D5] bg-[#FCF8F2] px-4 py-3">
                <p className="text-[13px] font-medium text-[#6B6259]">
                  {iceCreamFlavors.length
                    ? `Selected: ${iceCreamFlavors.join(", ")}`
                    : "You can select flavours now or update them later."}
                </p>
                <button
                  type="button"
                  onClick={() => setIceCreamModalOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#EB8B23] px-5 text-[13px] font-bold text-white transition hover:bg-[#8A3E1D]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
