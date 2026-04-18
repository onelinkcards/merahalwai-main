"use client";

import { useMemo } from "react";
import { ArrowRight, Leaf, MapPin, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getVendorDetailBySlug, type Vendor } from "@/data/vendors";
import MHIconOrange from "@/logos/Symbol/MH_Logo_Icon_Orange.png";

type VendorCardProps = {
  vendor: Vendor;
};

function FoodBadge({ isVeg, compact = false }: { isVeg: boolean; compact?: boolean }) {
  if (isVeg) {
    return (
      <span
        className={
          "inline-flex items-center gap-1.5 rounded-full border border-[#1D8C4E]/15 bg-[#EEF8F2] text-[#1D8C4E] " +
          (compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]")
        }
      >
        <Leaf className={(compact ? "h-3 w-3" : "h-3.5 w-3.5") + " fill-current text-current"} strokeWidth={2} />
        <span className="font-bold uppercase tracking-[0.16em]">Pure Veg</span>
      </span>
    );
  }

  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border border-[#C9563F]/15 bg-[#FFF2EF] text-[#B64532] " +
        (compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]")
      }
    >
      <span className="flex items-center gap-1">
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border border-[#1D8C4E] bg-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1D8C4E]" />
        </span>
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border border-[#B64532] bg-white">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B64532]" />
        </span>
      </span>
      <span className="font-bold uppercase tracking-[0.14em]">Veg & Non-Veg</span>
    </span>
  );
}

function FoodIndicatorBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[rgba(255,255,255,0.14)] px-2.5 py-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
      <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#1D8C4E] bg-white">
        <span className="h-2 w-2 rounded-full bg-[#1D8C4E]" />
      </span>
      {!isVeg ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#B64532] bg-white">
          <span className="h-2 w-2 rounded-full bg-[#B64532]" />
        </span>
      ) : null}
    </span>
  );
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const router = useRouter();
  const detail = useMemo(() => getVendorDetailBySlug(vendor.slug), [vendor.slug]);
  const goToProfile = () => router.push("/caterer/" + vendor.slug);
  const thumbs = vendor.images.slice(1, 3);
  const thirdThumb = vendor.images[3] ?? vendor.images[2] ?? vendor.images[0];
  const extraCount = Math.max(vendor.images.length - 3, 0);
  const packageCount = detail?.packages?.length ?? 0;
  const isPopular = vendor.rating >= 4.7 || vendor.reviews >= 150;
  const lowestPackagePrice =
    detail?.packages?.reduce((lowest, pkg) => Math.min(lowest, pkg.pricePerPlate), Number.POSITIVE_INFINITY) ??
    vendor.priceVeg;
  const displayPrice = Number.isFinite(lowestPackagePrice) ? lowestPackagePrice : vendor.priceVeg;

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      onClick={goToProfile}
      className="mh-vendor-card-surface group cursor-pointer overflow-hidden rounded-[28px] border bg-transparent transition-all duration-300 hover:border-[#E4D1BC] hover:shadow-[0_20px_46px_rgba(95,61,28,0.12)] active:scale-[0.99] md:flex md:min-h-[340px] md:items-stretch"
    >
      <div className="relative h-[284px] w-full overflow-hidden bg-[#1E1E1E] md:h-auto md:min-h-0 md:w-[42%] md:flex-shrink-0 md:self-stretch">
        <Image
          src={vendor.images[0]}
          alt={vendor.name}
          fill
          unoptimized
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {vendor.verified ? (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[#F0D4AF] bg-[rgba(255,249,240,0.94)] px-3 py-1.5 shadow-[0_8px_20px_rgba(95,61,28,0.12)]">
            <Image src={MHIconOrange} alt="MH Verified" className="h-[14px] w-[14px] object-contain" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#EB8B23]">MH VERIFIED</span>
          </div>
        ) : null}

        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <div className="flex h-[30px] items-center justify-center gap-1.5 rounded-full bg-[#1E8D4F]/95 px-3 shadow-[0_10px_24px_rgba(20,87,44,0.24)]">
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            <span className="text-[13px] font-bold text-white">{vendor.rating}</span>
          </div>
          {isPopular ? (
            <span className="inline-flex items-center rounded-full border border-white/35 bg-[rgba(255,247,236,0.9)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D] shadow-[0_10px_22px_rgba(95,61,28,0.12)] md:hidden">
              Popular
            </span>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 hidden h-[92px] bg-gradient-to-t from-black/70 via-black/20 to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t from-black/96 via-black/66 to-transparent md:hidden" />
        <div className="absolute bottom-3 left-3 hidden gap-2 md:flex">
          {thumbs.map((thumb) => (
            <div key={thumb} className="h-[48px] w-[48px] overflow-hidden rounded-xl border border-white/45 shadow-sm transition-transform hover:scale-105">
              <Image src={thumb} alt="" width={48} height={48} unoptimized className="h-full w-full object-cover" />
            </div>
          ))}
          {vendor.images.length > 3 ? (
            <div className="relative h-[48px] w-[48px] overflow-hidden rounded-xl border border-white/45">
              <Image src={thirdThumb} alt="" width={48} height={48} unoptimized className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-bold text-white">
                +{extraCount}
              </div>
            </div>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[22px] font-black leading-[1.02] tracking-tight text-white [text-shadow:0_6px_24px_rgba(0,0,0,0.42)]">
                {vendor.name}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-white/86">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#FFD9AE]" />
                  {vendor.location}
                </span>
                <span className="text-white/55">|</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[#FFD9AE]" />
                  {vendor.minPax}–{vendor.maxPax} guests
                </span>
              </p>
            </div>
            <FoodIndicatorBadge isVeg={vendor.isVeg} />
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/68">Starting from</p>
              <p className="mt-1 text-[24px] font-black leading-none tracking-tight text-white [text-shadow:0_6px_24px_rgba(0,0,0,0.35)]">
                ₹{displayPrice}
                <span className="ml-1 text-[11px] font-semibold text-white/82">/plate onwards</span>
              </p>
            </div>
            {packageCount > 0 ? (
              <span className="rounded-full border border-white/18 bg-white/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/92 backdrop-blur-md">
                {packageCount} Packages
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 flex-col justify-between bg-transparent px-7 py-6 md:flex">
        <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[24px] font-black leading-[1.06] tracking-tight text-[#1E1E1E]">
              {vendor.name}
            </h3>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1E8D4F] px-2.5 py-1 text-[11px] font-bold text-white">
                <Star className="h-3 w-3 fill-white text-white" />
                {vendor.rating}
              </span>
              <span className="text-[12px] font-semibold text-[#7F6C5A]">{vendor.reviews} reviews</span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#8B7355]">
              <MapPin className="h-4 w-4 flex-shrink-0 text-[#EB8B23]" />
              {vendor.location}
            </p>
            <p className="mt-3 flex items-center gap-2 text-[12px] font-bold text-[#8A7767]">
              <Users className="h-4 w-4 text-[#A3978B]" />
              {vendor.minPax}–{vendor.maxPax} guests
            </p>
          </div>
          <FoodBadge isVeg={vendor.isVeg} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {vendor.specialisations.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="mh-vendor-chip-solid whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]"
            >
              {tag}
            </span>
          ))}
        </div>
        </div>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A3978B]">Starting from</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[29px] font-black leading-none tracking-tighter text-[#1E1E1E]">
                ₹{displayPrice}
              </span>
              <span className="text-[13px] font-medium text-[#8B7355]">/plate</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToProfile();
              }}
              className="mh-outline-button flex h-10 min-w-[132px] items-center justify-center rounded-xl border-[1.5px] px-5 text-[13px] font-bold transition-all duration-300 hover:bg-[#FFF5EB] active:scale-[0.98]"
            >
              View Profile
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/caterer/" + vendor.slug);
              }}
              className="mh-primary-button flex h-10 min-w-[124px] items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-bold !text-[#FFFFFF] transition-all duration-300 active:scale-[0.98]"
            >
              Book Now
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

    </motion.article>
  );
}
