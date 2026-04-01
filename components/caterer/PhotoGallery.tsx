"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

type PhotoGalleryProps = {
  images: readonly string[];
  onOpen: (index: number) => void;
};

export default function PhotoGallery({ images, onOpen }: PhotoGalleryProps) {
  const hero = images[0];
  const gridImages = images.slice(1, 5);
  const extra = Math.max(images.length - 5, 0);

  return (
    <section className="w-full border-b border-[#EDEDED] bg-[#FFFFFF]">
      <div className="relative grid grid-cols-1 gap-2 bg-[#FFFFFF] lg:h-[400px] lg:grid-cols-[2fr_1fr]">
        <button onClick={() => onOpen(0)} className="relative block h-[280px] w-full cursor-pointer lg:h-[430px]">
          <Image src={hero} alt="Vendor photo" fill className="object-cover" />
        </button>
        <div className="grid grid-cols-2 gap-2 bg-[#FFFFFF]">
          {gridImages.map((img, idx) => (
            <button key={img + idx} onClick={() => onOpen(idx + 1)} className="relative block h-[140px] w-full cursor-pointer lg:h-[214px]">
              <Image src={img} alt="Gallery image" fill className="object-cover" />
              {idx === 3 && extra > 0 ? (
                <span className="absolute inset-0 flex items-center justify-center gap-1 bg-[#1C1C1C]/45 text-[#FFFFFF]">
                  <Camera className="h-4 w-4" />
                  <span className="text-[12px] font-bold">+{extra}</span>
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <button
          onClick={() => onOpen(0)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF]/95 px-3 py-2 text-[12px] font-semibold text-[#111827] shadow-sm"
        >
          <Camera className="h-3.5 w-3.5" />
          Show all photos
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide lg:hidden">
        {images.slice(0, 6).map((img, idx) => (
          <button
            key={img + idx}
            onClick={() => onOpen(idx)}
            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#E6E6E6]"
          >
            <Image src={img} alt="Thumbnail" fill className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
