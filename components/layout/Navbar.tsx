"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import LogoOrange from "@/logos/Horizontal/MH_Logo_Horizontal_Orange.png";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";

const cn = (...inputs: Array<string | false | null | undefined>) => clsx(inputs);

type MenuKey = "services" | "cuisines" | "vendors";
type MobileKey = "services" | "cuisines" | "vendors";

type LinkItem = {
  title: string;
  sub?: string;
  href?: string;
  badge?: { text: string; className: string };
};

const servicesCol1: LinkItem[] = [
  {
    title: "Wedding Catering",
    sub: "Full-scale shaadi setups",
    href: "/caterers?event=Wedding",
    badge: { text: "Popular", className: "bg-[#DE903E] text-[#FFFFFF]" },
  },
  { title: "Corporate Events", sub: "Office parties & galas", href: "/caterers?event=Corporate" },
  { title: "Birthday Parties", sub: "All age groups", href: "/caterers?event=Birthday" },
  { title: "Anniversary Celebrations", sub: "Intimate to grand scale", href: "/caterers?event=Anniversary" },
  { title: "Baby Shower & Pooja", sub: "Traditional setups", href: "/caterers?event=Pooja" },
  { title: "Retirement Parties", sub: "Memorable send-offs", href: "/caterers?event=Retirement" },
];

const servicesCol2: LinkItem[] = [
  {
    title: "Custom Cakes",
    sub: "Designer & theme cakes",
    href: "/caterers?special=Custom%20Cakes",
    badge: { text: "New", className: "bg-[#804226] text-[#FFFFFF]" },
  },
  { title: "Dessert Tables", sub: "Curated sweet spreads", href: "/caterers?special=Dessert" },
  { title: "Sweet Boxes", sub: "Gifting & favours", href: "/caterers?special=Sweet%20Boxes" },
  { title: "Mithai & Sweets", sub: "Traditional Indian sweets", href: "/caterers?special=Mithai" },
  {
    title: "Live Counters",
    sub: "Chaat, tandoor & more",
    href: "/caterers?special=Live%20Counter",
    badge: { text: "Trending", className: "bg-[#804226] text-[#FFFFFF]" },
  },
];

const servicesCol3: LinkItem[] = [
  { title: "Tea & Coffee", sub: "Hot beverage stations", href: "/caterers?special=Tea" },
  {
    title: "Mocktails",
    sub: "Fresh & signature blends",
    href: "/caterers?special=Mocktail",
    badge: { text: "Trending", className: "bg-[#804226] text-[#FFFFFF]" },
  },
  { title: "Fresh Juices", sub: "Seasonal fruit options", href: "/caterers?special=Juices" },
  { title: "Traditional Drinks", sub: "Thandai, lassi & more", href: "/caterers?special=Drinks" },
  { title: "Welcome Drinks", sub: "Event entry stations", href: "/caterers?special=Welcome" },
];

const cuisinesCol1: LinkItem[] = [
  { title: "Rajasthani", sub: "Dal baati, laal maas", href: "/caterers?cuisine=Rajasthani" },
  { title: "Punjabi", sub: "Rich curries & tandoor", href: "/caterers?cuisine=Punjabi" },
  { title: "Mughlai", sub: "Biryani & kebabs", href: "/caterers?cuisine=Mughlai" },
  { title: "Delhi Street", sub: "Chaat & snacks", href: "/caterers?cuisine=Delhi%20Street" },
  { title: "Awadhi", sub: "Dum cooking style", href: "/caterers?cuisine=Awadhi" },
];

const cuisinesCol2: LinkItem[] = [
  { title: "South Indian", sub: "Dosa, idli, sambar", href: "/caterers?cuisine=South%20Indian" },
  { title: "Chettinad", sub: "Spicy Tamil cuisine", href: "/caterers?cuisine=Chettinad" },
  { title: "Bengali", sub: "Fish curries & mishti", href: "/caterers?cuisine=Bengali" },
  { title: "Hyderabadi", sub: "Biryani & haleem", href: "/caterers?cuisine=Hyderabadi" },
];

