"use client";

import Image, { type StaticImageData } from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import bronzeIcon from "@/Group 8284.png";
import silverIcon from "@/silver.png";
import goldIcon from "@/gold.png";
import BookingStepper from "@/components/book/BookingStepper";
import { getVendorDetailBySlug } from "@/data/vendors";
import { useBookingStore } from "@/store/bookingStore";
import type { FoodPreference, PackageTier } from "@/store/bookingStore";

const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Birthday Party",
  "Anniversary",
  "Corporate Event",
  "Baby Shower",
  "Satsang / Pooja",
  "Housewarming",
];

const GUEST_PRESETS = (() => {
  const values = new Set<number>([10, 25, 50, 75, 100]);
  for (let v = 150; v <= 500; v += 50) values.add(v);
  for (let v = 600; v <= 2000; v += 100) values.add(v);
  return Array.from(values).sort((a, b) => a - b);
})();

const TIME_OPTIONS = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
];

const PACKAGE_META: Record<
  PackageTier,
  { icon: StaticImageData; accent: string; soft: string; shadow: string }
> = {
  bronze: {
    icon: bronzeIcon,
    accent: "#8A3E1D",
    soft: "bg-[#FCF3EE]",
    shadow: "shadow-[0_18px_40px_rgba(138,62,29,0.10)]",
  },
  silver: {
    icon: silverIcon,
    accent: "#66727E",
    soft: "bg-[#F3F5F7]",
    shadow: "shadow-[0_18px_40px_rgba(76,87,99,0.10)]",
  },
  gold: {
    icon: goldIcon,
    accent: "#B98B1B",
    soft: "bg-[#FFF7E6]",
    shadow: "shadow-[0_18px_40px_rgba(185,139,27,0.12)]",
  },
};

type SelectOption = {
  value: string;
  label: string;
  helper?: string;
  disabled?: boolean;
};

function formatFoodPreference(value: FoodPreference) {
  return value === "veg" ? "Pure Veg" : value === "veg_nonveg" ? "Veg + Non-Veg" : "";
}

function buildDateOptions(days = 45): SelectOption[] {
  const base = new Date();
  const results: SelectOption[] = [];

  for (let i = 1; i <= days; i += 1) {
    const value = new Date(base);
    value.setDate(base.getDate() + i);
    const iso = value.toISOString().slice(0, 10);
    const label = value.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    results.push({
      value: iso,
      label,
      helper: i === 1 ? "Tomorrow" : i <= 7 ? "This week" : undefined,
    });
  }

  return results;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function startOfMonth(date: Date) {
  const copy = new Date(date);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addMonths(date: Date, delta: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + delta);
  return copy;
}

function buildCalendarGrid(month: Date) {
  const start = startOfMonth(month);
  const startDay = start.getDay();
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startDay);

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    days.push(day);
  }
  return days;
}

