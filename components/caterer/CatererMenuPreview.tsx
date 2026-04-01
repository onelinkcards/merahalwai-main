"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { getMenuItemImageUrl, shortMenuDescription } from "@/data/menuItemImages";
import type { VendorDetailFull } from "@/data/vendors";

const PREVIEW_ITEMS = 4;

export default function CatererMenuPreview({ vendor, slug }: { vendor: VendorDetailFull; slug: string }) {
  const silver = useMemo(
    () => vendor.packages?.find((p) => p.id === "silver"),
    [vendor.packages],
  );

  if (!silver?.categories?.length) {
    return (
      <section className="mx-4 mt-4 rounded-2xl border border-[#E8D5B7] bg-white p-6 md:mx-0">
        <p className="text-center text-[14px] text-[#8B7355]">Menu details available when you start booking.</p>
        <Link
          href={`/caterer/${slug}`}
          className="mt-4 flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#DE903E] text-[15px] font-bold text-white transition-all hover:bg-[#804226] active:scale-[0.98]"
        >
          Book this caterer
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-4 mt-4 rounded-2xl border border-[#E8D5B7] bg-white p-5 md:mx-0">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-[18px] font-bold text-[#1E1E1E]">Menu preview</h3>
        <p className="text-[12px] text-[#8B7355]">
          Sample from Silver package. Pick package, guests, and dishes on the booking page.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {vendor.packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-xl border border-[#E8D5B7] bg-[#FFFAF5] px-2 py-3 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#8B7355]">{pkg.name}</p>
            <p className="mt-1 text-[15px] font-extrabold text-[#804226]">₹{pkg.pricePerPlate}</p>
            <p className="text-[9px] text-[#8B7355]">/plate</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {silver.categories.map((cat) => {
          const slice = cat.items.slice(0, PREVIEW_ITEMS);
          const rest = cat.items.length - slice.length;
          return (
            <div key={cat.name}>
              <p className="mb-2 text-[13px] font-bold text-[#804226]">{cat.name}</p>
              <div className="space-y-2">
                {slice.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-xl border border-[#E8D5B7] bg-[#FFFAF5] p-2.5"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#E8D5B7]">
                      <Image
                        src={getMenuItemImageUrl(item.name)}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
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
                        <span className="text-[13px] font-semibold text-[#1E1E1E]">{item.name}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#8B7355]">{shortMenuDescription(item.name)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {rest > 0 ? (
                <p className="mt-1.5 text-[11px] font-semibold text-[#DE903E]">
                  +{rest} more in this category on booking page
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <Link
        href={`/caterer/${slug}`}
        className="mt-5 flex h-[52px] w-full items-center justify-center rounded-2xl bg-[#DE903E] text-[15px] font-bold text-white transition-all hover:bg-[#804226] active:scale-[0.98]"
      >
        Select package & build menu
      </Link>
    </section>
  );
}
