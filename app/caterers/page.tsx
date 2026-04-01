"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
  CalendarDays,
  ChefHat,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import VendorCard from "@/components/caterers/VendorCard";
import FilterSidebar from "@/components/caterers/FilterSidebar";
import Navbar from "@/components/layout/Navbar";
import { VENDORS } from "@/data/vendors";
import MHIconOrange from "@/logos/Symbol/MH_Logo_Icon_Orange.png";

const DEFAULT_FILTERS = {
  guests: null as number | null,
  cuisines: [] as string[],
  minRating: 0,
  foodPref: null as "veg" | "nonveg" | null,
  budgets: [] as string[],
  eventTypes: [] as string[],
  guestRange: null as string | null,
  specialisations: [] as string[],
};

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const MOBILE_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "rating", label: "Rating" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
];

const CUISINE_OPTIONS = [
  "North Indian",
  "Mughlai",
  "South Indian",
  "Rajasthani",
  "Chaat",
  "Desserts",
  "Continental",
];

const EVENT_OPTIONS = [
  "Birthday Party",
  "Wedding",
  "Wedding Anniversary",
  "Baby Shower",
  "Retirement Party",
  "Corporate Event / Office Party",
  "Get-Together / Friends Party",
  "Break-Up Party",
  "Small Gathering (under 75 pax)",
  "Satsang / Pooja",
  "Funeral Bhoj",
];

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const dropdownTitleClass = "text-[12px] font-bold uppercase tracking-[0.2em] text-[#8A3E1D]";

