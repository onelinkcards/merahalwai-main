"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Square,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MenuItem = { readonly name: string; readonly isVeg: boolean; readonly isDefault: boolean };
type MenuCategory = { readonly name: string; readonly items: readonly MenuItem[] };
type MenuPackage = {
  readonly id: string;
  readonly name: string;
  readonly pricePerPlate: number;
  readonly description: string;
  readonly paxRange: string;
  readonly baseLimit: number;
  readonly maxLimit: number;
  readonly categories: readonly MenuCategory[];
};
type VendorDetails = {
  slug: string;
  addons: readonly { name: string; isVeg: boolean; pricePerPax: number }[];
  water: { type: string; pricePerBottle: number };
};

export type MenuBookingCompletePayload = {
  packageId: string;
  pricePerPlate: number;
  selectedItems: string[];
  addOnItems: string[];
  guestCount: number;
  guestSlab: string;
  waterType: "ro" | "packaged" | "none";
  specialNote: string;
};

type MenuDrawerProps = {
  vendor: VendorDetails;
  selectedPkg: MenuPackage;
  allPackages: readonly MenuPackage[];
  isOpen: boolean;
  onClose: () => void;
  onPkgChange: (pkgId: string) => void;
  onComplete: (data: MenuBookingCompletePayload) => void;
};

const STANDARD_SLABS = [
  "0-30",
  "30-50",
  "50-100",
  "100-150",
  "150-200",
  "200-250",
  "250-500",
  "500-1000",
  "1000-1500",
  "1500-2000",
];

const getPaxMidpoint = (slab: string | null) => {
  if (!slab) return 0;
  const [minRaw, maxRaw] = slab.split("-").map(Number);
  const min = Number.isFinite(minRaw) ? minRaw : 0;
  const max = Number.isFinite(maxRaw) ? maxRaw : min;
  if (min === 0 && max === 30) return 20;
  return Math.round((min + max) / 2);
};

const getTierColor = (id: string) => {
  if (id === "gold") return "#D4A017";
  if (id === "silver") return "#8B8B8B";
  return "#CD7F32";
};

