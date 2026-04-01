"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Droplets,
  Layers,
  Minus,
  Plus,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMenuItemImageUrl, shortMenuDescription } from "@/data/menuItemImages";
import { calculateBill } from "@/lib/calculateBill";
import { getDefaultMenuKeys } from "@/lib/bookingMenuHelpers";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";
import type { VendorDetailFull } from "@/data/vendors";
import type { PackageTier, WaterType } from "@/store/bookingStore";

const SLABS = [50, 100, 150, 200, 300, 500, 750, 1000];

const pkgMeta = (id: string) => {
  if (id === "gold")
    return {
      dot: "#D4A017",
      border: "border-[#D4A017]",
      ring: "border-[#D4A017]",
      badge: "PREMIUM",
      badgeBg: "bg-[#D4A017]",
      gstLine: "₹800–₹944 with GST",
      specGuests: "100-2000 guests",
      specDishes: "Up to 25 dishes",
      specSetup: "Royal setup + live counters",
    };
  if (id === "silver")
    return {
      dot: "#6B6B6B",
      border: "border-[#6B6B6B]",
      ring: "border-[#6B6B6B]",
      badge: "MOST POPULAR",
      badgeBg: "bg-[#DE903E]",
      gstLine: "₹500–₹590 with GST",
      specGuests: "50-800 guests",
      specDishes: "Up to 18 dishes",
      specSetup: "Premium setup",
    };
  return {
    dot: "#CD7F32",
    border: "border-[#CD7F32]",
    ring: "border-[#CD7F32]",
    badge: "",
    badgeBg: "",
      gstLine: "₹300–₹360 with GST",
    specGuests: "50-500 guests",
    specDishes: "Up to 12 dishes",
    specSetup: "Standard setup and service",
  };
};