const cuisinesCol3: LinkItem[] = [
  {
    title: "Jain Menu",
    sub: "No root vegetables",
    href: "/caterers?cuisine=Jain",
    badge: { text: "Pure Veg", className: "bg-[#DE903E] text-[#FFFFFF]" },
  },
  {
    title: "Pure Veg",
    sub: "100% vegetarian",
    href: "/caterers?food=veg",
    badge: { text: "Veg", className: "bg-[#DE903E] text-[#FFFFFF]" },
  },
  { title: "Continental", sub: "Western dishes", href: "/caterers?cuisine=Continental" },
  { title: "Multi-Cuisine", sub: "Mix of everything", href: "/caterers?cuisine=Multi-Cuisine" },
  {
    title: "Custom Menu",
    sub: "Build your own",
    href: "/caterers?cuisine=Custom",
    badge: { text: "New", className: "bg-[#804226] text-[#FFFFFF]" },
  },
];

const vendorsCol1: LinkItem[] = [
  { title: "All Caterers", sub: "Browse full directory", href: "/caterers" },
  {
    title: "Premium Caterers",
    sub: "Top-rated & verified",
    href: "/caterers?type=Premium%20%2F%20Luxury",
    badge: { text: "Verified", className: "bg-[#804226] text-[#FFFFFF]" },
  },
  { title: "Budget Friendly", sub: "Under ₹500/plate", href: "/caterers?budget=300-500" },
  { title: "Corporate Caterers", sub: "Office & event specialists", href: "/caterers?event=Corporate" },
  { title: "Wedding Caterers", sub: "Full-scale shaadi setup", href: "/caterers?event=Wedding" },
];

const areas = ["Mansarovar", "Vaishali Nagar", "C-Scheme", "Malviya Nagar", "Jagatpura"];

const mobileServices = ["Wedding", "Corporate", "Birthday", "Anniversary", "Pooja", "Retirement"];
const mobileCuisines = ["Rajasthani", "Punjabi", "South Indian", "Mughlai", "Continental"];
const mobileVendors = ["All Caterers", "Premium", "Budget Friendly", "Wedding Caterers"];

const getDropdownImage = (title: string) => {
  const map: Record<string, string> = {
    "Wedding Catering": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=120&q=80&auto=format&fit=crop",
    "Corporate Events": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=120&q=80&auto=format&fit=crop",
    "Birthday Parties": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=120&q=80&auto=format&fit=crop",
    "Anniversary Celebrations": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=120&q=80&auto=format&fit=crop",
    "Baby Shower & Pooja": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=120&q=80&auto=format&fit=crop",
    "Retirement Parties": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=120&q=80&auto=format&fit=crop",
    "Custom Cakes": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&q=80&auto=format&fit=crop",
    "Dessert Tables": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=120&q=80&auto=format&fit=crop",
    "Sweet Boxes": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=120&q=80&auto=format&fit=crop",
    "Mithai & Sweets": "https://images.unsplash.com/photo-1589308078055-eb7ecf20f4e2?w=120&q=80&auto=format&fit=crop",
    "Live Counters": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=120&q=80&auto=format&fit=crop",
    "Tea & Coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&q=80&auto=format&fit=crop",
    "Mocktails": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=120&q=80&auto=format&fit=crop",
    "Fresh Juices": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=120&q=80&auto=format&fit=crop",
    "Traditional Drinks": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=120&q=80&auto=format&fit=crop",
    "Welcome Drinks": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=120&q=80&auto=format&fit=crop",
    Rajasthani: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=120&q=80&auto=format&fit=crop",
    Punjabi: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=120&q=80&auto=format&fit=crop",
    Mughlai: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&q=80&auto=format&fit=crop",
    "South Indian": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=120&q=80&auto=format&fit=crop",
    Chettinad: "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=120&q=80&auto=format&fit=crop",
    Bengali: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=120&q=80&auto=format&fit=crop",
    Hyderabadi: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=120&q=80&auto=format&fit=crop",
    "Jain Menu": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=120&q=80&auto=format&fit=crop",
    "Pure Veg": "https://images.unsplash.com/photo-1512621776951-a57141f2e8c5?w=120&q=80&auto=format&fit=crop",
    Continental: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=120&q=80&auto=format&fit=crop",
    "Multi-Cuisine": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=80&auto=format&fit=crop",
    "Custom Menu": "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=120&q=80&auto=format&fit=crop",
    "All Caterers": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&q=80&auto=format&fit=crop",
    "Premium Caterers": "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=120&q=80&auto=format&fit=crop",
    "Budget Friendly": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=120&q=80&auto=format&fit=crop",
    "Corporate Caterers": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=120&q=80&auto=format&fit=crop",
    "Wedding Caterers": "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=120&q=80&auto=format&fit=crop",
    "Delhi Street": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=120&q=80&auto=format&fit=crop",
    Awadhi: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=120&q=80&auto=format&fit=crop",
  };
  return map[title] ?? "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=120&q=80&auto=format&fit=crop";
};

