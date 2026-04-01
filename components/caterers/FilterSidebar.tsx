"use client";

import * as React from "react";
import {
  Briefcase,
  Cake,
  Check,
  ChevronDown,
  Coffee,
  Gem,
  Heart,
  HeartCrack,
  Moon,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";

type FiltersState = {
  guests: number | null;
  cuisines: string[];
  minRating: number;
  foodPref: "veg" | "nonveg" | null;
  budgets: string[];
  eventTypes: string[];
  guestRange: string | null;
  specialisations: string[];
};

type FilterSidebarProps = {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onReset?: () => void;
  isMobile?: boolean;
  showHeader?: boolean;
};

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

const CUISINE_OPTIONS = [
  "North Indian",
  "Mughlai",
  "South Indian",
  "Rajasthani",
  "Chaat",
  "Desserts",
  "Continental",
];

const SPECIALISATION_OPTIONS = [
  "Live Counter",
  "Royal Setup",
  "Budget Friendly",
  "Premium / Luxury",
  "Mughlai Specialist",
  "Pure Veg Only",
  "Small Events Expert",
  "Corporate Caterer",
  "Outdoor Events",
];

const BUDGET_OPTIONS = [
  { val: "under300", label: "Under ₹300", sub: "Budget friendly" },
  { val: "300-500", label: "₹300–₹500", sub: "Mid range" },
  { val: "500-800", label: "₹500–₹800", sub: "Premium" },
  { val: "800plus", label: "₹800+", sub: "Luxury" },
];

const GUEST_RANGE_OPTIONS = [
  { val: "0-50", label: "< 50" },
  { val: "50-100", label: "50–100" },
  { val: "100-200", label: "100–200" },
  { val: "200-500", label: "200–500" },
  { val: "500-1000", label: "500–1000" },
  { val: "1000plus", label: "1000+" },
];

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const eventIcon = (event: string) => {
  if (event === "Birthday Party") return <Cake className="h-3.5 w-3.5" />;
  if (event === "Wedding") return <Heart className="h-3.5 w-3.5" />;
  if (event === "Wedding Anniversary") return <Gem className="h-3.5 w-3.5" />;
  if (event === "Baby Shower") return <Star className="h-3.5 w-3.5" />;
  if (event === "Retirement Party") return <Coffee className="h-3.5 w-3.5" />;
  if (event === "Corporate Event / Office Party") return <Briefcase className="h-3.5 w-3.5" />;
  if (event === "Get-Together / Friends Party") return <Users className="h-3.5 w-3.5" />;
  if (event === "Break-Up Party") return <HeartCrack className="h-3.5 w-3.5" />;
  if (event === "Small Gathering (under 75 pax)") return <UserCheck className="h-3.5 w-3.5" />;
  if (event === "Satsang / Pooja") return <Sparkles className="h-3.5 w-3.5" />;
  return <Moon className="h-3.5 w-3.5" />;
};

function SectionHeader({
  label,
  open,
  onToggle,
  activeCount,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  activeCount?: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-between py-0.5"
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold text-[#1E1E1E]">{label}</span>
        {activeCount && activeCount > 0 ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#804226] text-[9px] font-bold text-[#FFFFFF]">
            {activeCount}
          </span>
        ) : null}
      </div>
      <ChevronDown
        className={
          "h-[14px] w-[14px] text-[#8B7355] transition-transform duration-200 " +
          (open ? "rotate-180" : "rotate-0")
        }
      />
    </button>
  );
}

export default function FilterSidebar({
  filters,
  setFilters,
  onReset,
  isMobile,
  showHeader = true,
}: FilterSidebarProps) {
  const [showAllEvents, setShowAllEvents] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState({
    rating: true,
    food: true,
    eventType: false,
    guests: true,
    budget: true,
    cuisine: true,
    spec: false,
  });

  const tog = (k: keyof typeof openGroups) =>
    setOpenGroups((p) => ({ ...p, [k]: !p[k] }));

  const resetAll = () =>
    setFilters((p) => ({
      ...p,
      minRating: 0,
      foodPref: null,
      budgets: [],
      eventTypes: [],
      guestRange: null,
      specialisations: [],
      cuisines: [],
    }));

  const totalActive =
    (filters.minRating > 0 ? 1 : 0) +
    (filters.foodPref ? 1 : 0) +
    filters.budgets.length +
    filters.eventTypes.length +
    (filters.guestRange ? 1 : 0) +
    filters.specialisations.length +
    filters.cuisines.length;

  const visibleEvents = showAllEvents ? EVENT_OPTIONS : EVENT_OPTIONS.slice(0, 5);

  return (
    <aside
      className={
        isMobile
          ? "flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-transparent pb-[80px]"
          : "mh-glass-sidebar sticky top-[112px] hidden h-[calc(100vh-132px)] w-[324px] flex-shrink-0 flex-col self-start overflow-y-auto overflow-x-hidden rounded-[32px] border border-[rgba(234,216,192,0.82)] bg-transparent p-7 scrollbar-hide md:flex"
      }
    >
      {showHeader ? (
        <div className="mb-3 flex items-center justify-between border-b border-[#E5E0D8] pb-5">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-black tracking-tight text-[#1E1E1E]">Filters</span>
            {totalActive > 0 ? (
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#E07B39] text-[11px] font-bold text-[#FFFFFF]">
                {totalActive}
              </span>
            ) : null}
          </div>
          {(totalActive > 0 || (filters.guests != null && filters.guests > 0) || filters.cuisines.length > 0) && (
            <button
              type="button"
              onClick={onReset || resetAll}
              className="text-[12px] font-bold text-[#E07B39] transition-all hover:text-[#804226] hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      ) : null}

      {/* --- RATING --- */}
      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Minimum Rating" open={openGroups.rating} onToggle={() => tog("rating")} activeCount={filters.minRating > 0 ? 1 : 0} />
        </div>
        {openGroups.rating ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 0, label: "Any" },
              { val: 3.5, label: "3.5+" },
              { val: 4.0, label: "4.0+" },
              { val: 4.5, label: "4.5+" },
            ].map((item) => {
              const active = filters.minRating === item.val;
              return (
                <button
                  key={item.label}
                  onClick={() => setFilters((p) => ({ ...p, minRating: item.val }))}
                  className={
                    "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[12px] font-semibold transition-all active:scale-95 " +
                    (active
                      ? "mh-filter-active"
                      : "mh-filter-idle text-[#8B7355] hover:border-[#804226] hover:text-[#804226]")
                  }
                >
                  {item.val > 0 ? (
                    <Star className={"h-3 w-3 " + (active ? "fill-[#FFFFFF] text-[#FFFFFF]" : "fill-[#DE903E] text-[#DE903E]")} />
                  ) : null}
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* --- FOOD PREF --- */}
      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Food Preference" open={openGroups.food} onToggle={() => tog("food")} activeCount={filters.foodPref ? 1 : 0} />
        </div>
        {openGroups.food ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, foodPref: p.foodPref === "veg" ? null : "veg" }))}
              className={
                "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[12px] font-bold transition-all active:scale-95 " +
                (filters.foodPref === "veg"
                  ? "border-green-600 bg-green-600 text-[#FFFFFF]"
                  : "mh-filter-idle text-[#1E1E1E] hover:border-green-500")
              }
            >
              <span
                className={
                  "flex h-4 w-4 items-center justify-center rounded border-2 " +
                  (filters.foodPref === "veg" ? "border-[#FFFFFF]" : "border-green-600")
                }
              >
                <span className="h-2 w-2 rounded-sm" style={filters.foodPref === "veg" ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#16A34A" }} />
              </span>
              Pure Veg
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, foodPref: p.foodPref === "nonveg" ? null : "nonveg" }))}
              className={
                "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[12px] font-bold transition-all active:scale-95 " +
                (filters.foodPref === "nonveg"
                  ? "border-red-600 bg-red-600 text-[#FFFFFF]"
                  : "mh-filter-idle text-[#1E1E1E] hover:border-red-500")
              }
            >
              <span
                className={
                  "flex h-4 w-4 items-center justify-center rounded border-2 " +
                  (filters.foodPref === "nonveg" ? "border-[#FFFFFF]" : "border-red-600")
                }
              >
              <span className="h-2 w-2 rounded-sm" style={filters.foodPref === "nonveg" ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#DC2626" }} />
              </span>
              Veg & Non-Veg
            </button>
          </div>
        ) : null}
      </div>

      {/* --- GUEST COUNT --- */}
      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Guest Count" open={openGroups.guests} onToggle={() => tog("guests")} activeCount={filters.guestRange ? 1 : 0} />
        </div>
        {openGroups.guests ? (
          <div className="grid grid-cols-3 gap-2">
            {GUEST_RANGE_OPTIONS.map((item) => {
              const active = filters.guestRange === item.val;
              return (
                <button
                  key={item.val}
                  onClick={() => setFilters((p) => ({ ...p, guestRange: p.guestRange === item.val ? null : item.val }))}
                  className={
                    "rounded-xl border py-2 text-center text-[11px] font-semibold transition-all active:scale-95 " +
                    (active
                      ? "mh-filter-active"
                      : "mh-filter-idle text-[#8B7355] hover:border-[#804226] hover:text-[#804226]")
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* --- BUDGET --- */}
      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Budget Per Plate" open={openGroups.budget} onToggle={() => tog("budget")} activeCount={filters.budgets.length} />
        </div>
        {openGroups.budget ? (
          <div className="flex flex-col gap-2">
            {BUDGET_OPTIONS.map((item) => {
              const checked = filters.budgets.includes(item.val);
              return (
                <button
                  key={item.val}
                  onClick={() => setFilters((p) => ({ ...p, budgets: toggle(p.budgets, item.val) }))}
                  className={
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all " +
                    (checked ? "mh-filter-soft-active" : "mh-filter-idle hover:border-[#804226]")
                  }
                >
                  <span
                    className={
                      "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all " +
                      (checked ? "border-[#804226] bg-[#804226]" : "border-[#D1CBC3] bg-[#FFFFFF]")
                    }
                  >
                    {checked ? <Check className="h-[9px] w-[9px] text-[#FFFFFF]" /> : null}
                  </span>
                  <div className="flex flex-col">
                    <span className={"text-[12px] font-bold " + (checked ? "text-[#804226]" : "text-[#1E1E1E]")}>{item.label}</span>
                    <span className="text-[10px] text-[#8B7355]">{item.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* --- SPECIALISATIONS --- */}
      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Cuisine" open={openGroups.cuisine} onToggle={() => tog("cuisine")} activeCount={filters.cuisines.length} />
        </div>
        {openGroups.cuisine ? (
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((item) => {
              const active = filters.cuisines.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => setFilters((p) => ({ ...p, cuisines: toggle(p.cuisines, item) }))}
                  className={
                    "rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-95 " +
                    (active
                      ? "mh-filter-active"
                      : "mh-filter-idle text-[#804226] hover:border-[#804226]")
                  }
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* --- EVENTS --- */}
      <div className="py-4">
        <div className="mb-3">
          <SectionHeader label="Event Type" open={openGroups.eventType} onToggle={() => tog("eventType")} activeCount={filters.eventTypes.length} />
        </div>
        {openGroups.eventType ? (
          <div className="flex flex-col gap-1">
            {visibleEvents.map((event) => {
              const checked = filters.eventTypes.includes(event);
              return (
                <button
                  key={event}
                  onClick={() => setFilters((p) => ({ ...p, eventTypes: toggle(p.eventTypes, event) }))}
                  className={
                    "flex items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-all " +
                    (checked ? "mh-filter-soft-active" : "hover:bg-[rgba(255,250,245,0.45)]")
                  }
                >
                  <span
                    className={
                      "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all " +
                      (checked ? "border-[#804226] bg-[#804226]" : "border-[#D1CBC3] bg-[#FFFFFF]")
                    }
                  >
                    {checked ? <Check className="h-[9px] w-[9px] text-[#FFFFFF]" /> : null}
                  </span>
                  <span className={"text-[12px] font-medium " + (checked ? "text-[#804226] font-semibold" : "text-[#1E1E1E]")}>
                    {event}
                  </span>
                  <span className={"ml-auto " + (checked ? "text-[#DE903E]" : "text-[#8B7355]")}>
                    {eventIcon(event)}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setShowAllEvents((p) => !p)}
              className="mt-1 text-[11px] font-semibold text-[#DE903E] hover:text-[#804226]"
            >
              {showAllEvents ? "Show less" : `+ ${EVENT_OPTIONS.length - 5} more events`}
            </button>
          </div>
        ) : null}
      </div>

      {/* --- CATERER TYPE --- */}
      <div className="mh-glass-card mb-6 rounded-2xl border border-[rgba(234,216,192,0.72)] p-4">
        <div className="mb-3">
          <SectionHeader label="Caterer Speciality" open={openGroups.spec} onToggle={() => tog("spec")} activeCount={filters.specialisations.length} />
        </div>
        {openGroups.spec ? (
          <div className="flex flex-wrap gap-2">
            {SPECIALISATION_OPTIONS.map((item) => {
              const active = filters.specialisations.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => setFilters((p) => ({ ...p, specialisations: toggle(p.specialisations, item) }))}
                  className={
                    "rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-95 " +
                    (active
                      ? "mh-filter-active"
                      : "mh-filter-idle text-[#804226] hover:border-[#804226]")
                  }
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
