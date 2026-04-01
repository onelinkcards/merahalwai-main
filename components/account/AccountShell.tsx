"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  MapPinHouse,
  ReceiptText,
  UserRound,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import LogoOrange from "@/logos/Horizontal/MH_Logo_Horizontal_Orange.png";

type TabKey = "dashboard" | "orders" | "profile";

const navItems: Array<{ key: TabKey; label: string; href: string; icon: React.ReactNode }> = [
  { key: "dashboard", label: "Dashboard", href: "/account", icon: <LayoutGrid className="h-4 w-4" /> },
  { key: "orders", label: "My Orders", href: "/my-bookings", icon: <ReceiptText className="h-4 w-4" /> },
  { key: "profile", label: "Profile", href: "/account/profile", icon: <UserRound className="h-4 w-4" /> },
];

export default function AccountShell({
  active,
  title,
  description,
  children,
  actions,
}: {
  active: TabKey;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useDemoAuth();
  const safeName = user?.fullName ?? "MeraHalwai User";
  const initials = safeName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const savedVenueCount = user?.savedAddresses.length ?? 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(236,153,37,0.16),transparent_28%),linear-gradient(180deg,#FFFDF9_0%,#FBF6EF_42%,#F5EFE6_100%)] pb-16 text-[#151515]">
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-4 md:px-6 lg:pt-8 xl:px-8">
        <div className="mb-4 flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D7C6] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D] shadow-[0_14px_30px_rgba(118,73,28,0.08)] transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8D8D95]">Customer Account</p>
            <p className="truncate text-[22px] font-black tracking-[-0.03em] text-[#111111]">{title}</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-8">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-[#E7D5C4] bg-[linear-gradient(145deg,#FFF6EA_0%,#F9E9D3_45%,#F3D4B4_100%)] text-[#4A311F] shadow-[0_24px_60px_rgba(118,73,28,0.12)]">
              <div className="border-b border-[#EFDFC8] px-5 py-4">
                <Image src={LogoOrange} alt="Mera Halwai" className="h-7 w-auto object-contain" priority />
              </div>

              <div className="px-5 pb-5 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D89F67] bg-[#8A3E1D] text-[18px] font-black text-white shadow-[0_14px_26px_rgba(138,62,29,0.18)]">
                    {initials || "MH"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[20px] font-black tracking-[-0.03em] text-[#6A331D]">{safeName}</p>
                    <p className="truncate text-[13px] text-[#8E735F]">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-[#E7D6C2] bg-white/70 px-3 py-3 backdrop-blur-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A8763F]">Account</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#6B381F]">Customer profile active</p>
                  </div>
                  <Link
                    href="/account/profile"
                    className="inline-flex items-center gap-1 rounded-full border border-[#E5C7A8] bg-[#FFF8F0] px-3 py-1.5 text-[12px] font-semibold text-[#8A3E1D]"
                  >
                    View profile
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 text-[12px] text-[#7A6453]">
                  <div className="rounded-[16px] border border-[#E7D6C2] bg-white/70 px-3 py-3">
                    <p className="font-semibold text-[#B1814C]">City</p>
                    <p className="mt-1 font-semibold text-[#6B381F]">{user?.preferredCity}</p>
                  </div>
                  <div className="rounded-[16px] border border-[#E7D6C2] bg-white/70 px-3 py-3">
                    <p className="font-semibold text-[#B1814C]">Saved venues</p>
                    <p className="mt-1 font-semibold text-[#6B381F]">{savedVenueCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[#E7E8EC] bg-white shadow-[0_16px_40px_rgba(12,12,14,0.05)]">
              <div className="px-4 pb-2 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9797A1]">Navigate</p>
              </div>

              <nav className="divide-y divide-[#EFF0F3]">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={clsx(
                      "flex items-center justify-between px-4 py-4 text-[14px] font-semibold transition-colors",
                      active === item.key ? "bg-[#FFF3E6] text-[#8A3E1D]" : "text-[#4A4A50] hover:bg-[#FFFBF6]"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "flex h-9 w-9 items-center justify-center rounded-full border",
                          active === item.key
                            ? "border-[#EC9925] bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-white"
                            : "border-[#E8E8ED] bg-[#F7F8FA] text-[#6A6A73]"
                        )}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#B0B0B7]" />
                  </Link>
                ))}
              </nav>

              <div className="border-t border-[#EFF0F3] px-4 py-4">
                <div className="flex items-start gap-3 rounded-[18px] bg-[#F7F8FA] px-3 py-3 text-[13px] text-[#5D5D64]">
                  <MapPinHouse className="mt-0.5 h-4 w-4 text-[#8D8D95]" />
                  <div>
                    <p className="font-semibold text-[#181818]">{user?.preferredCity}</p>
                    <p className="mt-1">{user?.commonEventType} · {user?.commonGuestRange}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => logout("/login")}
                  className="mt-3 flex h-11 w-full items-center justify-between rounded-[18px] border border-[#E7D6C2] px-4 text-[14px] font-semibold text-[#8A3E1D] transition-colors hover:bg-[#FFF9F2]"
                >
                  <span className="flex items-center gap-3">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#B0B0B7]" />
                </button>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            {actions ? <div className="mb-4 flex flex-wrap gap-2.5 lg:hidden">{actions}</div> : null}

            <div className="mb-4 hidden rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6 lg:mb-6 lg:block">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9797A1] lg:block">
                    Customer Account
                  </p>
                  <h1 className="mt-0 text-[26px] font-black tracking-[-0.03em] text-[#111111] md:text-[30px] lg:mt-2 lg:text-[36px]">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-[760px] text-[14px] leading-[1.75] text-[#66666D] md:text-[15px]">
                    {description}
                  </p>
                </div>

                {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
              </div>
            </div>

            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