export default function MenuDrawer({
  vendor,
  selectedPkg,
  allPackages,
  isOpen,
  onClose,
  onPkgChange,
  onComplete,
}: MenuDrawerProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [localPkgId, setLocalPkgId] = useState(selectedPkg.id);
  const [selectedPax, setSelectedPax] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [waterSelected, setWaterSelected] = useState(false);
  const [note, setNote] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const activePkg = useMemo(
    () => allPackages.find((pkg) => pkg.id === localPkgId) ?? allPackages[0],
    [allPackages, localPkgId]
  );

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setLocalPkgId(selectedPkg.id);
    setSelectedPax(null);
    setSelectedAddons([]);
    setWaterSelected(false);
    setNote("");
  }, [isOpen, selectedPkg.id]);

  useEffect(() => {
    const defaults = activePkg.categories.flatMap((cat) =>
      cat.items.filter((item) => item.isDefault).map((item) => cat.name + "::" + item.name)
    );
    setSelectedItems(defaults);
  }, [activePkg]);

  if (!isOpen) return null;

  const supportedSlabs = (() => {
    const [minRaw, maxRaw] = activePkg.paxRange.split("-").map((v) => Number(v.trim()));
    const min = Number.isFinite(minRaw) ? minRaw : 0;
    const max = Number.isFinite(maxRaw) ? maxRaw : 2000;
    return STANDARD_SLABS.filter((slab) => {
      const [sMin, sMax] = slab.split("-").map(Number);
      return sMax >= min && sMin <= max;
    });
  })();

  const defaultSet = new Set(
    activePkg.categories.flatMap((cat) =>
      cat.items.filter((item) => item.isDefault).map((item) => cat.name + "::" + item.name)
    )
  );
  const selectedRegular = selectedItems.filter((k) => !defaultSet.has(k));
  const autoAddonCount = Math.max(0, selectedItems.length - activePkg.baseLimit);
  const regularAllowed = Math.max(0, activePkg.baseLimit - defaultSet.size);
  const autoAddonSet = new Set(selectedRegular.slice(regularAllowed));

  const paxMidpoint = getPaxMidpoint(selectedPax);
  const baseTotal = activePkg.pricePerPlate * paxMidpoint;
  const addonsTotal = selectedAddons.reduce((sum, name) => {
    const addon = vendor.addons.find((a) => a.name === name);
    return sum + (addon ? addon.pricePerPax * paxMidpoint : 0);
  }, 0);
  const subtotal = baseTotal + addonsTotal;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const progressPct = Math.min(100, Math.round((selectedItems.length / activePkg.baseLimit) * 100));
  const progressOver = selectedItems.length > activePkg.baseLimit;

  const closeFromBackdrop = () => {
    if (currentStep === 1) {
      onClose();
      return;
    }
    const ok = window.confirm("Your progress will be lost. Close booking sheet?");
    if (ok) onClose();
  };

  const goBack = () => {
    if (currentStep === 1) return onClose();
    if (currentStep === 2) {
      setSelectedPax(null);
      setCurrentStep(1);
      return;
    }
    setSelectedAddons([]);
    setWaterSelected(false);
    setNote("");
    setCurrentStep(2);
  };

  const toggleItem = (key: string, locked: boolean) => {
    if (locked) return;
    setSelectedItems((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const toggleAddon = (name: string) => {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeFromBackdrop}
        className="fixed inset-0 z-[60] bg-[#1E1E1E]/50 backdrop-blur-sm"
        aria-label="close backdrop"
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[85vh] flex-col rounded-t-3xl bg-[#FFFFFF] shadow-2xl lg:inset-0 lg:m-auto lg:h-fit lg:w-full lg:max-w-[480px] lg:rounded-2xl"
      >
        <div className="flex justify-center pb-1 pt-3 flex-shrink-0 lg:hidden">
          <div className="h-1 w-10 rounded-full bg-[#E8D5B7]" />
        </div>

        <div className="flex-shrink-0 px-5 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 1 ? (
                <button onClick={goBack} className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFFFFF] border border-[#E8D5B7]">
                  <ArrowLeft className="h-4 w-4 text-[#804226]" />
                </button>
              ) : null}
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#111827]">
                  {currentStep === 1
                    ? "Choose Package"
                    : currentStep === 2
                    ? "Guest Count"
                    : "Menu & Add-ons"}
                </span>
                <span className="mt-0.5 text-[11px] text-[#8B7355]">
                  {currentStep === 1
                    ? "3 packages available"
                    : currentStep === 2
                    ? "Select range to continue"
                    : "Customise your order"}
                </span>
              </div>
            </div>
            <button onClick={closeFromBackdrop} className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8D5B7] bg-[#FFFFFF]">
              <X className="h-4 w-4 text-[#804226]" />
            </button>
          </div>

          <div className="flex gap-2">
            {[
              { n: 1, label: "Package" },
              { n: 2, label: "Guests" },
              { n: 3, label: "Menu" },
            ].map((step) => (
              <div key={step.n} className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 " +
                      (step.n < currentStep
                        ? "bg-[#804226] text-[#FFFFFF]"
                        : step.n === currentStep
                        ? "bg-[#DE903E] text-[#FFFFFF]"
                        : "bg-[#E8D5B7] text-[#8B7355]")
                    }
                  >
                    {step.n < currentStep ? <Check className="h-2.5 w-2.5" /> : step.n}
                  </div>
                  <span
                    className={
                      "text-[10px] font-semibold " +
                      (step.n <= currentStep ? "text-[#804226]" : "text-[#8B7355]")
                    }
                  >
                    {step.label}
                  </span>
                </div>
                <div
                  className={
                    "h-1 rounded-full " +
                    (step.n < currentStep
                      ? "bg-[#804226]"
                      : step.n === currentStep
                      ? "bg-[#DE903E]"
                      : "bg-[#E8D5B7]")
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#E8D5B7] flex-shrink-0" />

        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 ? (
            <div className="px-5 py-4">
              {allPackages.map((pkg) => {
                const selected = localPkgId === pkg.id;
                const tierColor = getTierColor(pkg.id);
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setLocalPkgId(pkg.id)}
                    className={
                      "mb-3 w-full rounded-2xl border-2 bg-[#FFFFFF] p-4 text-left transition-all active:scale-[0.99] " +
                      (selected ? "border-[#DE903E] shadow-md" : "border-[#E5E7EB]")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tierColor }} />
                          <p className="text-[16px] font-bold" style={{ color: tierColor }}>
                            {pkg.name}
                          </p>
                        </div>
                        <p className="text-[12px] text-[#8B7355]">{pkg.description}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#8B7355]">
                          <Users className="h-2.5 w-2.5" />
                          {pkg.paxRange}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[22px] font-extrabold text-[#111827]">₹{pkg.pricePerPlate}</p>
                        <p className="text-[11px] text-[#8B7355]">/plate</p>
                        <span className="mt-1 rounded-md bg-[#FFFFFF] border border-[#E8D5B7] px-2 py-0.5 text-[10px] text-[#804226]">
                          Up to {pkg.maxLimit} dishes
                        </span>
                        {selected ? <CheckCircle2 className="mt-2 h-4.5 w-4.5 text-[#DE903E]" /> : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="px-5 py-4">
              <div className="mb-5 flex items-center justify-between rounded-xl bg-[#FFF3E8] px-4 py-2.5">
                <p className="text-[13px] font-semibold text-[#804226]">
                  {activePkg.name} · ₹{activePkg.pricePerPlate}/plate
                </p>
                <button onClick={() => setCurrentStep(1)} className="text-[12px] font-semibold text-[#DE903E]">
                  Change
                </button>
              </div>

              <p className="mb-3 text-[14px] font-semibold text-[#111827]">Select guest range:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {supportedSlabs.map((slab) => {
                  const active = selectedPax === slab;
                  return (
                    <button
                      key={slab}
                      onClick={() => setSelectedPax(slab)}
                      className={
                        "rounded-2xl border px-3 py-3.5 text-center transition-all active:scale-95 " +
                        (active
                          ? "border-[#DE903E] bg-[#FFF8F0] text-[#DE903E]"
                          : "border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] hover:border-[#D1D5DB]")
                      }
                    >
                      <Users className={"mx-auto mb-1 h-4 w-4 " + (active ? "text-[#DE903E]" : "text-[#8B7355]")} />
                      <p className="text-[13px] font-semibold">{slab.replace("-", "–")} guests</p>
                    </button>
                  );
                })}
              </div>

              {selectedPax ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl border border-[#E8D5B7] bg-[#FFF3E8] px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-[#8B7355]">₹{activePkg.pricePerPlate} × ~{paxMidpoint} guests</p>
                    <p className="text-[20px] font-extrabold text-[#804226]">
                      ≈ ₹{(activePkg.pricePerPlate * paxMidpoint).toLocaleString("en-IN")}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="px-5 py-4">
              <div className="sticky top-0 z-[2] mb-4 rounded-xl bg-[#FFF3E8] px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[#804226]">
                    {activePkg.name} · {selectedPax?.replace("-", "–")} guests
                  </p>
                  <p className="text-[12px] font-bold text-[#804226]">₹{activePkg.pricePerPlate}/plate</p>
                </div>
              </div>

              <p className="text-[14px] font-bold text-[#111827]">Included Menu</p>
              <p className="mb-3 text-[12px] text-[#8B7355]">These dishes come with your package</p>

              {activePkg.categories.map((cat) => (
                <div key={cat.name} className="mb-4">
                  <span className="inline-block rounded-lg bg-[#FFF3E8] px-3 py-1.5 text-[13px] font-semibold text-[#804226]">
                    {cat.name}
                  </span>
                  <div className="mt-2 space-y-1">
                    {cat.items.map((item) => {
                      const key = cat.name + "::" + item.name;
                      const locked = item.isDefault;
                      const checked = selectedItems.includes(key);
                      const autoAddon = autoAddonSet.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleItem(key, locked)}
                          className="flex w-full items-center gap-2.5 py-1.5 text-left"
                        >
                          {checked ? (
                            <CheckSquare className={"h-4 w-4 " + (locked ? "text-[#16A34A]" : "text-[#DE903E]")} />
                          ) : (
                            <Square className="h-4 w-4 text-[#9CA3AF]" />
                          )}

                          <span
                            className={
                              "flex h-3.5 w-3.5 items-center justify-center rounded-sm border " +
                              (item.isVeg ? "border-[#16A34A]" : "border-[#DC2626]")
                            }
                          >
                            <span className={"h-2 w-2 rounded-full " + (item.isVeg ? "bg-[#16A34A]" : "bg-[#DC2626]")} />
                          </span>

                          <p className="flex-1 text-[13px] text-[#111827]">{item.name}</p>
                          {locked ? (
                            <span className="text-[10px] text-[#16A34A]">Included</span>
                          ) : autoAddon ? (
                            <span className="rounded px-2 py-1 text-xs font-bold text-[#9A3412] bg-[#FFEDD5]">Auto Add-on</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="my-4 h-px bg-[#E8D5B7]" />
                </div>
              ))}

              <div
                className={
                  "mb-4 rounded-xl border px-3 py-3 " +
                  (progressOver
                    ? "border-[#FDBA74] bg-[#FFF7ED] text-[#9A3412]"
                    : "border-[#86EFAC] bg-[#F0FDF4] text-[#15803D]")
                }
              >
                <p className="text-[12px] font-semibold">
                  {progressOver
                    ? autoAddonCount + " extra items marked as auto add-ons"
                    : "Selected: " + selectedItems.length + " / " + activePkg.baseLimit + " Base Items"}
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-[#E5E7EB]">
                  <div
                    className={"h-full rounded-full " + (progressOver ? "bg-[#DE903E]" : "bg-[#22C55E]")}
                    style={{ width: String(progressPct) + "%" }}
                  />
                </div>
              </div>

              <p className="text-[14px] font-bold text-[#111827]">Optional Add-ons</p>
              <p className="mb-3 text-[12px] text-[#8B7355]">Charged per person</p>
              {vendor.addons.map((addon) => {
                const active = selectedAddons.includes(addon.name);
                return (
                  <div key={addon.name} className="flex items-center gap-3 border-b border-[#F8F3EE] py-3 last:border-0">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                    <div className="flex-1">
                      <p className="text-[13px] text-[#111827]">{addon.name}</p>
                      <p className="text-[11px] text-[#8B7355]">+₹{addon.pricePerPax}/person</p>
                    </div>
                    <button
                      onClick={() => toggleAddon(addon.name)}
                      className={
                        "relative h-5.5 w-10 rounded-full transition-colors " +
                        (active ? "bg-[#804226]" : "bg-[#E8D5B7]")
                      }
                    >
                      <span
                        className={
                          "absolute top-0.5 h-4 w-4 rounded-full bg-[#FFFFFF] shadow transition-transform " +
                          (active ? "translate-x-[18px]" : "translate-x-0.5")
                        }
                      />
                    </button>
                  </div>
                );
              })}

              <div className="mt-1 flex items-center gap-3 py-3">
                <Users className="h-[15px] w-[15px] text-[#8B7355]" />
                <div className="flex-1">
                  <p className="text-[13px] text-[#111827]">Packaged Water</p>
                  <p className="text-[11px] text-[#8B7355]">₹{vendor.water.pricePerBottle}/bottle</p>
                </div>
                <button
                  onClick={() => setWaterSelected((p) => !p)}
                  className={
                    "relative h-5.5 w-10 rounded-full transition-colors " +
                    (waterSelected ? "bg-[#804226]" : "bg-[#E8D5B7]")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 h-4 w-4 rounded-full bg-[#FFFFFF] shadow transition-transform " +
                      (waterSelected ? "translate-x-[18px]" : "translate-x-0.5")
                    }
                  />
                </button>
              </div>

              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests..."
                className="mt-4 w-full resize-none rounded-xl border border-[#E8D5B7] bg-[#FFFFFF] px-4 py-3 text-[13px] text-[#1E1E1E] outline-none placeholder:text-[#8B7355] focus:border-[#804226]"
              />

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#E8D5B7] bg-[#FFFFFF]">
                <div className="flex items-center gap-2 bg-[#FFF3E8] px-4 py-2.5">
                  <Users className="h-3.5 w-3.5 text-[#804226]" />
                  <p className="text-[13px] font-bold text-[#804226]">Bill Estimate</p>
                </div>
                <div className="space-y-2 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-[#1E1E1E]">Package</p>
                    <p className="text-[13px]">₹{baseTotal.toLocaleString("en-IN")}</p>
                  </div>
                  {selectedAddons.map((name) => {
                    const addon = vendor.addons.find((a) => a.name === name);
                    if (!addon) return null;
                    return (
                      <div key={name} className="flex items-center justify-between">
                        <p className="text-[12px] text-[#8B7355]">{name}</p>
                        <p className="text-[12px] text-[#8B7355]">+₹{(addon.pricePerPax * paxMidpoint).toLocaleString("en-IN")}</p>
                      </div>
                    );
                  })}
                  <div className="h-px bg-[#E8D5B7]" />
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#1E1E1E]">Subtotal</p>
                    <p className="text-[13px] font-semibold">₹{subtotal.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#8B7355]">GST 18%</p>
                    <p className="text-[12px] text-[#8B7355]">₹{gst.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="h-px bg-[#E8D5B7]" />
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-[#804226]">Total</p>
                    <p className="text-[18px] font-extrabold text-[#804226]">₹{total.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex-shrink-0 border-t border-[#E8D5B7] bg-[#FFFFFF] px-5 py-4">
          {currentStep === 1 ? (
            <button
              onClick={() => {
                onPkgChange(localPkgId);
                setCurrentStep(2);
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#DE903E] text-[14px] font-bold text-[#FFFFFF]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}

          {currentStep === 2 ? (
            <button
              onClick={() => {
                if (!selectedPax) return;
                setCurrentStep(3);
              }}
              className={
                "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold " +
                (selectedPax ? "bg-[#DE903E] text-[#FFFFFF]" : "cursor-not-allowed bg-[#E8D5B7] text-[#8B7355]")
              }
            >
              {selectedPax ? "Continue to Menu" : "Select Guests to Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}

          {currentStep === 3 ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8B7355]">Estimated</span>
                <span className="text-[18px] font-extrabold text-[#804226]">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!selectedPax) return;
                  const mid = getPaxMidpoint(selectedPax);
                  onComplete({
                    packageId: activePkg.id,
                    pricePerPlate: activePkg.pricePerPlate,
                    selectedItems: [...selectedItems],
                    addOnItems: [...selectedAddons],
                    guestCount: Math.max(mid, 25),
                    guestSlab: selectedPax.replace("-", "–") + " guests",
                    waterType: waterSelected ? "packaged" : "none",
                    specialNote: note.trim(),
                  });
                }}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#DE903E] text-[14px] font-bold text-[#FFFFFF]"
              >
                Continue to event details
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </>
  );
}