const getMobileHref = (section: MobileKey, item: string) => {
  if (section === "services") {
    const map: Record<string, string> = {
      Wedding: "/caterers?event=Wedding",
      Corporate: "/caterers?event=Corporate",
      Birthday: "/caterers?event=Birthday",
      Anniversary: "/caterers?event=Anniversary",
      Pooja: "/caterers?event=Pooja",
      Retirement: "/caterers?event=Retirement",
    };
    return map[item] ?? "/caterers";
  }

  if (section === "cuisines") {
    return "/caterers?cuisine=" + encodeURIComponent(item);
  }

  const vendorMap: Record<string, string> = {
    Premium: "/caterers?type=Premium%20%2F%20Luxury",
    "Budget Friendly": "/caterers?budget=300-500",
    "Wedding Caterers": "/caterers?event=Wedding",
  };
  return vendorMap[item] ?? "/caterers";
};

function ColumnHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[#804226]">{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#804226]">{label}</p>
    </div>
  );
}

function DropdownRow({
  title,
  sub,
  badge,
  onClick,
}: {
  title: string;
  sub?: string;
  badge?: LinkItem["badge"];
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-150 hover:bg-[#FFF4EA]"
    >
      <img
        src={getDropdownImage(title)}
        alt={title}
        className="h-9 w-9 flex-shrink-0 rounded-lg border border-[#E8D5B7] object-cover shadow-sm"
      />
      <span className="flex-1">
        <span className="block text-[13px] font-semibold text-[#1E1E1E] group-hover:text-[#804226]">
          {title}
        </span>
        {sub ? <span className="mt-0.5 block text-[11px] text-[#8B7355]">{sub}</span> : null}
      </span>
      {badge ? (
        <span className={cn("rounded-md px-2 py-0.5 text-[9px] font-bold uppercase", badge.className)}>
          {badge.text}
        </span>
      ) : null}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, isAuthenticated, user, logout } = useDemoAuth();

  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<Record<MobileKey, boolean>>({
    services: false,
    cuisines: false,
    vendors: false,
  });

  const openTimer = useRef<NodeJS.Timeout | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);
  const dropdownRefs = useRef<Record<MenuKey, HTMLDivElement | null>>({
    services: null,
    cuisines: null,
    vendors: null,
  });
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname, mobileOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleEnter = (key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setOpenMenu(key), 150);
  };

  const handleLeave = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 200);
  };

  const navItemClass = (active?: boolean) =>
    cn(
      "flex h-[42px] cursor-pointer items-center gap-1.5 rounded-full border px-[18px] text-[14px] font-bold tracking-wide transition-all duration-[150ms]",
      active
        ? "border-[#F1D7BA] bg-[linear-gradient(180deg,rgba(255,248,240,0.98),rgba(255,241,224,0.94))] text-[#8A3E1D] shadow-[0_10px_24px_rgba(138,62,29,0.08),inset_0_1px_0_rgba(255,255,255,0.68)]"
        : "border-transparent bg-transparent text-[#4A3F36] hover:border-[#F0E0CB] hover:bg-[#FFF8F1] hover:text-[#8A3E1D]"
    );

  const panelMotion = {
    initial: { opacity: 0, y: -8, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.97 },
    transition: { duration: 0.15 },
  };

  const safeFullName = user?.fullName ?? "Priya Sharma";
  const firstName = user?.firstName ?? safeFullName.split(" ")[0] ?? "Priya";
  const initials = safeFullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <header className="sticky top-0 z-[200] px-4 pt-3 md:px-6 md:pt-4">
      {/* Main navigation */}
      <div className="mh-navbar-shell z-[200] mx-auto w-full max-w-[1280px] rounded-[24px] md:rounded-[28px]">
        <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center px-4 md:h-[74px] md:px-7">
          {/* LEFT: Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center">
            <Image src={LogoOrange} alt="Mera Halwai" className="h-[40px] w-auto object-contain md:h-[46px]" priority />
          </Link>

          {/* CENTER: Nav links */}
          <div className="flex flex-1 justify-center">
            <nav className="relative hidden h-full items-center gap-1.5 md:flex" style={{ height: "74px" }}>
            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => handleEnter("services")}
              onMouseLeave={handleLeave}
              ref={(el) => {
                dropdownRefs.current.services = el;
              }}
            >
              <button
                onClick={() => setOpenMenu((p) => (p === "services" ? null : "services"))}
                className={navItemClass(openMenu === "services")}
              >
                Services
                <ChevronDown
                  className={cn(
                    "h-[13px] w-[13px] text-current opacity-60 transition-transform duration-200",
                    openMenu === "services" ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              <AnimatePresence>
                {openMenu === "services" ? (
                  <motion.div
                    {...panelMotion}
                    className="mh-glass-popover absolute left-1/2 top-[calc(100%+14px)] z-[200] w-[920px] max-w-[calc(100vw-40px)] -translate-x-1/2 overflow-hidden rounded-[28px]"
                  >
                    <div className="flex">
                      <div className="flex-1 border-r border-[#E8D5B7] p-6">
                        <ColumnHeader icon={<UtensilsCrossed className="h-[14px] w-[14px]" />} label="Catering Services" />
                        <div className="space-y-1">
                          {servicesCol1.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 border-r border-[#E8D5B7] p-6">
                        <ColumnHeader icon={<Sparkles className="h-[14px] w-[14px]" />} label="Specialty Items" />
                        <div className="space-y-1">
                          {servicesCol2.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <ColumnHeader icon={<Coffee className="h-[14px] w-[14px]" />} label="Beverages" />
                        <div className="space-y-1">
                          {servicesCol3.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => handleEnter("cuisines")}
              onMouseLeave={handleLeave}
              ref={(el) => {
                dropdownRefs.current.cuisines = el;
              }}
            >
              <button
                onClick={() => setOpenMenu((p) => (p === "cuisines" ? null : "cuisines"))}
                className={navItemClass(openMenu === "cuisines")}
              >
                Cuisines
                <ChevronDown
                  className={cn(
                    "h-[13px] w-[13px] text-current opacity-60 transition-transform duration-200",
                    openMenu === "cuisines" ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              <AnimatePresence>
                {openMenu === "cuisines" ? (
                  <motion.div
                    {...panelMotion}
                    className="mh-glass-popover absolute left-1/2 top-[calc(100%+14px)] z-[200] w-[860px] max-w-[calc(100vw-40px)] -translate-x-1/2 overflow-hidden rounded-[28px]"
                  >
                    <div className="flex">
                      <div className="flex-1 border-r border-[#E8D5B7] p-6">
                        <ColumnHeader icon={<MapPin className="h-[14px] w-[14px]" />} label="North India" />
                        <div className="space-y-1">
                          {cuisinesCol1.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 border-r border-[#E8D5B7] p-6">
                        <ColumnHeader icon={<MapPin className="h-[14px] w-[14px]" />} label="South & East" />
                        <div className="space-y-1">
                          {cuisinesCol2.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <ColumnHeader icon={<Sparkles className="h-[14px] w-[14px]" />} label="Special" />
                        <div className="space-y-1">
                          {cuisinesCol3.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              className="relative flex h-full items-center"
              onMouseEnter={() => handleEnter("vendors")}
              onMouseLeave={handleLeave}
              ref={(el) => {
                dropdownRefs.current.vendors = el;
              }}
            >
              <button
                onClick={() => setOpenMenu((p) => (p === "vendors" ? null : "vendors"))}
                className={navItemClass(openMenu === "vendors")}
              >
                Vendors
                <ChevronDown
                  className={cn(
                    "h-[13px] w-[13px] text-current opacity-60 transition-transform duration-200",
                    openMenu === "vendors" ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              <AnimatePresence>
                {openMenu === "vendors" ? (
                  <motion.div
                    {...panelMotion}
                    className="mh-glass-popover absolute left-1/2 top-[calc(100%+14px)] z-[200] w-[760px] max-w-[calc(100vw-40px)] -translate-x-1/2 overflow-hidden rounded-[28px]"
                  >
                    <div className="flex">
                      <div className="flex-1 border-r border-[#E8D5B7] p-6">
                        <ColumnHeader icon={<Users className="h-[14px] w-[14px]" />} label="By Type" />
                        <div className="space-y-1">
                          {vendorsCol1.map((item) => (
                            <DropdownRow key={item.title} {...item} onClick={() => router.push(item.href ?? "/caterers")} />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <ColumnHeader icon={<MapPin className="h-[14px] w-[14px]" />} label="Jaipur Areas" />
                        <div className="space-y-1">
                          {areas.map((area) => (
                            <button
                              key={area}
                              className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[#1E1E1E] transition-colors duration-150 hover:bg-[#FFF3E8] hover:text-[#804226]"
                              onClick={() => router.push("/caterers?location=" + encodeURIComponent(area))}
                            >
                              {area}
                            </button>
                          ))}
                          <button
                            className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-[#DE903E]"
                            onClick={() => router.push("/caterers")}
                          >
                            View All Areas →
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="relative flex h-full items-center">
              <button
                onClick={() => router.push("/about")}
                className={navItemClass(pathname === "/about")}
              >
                About
              </button>
            </div>
          </nav>
          </div>{/* end CENTER */}

          {/* RIGHT: Login + CTA */}
          <div className="flex flex-shrink-0 items-center gap-4">
            <div className="hidden items-center gap-3 md:flex">
              {ready && isAuthenticated ? (
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((prev) => !prev)}
                    className="mh-glass-chip flex h-[48px] items-center gap-3 rounded-2xl border px-4 text-[#8A3E1D] shadow-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE8CA] text-[12px] font-black text-[#8A3E1D]">
                      {initials}
                    </span>
                    <span className="flex flex-col items-start leading-none">
                      <span className="text-[14px] font-bold text-[#1E1E1E]">{firstName}</span>
                      <span className="mt-1 text-[11px] font-semibold text-[#8A3E1D]">My account</span>
                    </span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", accountOpen ? "rotate-180" : "rotate-0")}
                    />
                  </button>

                  <AnimatePresence>
                    {accountOpen ? (
                      <motion.div
                        {...panelMotion}
                        className="absolute right-0 top-[calc(100%+12px)] z-[220] w-[260px] overflow-hidden rounded-[24px] border border-[#E7DCCC] bg-white shadow-[0_26px_48px_rgba(24,20,16,0.10)]"
                      >
                        <div className="border-b border-[#EEE5DA] bg-[#FCF8F2] px-4 py-4">
                          <p className="text-[15px] font-black text-[#1E1E1E]">{user?.fullName}</p>
                          <p className="mt-1 text-[12px] text-[#7C7167]">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          {[
                            { label: "My Profile", href: "/account/profile" },
                            { label: "My Orders", href: "/my-bookings" },
                          ].map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center justify-between rounded-2xl px-3 py-3 text-[14px] font-bold text-[#2E2925] transition-colors hover:bg-[#FCFAF7]"
                            >
                              {item.label}
                              <UserRound className="h-4 w-4 text-[#8A3E1D]" />
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setAccountOpen(false);
                              logout("/login");
                            }}
                            className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-[14px] font-bold text-[#2E2925] transition-colors hover:bg-[#FCFAF7]"
                          >
                            Logout
                            <LogOut className="h-4 w-4 text-[#8A3E1D]" />
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="mh-outline-button flex h-[46px] items-center justify-center gap-2 rounded-2xl border px-5 text-[14px] font-bold transition-all hover:bg-[#FAF8F6]"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                className="mh-primary-button flex h-[42px] items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-bold !text-[#FFFFFF] shadow-[0_10px_24px_rgba(235,139,35,0.24)] transition-all hover:bg-[#c66a2e]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-[18px] border border-[#E8D7C0] bg-[rgba(255,255,255,0.92)] shadow-[0_12px_30px_rgba(95,61,28,0.08),inset_0_1px_0_rgba(255,255,255,0.86)] md:hidden"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
            >
            {mobileOpen ? (
              <X className="h-[22px] w-[22px] text-[var(--text-head)]" />
            ) : (
              <div className="flex flex-col gap-[5px]">
                <span className="block h-[2.5px] w-[22px] rounded-full bg-[var(--text-head)]" />
                <span className="block h-[2.5px] w-[22px] rounded-full bg-[var(--text-head)]" />
                <span className="block h-[2.5px] w-[22px] rounded-full bg-[var(--text-head)]" />
              </div>
            )}
          </button>
          </div>{/* end RIGHT */}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/60 md:hidden backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 top-[10vh] z-[160] flex flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl md:hidden"
            >
              <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-[#E8D5B7]/50 bg-[#FFF9F3] px-6">
                <Image src={LogoOrange} alt="Mera Halwai" className="h-[30px] w-auto object-contain drop-shadow-sm" priority />
                <button
                  className="flex items-center justify-center p-2 text-[#804226] transition-opacity hover:opacity-70"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-6 w-6" strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-2 pb-[100px]">
                {[
                  {
                    key: "services" as const,
                    label: "Services",
                    items: mobileServices,
                    icon: <UtensilsCrossed className="h-4 w-4" />,
                    note: "Catering flows for different event types",
                  },
                  {
                    key: "cuisines" as const,
                    label: "Cuisines",
                    items: mobileCuisines,
                    icon: <Sparkles className="h-4 w-4" />,
                    note: "Browse menus by cuisine preference",
                  },
                  {
                    key: "vendors" as const,
                    label: "Vendors",
                    items: mobileVendors,
                    icon: <Users className="h-4 w-4" />,
                    note: "Jump into popular vendor discovery paths",
                  },
                ].map((section) => (
                  <div key={section.key} className="border-b border-[#F0EBE3] py-1">
                    <button
                      className="flex w-full items-center justify-between py-[16px] text-left"
                      onClick={() =>
                        setMobileAccordion((p) => ({ ...p, [section.key]: !p[section.key] }))
                      }
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8C1] bg-[linear-gradient(180deg,#FFF9F1,#FFF1E2)] text-[#8A3E1D] shadow-[0_10px_20px_rgba(138,62,29,0.08)]">
                          {section.icon}
                        </span>
                        <span>
                          <span className="block text-[16px] font-extrabold tracking-tight text-[#1E1E1E]">
                            {section.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-semibold text-[#8B7355]">
                            {section.note}
                          </span>
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-[#8B7355] transition-transform",
                          mobileAccordion[section.key] ? "rotate-180" : "rotate-0"
                        )}
                        strokeWidth={2.5}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileAccordion[section.key] ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3 pb-4 pt-1">
                            {section.items.map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  setMobileOpen(false);
                                  router.push(getMobileHref(section.key, item));
                                }}
                                className="group overflow-hidden rounded-[20px] border border-[#E9D8C1] bg-[linear-gradient(180deg,#FFFFFF,#FFF8F1)] text-left shadow-[0_10px_20px_rgba(95,61,28,0.06)] transition-all active:scale-[0.98]"
                              >
                                <div className="flex items-center gap-3 px-3 py-3">
                                  <img
                                    src={getDropdownImage(item)}
                                    alt={item}
                                    className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[13px] font-bold leading-[1.25] text-[#1E1E1E] group-active:text-[#8A3E1D]">
                                      {item}
                                    </span>
                                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C17A33]">
                                      Explore
                                    </span>
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ))}

                <button
                  className="flex w-full items-center justify-between border-b border-[#F0EBE3] py-[16px] text-left"
                  onClick={() => { setMobileOpen(false); router.push("/about"); }}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E9D8C1] bg-[linear-gradient(180deg,#FFF9F1,#FFF1E2)] text-[#8A3E1D] shadow-[0_10px_20px_rgba(138,62,29,0.08)]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[16px] font-extrabold tracking-tight text-[#1E1E1E]">About</span>
                      <span className="mt-0.5 block text-[11px] font-semibold text-[#8B7355]">
                        Learn how MeraHalwai works in Jaipur
                      </span>
                    </span>
                  </span>
                  <ChevronDown className="h-5 w-5 rotate-[-90deg] text-[#8B7355]" strokeWidth={2.5} />
                </button>

                <div className="mt-8 flex flex-col gap-3">
                  {ready && isAuthenticated ? (
                    <>
                      <div className="rounded-[24px] border border-[#E8D5B7] bg-[#FFF8F0] px-4 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBE8CA] text-[13px] font-black text-[#8A3E1D]">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-black text-[#1E1E1E]">{user?.fullName}</p>
                            <p className="truncate text-[12px] text-[#7B7066]">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/account/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#E8D5B7] bg-white text-[15px] font-bold tracking-wide text-[#1E1E1E] shadow-sm transition-transform active:scale-[0.98]"
                      >
                        <UserRound className="h-4 w-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/my-bookings"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#E8D5B7] bg-white text-[15px] font-bold tracking-wide text-[#1E1E1E] shadow-sm transition-transform active:scale-[0.98]"
                      >
                        <UserRound className="h-4 w-4" />
                        My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          logout("/login");
                        }}
                        className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#E8D5B7] bg-white text-[15px] font-bold tracking-wide text-[#1E1E1E] shadow-sm transition-transform active:scale-[0.98]"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#E8D5B7] bg-white text-[15px] font-bold tracking-wide text-[#1E1E1E] shadow-sm transition-transform active:scale-[0.98]"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="mh-primary-button flex h-[48px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold tracking-wide text-white shadow-sm transition-transform active:scale-[0.98]"
                      >
                        <UserPlus className="h-4 w-4" />
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