export default function BookBasicsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useBookingStore();
  const setMany = useBookingStore((state) => state.setMany);

  const slug = useMemo(() => {
    const queryVendor = searchParams.get("vendor");
    if (queryVendor && getVendorDetailBySlug(queryVendor)) return queryVendor;
    if (store.vendorSlug && getVendorDetailBySlug(store.vendorSlug)) return store.vendorSlug;
    return "";
  }, [searchParams, store.vendorSlug]);

  const vendor = useMemo(() => (slug ? getVendorDetailBySlug(slug) : null), [slug]);
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [openField, setOpenField] = useState<"event" | "guest" | "date" | "time" | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageTier>(
    store.vendorSlug === slug && store.selectedPackage ? store.selectedPackage : "silver"
  );
  const [guestCount, setGuestCount] = useState(
    store.vendorSlug === slug && store.guestCount > 0 ? store.guestCount : 100
  );
  const [eventType, setEventType] = useState(store.eventType || "");
  const [eventDate, setEventDate] = useState(store.eventDate || "");
  const [eventTime, setEventTime] = useState(store.eventTime || "7:00 PM");
  const [foodPreference, setFoodPreference] = useState<FoodPreference>(
    store.vendorSlug === slug ? store.foodPreference : ""
  );
  const eventRef = useRef<HTMLDivElement | null>(null);
  const guestRef = useRef<HTMLDivElement | null>(null);
  const dateRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const foodRef = useRef<HTMLDivElement | null>(null);
  const packageRef = useRef<HTMLDivElement | null>(null);

  const scrollToRef = (ref: { current: HTMLDivElement | null }) => {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!slug || !vendor) {
      router.replace("/caterers");
      return;
    }

    setGuestCount((current) => Math.min(vendor.maxPax, Math.max(vendor.minPax, current)));
    if (!eventType) setEventType(vendor.eventTypes[0] ?? EVENT_TYPES[0]);
    if (!eventDate) setEventDate(dateOptions[0]?.value ?? "");
    if (!eventTime) setEventTime("7:00 PM");
    if (vendor.isVeg && !foodPreference) {
      setFoodPreference("veg");
    }
  }, [dateOptions, eventDate, eventTime, eventType, foodPreference, router, slug, vendor]);

  if (!vendor) return null;

  const activePackage = vendor.packages.find((entry) => entry.id === selectedPackage) ?? vendor.packages[0];
  const canContinue = Boolean(
    eventType &&
      eventDate &&
      eventTime.trim() &&
      foodPreference &&
      guestCount >= vendor.minPax &&
      guestCount <= vendor.maxPax
  );

  const persistBasics = () => {
    const shouldResetMenu =
      store.vendorSlug !== slug ||
      store.selectedPackage !== selectedPackage ||
      store.foodPreference !== foodPreference;

    setMany({
      vendorSlug: slug,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      vendorImage: vendor.images[0] ?? "",
      selectedPackage,
      pricePerPlate: activePackage.pricePerPlate,
      guestCount,
      guestSlab: `${guestCount} guests`,
      eventType,
      eventDate,
      eventTime: eventTime.trim(),
      foodPreference,
      ...(shouldResetMenu
        ? {
            selectedItems: [],
            addOnItems: [],
            autoAddOnItems: [],
            categorySelectionSummary: [],
            waterType: "none",
            waterLabel: "",
            waterPricePerPax: 0,
            waterTotal: 0,
            couponCode: "",
            couponDiscount: 0,
            addOnTotal: 0,
            gstAmount: 0,
            convenienceFee: 0,
            grandTotal: 0,
          }
        : {}),
    });
  };

  const onContinue = () => {
    if (!canContinue) return;
    persistBasics();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    router.push("/book/customize?vendor=" + encodeURIComponent(slug));
  };

  const changeGuests = (value: number) => {
    setGuestCount(Math.min(vendor.maxPax, Math.max(vendor.minPax, value)));
  };

  const dateLabel = dateOptions.find((item) => item.value === eventDate)?.label ?? "Choose date";

  return (
    <main className="min-h-screen bg-[#F8F4EF] pb-28">
      <BookingStepper current={1} />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[30px] border border-stone-200 bg-white px-5 py-5 shadow-[0_20px_50px_rgba(35,25,20,0.05)]">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-stone-100">
              <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-black text-stone-950">{vendor.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-[#EB8B23] text-[#EB8B23]" />
                  {vendor.rating}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  {vendor.location}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Step 1</p>
              <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em] text-stone-950">Start your booking</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-[1.75] text-stone-500">
                Choose your event basics, food preference, and package before you continue to the menu builder.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div ref={eventRef}>
                  <SelectField
                    label="Event Type"
                    value={eventType}
                    display={eventType || "Choose event type"}
                    open={openField === "event"}
                    onToggle={() => setOpenField((current) => (current === "event" ? null : "event"))}
                    options={EVENT_TYPES.map((item) => ({ value: item, label: item }))}
                    onSelect={(value) => {
                      setEventType(value);
                      setOpenField(null);
                      scrollToRef(guestRef);
                    }}
                    icon={CalendarDays}
                  />
                </div>

                <div ref={guestRef}>
                  <SelectField
                    label="Guest Count / Pax"
                    value={String(guestCount)}
                    display={`${guestCount} guests`}
                    open={openField === "guest"}
                    onToggle={() => setOpenField((current) => (current === "guest" ? null : "guest"))}
                    options={GUEST_PRESETS.map((value) => ({ value: String(value), label: `${value} guests` }))}
                    onSelect={(value) => {
                      changeGuests(Number(value));
                      setOpenField(null);
                      scrollToRef(dateRef);
                    }}
                    icon={Users}
                  />
                  <p className="mt-2 text-[12px] font-medium text-stone-500">Select between 10 and 2000 guests</p>
                </div>

                <div ref={dateRef}>
                  <DatePickerField
                    label="Event Date"
                    value={eventDate}
                    display={dateLabel}
                    open={openField === "date"}
                    onToggle={() => setOpenField((current) => (current === "date" ? null : "date"))}
                    onSelect={(value) => {
                      setEventDate(value);
                      setOpenField(null);
                      scrollToRef(timeRef);
                    }}
                  />
                </div>

                <div ref={timeRef}>
                  <TimePickerField
                    label="Event Time"
                    value={eventTime}
                    open={openField === "time"}
                    onToggle={() => setOpenField((current) => (current === "time" ? null : "time"))}
                    onSelect={(value) => {
                      setEventTime(value);
                      setOpenField(null);
                      scrollToRef(foodRef);
                    }}
                  />
                </div>
              </div>

              <div className="mt-6" ref={foodRef}>
                <Field label="Food Preference" helper="Select what type of food you want for this event">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFoodPreference("veg");
                        scrollToRef(packageRef);
                      }}
                      className={
                        "flex items-center justify-between rounded-[20px] border px-4 py-3 text-left transition " +
                        (foodPreference === "veg"
                          ? "border-[#1D8C4E] bg-[#EEF8F2] text-[#1D8C4E]"
                          : "border-stone-200 bg-white text-stone-700 hover:border-[#1D8C4E]")
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1D8C4E] bg-white">
                          <span className="h-3 w-3 rounded-full bg-[#1D8C4E]" />
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold">Pure Veg</p>
                          <p className="text-[12px] text-stone-500">Only veg dishes in menu</p>
                        </div>
                      </div>
                      {foodPreference === "veg" ? <Check className="h-4 w-4" /> : null}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (vendor.isVeg) return;
                        setFoodPreference("veg_nonveg");
                        scrollToRef(packageRef);
                      }}
                      disabled={vendor.isVeg}
                      className={
                        "flex items-center justify-between rounded-[20px] border px-4 py-3 text-left transition " +
                        (vendor.isVeg
                          ? "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400"
                          : foodPreference === "veg_nonveg"
                            ? "border-[#B64532] bg-[#FFF2EF] text-[#B64532]"
                            : "border-stone-200 bg-white text-stone-700 hover:border-[#B64532]")
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1D8C4E] bg-white">
                            <span className="h-3 w-3 rounded-full bg-[#1D8C4E]" />
                          </span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#B64532] bg-white">
                            <span className="h-3 w-3 rounded-full bg-[#B64532]" />
                          </span>
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold">Veg + Non-Veg</p>
                          <p className="text-[12px] text-stone-500">
                            {vendor.isVeg ? "This caterer is veg-only" : "Both veg & non-veg dishes"}
                          </p>
                        </div>
                      </div>
                      {foodPreference === "veg_nonveg" ? <Check className="h-4 w-4" /> : null}
                    </button>
                  </div>
                </Field>
              </div>
            </section>

            <section
              ref={packageRef}
              className="rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Package</p>
                  <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-stone-950">Choose Package</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {vendor.packages.map((pkg) => {
                  const meta = PACKAGE_META[pkg.id];
                  const selected = pkg.id === selectedPackage;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={
                        "relative overflow-hidden rounded-[24px] border p-4 text-left transition " +
                        (selected ? `${meta.soft} ${meta.shadow}` : "border-stone-200 bg-white hover:border-stone-300")
                      }
                      style={selected ? { borderColor: meta.accent } : undefined}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1.5"
                        style={{ backgroundColor: meta.accent, opacity: selected ? 1 : 0.16 }}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <Image src={meta.icon} alt={pkg.name} width={28} height={28} className="h-7 w-7 object-contain" />
                          </div>
                          <div>
                            <p className="text-[17px] font-black text-stone-950">{pkg.name}</p>
                            <p className="text-[12px] font-medium text-stone-500">Per plate pricing</p>
                          </div>
                        </div>
                        {selected ? (
                          <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-white">Selected</span>
                        ) : null}
                      </div>

                      <p className="mt-4 text-[30px] font-black tracking-tight text-stone-950">₹{pkg.pricePerPlate}</p>
                      <p className="text-[13px] text-stone-500">per plate</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_28px_60px_rgba(35,25,20,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Current selection</p>
              <div className="mt-4 space-y-4 rounded-[24px] border border-stone-200 bg-[#FBF9F6] p-4">
                <SummaryRow label="Package" value={`${activePackage.name} · ₹${activePackage.pricePerPlate}/plate`} />
                <SummaryRow label="Food" value={formatFoodPreference(foodPreference) || "Choose option"} />
                <SummaryRow label="Guests" value={`${guestCount} guests`} />
                <SummaryRow label="Date" value={dateLabel} />
                <SummaryRow label="Time" value={eventTime || "Select time"} />
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={onContinue}
                className={
                  "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-[20px] text-[15px] font-bold transition " +
                  (canContinue ? "bg-[#EB8B23] text-white hover:bg-[#8A3E1D]" : "cursor-not-allowed bg-stone-200 text-stone-500")
                }
              >
                Continue to Menu
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-18px_40px_rgba(35,25,20,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-stone-900">
              {activePackage.name} · ₹{activePackage.pricePerPlate}/plate · {guestCount} guests
            </p>
            <p className="text-[12px] text-stone-500">
              {formatFoodPreference(foodPreference) || "Choose food"} · {dateLabel} · {eventTime}
            </p>
          </div>
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className={
              "flex h-12 items-center justify-center gap-2 rounded-[18px] px-5 text-[14px] font-bold transition " +
              (canContinue ? "bg-[#EB8B23] text-white" : "cursor-not-allowed bg-stone-200 text-stone-500")
            }
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

function SelectField({
  label,
  helper,
  value,
  display,
  open,
  onToggle,
  options,
  onSelect,
  icon: Icon,
}: {
  label: string;
  helper?: string;
  value: string;
  display: string;
  open: boolean;
  onToggle: () => void;
  options: SelectOption[];
  onSelect: (value: string) => void;
  icon: typeof CalendarDays;
}) {
  return (
    <Field label={label} helper={helper}>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={inputClass() + " flex items-center justify-between pl-11 text-left"}
        >
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <span className={value ? "text-stone-900" : "text-stone-400"}>{display}</span>
          <ChevronDown className={"h-4 w-4 text-stone-400 transition " + (open ? "rotate-180" : "")} />
        </button>
        {open ? (
          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-[22px] border border-stone-200 bg-white p-2 shadow-[0_20px_50px_rgba(35,25,20,0.12)]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => !option.disabled && onSelect(option.value)}
                className={
                  "flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition " +
                  (option.disabled
                    ? "cursor-not-allowed opacity-45"
                    : value === option.value
                      ? "bg-[#FCF3EE] text-[#8A3E1D]"
                      : "text-stone-700 hover:bg-stone-50")
                }
              >
                <div>
                  <p className="text-[14px] font-semibold">{option.label}</p>
                  {option.helper ? <p className="mt-1 text-[12px] text-stone-500">{option.helper}</p> : null}
                </div>
                {value === option.value ? <Check className="mt-0.5 h-4 w-4 flex-shrink-0" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function DatePickerField({
  label,
  value,
  display,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  display: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const days = useMemo(() => buildCalendarGrid(viewMonth), [viewMonth]);
  const today = new Date();

  return (
    <Field label={label}>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={inputClass() + " flex items-center justify-between pl-11 text-left"}
        >
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <span className={value ? "text-stone-900" : "text-stone-400"}>{display}</span>
          <ChevronDown className={"h-4 w-4 text-stone-400 transition " + (open ? "rotate-180" : "")} />
        </button>
        {open ? (
          <div className="absolute z-20 mt-2 w-full rounded-[22px] border border-stone-200 bg-white p-4 shadow-[0_20px_50px_rgba(35,25,20,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((current) => addMonths(current, -1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 hover:border-[#8A3E1D] hover:text-[#8A3E1D]"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <span className="text-[14px] font-semibold text-stone-800">{getMonthLabel(viewMonth)}</span>
              <button
                type="button"
                onClick={() => setViewMonth((current) => addMonths(current, 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 hover:border-[#8A3E1D] hover:text-[#8A3E1D]"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-stone-500">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span key={day} className="py-1">{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const iso = day.toISOString().slice(0, 10);
                const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
                const isSelected = value === iso;
                const isToday =
                  day.getDate() === today.getDate() &&
                  day.getMonth() === today.getMonth() &&
                  day.getFullYear() === today.getFullYear();
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onSelect(iso)}
                    className={
                      "h-9 rounded-xl text-[13px] font-semibold transition " +
                      (isSelected
                        ? "bg-[#8A3E1D] text-white"
                        : isToday
                          ? "border border-[#8A3E1D] text-[#8A3E1D]"
                          : isCurrentMonth
                            ? "text-stone-700 hover:bg-stone-100"
                            : "text-stone-300")
                    }
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function TimePickerField({
  label,
  value,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Field label={label} emphasize>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className={inputClass() + " flex items-center justify-between pl-11 text-left"}
        >
          <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <span className={value ? "text-stone-900" : "text-stone-400"}>{value || "Select time"}</span>
          <ChevronDown className={"h-4 w-4 text-stone-400 transition " + (open ? "rotate-180" : "")} />
        </button>
        {open ? (
          <div className="absolute z-20 mt-2 w-full max-h-56 overflow-y-auto rounded-[22px] border border-stone-200 bg-white p-2 shadow-[0_20px_50px_rgba(35,25,20,0.12)]">
            {TIME_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={
                  "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-[14px] font-semibold transition " +
                  (value === item
                    ? "bg-[#FCF3EE] text-[#8A3E1D]"
                    : "text-stone-700 hover:bg-stone-50")
                }
              >
                {item}
                {value === item ? <Check className="h-4 w-4" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Field>
  );
}

function Field({
  label,
  helper,
  emphasize,
  children,
}: {
  label: string;
  helper?: string;
  emphasize?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          className={
            "text-[12px] uppercase tracking-[0.16em] " +
            (emphasize ? "font-bold text-stone-800" : "font-semibold text-stone-500")
          }
        >
          {label}
        </label>
      </div>
      {children}
      {helper ? <p className="mt-2 text-[12px] text-stone-500">{helper}</p> : null}
    </div>
  );
}

function inputClass() {
  return "relative h-[52px] w-full rounded-[22px] border border-stone-300 bg-[#FFFDFC] px-4 text-[15px] font-semibold text-stone-900 outline-none transition focus:border-[#8A3E1D]";
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-semibold text-stone-950">{value}</span>
    </div>
  );
}