export default function CaterersPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("popular");
  const [desktopSortOpen, setDesktopSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"eventType" | "guests" | "cuisines" | null>(null);
  const [searchText, setSearchText] = useState("");
  const searchBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedEventTypes = useMemo(
    () => [...new Set(filters.eventTypes.filter(Boolean))],
    [filters.eventTypes]
  );

  const eventDisplayLabel =
    selectedEventTypes.length === 0
      ? "Any Event"
      : selectedEventTypes.length === 1
      ? selectedEventTypes[0]
      : `${selectedEventTypes[0]} +${selectedEventTypes.length - 1}`;

  const filteredVendors = useMemo(() => {
    let result = [...VENDORS];

    if (filters.minRating > 0) result = result.filter((v) => v.rating >= filters.minRating);
    if (filters.foodPref === "veg") result = result.filter((v) => v.isVeg === true);
    if (filters.foodPref === "nonveg") result = result.filter((v) => v.isVeg === false);

    if (filters.budgets.length > 0) {
      result = result.filter((v) =>
        filters.budgets.some((b) => {
          if (b === "under300") return v.priceVeg < 300;
          if (b === "300-500") return v.priceVeg >= 300 && v.priceVeg <= 500;
          if (b === "500-800") return v.priceVeg > 500 && v.priceVeg <= 800;
          if (b === "800plus") return v.priceVeg > 800;
          return false;
        })
      );
    }

    if (filters.cuisines.length > 0) {
      result = result.filter((v) => filters.cuisines.some((c) => v.cuisines.includes(c)));
    }

    if (selectedEventTypes.length > 0) {
      result = result.filter((v) => selectedEventTypes.some((e) => v.eventTypes.includes(e)));
    }

    if (filters.guestRange) {
      if (filters.guestRange === "0-50") {
        result = result.filter((v) => v.maxPax >= 1 && v.minPax <= 50);
      } else if (filters.guestRange === "50-100") {
        result = result.filter((v) => v.maxPax >= 50 && v.minPax <= 100);
      } else if (filters.guestRange === "100-200") {
        result = result.filter((v) => v.maxPax >= 100 && v.minPax <= 200);
      } else if (filters.guestRange === "200-500") {
        result = result.filter((v) => v.maxPax >= 200 && v.minPax <= 500);
      } else if (filters.guestRange === "500-1000") {
        result = result.filter((v) => v.maxPax >= 500 && v.minPax <= 1000);
      } else if (filters.guestRange === "1000plus") {
        result = result.filter((v) => v.maxPax >= 1000);
      }
    }

    if (filters.specialisations.length > 0) {
      result = result.filter((v) =>
        filters.specialisations.some((s) => v.specialisations.includes(s))
      );
    }

    const selectedGuests = filters.guests;
    if (selectedGuests != null) {
      result = result.filter((v) => v.minPax <= selectedGuests && v.maxPax >= selectedGuests);
    }

    if (searchText.trim()) {
      const s = searchText.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(s) ||
          v.location.toLowerCase().includes(s) ||
          v.cuisines.some((c) => c.toLowerCase().includes(s)) ||
          v.specialisations.some((sp) => sp.toLowerCase().includes(s))
      );
    }

    if (sortBy === "recommended") result.sort((a, b) => b.rating * 20 + b.reviews - (a.rating * 20 + a.reviews));
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "price-low") result.sort((a, b) => a.priceVeg - b.priceVeg);
    else if (sortBy === "price-high") result.sort((a, b) => b.priceVeg - a.priceVeg);
    else if (sortBy === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => b.reviews - a.reviews);

    return result;
  }, [filters, selectedEventTypes, sortBy, searchText]);

  const chips = useMemo(
    () =>
      [
        filters.guests && {
          label: `${filters.guests} guests`,
          remove: () => setFilters((p) => ({ ...p, guests: null })),
        },
        filters.foodPref && {
          label: filters.foodPref === "veg" ? "Pure Veg" : "Veg & Non-Veg",
          remove: () => setFilters((p) => ({ ...p, foodPref: null })),
        },
        filters.minRating > 0 && {
          label: "★ " + filters.minRating + "+",
          remove: () => setFilters((p) => ({ ...p, minRating: 0 })),
        },
        filters.guestRange && {
          label:
            filters.guestRange === "1000plus"
              ? "1000+ Guests"
              : filters.guestRange.replace("-", "–") + " Guests",
          remove: () => setFilters((p) => ({ ...p, guestRange: null })),
        },
        ...filters.budgets.map((b) => ({
          label:
            b === "under300"
              ? "Under ₹300"
              : b === "300-500"
              ? "₹300–₹500"
              : b === "500-800"
              ? "₹500–₹800"
              : "₹800+",
          remove: () => setFilters((p) => ({ ...p, budgets: p.budgets.filter((x) => x !== b) })),
        })),
        ...filters.cuisines.map((c) => ({
          label: c,
          remove: () => setFilters((p) => ({ ...p, cuisines: p.cuisines.filter((x) => x !== c) })),
        })),
        ...selectedEventTypes.map((e) => ({
          label: e,
          remove: () =>
            setFilters((p) => ({
              ...p,
              eventTypes: p.eventTypes.filter((x) => x !== e),
            })),
        })),
        ...filters.specialisations.map((s) => ({
          label: s,
          remove: () =>
            setFilters((p) => ({
              ...p,
              specialisations: p.specialisations.filter((x) => x !== s),
            })),
        })),
      ].filter(Boolean) as { label: string; remove: () => void }[],
    [filters, selectedEventTypes]
  );

  const selectedSortLabel =
    [...SORT_OPTIONS, ...MOBILE_SORT_OPTIONS].find((s) => s.value === sortBy)?.label ?? "Most Popular";
  const selectedMobileSortLabel =
    MOBILE_SORT_OPTIONS.find((s) => s.value === sortBy)?.label ?? selectedSortLabel;
  const mobileGuestsLabel = filters.guests ? `${filters.guests} guests` : "Guests";
  const mobileEventLabel =
    selectedEventTypes.length === 0
      ? "Event Type"
      : selectedEventTypes.length === 1
      ? selectedEventTypes[0]
      : `${selectedEventTypes[0]} +${selectedEventTypes.length - 1}`;
  const mobileCuisineLabel =
    filters.cuisines.length === 0
      ? "Cuisine"
      : filters.cuisines.length === 1
      ? filters.cuisines[0]
      : `${filters.cuisines[0]} +${filters.cuisines.length - 1}`;

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchText("");
  };

  return (
    <main className="caterers-page min-h-screen bg-transparent pb-10 text-[#1E1E1E] md:pb-0">
      <Navbar />

      {/* --- MOBILE ONLY: Search + Quick Filters --- */}
      <div className="md:hidden px-4 pt-3">
        <div className="mh-glass-bar overflow-hidden rounded-[28px] border border-[rgba(234,216,192,0.78)] px-4 py-4 shadow-[0_18px_44px_rgba(95,61,28,0.1)]">
          <div className="relative">
            <div className="pointer-events-none absolute left-[15px] top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#FFF6EC] p-1 text-[#B86626] shadow-[0_6px_16px_rgba(184,102,38,0.12)]">
              <Search className="h-[14px] w-[14px]" strokeWidth={2.7} />
            </div>
            <input
              id="mobileSearchInput"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search caterer or cuisine"
              className="mh-glass-field h-[52px] w-full rounded-[18px] pl-[50px] pr-10 text-[14px] font-bold text-[#804226] placeholder:text-[#D08A43] outline-none"
            />
            {searchText ? (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-[14px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#DE903E] text-white shadow-sm"
              >
                <X className="h-[12px] w-[12px]" strokeWidth={3} />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex gap-2.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="mh-glass-chip flex h-[40px] flex-shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-bold text-[#1E1E1E] shadow-sm transition-transform active:scale-95"
            >
              <Filter className="h-3.5 w-3.5 text-[#DE903E]" strokeWidth={2.5} />
              Filters
            </button>
            <button
              onClick={() => setOpenDropdown("guests")}
              className={
                "mh-glass-chip flex h-[40px] flex-shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-bold shadow-sm transition-transform active:scale-95 " +
                (filters.guests ? "border-[#EB8B23]/28 text-[#8A3E1D]" : "text-[#1E1E1E]")
              }
            >
              <Users className="h-3.5 w-3.5 text-[#804226]" strokeWidth={2.4} />
              {mobileGuestsLabel}
            </button>
            <button
              onClick={() => setOpenDropdown("eventType")}
              className={
                "mh-glass-chip flex h-[40px] flex-shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-bold shadow-sm transition-transform active:scale-95 " +
                (selectedEventTypes.length > 0 ? "border-[#EB8B23]/28 text-[#8A3E1D]" : "text-[#1E1E1E]")
              }
            >
              <CalendarDays className="h-3.5 w-3.5 text-[#804226]" strokeWidth={2.4} />
              {mobileEventLabel}
            </button>
            <button
              onClick={() => setOpenDropdown("cuisines")}
              className={
                "mh-glass-chip flex h-[40px] flex-shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-bold shadow-sm transition-transform active:scale-95 " +
                (filters.cuisines.length > 0 ? "border-[#EB8B23]/28 text-[#8A3E1D]" : "text-[#1E1E1E]")
              }
            >
              <ChefHat className="h-3.5 w-3.5 text-[#804226]" strokeWidth={2.4} />
              {mobileCuisineLabel}
            </button>
            <button
              onClick={() => setMobileSortOpen(true)}
              className="mh-glass-chip flex h-[40px] flex-shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-bold text-[#1E1E1E] shadow-sm transition-transform active:scale-95"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#804226]" strokeWidth={2.3} />
              Sort
            </button>
          </div>

          {chips.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="mh-glass-chip inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#EB8B23]/24 px-3 py-1.5 text-[12px] font-bold text-[#8A3E1D] shadow-sm"
                >
                  {chip.label}
                  <button
                    onClick={chip.remove}
                    className="tap-small flex h-4 w-4 items-center justify-center rounded-full text-[#DE903E]"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAll}
                className="tap-small inline-flex items-center px-1 py-1 text-[12px] font-bold text-[#DE903E]"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Unified 1280px Central Container */}
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 pt-5 md:px-8 md:pt-7">
        
        {/* TOP COMPONENT: Search Bar row (DESKTOP ONLY) */}
        <div ref={searchBarRef} className="relative z-[90] mb-7 hidden w-full md:block">
          <div className="mh-glass-bar flex w-full items-center gap-1.5 rounded-[34px] border-[1.5px] border-[#DE903E]/18 p-[7px] shadow-sm transition-all focus-within:border-[#DE903E]/35 focus-within:shadow-md md:h-[76px]">
            <div className="relative flex-1">
              <button
                onClick={() => setOpenDropdown((p) => (p === "eventType" ? null : "eventType"))}
                className={
                  "flex h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-[24px] border-r border-[#f0ece4] bg-transparent px-5 transition-all " +
                  (selectedEventTypes.length > 0 ? "text-[#EB8B23]" : "text-[#1a1a1a] hover:bg-[#fffaf4]")
                }
              >
                <Calendar className="h-[15px] w-[15px] flex-shrink-0 text-[#EB8B23]" />
                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9b8f82]">
                    Event Type
                  </span>
                  <span className="truncate text-[14px] font-semibold text-[#1a1a1a]">
                    {eventDisplayLabel}
                  </span>
                </div>
                <ChevronDown
                  className={
                    "h-[11px] w-[11px] flex-shrink-0 text-[#9b8f82] transition-transform duration-150 " +
                    (openDropdown === "eventType" ? "rotate-180" : "rotate-0")
                  }
                />
              </button>

              {openDropdown === "eventType" ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                className="mh-glass-popover absolute left-0 top-[calc(100%+14px)] z-[90] w-[332px] overflow-hidden rounded-[26px] border border-[#E5E0D8]"
              >
                  <div className="border-b border-[#E5E0D8]/60 px-5 py-4">
                    <p className={dropdownTitleClass}>Select Event Type</p>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto py-1">
                    {EVENT_OPTIONS.map((option) => {
                      const selected = selectedEventTypes.includes(option);
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => {
                            setFilters((p) => ({ ...p, eventTypes: [option] }));
                            setOpenDropdown(null);
                          }}
                          className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[14px] transition-colors hover:bg-[#F0EBE1]"
                        >
                          <span className={selected ? "font-bold text-[#804226]" : "font-medium text-[#1E1E1E]"}>{option}</span>
                          <span
                            className={
                              "h-[16px] w-[16px] rounded-full " +
                              (selected ? "border-[4px] border-[#DE903E] bg-white shadow-sm" : "border border-[#D1A87A]/50 bg-white")
                            }
                          >
                            {selected ? <Check className="h-2.5 w-2.5 text-[#FFFFFF]" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="relative flex-1">
              <button
                onClick={() => setOpenDropdown((p) => (p === "guests" ? null : "guests"))}
                className="flex h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-[24px] border-r border-[#f0ece4] bg-transparent px-5 transition-all hover:bg-[#fffaf4]"
              >
                <Users className="h-[15px] w-[15px] flex-shrink-0 text-[#EB8B23]" />
                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9b8f82]">Guests</span>
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">{filters.guests ?? "Any Guests"}</span>
                </div>
                <ChevronDown
                  className={
                    "h-[11px] w-[11px] flex-shrink-0 text-[#9b8f82] transition-transform duration-150 " +
                    (openDropdown === "guests" ? "rotate-180" : "rotate-0")
                  }
                />
              </button>

              {openDropdown === "guests" ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                className="mh-glass-popover absolute left-0 top-[calc(100%+14px)] z-[90] w-[336px] overflow-hidden rounded-[26px] border border-[#E5E0D8]"
              >
                  <div className="border-b border-[#E5E0D8]/60 px-5 py-4">
                    <p className={dropdownTitleClass}>Select Guest Count</p>
                  </div>
                  <div className="mb-3 flex items-center justify-between px-5 pt-3">
                    <p className="text-[12px] font-semibold text-[#804226]">Guests (PAX)</p>
                    <span className="rounded-lg bg-[#F5F0E6] px-2.5 py-1 text-[12px] font-bold text-[#804226]">{filters.guests || "Any"}</span>
                  </div>
                  <div className="px-5 pb-5">
                    <input
                      type="range"
                      min={25}
                      max={2000}
                      step={25}
                      value={filters.guests || 25}
                      onChange={(e) =>
                        setFilters((p) => ({
                          ...p,
                          guests: Number(e.target.value),
                        }))
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#E8D5B7] accent-[#804226]"
                    />
                    <div className="mt-2 flex justify-between text-[11px] font-medium text-[#8B7355]">
                      <span>25</span>
                      <span>500</span>
                      <span>1000</span>
                      <span>2000+</span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2.5">
                      {[100, 250, 500, 800, 1200, 1600].map((value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setFilters((p) => ({ ...p, guests: Number(value) }))}
                          className={
                            "rounded-xl border-[1.5px] px-2 py-2 text-[13px] font-semibold transition-colors " +
                            (filters.guests === Number(value)
                              ? "border-[#804226] bg-[#804226] text-[#FFFFFF]"
                              : "border-[#E5E0D8] bg-[#FFFFFF] text-[#804226] hover:border-[#804226] hover:bg-[#FAF8F5]")
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="relative flex-1">
              <button
                onClick={() => setOpenDropdown((p) => (p === "cuisines" ? null : "cuisines"))}
                className={
                  "flex h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-[24px] border-r border-[#f0ece4] bg-transparent px-5 transition-all hover:bg-[#fffaf4] " +
                  (filters.cuisines.length > 0 ? "text-[#EB8B23]" : "text-[#1a1a1a]")
                }
              >
                <SlidersHorizontal className="h-[15px] w-[15px] flex-shrink-0 text-[#EB8B23]" />
                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9b8f82]">
                    Cuisine
                  </span>
                  <span className="truncate text-[14px] font-semibold text-[#1a1a1a]">
                    {filters.cuisines.length > 0 ? filters.cuisines.slice(0, 2).join(", ") : "Any Cuisine"}
                    {filters.cuisines.length > 2 ? " +more" : ""}
                  </span>
                </div>
                <ChevronDown
                  className={
                    "h-[11px] w-[11px] flex-shrink-0 text-[#9b8f82] transition-transform duration-150 " +
                    (openDropdown === "cuisines" ? "rotate-180" : "rotate-0")
                  }
                />
              </button>

              {openDropdown === "cuisines" ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="mh-glass-popover absolute left-0 top-[calc(100%+14px)] z-[90] w-[312px] overflow-hidden rounded-[26px] border border-[#E5E0D8]"
                >
                  <div className="border-b border-[#E5E0D8] px-4 py-3">
                    <p className={dropdownTitleClass}>Select Cuisines</p>
                  </div>
                  <div className="py-2">
                    {CUISINE_OPTIONS.map((option) => {
                      const checked = filters.cuisines.includes(option);
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() =>
                            setFilters((p) => ({
                              ...p,
                              cuisines: toggle(p.cuisines, option),
                            }))
                          }
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-[#F5F0E6]"
                        >
                          <span
                            className={
                              "flex h-5 w-5 items-center justify-center rounded-md border-2 " +
                              (checked ? "border-[#7A3E26] bg-[#7A3E26]" : "border-[#E5E0D8] bg-[#FFFFFF]")
                            }
                          >
                            {checked ? <Check className="h-3 w-3 text-[#FFFFFF]" /> : null}
                          </span>
                          <span className="text-[13px] font-medium text-[#1E1E1E]">{option}</span>
                          {checked ? (
                            <span className="ml-auto rounded-md bg-[#FFF3E8] px-2 py-0.5 text-[10px] font-semibold text-[#804226]">
                              Selected
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E5E0D8] px-4 py-3">
                    <span className="text-[12px] text-[#6B7280]">
                      {filters.cuisines.length > 0 ? filters.cuisines.length + " selected" : "None selected"}
                    </span>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="h-8 rounded-lg bg-[#DF923A] px-5 text-[12px] font-bold text-[#FFFFFF] hover:bg-[#C88232]"
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Text search input */}
            <div className="flex h-[52px] flex-1 items-center gap-2.5 rounded-[24px] px-5">
              <Search className="h-[15px] w-[15px] flex-shrink-0 text-[#EB8B23]" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9b8f82]">
                  Search
                </span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Caterer name, cuisine..."
                className="w-full bg-transparent text-[14px] font-semibold text-[#1a1a1a] outline-none placeholder:text-[#c8c0b8]"
              />
              </div>
              {searchText ? (
                <button onClick={() => setSearchText("")} className="flex-shrink-0 text-[#9b8f82] hover:text-[#1a1a1a]">
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

          </div>
        </div>

        {/* MIDDLE COMPONENT: Title & Sorting Header */}
        {filteredVendors.length > 0 && (
          <div className="mb-3 flex w-full flex-col items-start justify-between gap-2.5 border-b border-[#E8D5B7] pb-3 md:mb-4 md:pb-4 md:flex-row md:items-end">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#DE903E] md:mb-1 md:text-[13px]">
                <TrendingUp className="h-3.5 w-3.5" />
                Premium Caterers in Jaipur
              </p>
              <h1 className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-black leading-[1.08] tracking-tight text-[#1E1E1E] md:max-w-[820px] md:overflow-visible md:whitespace-normal md:text-[22px]">
                Showing{" "}
                <span className="text-[#EB8B23]">
                  {filteredVendors.length} verified {filteredVendors.length === 1 ? "caterer" : "caterers"}
                </span>{" "}
                in Jaipur
                {filters.guests ? ` for ${filters.guests} guests` : ""}
              </h1>
            </div>
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setDesktopSortOpen((prev) => !prev)}
                className="mh-glass-chip inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold text-[#804226] shadow-sm transition-all hover:border-[#804226]"
              >
                Sort: {selectedSortLabel}
                <ChevronDown className="h-3.5 w-3.5 text-[#8B7355]" />
              </button>
              {desktopSortOpen ? (
                <div className="mh-glass-popover absolute right-0 top-11 z-50 w-[220px] overflow-hidden rounded-2xl border border-[#E8D5B7]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setDesktopSortOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-[#FFFAF5]"
                    >
                      <span className={sortBy === option.value ? "font-bold text-[#804226]" : "font-medium text-[#1E1E1E]"}>
                        {option.label}
                      </span>
                      {sortBy === option.value ? <Check className="h-3.5 w-3.5 text-[#804226]" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

          {chips.length > 0 ? (
            <div className="mt-2 hidden md:flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <span
                  key={chip.label}
                  className="mh-glass-chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-[#8A3E1D] shadow-sm"
                >
                  {chip.label}
                  <button
                    onClick={chip.remove}
                    className="flex h-3.5 w-3.5 items-center justify-center text-[#8B7355] hover:text-[#804226]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button 
                onClick={clearAll} 
                className="ml-2 text-[12px] font-bold text-[#EB8B23] transition-all hover:text-[#8A3E1D] hover:underline"
              >
                Clear All
              </button>
            </div>
          ) : null}

        {/* BOTTOM COMPONENT: Sidebar & Vendors Grid */}
        <section className="mt-4 flex w-full flex-1 gap-5 pb-12 md:mt-5 md:pb-24">
          <FilterSidebar filters={filters} setFilters={setFilters} onReset={clearAll} />

        <div id="vendor-listings" className="flex-1 p-0">
          {filteredVendors.length === 0 ? (
            <div className="mh-glass-card flex flex-col items-center rounded-[28px] px-8 py-20 text-center">
              <div className="mh-glass-chip mx-auto flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[20px] shadow-[0_4px_16px_rgba(222,144,62,0.1)]">
                <Image src={MHIconOrange} alt="Mera Halwai" className="h-10 w-10 opacity-80" />
              </div>
              <p className="mt-5 text-[20px] font-bold text-[#7A3E26]">No caterers found</p>
              <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#6B7280]">
                No caterers match your current filters. Try changing the event type or guest count.
              </p>
              <button
                onClick={clearAll}
                className="mh-primary-button mt-6 h-11 rounded-xl px-8 text-sm font-bold text-[#FFFFFF] transition-all active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 md:gap-6"
            >
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Close Unified Central Container */}
      </div>

      <AnimatePresence>
        {openDropdown ? (
          <div className="fixed inset-0 z-[120] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenDropdown(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="mh-glass-sheet absolute bottom-0 left-0 right-0 flex max-h-[78vh] flex-col rounded-t-[30px]"
            >
              <div className="flex-shrink-0 border-b border-[#E8D5B7]/70 px-5 pb-3 pt-5">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E5E0D8]" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-black tracking-tight text-[#1E1E1E]">
                      {openDropdown === "eventType" ? "Event Type" : openDropdown === "guests" ? "Guests" : "Cuisine"}
                    </h3>
                    <p className="mt-1 text-[12px] font-semibold text-[#8B7355]">
                      {openDropdown === "guests"
                        ? "Set a quick guest count for Jaipur caterers"
                        : openDropdown === "eventType"
                        ? "Choose the type of event you’re planning"
                        : "Pick cuisines you want to compare"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0E6] text-[#1E1E1E] transition-transform active:scale-90"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 scrollbar-hide">
                {openDropdown === "eventType" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((p) => ({ ...p, eventTypes: [] }));
                        setOpenDropdown(null);
                      }}
                      className="mb-2 flex w-full items-center justify-between rounded-[18px] border border-[#E8D5B7] bg-[#FFF9F3] px-4 py-3 text-left"
                    >
                      <span className="text-[14px] font-bold text-[#1E1E1E]">Any Event</span>
                      {selectedEventTypes.length === 0 ? <Check className="h-4 w-4 text-[#DE903E]" /> : null}
                    </button>
                    <div className="space-y-2">
                      {EVENT_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => {
                            setFilters((p) => ({ ...p, eventTypes: [option] }));
                            setOpenDropdown(null);
                          }}
                          className="flex w-full items-center justify-between rounded-[18px] border border-[#EFE3D4] bg-white px-4 py-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                        >
                          <span className={selectedEventTypes.includes(option) ? "font-bold text-[#804226]" : "font-semibold text-[#1E1E1E]"}>
                            {option}
                          </span>
                          {selectedEventTypes.includes(option) ? <Check className="h-4 w-4 text-[#DE903E]" /> : null}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {openDropdown === "guests" ? (
                  <div className="pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Guest Count</span>
                      <span className="rounded-full bg-[#F5F0E6] px-3 py-1 text-[13px] font-bold text-[#804226]">
                        {filters.guests ?? "Any"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFilters((p) => ({ ...p, guests: null }))}
                      className={
                        "mt-4 flex h-[42px] w-full items-center justify-center rounded-[16px] border text-[13px] font-bold transition-all " +
                        (!filters.guests
                          ? "border-[#8A3E1D] bg-[#8A3E1D] text-white"
                          : "border-[#E8D5B7] bg-white text-[#804226]")
                      }
                    >
                      Any Guests
                    </button>

                    <div className="mt-4 grid grid-cols-3 gap-2.5">
                      {[50, 100, 200, 350, 500, 1000].map((value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setFilters((p) => ({ ...p, guests: value }))}
                          className={
                            "rounded-[16px] border px-3 py-3 text-[13px] font-bold transition-all " +
                            (filters.guests === value
                              ? "border-[#8A3E1D] bg-[#8A3E1D] text-white"
                              : "border-[#E8D5B7] bg-white text-[#804226]")
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[22px] border border-[#E8D5B7] bg-[rgba(255,250,245,0.9)] px-4 py-4">
                      <div className="mb-3 flex items-center justify-between text-[12px] font-semibold text-[#8B7355]">
                        <span>25</span>
                        <span>500</span>
                        <span>1000</span>
                        <span>2000+</span>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={2000}
                        step={25}
                        value={filters.guests ?? 25}
                        onChange={(e) => setFilters((p) => ({ ...p, guests: Number(e.target.value) }))}
                        className="h-2 w-full appearance-none rounded-full bg-[#E5E0D8] accent-[#DE903E] outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="mh-primary-button mt-5 flex h-[48px] w-full items-center justify-center rounded-[16px] text-[14px] font-bold !text-white"
                    >
                      Done
                    </button>
                  </div>
                ) : null}

                {openDropdown === "cuisines" ? (
                  <>
                    <div className="space-y-2">
                      {CUISINE_OPTIONS.map((option) => {
                        const selected = filters.cuisines.includes(option);
                        return (
                          <button
                            type="button"
                            key={option}
                            onClick={() =>
                              setFilters((p) => ({
                                ...p,
                                cuisines: toggle(p.cuisines, option),
                              }))
                            }
                            className="flex w-full items-center justify-between rounded-[18px] border border-[#EFE3D4] bg-white px-4 py-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                          >
                            <span className={selected ? "font-bold text-[#804226]" : "font-semibold text-[#1E1E1E]"}>
                              {option}
                            </span>
                            <span
                              className={
                                "flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border-[1.5px] transition-colors " +
                                (selected ? "border-[#DE903E] bg-[#DE903E]" : "border-[#D1A87A]/50 bg-white")
                              }
                            >
                              {selected ? <Check className="h-3 w-3 text-white stroke-[3px]" /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="mh-primary-button mt-5 flex h-[48px] w-full items-center justify-center rounded-[16px] text-[14px] font-bold !text-white"
                    >
                      Apply Cuisine
                    </button>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileFilterOpen ? (
          <div className="fixed inset-0 z-[120] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="mh-glass-sheet absolute bottom-0 left-0 right-0 top-[6vh] flex flex-col rounded-t-[32px]"
            >
              <div className="flex-shrink-0 border-b border-[#E8D5B7]/70 px-5 pb-4 pt-5">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E5E0D8]" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-black tracking-tight text-[#1E1E1E]">Filters</h3>
                    <p className="mt-1 text-[12px] font-semibold text-[#8B7355]">
                      {chips.length > 0 ? `${chips.length} selected` : "Refine Jaipur caterers"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0E6] text-[#1E1E1E] transition-transform active:scale-90"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 scrollbar-hide">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  onReset={clearAll}
                  isMobile
                  showHeader={false}
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 border-t border-[#E8D5B7]/80 bg-[linear-gradient(180deg,rgba(255,252,248,0.98),rgba(255,245,235,0.98))] px-5 py-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mh-outline-button flex h-[48px] flex-1 items-center justify-center rounded-[16px] border text-[14px] font-bold"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="mh-primary-button flex h-[48px] flex-[1.3] items-center justify-center rounded-[16px] text-[14px] font-bold !text-white"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileSortOpen ? (
          <div className="fixed inset-0 z-[120] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSortOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="mh-glass-sheet absolute bottom-0 left-0 right-0 flex max-h-[70vh] flex-col rounded-t-[30px]"
            >
              <div className="flex-shrink-0 border-b border-[#E8D5B7]/70 px-5 pb-3 pt-5">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E5E0D8]" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-black tracking-tight text-[#1E1E1E]">Sort</h3>
                    <p className="mt-1 text-[12px] font-semibold text-[#8B7355]">Current: {selectedMobileSortLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSortOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0E6] text-[#1E1E1E] transition-transform active:scale-90"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 scrollbar-hide">
                <div className="space-y-2">
                  {MOBILE_SORT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setMobileSortOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-[18px] border border-[#EFE3D4] bg-white px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                    >
                      <span className={sortBy === option.value ? "font-bold text-[#804226]" : "font-semibold text-[#1E1E1E]"}>
                        {option.label}
                      </span>
                      {sortBy === option.value ? <Check className="h-4 w-4 text-[#DE903E]" /> : null}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
