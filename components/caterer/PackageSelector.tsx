"use client";

import { Users } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

type Package = {
  id: string;
  name: string;
  pricePerPlate: number;
  description: string;
  paxRange: string;
  maxLimit: number;
  color: string;
  bgColor: string;
  borderColor: string;
};

type PackageSelectorProps = {
  packages: readonly Package[];
  selectedPkg: string;
  onSelect: (pkgId: string) => void;
  onOpenMenu: () => void;
};

export default function PackageSelector({
  packages,
  selectedPkg,
  onSelect,
  onOpenMenu,
}: PackageSelectorProps) {
  const tierStyle = (id: string) => {
    if (id === "gold") {
      return {
        border: "border-[#D4A017]",
        badge: "bg-[#FFFBEC] text-[#A36B00]",
        icon: "/gold.png",
      };
    }
    if (id === "silver") {
      return {
        border: "border-[#A0A0A0]",
        badge: "bg-[#F4F4F4] text-[#555555]",
        icon: "/silver.png",
      };
    }
    return {
      border: "border-[#C6844F]",
      badge: "bg-[#FDF4EC] text-[#A45A2A]",
      icon: "/Group 8284.png",
    };
  };

  return (
    <section>
      <h3 className="mb-4 text-[20px] font-bold text-[#1C1C1C]">Choose Package</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {packages.map((pkg) => {
          const isSelected = selectedPkg === pkg.id;
          const tone = tierStyle(pkg.id);
          return (
            <motion.article
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(pkg.id);
                }
              }}
              className={
                "rounded-2xl border p-5 text-left transition-all duration-200 " +
                (isSelected
                  ? "border-[#DE903E] bg-[#FFF8F0] shadow-[0_8px_22px_rgb(0,0,0,0.08)]"
                  : "border-[#E6E6E6] bg-[#FFFFFF]")
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-5 w-5 overflow-hidden rounded-sm">
                    <Image src={tone.icon} alt={pkg.name + " icon"} fill className="object-contain" />
                  </div>
                  <span className="text-[16px] font-bold text-[#1C1C1C]">{pkg.name}</span>
                </div>
                <span className={"rounded-md px-2 py-0.5 text-[10px] font-semibold " + tone.badge}>Tier</span>
              </div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-[30px] font-extrabold text-[#1C1C1C]">₹{pkg.pricePerPlate}</span>
                <span className="pb-1 text-[13px] text-[#666666]">/plate</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#666666]">
                <Users className="h-3.5 w-3.5 text-[#666666]" />
                {pkg.paxRange}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#666666]">{pkg.description}</p>
              <span className="mt-2 inline-block rounded bg-[#F9F9F9] px-2 py-0.5 text-[11px] font-semibold text-[#333333]">
                Up to {pkg.maxLimit} dishes
              </span>
              <p className="mt-2 text-[12px] font-medium text-[#6B7280]">View full menu</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(pkg.id);
                }}
                className={
                  "mt-3 h-9 w-full rounded-xl text-[13px] font-bold " +
                  (isSelected
                    ? "bg-[#DE903E] text-[#FFFFFF]"
                    : "border border-[#DE903E] text-[#DE903E]")
                }
              >
                {isSelected ? "Selected ✓" : "Select"}
              </button>
            </motion.article>
          );
        })}
      </div>
      <button onClick={onOpenMenu} className="mt-3 block w-full text-center text-[13px] font-semibold text-[#DE903E]">
        View full menu & customise →
      </button>
    </section>
  );
}
