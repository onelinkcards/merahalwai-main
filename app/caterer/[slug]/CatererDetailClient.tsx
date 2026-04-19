"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Share2,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getVendorDetailBySlug, type VendorDetailFull } from "@/data/vendors";
import { buildFullMenuPreviewSections } from "@/lib/bookingMenuHelpers";
import { useBookingStore, type FoodPreference, type PackageTier } from "@/store/bookingStore";

type ReviewData = VendorDetailFull["reviews"][number];
type FoodViewMode = "veg" | "all";

function packageTone(id: string) {
  if (id === "gold") {
    return {
      icon: "/gold.png",
      border: "#D4A017",
      bg: "#FFF7DD",
      panelBg: "#FFF9EC",
      badgeBg: "#FFF0B8",
      text: "#7A5C00",
      accent: "#C69100",
    };
  }

  if (id === "silver") {
    return {
      icon: "/silver.png",
      border: "#94A0AD",
      bg: "#F2F5F8",
      panelBg: "#F6F8FB",
      badgeBg: "#E5EBF1",
      text: "#415569",
      accent: "#5A6C7C",
    };
  }

  return {
    icon: "/Group 8284.png",
    border: "#B6784D",
    bg: "#FBF1E7",
    panelBg: "#FDF6F0",
    badgeBg: "#F6E5D8",
    text: "#8B5E3C",
    accent: "#8A3E1D",
  };
}

function FoodBadge({ isVeg }: { isVeg: boolean }) {
  if (isVeg) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1D8C4E]/15 bg-[#EEF8F2] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D8C4E]">
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#1D8C4E] bg-white">
          <span className="h-2 w-2 rounded-full bg-[#1D8C4E]" />
        </span>
        Pure Veg
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#C9563F]/15 bg-[#FFF2EF] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#B64532]">
      <span className="flex items-center gap-1">
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#1D8C4E] bg-white">
          <span className="h-2 w-2 rounded-full bg-[#1D8C4E]" />
        </span>
        <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#B64532] bg-white">
          <span className="h-2 w-2 rounded-full bg-[#B64532]" />
        </span>
      </span>
      Veg & Non-Veg
    </span>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-[#E6DED4] bg-white shadow-[0_18px_42px_rgba(24,20,16,0.05)]">
      <div className="p-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1F1E1B] text-[13px] font-black text-white">
            {review.initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-[16px] font-black text-[#1E1E1E]">{review.name}</p>
                <span className="rounded-full border border-[#E6DED3] bg-[#FCFAF6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6D5A49]">
                  {review.event}
                </span>
              </div>
              <p className="mt-1 text-[12px] font-medium text-[#8B7355]">{review.date}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 self-start rounded-full bg-[#1E8D4F] px-3 py-1.5 text-[12px] font-bold text-white">
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            {review.rating}.0
          </div>
        </div>

        <p className="mt-4 text-[14px] leading-[1.85] text-[#403830] md:text-[15px]">{review.text}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F0E8DE] bg-[#FCFAF6] px-5 py-3.5 md:px-6">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={
                "h-3.5 w-3.5 " +
                (index < review.rating ? "fill-[#EB8B23] text-[#EB8B23]" : "text-[#E8D5B7]")
              }
            />
          ))}
        </div>
        <span className="rounded-full border border-[#E7DDD0] px-3 py-1 text-[11px] font-semibold text-[#6B6259]">
          Verified event feedback
        </span>
      </div>
    </article>
  );
}

