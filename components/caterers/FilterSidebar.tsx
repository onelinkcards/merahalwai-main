"use client";

import * as React from "react";
import { Check, ChevronDown, Star } from "lucide-react";

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
      className="flex w-full items-center justify-between rounded-[18px] border border-[#EEE4D8] bg-[#FFFCF8] px-4 py-3.5 text-left transition-all hover:border-[#D8C4AE]"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[15px] font-black tracking-tight text-[#1E1E1E]">{label}</span>
        {activeCount && activeCount > 0 ? (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#8A3E1D] px-1.5 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </div>
      <ChevronDown
        className={
          "h-4 w-4 text-[#8B7355] transition-transform duration-200 " +
          (open ? "rotate-180" : "rotate-0")
        }
      />
    </button>
  );
}

function ChoicePill({
  label,
  active,
  onClick,
  compact = false,
  prominent = false,
  className = "",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  prominent?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-[16px] border px-4 text-left text-[12px] font-semibold transition-all active:scale-[0.98] " +
        (prominent ? "min-h-[52px] py-3.5 " : compact ? "min-h-[44px] py-2.5 " : "min-h-[50px] py-3 ") +
        (active
          ? "border-[#8A3E1D] bg-[#FCF2E8] text-[#8A3E1D] shadow-[0_10px_22px_rgba(138,62,29,0.08)]"
          : "border-[#E7DED2] bg-[#FFFDF9] text-[#5F564C] hover:border-[#CDAA84]") +
        className
      }
    >
      {label}
    </button>
  );
}

function CompactFilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "min-h-[40px] rounded-[14px] border px-3 py-2 text-[11px] font-semibold leading-[1.35] transition-all active:scale-[0.98] " +
        (active
          ? "border-[#8A3E1D] bg-[#FCF3EA] text-[#8A3E1D] shadow-[0_8px_20px_rgba(138,62,29,0.08)]"
          : "border-[#E7DED2] bg-[#FFFCF8] text-[#6B5440] hover:border-[#C89A72]")
      }
    >
      {label}
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
    eventType: !isMobile,
    guests: true,
    budget: true,
    cuisine: true,
    spec: !isMobile,
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
          : "mh-glass-sidebar sticky top-[112px] hidden h-[calc(100vh-132px)] w-[340px] flex-shrink-0 flex-col self-start overflow-y-auto overflow-x-hidden rounded-[32px] border border-[rgba(234,216,192,0.82)] bg-transparent p-5 scrollbar-hide md:flex"
      }
    >
      {showHeader ? (
        <div className="mb-3 flex items-center justify-between border-b border-[#E5E0D8] pb-5">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-black tracking-tight text-[#1E1E1E]">Filters</span>
            {totalActive > 0 ? (
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#E07B39] text-[11px] font-bold text-white">
                {totalActive}
              </span>
            ) : null}
          </div>
          {(totalActive > 0 || (filters.guests != null && filters.guests > 0)) && (
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

      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader
            label="Minimum Rating"
            open={openGroups.rating}
            onToggle={() => tog("rating")}
            activeCount={filters.minRating > 0 ? 1 : 0}
          />
        </div>
        {openGroups.rating ? (
          <div className="grid grid-cols-2 gap-2.5">
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
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, minRating: item.val }))}
                  className={
                    "flex items-center justify-center gap-1.5 rounded-[14px] border py-3 text-[12px] font-semibold transition-all active:scale-95 " +
                    (active
                      ? "mh-filter-active"
                      : "mh-filter-idle text-[#8B7355] hover:border-[#804226] hover:text-[#804226]")
                  }
                >
                  {item.val > 0 ? (
                    <Star
                      className={
                        "h-3 w-3 " +
                        (active ? "fill-white text-white" : "fill-[#DE903E] text-[#DE903E]")
                      }
                    />
                  ) : null}
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader
            label="Food Preference"
            open={openGroups.food}
            onToggle={() => tog("food")}
            activeCount={filters.foodPref ? 1 : 0}
          />
        </div>
        {openGroups.food ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, foodPref: p.foodPref === "veg" ? null : "veg" }))}
              className={
                "flex items-center justify-center gap-2 rounded-[16px] border-2 py-3 text-[12px] font-bold transition-all active:scale-95 " +
                (filters.foodPref === "veg"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-[#D6E6D7] bg-white text-[#1E1E1E] hover:border-green-500")
              }
            >
              <span
                className={
                  "flex h-4 w-4 items-center justify-center rounded border-2 " +
                  (filters.foodPref === "veg" ? "border-white" : "border-green-600")
                }
              >
                <span
                  className="h-2 w-2 rounded-sm"
                  style={filters.foodPref === "veg" ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#16A34A" }}
                />
              </span>
              Pure Veg
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters((p) => ({ ...p, foodPref: p.foodPref === "nonveg" ? null : "nonveg" }))
              }
              className={
                "flex items-center justify-center gap-2 rounded-[16px] border-2 py-3 text-[12px] font-bold transition-all active:scale-95 " +
                (filters.foodPref === "nonveg"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-[#F0D6D1] bg-white text-[#1E1E1E] hover:border-red-500")
              }
            >
              <span
                className={
                  "flex h-4 w-4 items-center justify-center rounded border-2 " +
                  (filters.foodPref === "nonveg" ? "border-white" : "border-red-600")
                }
              >
                <span
                  className="h-2 w-2 rounded-sm"
                  style={filters.foodPref === "nonveg" ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#DC2626" }}
                />
              </span>
              Veg & Non-Veg
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader
            label="Guest Count"
            open={openGroups.guests}
            onToggle={() => tog("guests")}
            activeCount={filters.guestRange ? 1 : 0}
          />
        </div>
        {openGroups.guests ? (
          <div className="grid grid-cols-3 gap-2.5">
            {GUEST_RANGE_OPTIONS.map((item) => {
              const active = filters.guestRange === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() =>
                    setFilters((p) => ({ ...p, guestRange: p.guestRange === item.val ? null : item.val }))
                  }
                  className={
                    "rounded-[14px] border py-2.5 text-center text-[11px] font-semibold transition-all active:scale-95 " +
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

      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader
            label="Budget Per Plate"
            open={openGroups.budget}
            onToggle={() => tog("budget")}
            activeCount={filters.budgets.length}
          />
        </div>
        {openGroups.budget ? (
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-1">
            {BUDGET_OPTIONS.map((item) => {
              const checked = filters.budgets.includes(item.val);
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, budgets: toggle(p.budgets, item.val) }))}
                  className={
                    "rounded-[16px] border px-4 py-3.5 text-left transition-all active:scale-[0.98] " +
                    (checked
                      ? "border-[#8A3E1D] bg-[#FCF3EE] shadow-[0_10px_22px_rgba(138,62,29,0.08)]"
                      : "border-[#E7DED2] bg-white hover:border-[#CDAA84]")
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className={"block text-[13px] font-bold " + (checked ? "text-[#8A3E1D]" : "text-[#1E1E1E]")}>{item.label}</span>
                      <span className="mt-1 block text-[11px] font-medium text-[#8B7355]">{item.sub}</span>
                    </span>
                    <span
                      className={
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border transition-all " +
                        (checked ? "border-[#8A3E1D] bg-[#8A3E1D]" : "border-[#D8CFC4] bg-white")
                      }
                    >
                      {checked ? <Check className="h-[10px] w-[10px] text-white" /> : null}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Cuisine" open={openGroups.cuisine} onToggle={() => tog("cuisine")} activeCount={filters.cuisines.length} />
        </div>
        {openGroups.cuisine ? (
          <div className="flex flex-wrap gap-2.5">
            {CUISINE_OPTIONS.map((item) => (
              <ChoicePill
                key={item}
                label={item}
                active={filters.cuisines.includes(item)}
                onClick={() => setFilters((p) => ({ ...p, cuisines: toggle(p.cuisines, item) }))}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="border-b border-[#E5E0D8] py-4">
        <div className="mb-3">
          <SectionHeader label="Event Type" open={openGroups.eventType} onToggle={() => tog("eventType")} activeCount={filters.eventTypes.length} />
        </div>
        {openGroups.eventType ? (
          <div className="flex flex-wrap gap-2.5">
            {visibleEvents.map((event) => {
              const active = filters.eventTypes.includes(event);
              return (
                <CompactFilterPill
                  key={event}
                  label={event}
                  active={active}
                  onClick={() => setFilters((p) => ({ ...p, eventTypes: toggle(p.eventTypes, event) }))}
                />
              );
            })}
            <button
              type="button"
              onClick={() => setShowAllEvents((p) => !p)}
              className="min-h-[40px] rounded-[14px] border border-dashed border-[#D9C4AD] bg-[#FFF9F3] px-3 py-2 text-[11px] font-semibold text-[#8A3E1D]"
            >
              {showAllEvents ? "Show less" : `+ ${EVENT_OPTIONS.length - 5} more events`}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mb-6 pt-4">
        <div className="mb-3">
          <SectionHeader label="Caterer Speciality" open={openGroups.spec} onToggle={() => tog("spec")} activeCount={filters.specialisations.length} />
        </div>
        {openGroups.spec ? (
          <div className="flex flex-wrap gap-2.5">
            {SPECIALISATION_OPTIONS.map((item) => {
              const active = filters.specialisations.includes(item);
              return (
                <CompactFilterPill
                  key={item}
                  label={item}
                  active={active}
                  onClick={() => setFilters((p) => ({ ...p, specialisations: toggle(p.specialisations, item) }))}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