export default function CatererBookingSections({
  vendor,
  slug,
}: {
  vendor: VendorDetailFull;
  slug: string;
}) {
  const router = useRouter();
  const setMany = useBookingStore((s) => s.setMany);

  const [selectedPkg, setSelectedPkg] = useState<PackageTier>("silver");
  const [guestCount, setGuestCount] = useState(() => Math.max(100, vendor.minPax));
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addOnItems, setAddOnItems] = useState<string[]>([]);
  const [waterType, setWaterType] = useState<WaterType>("packaged");
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);

  const pkg = vendor.packages.find((p) => p.id === selectedPkg) ?? vendor.packages[0];
  const meta = pkgMeta(pkg.id);

  useEffect(() => {
    setSelectedItems(getDefaultMenuKeys(slug, selectedPkg));
  }, [slug, selectedPkg]);

  const defaultSet = useMemo(() => {
    return new Set(getDefaultMenuKeys(slug, selectedPkg));
  }, [slug, selectedPkg]);

  const regularAllowed = Math.max(0, pkg.baseLimit - defaultSet.size);

  const toggleItem = useCallback(
    (key: string, locked: boolean) => {
      if (locked) return;
      setSelectedItems((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
    },
    []
  );

  const selectedRegular = selectedItems.filter((k) => !defaultSet.has(k));
  const autoAddonSet = new Set(selectedRegular.slice(regularAllowed));
  const autoAddonCount = Math.max(0, selectedItems.length - pkg.baseLimit);

  const bill = useMemo(
    () =>
      calculateBill({
        vendorSlug: slug,
        selectedPackage: selectedPkg as PackageTier,
        pricePerPlate: pkg.pricePerPlate,
        guestCount,
        selectedItems,
        addOnItems,
        couponDiscount: 0,
      }),
    [slug, selectedPkg, pkg.pricePerPlate, guestCount, selectedItems, addOnItems]
  );

  const pct = Math.min(100, Math.round((selectedItems.length / Math.max(1, pkg.maxLimit)) * 100));

  const toggleAddon = (name: string) => {
    setAddOnItems((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  };

  const syncStore = useCallback(() => {
    setMany({
      vendorSlug: slug,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorImage: vendor.images[0] ?? "",
      selectedPackage: selectedPkg as PackageTier,
      pricePerPlate: pkg.pricePerPlate,
      selectedItems,
      addOnItems,
      guestCount,
      guestSlab: `${guestCount} guests`,
      waterType,
    });
  }, [setMany, slug, vendor, selectedPkg, pkg.pricePerPlate, selectedItems, addOnItems, guestCount, waterType]);

  const onBookNow = () => {
    if (guestCount < 25) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      useToastStore.getState().show("Please enter guest count (min 25).");
      return;
    }
    if (selectedItems.length === 0) {
      useToastStore.getState().show("Please select at least one menu item.");
      return;
    }
    syncStore();
    router.push("/book/basics?vendor=" + encodeURIComponent(slug));
  };

  const inc = () => setGuestCount((g) => g + 25);
  const dec = () => setGuestCount((g) => Math.max(25, g - 25));

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-5 md:mx-0"
      >
        <h2 className="mb-2 text-[18px] font-bold text-[#1E1E1E]">Select Package and Guests</h2>

        <div
          className={
            "mb-4 flex items-center justify-between rounded-2xl border border-[#E8D5B7] bg-white p-4 " +
            (shake ? "animate-shake-card" : "")
          }
        >
          <div className="flex items-center gap-3">
            <Users className="h-[18px] w-[18px] text-[#DE903E]" />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#1E1E1E]">Number of Guests</span>
              <span className="text-[11px] text-[#8B7355]">Used to calculate your bill</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={dec}
              disabled={guestCount <= 25}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D5B7] text-[16px] font-bold text-[#804226] transition-colors hover:border-[#804226] active:bg-[#FFF3E8] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-[20px] font-extrabold text-[#804226]">{guestCount}</span>
            <button
              type="button"
              onClick={inc}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#E8D5B7] text-[16px] font-bold text-[#804226] transition-colors hover:border-[#804226] active:bg-[#FFF3E8]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SLABS.map((n) => {
            const active = guestCount === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setGuestCount(n)}
                className={
                  "cursor-pointer rounded-lg border-2 px-3 py-1.5 text-[11px] font-semibold transition-colors " +
                  (active
                    ? "border-[#804226] bg-[#FFF3E8] text-[#804226]"
                    : "border-[#E8D5B7] text-[#8B7355]")
                }
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {vendor.packages.map((p) => {
            const selected = selectedPkg === p.id;
            const m = pkgMeta(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPkg(p.id)}
                className={
                  "w-full cursor-pointer overflow-hidden rounded-2xl border-2 bg-white text-left transition-all " +
                  (selected ? m.ring + " shadow-md" : "border-[#E8D5B7]")
                }
              >
                <div className="flex justify-between gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: m.dot }} />
                      <span className="text-[18px] font-bold" style={{ color: m.dot }}>
                        {p.name}
                      </span>
                      {m.badge ? (
                        <span className={"rounded px-2 py-0.5 text-[9px] font-bold text-white " + m.badgeBg}>
                          {m.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-[#8B7355]">
                      {p.id === "bronze"
                        ? "Best for intimate and budget events"
                        : p.id === "silver"
                          ? "Ideal for weddings and mid-scale events"
                          : "Grand weddings and premium events"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[32px] font-extrabold leading-none text-[#804226]">₹{p.pricePerPlate}</p>
                    <p className="text-[11px] text-[#8B7355]">/plate</p>
                    <p className="mt-0.5 text-[10px] text-[#8B7355]">{m.gstLine}</p>
                  </div>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#F0EBE3] px-5 py-3">
                  <div className="flex flex-col gap-1.5 text-[12px] text-[#1E1E1E]">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-[#DE903E]" /> {m.specGuests}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <UtensilsCrossed className="h-3 w-3 text-[#DE903E]" /> {m.specDishes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-[#DE903E]" /> {m.specSetup}
                    </span>
                  </div>
                  <span
                    className={
                      "flex h-9 w-24 flex-shrink-0 items-center justify-center rounded-xl text-[13px] font-semibold " +
                      (selected ? "bg-[#804226] text-white" : "border-2 border-[#804226] text-[#804226]")
                    }
                  >
                    {selected ? (
                      <>
                        <Check className="mr-1 h-3.5 w-3.5" /> Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-4 mt-6 md:mx-0"
      >
        <h2 className="mb-1 text-[18px] font-bold text-[#1E1E1E]">Build Your Menu</h2>
        <p className="mb-3 text-[12px] text-[#8B7355]">
          {selectedPkg} - Select up to {pkg.maxLimit} dishes - {selectedItems.length}/{pkg.maxLimit} chosen
        </p>
        <div className="mb-4 h-1.5 w-full rounded-full bg-[#F0EBE3]">
          <div
            className="h-full rounded-full bg-[#DE903E] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {autoAddonCount > 0 ? (
          <div className="mb-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-[12px] text-amber-700">
              {autoAddonCount} extra items added as add-ons (per-person rates apply)
            </p>
          </div>
        ) : null}

        {pkg.categories.map((cat) => {
          const open = openCat[cat.name] ?? true;
          const catKeys = cat.items.map((it) => `${cat.name}::${it.name}`);
          const selInCat = catKeys.filter((k) => selectedItems.includes(k)).length;
          const catLimit = cat.items.filter((it) => it.isDefault).length + 2;
          return (
            <div
              key={cat.name}
              className="mb-3 overflow-hidden rounded-2xl border border-[#E8D5B7] bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenCat((o) => ({ ...o, [cat.name]: !open }))}
                className="flex w-full items-center justify-between px-4 py-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#1E1E1E]">{cat.name}</span>
                  <span className="rounded-lg bg-[#FFF3E8] px-2 py-0.5 text-[10px] font-bold text-[#804226]">
                    {selInCat}/{catLimit} selected
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-[#8B7355] transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open ? (
                <div className="grid grid-cols-1 gap-2 px-4 pb-4">
                  {cat.items.map((item) => {
                    const key = `${cat.name}::${item.name}`;
                    const locked = item.isDefault;
                    const checked = selectedItems.includes(key);
                    const isAuto = autoAddonSet.has(key);
                    const img = getMenuItemImageUrl(item.name);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleItem(key, locked)}
                        className={
                          "flex cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors " +
                          (checked
                            ? "border-2 border-[#804226] bg-[#FFF3E8]"
                            : "border-2 border-[#E8D5B7] bg-[#FFFAF5] hover:border-[#8B7355]")
                        }
                      >
                        <span
                          className={
                            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 " +
                            (checked ? "border-[#804226] bg-[#804226]" : "border-[#E8D5B7]")
                          }
                        >
                          {checked ? <Check className="h-3 w-3 text-white" /> : null}
                        </span>
                        <span
                          className={
                            "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border " +
                            (item.isVeg ? "border-green-600" : "border-red-600")
                          }
                        >
                          <span
                            className={
                              "h-2.5 w-2.5 rounded-full " + (item.isVeg ? "bg-green-600" : "bg-red-600")
                            }
                          />
                        </span>
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#E8D5B7]">
                          <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#1E1E1E]">{item.name}</p>
                          <p className="text-[10px] text-[#8B7355]">{shortMenuDescription(item.name)}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {locked ? (
                              <span className="rounded bg-green-100 px-2 py-0.5 text-[9px] font-semibold text-green-700">
                                Default
                              </span>
                            ) : null}
                            {isAuto ? (
                              <span className="rounded border border-[#D4A017] bg-[#FFFBEC] px-2 py-0.5 text-[9px] text-[#D4A017]">
                                Add-on
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-5 md:mx-0"
      >
        <div className="mb-4 rounded-2xl border border-[#E8D5B7] bg-white p-5">
          <h3 className="mb-3 text-[15px] font-bold text-[#1E1E1E]">Optional Add-ons</h3>
          <div className="grid grid-cols-2 gap-3">
            {vendor.addons.map((a) => {
              const on = addOnItems.includes(a.name);
              return (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => toggleAddon(a.name)}
                  className={
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-left " +
                    (on ? "border-[#DE903E] bg-[#FFF3E8]" : "border-[#E8D5B7] bg-white")
                  }
                >
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#E8D5B7]">
                    <Image
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&q=80&auto=format&fit=crop"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#1E1E1E]">{a.name}</p>
                    <p className="text-[11px] font-semibold text-[#DE903E]">+₹{a.pricePerPax}/person</p>
                  </div>
                  <span
                    className={`relative h-5 w-10 flex-shrink-0 rounded-full transition-colors ${on ? "bg-[#DE903E]" : "bg-[#E8D5B7]"}`}
                  >
                    <span
                      className={
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform " +
                        (on ? "translate-x-[18px]" : "translate-x-0.5")
                      }
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-[#E8D5B7] bg-white p-5">
          <h3 className="mb-3 text-[15px] font-bold text-[#1E1E1E]">Water Arrangement</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            {(
              [
                { id: "ro" as WaterType, label: "RO Water", sub: "₹15/person", Icon: Droplets },
                { id: "packaged" as WaterType, label: "Packaged Bottle", sub: `₹${vendor.water.pricePerBottle}/bottle`, Icon: Droplets },
                { id: "none" as WaterType, label: "Not Required", sub: "No charge", Icon: Droplets },
              ] as const
            ).map(({ id, label, sub }) => (
              <button
                key={id}
                type="button"
                onClick={() => setWaterType(id)}
                className={
                  "flex flex-1 flex-col rounded-xl border-2 p-3 text-left " +
                  (waterType === id ? "border-[#804226] bg-[#FFF3E8]" : "border-[#E8D5B7]")
                }
              >
                <Droplets className="h-[18px] w-[18px] text-blue-500" />
                <span className="mt-1 text-[12px] font-semibold text-[#1E1E1E]">{label}</span>
                <span className="text-[11px] text-[#DE903E]">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="h-28 md:h-32" />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8D5B7] bg-white px-5 py-4 shadow-lg"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
              <span className="text-[11px] font-bold capitalize text-[#1E1E1E]">{selectedPkg}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-[26px] font-extrabold text-[#804226]">₹{pkg.pricePerPlate}</span>
              <span className="text-[11px] text-[#8B7355]">/plate</span>
            </div>
            <p className="text-[10px] text-[#8B7355]">
              Estimated: ₹{bill.grandTotal.toLocaleString("en-IN")} for {guestCount} guests
            </p>
          </div>
          <button
            type="button"
            onClick={onBookNow}
            className="flex h-[52px] flex-1 items-center justify-center rounded-2xl bg-[#DE903E] text-[15px] font-bold text-white transition-all hover:bg-[#804226] active:scale-[0.98] sm:max-w-xs"
          >
            Book Now
          </button>
        </div>
      </div>

    </>
  );
}