export default function CatererDetailClient() {
  const params = useParams<{ slug: string | string[] }>();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] ?? "" : params?.slug ?? "";
  const vendor = useMemo(() => (slug ? getVendorDetailBySlug(slug) : null), [slug]);
  const setMany = useBookingStore((s) => s.setMany);

  const [selectedPkg, setSelectedPkg] = useState<PackageTier>("silver");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [openMenuCategory, setOpenMenuCategory] = useState<string | null>(null);
  const [foodView, setFoodView] = useState<FoodViewMode>("all");

  const menuRef = useRef<HTMLElement | null>(null);
  const packagesRef = useRef<HTMLElement | null>(null);
  const reviewsRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const overviewRef = useRef<HTMLElement | null>(null);
  const locationRef = useRef<HTMLElement | null>(null);
  const bookingPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!vendor) return;
    const preferred =
      (vendor.packages.find((pkg) => pkg.id === "silver")?.id as PackageTier | undefined) ??
      (vendor.packages[0]?.id as PackageTier | undefined) ??
      "bronze";

    setSelectedPkg(preferred);
    setMany({
      vendorSlug: slug,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorImage: vendor.images[0] ?? "",
    });
    setFoodView(vendor.isVeg ? "veg" : "all");
  }, [slug, vendor, setMany]);

  const startingPrice = useMemo(() => {
    if (!vendor) return 0;
    return Math.min(...vendor.packages.map((pkg) => pkg.pricePerPlate));
  }, [vendor]);

  const selectedPackage = useMemo(() => {
    if (!vendor) return null;
    return vendor.packages.find((pkg) => pkg.id === selectedPkg) ?? vendor.packages[0] ?? null;
  }, [selectedPkg, vendor]);

  const menuGroups = useMemo(
    () =>
      selectedPackage
        ? buildFullMenuPreviewSections(
            slug,
            (vendor?.isVeg || foodView === "veg" ? "veg" : "veg_nonveg") as FoodPreference
          )
        : [],
    [foodView, selectedPackage, slug, vendor?.isVeg]
  );

  const imageList = vendor?.images ?? [];
  const locality = useMemo(() => {
    if (!vendor) return "";
    return vendor.location.includes("Jaipur") ? vendor.location : `${vendor.location}, Jaipur`;
  }, [vendor]);

  const subtitle = useMemo(() => {
    if (!vendor) return "";
    const cuisines = vendor.cuisines.slice(0, 2).join(" & ");
    const events = vendor.eventTypes.slice(0, 2).join(" and ").replace(/ \/ Office Party/g, "").toLowerCase();
    return `${cuisines} menus designed for ${events} across Jaipur.`;
  }, [vendor]);

  const aboutText = useMemo(() => {
    if (!vendor) return "";
    const cuisines = vendor.cuisines.slice(0, 2).join(" and ");
    const service = vendor.specialisations.slice(0, 2).join(" and ").toLowerCase();
    const events = vendor.eventTypes.slice(0, 2).join(" and ").replace(/ \/ Office Party/g, "").toLowerCase();
    return `${vendor.name} focuses on ${cuisines} catering with ${service}. Best suited for ${events} when you want structured packages and menu customization.`;
  }, [vendor]);

  const highlightedReviews = vendor?.reviews.slice(0, 3) ?? [];
  const googlePlaceId = vendor ? (vendor as VendorDetailFull & { googlePlaceId?: string }).googlePlaceId : undefined;
  const googleReviewsLink = googlePlaceId
    ? `https://search.google.com/local/reviews?placeid=${googlePlaceId}`
    : null;
  const mapsQuery = useMemo(() => encodeURIComponent(locality), [locality]);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&z=14&output=embed`;

  useEffect(() => {
    if (!menuGroups.length) return;
    setOpenMenuCategory((prev) =>
      prev && menuGroups.some((group) => group.title === prev) ? prev : menuGroups[0]?.title ?? null
    );
  }, [menuGroups]);

  if (!vendor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FDF9F3] px-4">
        <div className="mh-vendor-card-surface w-full max-w-md rounded-[28px] border p-8 text-center">
          <p className="text-[24px] font-black text-[#1E1E1E]">Caterer not found</p>
          <button
            type="button"
            onClick={() => router.push("/caterers")}
            className="mh-primary-button mt-5 h-11 rounded-xl px-6 text-[14px] font-bold text-white"
          >
            Back to Search
          </button>
        </div>
      </main>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const scrollToSection = (ref: RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyPackageSelection = (pkgId: PackageTier) => {
    setSelectedPkg(pkgId);
  };

  const beginBookingIntent = (pkgId?: PackageTier) => {
    if (!vendor) return;
    const activePackage =
      vendor.packages.find((pkg) => pkg.id === (pkgId ?? selectedPackage?.id)) ?? selectedPackage;
    if (!activePackage) return;

    setMany({
      vendorSlug: slug,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorImage: vendor.images[0] ?? "",
      selectedPackage: activePackage.id as PackageTier,
      pricePerPlate: activePackage.pricePerPlate,
    });

    router.push("/book/basics?vendor=" + encodeURIComponent(slug));
  };

  const handlePackageAction = (pkgId: PackageTier) => {
    applyPackageSelection(pkgId);
    beginBookingIntent(pkgId);
  };

  const handleShareProfile = async () => {
    const url = typeof window !== "undefined" ? window.location.href : mapsUrl;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: vendor.name, url });
        return;
      } catch {
        // noop fallback below
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  const bookingPanel = (
    <div
      ref={bookingPanelRef}
      className="overflow-hidden rounded-[30px] border border-[#DDD6CC] bg-[linear-gradient(180deg,#FFFDF9_0%,#FFF8F0_100%)] shadow-[0_28px_60px_rgba(20,18,15,0.08)]"
    >
      <div className="border-b border-[#EEE4D7] bg-[linear-gradient(135deg,rgba(236,153,37,0.08),rgba(138,62,29,0.02))] px-5 py-4">
        <h3 className="text-[26px] font-black leading-[1] tracking-[-0.03em] text-[#1E1E1E]">
          Choose Package
        </h3>
      </div>

      <div className="px-4 py-5">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
          {vendor.packages.map((pkg) => {
            const active = selectedPackage?.id === pkg.id;
            const tone = packageTone(pkg.id);
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => applyPackageSelection(pkg.id as PackageTier)}
                className="relative overflow-hidden rounded-[24px] border px-4 py-4 text-left transition-all duration-200 ease-out focus:outline-none"
                style={{
                  borderColor: active ? tone.border : "#E4DDD3",
                  background: active
                    ? `linear-gradient(180deg, ${tone.bg} 0%, ${tone.panelBg} 100%)`
                    : "linear-gradient(180deg,#FFFFFF 0%,#FFFCF8 100%)",
                  boxShadow: active ? "0 18px 34px rgba(138,62,29,0.14)" : "0 10px 24px rgba(31,30,27,0.05)",
                }}
                aria-pressed={active}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{
                    background: active
                      ? "linear-gradient(90deg,#EC9925 0%,#8A3E1D 100%)"
                      : "transparent",
                  }}
                />

                <div className="flex h-full min-h-[148px] flex-col gap-4 md:min-h-[168px] xl:grid xl:min-h-0 xl:grid-cols-[48px_minmax(0,1fr)_auto] xl:items-center xl:gap-4">
                  <div className="flex items-center justify-between xl:contents">
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] border"
                      style={{
                        background: active ? tone.badgeBg : "#FBF7F0",
                        borderColor: active ? tone.border : "#E8DED1",
                      }}
                    >
                      <div className="relative h-6 w-6">
                        <Image src={tone.icon} alt={pkg.name + " icon"} fill className="object-contain" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 xl:pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className="text-[19px] font-black leading-none tracking-[-0.02em]"
                        style={{ color: active ? tone.text : "#1E1E1E" }}
                      >
                        {pkg.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto xl:mt-0 xl:text-right">
                    <p className="text-[30px] font-black leading-none tracking-[-0.04em] text-[#1E1E1E]">
                      ₹{pkg.pricePerPlate}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-[#6D6760]">/plate</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => beginBookingIntent(selectedPackage?.id as PackageTier | undefined)}
          className="mt-5 flex h-14 w-full items-center justify-center rounded-[20px] px-5 text-[16px] font-bold text-white shadow-[0_20px_40px_rgba(138,62,29,0.18)] transition-all hover:brightness-[1.03]"
          style={{
            background: "linear-gradient(135deg,#8A3E1D 0%,#682C13 100%)",
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );

  const paymentSplitBar = (
    <div className="overflow-hidden rounded-[18px] border border-[#E7DED2] bg-white shadow-[0_14px_28px_rgba(24,20,16,0.05)]">
      <div className="border-b border-[#EFE5D9] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A6D52]">Payment after confirmation</p>
        <p className="mt-1 text-[12px] font-medium text-[#5F5A54]">30% online now, remaining 70% at property.</p>
      </div>
      <div className="grid grid-cols-2">
        <div className="flex items-center justify-center gap-2 bg-[#682C13] px-3 py-2.5 text-white">
          <span className="text-[21px] font-black leading-none tracking-[-0.04em]">30%</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/84">Online</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-[#FBF4E8] px-3 py-2.5 text-[#7D776F]">
          <span className="text-[21px] font-black leading-none tracking-[-0.04em] text-[#78736B]">70%</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8D867B]">Offline</span>
        </div>
      </div>
    </div>
  );

  const bookingSidebar = (
    <div className="space-y-4">
      {bookingPanel}
      {paymentSplitBar}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-32 text-[#1E1E1E] md:pb-16">
      {!lightboxOpen ? <Navbar /> : null}
      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-3 md:px-8 md:pt-8 xl:px-10">
        <div className="hidden items-center justify-between md:flex">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/caterers")}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E3D5C4] bg-white px-5 text-[13px] font-bold text-[#5F5A54] shadow-[0_10px_24px_rgba(24,20,16,0.04)] transition-colors hover:text-[#1E1E1E]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </button>
            <nav className="flex items-center gap-3 text-[15px] text-[#6D6760]">
              <button
                onClick={() => router.push("/caterers")}
                className="font-medium transition-colors hover:text-[#1E1E1E]"
              >
                Caterers
              </button>
              <span>/</span>
              <span className="font-semibold text-[#1E1E1E]">{vendor.name}</span>
            </nav>
          </div>
        </div>

        <section className="mt-6 xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
          <div className="min-w-0">
            <section className="md:hidden">
              <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_22px_54px_rgba(20,18,15,0.08)]">
                <div className="grid grid-cols-[1.28fr_0.92fr] gap-2 bg-[#EFE9DF] p-2">
                  <div
                    className="relative h-[168px] overflow-hidden rounded-[22px] cursor-pointer"
                    onClick={() => openLightbox(0)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLightbox(0);
                      }
                    }}
                  >
                    <Image
                      src={imageList[0] ?? ""}
                      alt={vendor.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="66vw"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/caterers");
                      }}
                      className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#E8DDD1] bg-white/96 text-[#1E1E1E] shadow-[0_12px_24px_rgba(0,0,0,0.16)]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openLightbox(1)}
                    className="relative row-span-2 h-[346px] overflow-hidden rounded-[22px]"
                  >
                    <Image
                      src={imageList[1] ?? imageList[0] ?? ""}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="34vw"
                    />
                  <div className="pointer-events-none absolute bottom-3 left-3">
                    <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#E6DED3] bg-white/96 px-3.5 text-[11px] font-bold text-[#1E1E1E] shadow-[0_10px_22px_rgba(0,0,0,0.18)]">
                      <Camera className="h-3.5 w-3.5 text-[#1E1E1E]" />
                      View Album
                    </span>
                  </div>
                </button>

                  <button
                    type="button"
                    onClick={() => openLightbox(2)}
                    className="relative h-[168px] overflow-hidden rounded-[22px]"
                  >
                    <Image
                      src={imageList[2] ?? imageList[0] ?? ""}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="66vw"
                    />
                  </button>
                </div>

                <div className="px-4 pb-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h1 className="text-[28px] font-black leading-[1.04] tracking-tight text-[#1E1E1E] break-words">
                        {vendor.name}
                      </h1>
                      <p className="mt-2 text-[14px] font-medium text-[#625B53]">
                        {vendor.cuisines.slice(0, 2).join(", ")}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#EEF7D7] px-3 py-2 text-right shadow-sm">
                      <p className="text-[12px] font-black text-[#6B8A1D]">{vendor.rating}★</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#4E4A44]">{vendor.reviewsCount}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-[1.75] text-[#3F3932]">{subtitle}</p>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[#7C746B]">{locality}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <FoodBadge isVeg={vendor.isVeg} />
                    {vendor.cuisines.slice(0, 2).map((cuisine) => (
                      <span
                        key={cuisine}
                        className="rounded-full border border-[#E7DED2] bg-[#FAF7F2] px-3 py-1.5 text-[11px] font-semibold text-[#5B544C]"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => openLightbox(0)}
                      className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#E7DED2] bg-[#FBF8F3] px-3 text-[12px] font-bold text-[#3B3530]"
                    >
                      <Camera className="h-4 w-4 text-[#8A3E1D]" />
                      View Album
                    </button>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#E7DED2] bg-[#FBF8F3] px-3 text-[12px] font-bold text-[#3B3530]"
                    >
                      <Navigation className="h-4 w-4 text-[#8A3E1D]" />
                      Directions
                    </a>
                    <button
                      onClick={() => scrollToSection(reviewsRef)}
                      className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#E7DED2] bg-[#FBF8F3] px-3 text-[12px] font-bold text-[#3B3530]"
                    >
                      <Star className="h-4 w-4 text-[#8A3E1D]" />
                      Reviews
                    </button>
                  </div>

                  <div className="mt-5 md:hidden">{paymentSplitBar}</div>

                  <div className="mt-5 flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                      onClick={() => scrollToSection(overviewRef)}
                      className="border-b-2 border-[#8A3E1D] pb-2 text-[14px] font-bold text-[#1E1E1E]"
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => scrollToSection(packagesRef)}
                      className="pb-2 text-[14px] font-semibold text-[#6D6760]"
                    >
                      Packages
                    </button>
                    <button
                      onClick={() => scrollToSection(menuRef)}
                      className="pb-2 text-[14px] font-semibold text-[#6D6760]"
                    >
                      Menu
                    </button>
                    <button
                      onClick={() => scrollToSection(reviewsRef)}
                      className="pb-2 text-[14px] font-semibold text-[#6D6760]"
                    >
                      Reviews
                    </button>
                    <button
                      onClick={() => scrollToSection(locationRef)}
                      className="pb-2 text-[14px] font-semibold text-[#6D6760]"
                    >
                      Location
                    </button>
                  </div>

                  <div className="mt-5 hidden md:block">{bookingPanel}</div>
                </div>
              </div>
            </section>

            <section className="hidden gap-3 lg:grid-cols-[minmax(0,1.72fr)_minmax(240px,0.82fr)] md:grid">
              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="relative block min-h-[320px] overflow-hidden rounded-[28px] bg-[#EDE8DF] text-left sm:min-h-[420px] lg:min-h-[560px]"
              >
                <Image
                  src={imageList[0] ?? ""}
                  alt={vendor.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 1279px) 100vw, 66vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-black/56 via-black/18 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#1E1E1E] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                    ★ {vendor.rating}
                  </span>
                  <span className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#5F5A54] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                    {vendor.reviewsCount} reviews
                  </span>
                </div>
                {imageList.length > 1 ? (
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E6DED3] bg-white px-5 text-[13px] font-bold text-[#1E1E1E] shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
                      <Camera className="h-4 w-4 text-[#1E1E1E]" />
                      View Album
                    </span>
                  </div>
                ) : null}
              </button>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {imageList.slice(1, 4).map((image, index) => {
                  const actualIndex = index + 1;
                  const isLastVisible = actualIndex === 3 && imageList.length > 4;
                  return (
                    <button
                      key={image + actualIndex}
                      type="button"
                      onClick={() => openLightbox(actualIndex)}
                      className={
                        "relative overflow-hidden rounded-[24px] bg-[#EDE8DF] " +
                        (index === 2 ? "h-[220px] sm:col-span-2 lg:h-[184px] lg:col-span-1" : "h-[160px] sm:h-[190px] lg:h-[184px]")
                      }
                    >
                      <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 50vw, 24vw"
                      />
                      {isLastVisible ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/38 text-[15px] font-bold text-white">
                          +{imageList.length - 4} more
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="hidden border-b border-[#E7E1D8] py-7 md:block md:py-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[860px]">
                  <h1 className="truncate text-[34px] font-black leading-[0.98] tracking-tight text-[#161513] md:text-[52px]">
                    {vendor.name}
                  </h1>
                  <p className="mt-3 text-[16px] font-medium leading-[1.7] text-[#5F5A54]">
                    {vendor.cuisines.join(", ")}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF7D7] px-3 py-1.5 text-[13px] font-bold text-[#6B8A1D]">
                      <Star className="h-4 w-4 fill-current" />
                      {vendor.rating}
                    </span>
                    <span className="text-[15px] font-semibold text-[#6D6760]">{vendor.reviewsCount} reviews</span>
                    <FoodBadge isVeg={vendor.isVeg} />
                  </div>
                  <p className="mt-4 max-w-[760px] text-[15px] leading-[1.8] text-[#3F3932] md:text-[16px]">
                    {subtitle}
                  </p>
                  <p className="mt-3 flex items-start gap-2 text-[15px] leading-[1.7] text-[#5F5A54]">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#78726A]" />
                    <span>{locality}</span>
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E3D5C4] bg-white px-5 text-[14px] font-bold text-[#1E1E1E] shadow-[0_8px_22px_rgba(24,20,16,0.05)]"
                    >
                      <Navigation className="h-4 w-4 text-[#8A3E1D]" />
                      Directions
                    </a>
                    <button
                      onClick={handleShareProfile}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E3D5C4] bg-white px-5 text-[14px] font-bold text-[#1E1E1E] shadow-[0_8px_22px_rgba(24,20,16,0.05)]"
                    >
                      <Share2 className="h-4 w-4 text-[#8A3E1D]" />
                      Share
                    </button>
                    <button
                      onClick={() => scrollToSection(reviewsRef)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E3D5C4] bg-white px-5 text-[14px] font-bold text-[#1E1E1E] shadow-[0_8px_22px_rgba(24,20,16,0.05)]"
                    >
                      <Star className="h-4 w-4 text-[#8A3E1D]" />
                      Reviews
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 lg:max-w-[360px] lg:justify-end">
                  {vendor.specialisations.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#E6DED3] bg-[#FBFAF7] px-3 py-1.5 text-[11px] font-semibold text-[#5A534B]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 xl:hidden">{bookingSidebar}</div>

              <div className="mt-7 flex gap-8 overflow-x-auto pt-1 scrollbar-hide">
                <button onClick={() => scrollToSection(overviewRef)} className="border-b-2 border-[#8A3E1D] pb-3 text-[14px] font-bold text-[#1E1E1E]">
                  Overview
                </button>
                <button onClick={() => scrollToSection(packagesRef)} className="pb-3 text-[14px] font-semibold text-[#6D6760]">
                  Packages
                </button>
                <button onClick={() => scrollToSection(menuRef)} className="pb-3 text-[14px] font-semibold text-[#6D6760]">
                  Menu
                </button>
                <button onClick={() => scrollToSection(reviewsRef)} className="pb-3 text-[14px] font-semibold text-[#6D6760]">
                  Reviews
                </button>
                <button onClick={() => scrollToSection(locationRef)} className="pb-3 text-[14px] font-semibold text-[#6D6760]">
                  Location
                </button>
              </div>
            </section>

            <section ref={packagesRef} className="pt-12">
              <div className="mb-6">
                <h2 className="text-[28px] font-black tracking-tight text-[#161513] md:text-[34px]">
                  Packages & Pricing
                </h2>
                <p className="mt-2 text-[15px] text-[#6D6760]">
                  Choose the package structure first, then preview the menu before continuing.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {vendor.packages.map((pkg) => {
                  const isSelected = selectedPackage?.id === pkg.id;
                  const tone = packageTone(pkg.id);

                  return (
                    <article
                      key={pkg.id}
                      onClick={() => applyPackageSelection(pkg.id as PackageTier)}
                      className={
                        "flex h-full cursor-pointer flex-col border bg-white p-6 shadow-[0_18px_40px_rgba(24,20,16,0.05)] transition-all " +
                        (isSelected
                          ? "border-[#1F1E1B] rounded-[28px]"
                          : "rounded-[24px] border-[#E5DED4]")
                      }
                      style={{
                        borderColor: isSelected ? tone.border : "#E5DED4",
                        background: isSelected
                          ? `linear-gradient(180deg, ${tone.bg}, #FFFFFF)`
                          : "#FFFFFF",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-6 w-6 flex-shrink-0">
                              <Image
                                src={tone.icon}
                                alt={pkg.name + " icon"}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <h3
                              className="text-[22px] font-black tracking-tight"
                              style={{ color: tone.text }}
                              >
                                {pkg.name}
                              </h3>
                            </div>
                            <p className="mt-2 text-[13px] font-semibold text-[#6D6760]">
                              Structured package for MeraHalwai booking
                            </p>
                          </div>
                        </div>

                      <div className="mt-6 flex items-end gap-1.5">
                        <span className="text-[40px] font-black leading-none tracking-tight text-[#1E1E1E]">
                          ₹{pkg.pricePerPlate}
                        </span>
                        <span className="text-[14px] font-semibold text-[#6D6760]">/plate</span>
                      </div>

                      <p className="mt-4 line-clamp-2 min-h-[44px] text-[14px] leading-[1.7] text-[#3F3932]">
                        {pkg.description}
                      </p>

                      <div className="mt-auto flex items-center justify-end gap-4 border-t border-[#EEE7DD] pt-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePackageAction(pkg.id as PackageTier);
                          }}
                          className="flex h-11 min-w-[132px] items-center justify-center rounded-xl px-4 text-[13px] font-bold text-white transition-all hover:brightness-[1.03]"
                          style={{
                            background: "linear-gradient(135deg,#8A3E1D 0%,#682C13 100%)",
                            boxShadow: isSelected
                              ? "0 16px 28px rgba(24,20,16,0.14)"
                              : "0 10px 20px rgba(24,20,16,0.08)",
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section ref={menuRef} className="pt-12">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-[28px] font-black tracking-tight text-[#161513] md:text-[34px]">
                    Menu Preview
                  </h2>
                  <p className="mt-2 text-[15px] text-[#6D6760]">Customize full menu before booking.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {!vendor.isVeg ? (
                    <div className="inline-flex overflow-hidden rounded-full border border-[#E5DED4] bg-white shadow-[0_10px_24px_rgba(24,20,16,0.04)]">
                      <button
                        type="button"
                        onClick={() => setFoodView("veg")}
                        className={
                          "px-4 py-2 text-[12px] font-bold transition-colors " +
                          (foodView === "veg" ? "bg-[#1F8C4F] text-white" : "text-[#5A534B]")
                        }
                      >
                        Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setFoodView("all")}
                        className={
                          "px-4 py-2 text-[12px] font-bold transition-colors " +
                          (foodView === "all" ? "bg-[#B64532] text-white" : "text-[#5A534B]")
                        }
                      >
                        Veg & Non-Veg
                      </button>
                    </div>
                  ) : null}
                  {selectedPackage ? (
                    <span className="rounded-full border border-[#E5DED4] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5A534B]">
                      Previewing {selectedPackage.name}
                    </span>
                  ) : null}
                  <button
                    onClick={() => beginBookingIntent()}
                    className="hidden h-11 items-center justify-center rounded-full border border-[#E3D5C4] bg-white px-5 text-[13px] font-bold text-[#682C13] shadow-[0_10px_24px_rgba(24,20,16,0.05)] transition-colors hover:bg-[#FFF7EF] md:inline-flex"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-[#E4DDD3] bg-white shadow-[0_18px_42px_rgba(24,20,16,0.05)]">
                <div className="grid grid-cols-3 gap-2 border-b border-[#EEE7DD] bg-[#F8F4EE] p-3">
                  {imageList.slice(0, 3).map((image, index) => (
                    <div key={image + index} className="relative h-[116px] overflow-hidden rounded-[18px]">
                      <Image src={image} alt="" fill className="object-cover" sizes="33vw" />
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-[#EEE7DD]">
                  {menuGroups.map((group) => {
                    const isOpen = openMenuCategory === group.title;
                    return (
                      <article key={group.title}>
                        <button
                          onClick={() => setOpenMenuCategory((prev) => (prev === group.title ? null : group.title))}
                          className="flex w-full items-center justify-between px-5 py-4 text-left"
                        >
                          <div>
                            <h3 className="text-[17px] font-black tracking-tight text-[#1E1E1E]">{group.title}</h3>
                            <p className="mt-1 text-[12px] font-medium text-[#6D6760]">
                              {group.items.length + group.more} items in this category
                            </p>
                          </div>
                          <ChevronDown
                            className={
                              "h-5 w-5 text-[#8A3E1D] transition-transform " +
                              (isOpen ? "rotate-180" : "rotate-0")
                            }
                          />
                        </button>
                        {isOpen ? (
                          <div className="px-5 pb-5">
                            <div className="grid gap-3 md:grid-cols-2">
                              {group.items.map((item) => (
                                <div key={item.name} className="flex items-start gap-2.5 rounded-[16px] bg-[#FAF7F2] px-3 py-3">
                                  <span
                                    className={
                                      "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border " +
                                      (item.isVeg ? "border-[#1D8C4E]" : "border-[#B64532]")
                                    }
                                  >
                                    <span
                                      className={
                                        "h-2 w-2 rounded-full " + (item.isVeg ? "bg-[#1D8C4E]" : "bg-[#B64532]")
                                      }
                                    />
                                  </span>
                                  <span className="text-[14px] leading-[1.55] text-[#403830]">{item.name}</span>
                                </div>
                              ))}
                            </div>
                            {group.more > 0 ? (
                              <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.1em] text-[#8A3E1D]">
                                +{group.more} more items
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <section ref={aboutRef} className="border-t border-[#E7E1D8] pt-12">
              <h2 className="text-[28px] font-black tracking-tight text-[#161513] md:text-[34px]">
                About This Caterer
              </h2>
              <p className="mt-4 max-w-[820px] text-[15px] leading-[1.85] text-[#403830] md:text-[16px]">
                {aboutText}
              </p>
            </section>

            <section ref={locationRef} className="border-t border-[#E7E1D8] pt-12">
              <div className="overflow-hidden rounded-[26px] border border-[#E4DDD3] bg-white shadow-[0_18px_42px_rgba(24,20,16,0.05)]">
                <div className="flex items-center justify-between border-b border-[#EEE7DD] px-5 py-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Location Preview</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#3F3932]">{locality}</p>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#8A3E1D] transition-colors hover:text-[#EB8B23]"
                  >
                    View on Maps
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="h-[240px] w-full bg-[#F3EEE6] md:h-[280px]">
                  <iframe
                    title={`${vendor.name} location map`}
                    src={mapsEmbedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </section>

            <section ref={reviewsRef} className="border-t border-[#E7E1D8] pt-12">
              {(() => {
                const title = googleReviewsLink ? "Google Reviews" : "Customer Reviews";
                const handleReviewsClick = () => {
                  if (googleReviewsLink) {
                    window.open(googleReviewsLink, "_blank", "noopener,noreferrer");
                  } else {
                    setReviewsOpen(true);
                  }
                };

                return (
                  <>
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h2 className="text-[28px] font-black tracking-tight text-[#161513] md:text-[34px]">
                          {title}
                        </h2>
                        <p className="mt-2 text-[15px] text-[#6D6760]">
                          {vendor.rating} average rating across {vendor.reviewsCount} reviews
                        </p>
                      </div>
                      <button
                        onClick={handleReviewsClick}
                        className="self-start text-[14px] font-bold text-[#1E1E1E] transition-colors hover:text-[#5A534B] md:self-auto"
                      >
                        See all reviews
                      </button>
                    </div>

                    <div className="mt-8 hidden gap-4 md:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                      <div className="rounded-[26px] border border-[#E6E0D7] bg-white p-5 shadow-[0_18px_40px_rgba(24,20,16,0.05)]">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Average Rating</p>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="text-[46px] font-black leading-none tracking-tight text-[#1E1E1E]">
                            {vendor.rating}
                          </span>
                          <span className="mb-1 text-[14px] font-semibold text-[#6D6760]">/ 5</span>
                        </div>
                        <div className="mt-4 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={
                                "h-4 w-4 " +
                                (index < Math.round(vendor.rating)
                                  ? "fill-[#EB8B23] text-[#EB8B23]"
                                  : "text-[#E8D5B7]")
                              }
                            />
                          ))}
                        </div>
                        <p className="mt-4 text-[14px] leading-[1.8] text-[#5A534B]">
                          {googleReviewsLink
                            ? "Live Google reviews synced for this caterer."
                            : "Verified customer feedback from recent bookings."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {highlightedReviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4 md:hidden">
                      {highlightedReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </>
                );
              })()}
            </section>

            <section className="mt-12 overflow-hidden rounded-[30px] bg-[#1F1E1B] px-6 py-7 text-white md:px-8 md:py-8">
              <h2 className="text-[28px] font-black tracking-tight md:text-[34px]">Ready to continue?</h2>
              <p className="mt-2 max-w-[720px] text-[15px] leading-[1.7] text-white/74">
                Choose your package in the booking panel, then continue to menu customization in the next step.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => beginBookingIntent()}
                  className="flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[14px] font-bold text-[#1F1E1B] transition-colors hover:bg-[#F2EFE9]"
                >
                  Book Now
                </button>
              </div>
            </section>
          </div>

          <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
            {bookingSidebar}
          </aside>
        </section>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8D5B7] bg-white/96 px-4 py-3 shadow-[0_-10px_28px_rgba(36,22,8,0.08)] backdrop-blur-md md:hidden"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <div className="flex min-w-[0px] flex-1 items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9F8B77]">Price</p>
              <p className="mt-1 text-[26px] font-black leading-none tracking-tight text-[#1E1E1E]">
                ₹{selectedPackage?.pricePerPlate ?? startingPrice}
                <span className="ml-1 text-[13px] font-semibold text-[#8B7355]">/plate</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => beginBookingIntent()}
            className="flex h-[58px] min-w-[168px] items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#8A3E1D_0%,#682C13_100%)] px-5 text-[15px] font-bold text-white shadow-[0_14px_28px_rgba(104,44,19,0.18)] transition-colors hover:brightness-[1.03]"
          >
            Book Now
          </button>
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-white md:bg-[#F7F3EC]"
          >
            <div className="relative flex h-[calc(100vh-140px)] items-center justify-center px-4 md:px-12">
              <div className="relative h-full w-full max-w-5xl">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-black/15 bg-white text-[#1E1E1E] shadow-[0_14px_28px_rgba(24,20,16,0.16)] md:h-11 md:w-auto md:min-w-[112px] md:gap-2 md:px-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden text-[13px] font-bold md:inline">Back</span>
                </button>
                <Image
                  src={imageList[lightboxIndex] ?? imageList[0] ?? ""}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {imageList.length > 1 ? (
                <>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev - 1 + imageList.length) % imageList.length)}
                    className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-white shadow-[0_16px_28px_rgba(24,20,16,0.2)] md:left-6 md:h-12 md:w-12"
                  >
                    <ChevronLeft className="h-5 w-5 text-[#1E1E1E]" />
                  </button>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev + 1) % imageList.length)}
                    className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-white shadow-[0_16px_28px_rgba(24,20,16,0.2)] md:right-6 md:h-12 md:w-12"
                  >
                    <ChevronRight className="h-5 w-5 text-[#1E1E1E]" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex flex-col items-center gap-2 pb-5">
              <span className="text-[13px] font-semibold text-[#5F5A54]">
                {lightboxIndex + 1} / {imageList.length}
              </span>
              <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide">
                {imageList.map((image, index) => (
                  <button
                    key={image + index}
                    onClick={() => setLightboxIndex(index)}
                    className={
                      "relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl " +
                      (lightboxIndex === index ? "ring-2 ring-[#EB8B23]" : "opacity-70")
                    }
                  >
                    <Image src={image} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {reviewsOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
          >
            <button className="absolute inset-0" onClick={() => setReviewsOpen(false)} aria-label="Close reviews" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="relative z-[66] max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-6 md:max-w-3xl md:rounded-[28px]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-[22px] font-black text-[#1E1E1E]">{googleReviewsLink ? "Google Reviews" : "Customer Reviews"}</h3>
                  <p className="mt-1 text-[13px] text-[#8B7355]">{vendor.reviewsCount} reviews · {vendor.rating} average</p>
                </div>
                <button
                  onClick={() => setReviewsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EFE7]"
                >
                  <X className="h-4 w-4 text-[#1E1E1E]" />
                </button>
              </div>

              <div className="space-y-4">
                {vendor.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
