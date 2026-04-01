"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { VegDotInline } from "./VegDotInline";

type Addon = { name: string; isVeg: boolean; pricePerPax: number };

type Props = {
  open: boolean;
  onClose: () => void;
  packageLabel: string;
  packagePricePerPlate: number;
  addons: Addon[];
  selectedAddons: string[];
  toggleAddon: (name: string) => void;
  paxMidpoint: number;
};

export function AddonCustomizeModal({
  open,
  onClose,
  packageLabel,
  packagePricePerPlate,
  addons,
  selectedAddons,
  toggleAddon,
  paxMidpoint,
}: Props) {
  const addonSum = addons
    .filter((a) => selectedAddons.includes(a.name))
    .reduce((s, a) => s + a.pricePerPax * paxMidpoint, 0);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="addon-modal-root"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-lg rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:max-w-xl"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex max-h-[min(88vh,720px)] flex-col overflow-hidden rounded-[28px]">
              <div className="border-b border-[#E8E5E0] px-5 pb-4 pt-5 md:px-7 md:pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <p className="text-[12px] font-medium text-[#6B7280]">
                      {packageLabel} · from ₹{packagePricePerPlate}/plate
                    </p>
                    <h2 className="mt-1 text-[20px] font-bold leading-tight text-[#111827] md:text-[22px]">
                      Customise add-ons for your event
                    </h2>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      Select extras — charged per guest, added to your final bill.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151] transition-colors hover:bg-[#E5E7EB]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 md:px-7">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="text-[15px] font-bold text-[#111827]">Quick add-ons</h3>
                  <span className="text-[12px] font-semibold text-[#9CA3AF]">
                    ({selectedAddons.length}/{addons.length})
                  </span>
                </div>
                <div className="rounded-2xl bg-[#F5F5F5] p-3 md:p-4">
                  <div className="space-y-0 divide-y divide-[#E5E7EB]">
                    {addons.map((addon) => {
                      const on = selectedAddons.includes(addon.name);
                      return (
                        <label
                          key={addon.name}
                          className="flex cursor-pointer items-center gap-3 py-3.5 first:pt-1 last:pb-1"
                        >
                          <VegDotInline isVeg={addon.isVeg} size={16} />
                          <span className="flex-1 text-[14px] font-medium text-[#111827]">
                            {addon.name}
                          </span>
                          <span className="text-[13px] font-semibold text-[#6B7280]">
                            + ₹{addon.pricePerPax}
                          </span>
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleAddon(addon.name)}
                            className="h-5 w-5 flex-shrink-0 rounded border-2 border-[#D1D5DB] accent-[#DE903E]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E8E5E0] bg-white px-5 py-4 md:px-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                      Add-ons subtotal (est.)
                    </p>
                    <p className="text-[22px] font-extrabold text-[#111827]">
                      ₹{addonSum.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[48px] w-full rounded-full bg-[#DE903E] px-6 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(222,144,62,0.35)] transition-all hover:bg-[#804226] active:scale-[0.98] sm:w-auto sm:min-w-[200px]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
