"use client";

import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  LogOut,
  MapPin,
  ReceiptText,
  UserRound,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";

type TabKey = "account" | "orders";

const navItems: Array<{ key: TabKey; label: string; href: string; icon: React.ReactNode }> = [
  { key: "account", label: "Account", href: "/account", icon: <UserRound className="h-4 w-4" /> },
  { key: "orders", label: "My Orders", href: "/my-bookings", icon: <ReceiptText className="h-4 w-4" /> },
];

export default function AccountShell({
  active,
  title,
  description,
  children,
  actions,
  mobileBackHref = "/caterers",
}: {
  active: TabKey;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  mobileBackHref?: string;
}) {
  const router = useRouter();
  const { user, logout } = useDemoAuth();
  const safeName = user?.fullName ?? "MeraHalwai User";
  const initials = safeName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const userCity = user?.preferredCity ?? "Jaipur";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FCFAF6_0%,#F6F2EB_45%,#F3EDE3_100%)] pb-16 text-[#151515]">
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <div className="mx-auto max-w-[1160px] px-4 pb-10 pt-4 md:px-6 lg:pt-8 xl:px-8">
        <div className="mb-4 rounded-[22px] border border-[#E6DACB] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(20,14,8,0.06)] lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(mobileBackHref)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#E8D7C6] bg-[#FFFCF8] px-3 text-[13px] font-semibold text-[#8A3E1D] transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E6DACB] bg-[#FFF8EF] px-3 py-1 text-[11px] font-semibold text-[#70523A]">
              <MapPin className="h-3.5 w-3.5 text-[#8A3E1D]" />
              {userCity}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-[15px] font-black text-white">
              {initials || "MH"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[18px] font-black tracking-[-0.02em] text-[#111111]">{safeName}</p>
              <p className="truncate text-[12px] text-[#7A6D60]">{user?.email}</p>
            </div>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={clsx(
                  "inline-flex h-10 items-center justify-center gap-2 rounded-full border text-[13px] font-semibold transition-colors",
                  active === item.key
                    ? "border-[#EC9925] bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] text-white"
                    : "border-[#E7E2DA] bg-white text-[#4E453D]"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-7">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="hidden overflow-hidden rounded-[24px] border border-[#E6DACB] bg-white text-[#2E2721] shadow-[0_14px_34px_rgba(20,14,8,0.06)] lg:block">
              <div className="px-5 pb-5 pt-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-[20px] font-black text-white shadow-[0_12px_24px_rgba(138,62,29,0.16)]">
                    {initials || "MH"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[24px] font-black tracking-[-0.03em] text-[#191512]">{safeName}</p>
                    <p className="truncate text-[14px] text-[#7A6D60]">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#E6DACB] bg-[#FFF8EF] px-3 py-1 text-[11px] font-semibold text-[#70523A]">
                  <MapPin className="h-3.5 w-3.5 text-[#8A3E1D]" />
                  {userCity}
                </div>
              </div>
            </div>

            <div className="hidden overflow-hidden rounded-[24px] border border-[#E7E2DA] bg-white shadow-[0_14px_34px_rgba(20,14,8,0.05)] lg:block">
              <nav className="divide-y divide-[#F1ECE5]">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={clsx(
                      "flex items-center justify-between px-4 py-4 text-[14px] font-semibold transition-colors",
                      active === item.key ? "bg-[#FFF4E8] text-[#8A3E1D]" : "text-[#4B433B] hover:bg-[#FCFAF6]"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "flex h-8 w-8 items-center justify-center rounded-full border",
                          active === item.key
                            ? "border-[#EC9925] bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-white"
                            : "border-[#E7E2DA] bg-[#FAF8F5] text-[#73685D]"
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

              <div className="border-t border-[#F1ECE5] px-4 py-4">
                <button
                  type="button"
                  onClick={() => logout("/login")}
                  className="flex h-11 w-full items-center justify-between rounded-[14px] border border-[#E7D6C2] px-4 text-[14px] font-semibold text-[#8A3E1D] transition-colors hover:bg-[#FFF9F2]"
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

            <div className="mb-4 hidden rounded-[24px] border border-[#E7E2DA] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(20,14,8,0.05)] md:px-6 lg:mb-6 lg:block">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8D8378] lg:block">
                    Customer Account
                  </p>
                  <h1 className="mt-0 text-[26px] font-black tracking-[-0.03em] text-[#111111] md:text-[30px] lg:mt-2 lg:text-[34px]">
                    {title}
                  </h1>
                  <p className="mt-2 max-w-[760px] text-[14px] leading-[1.7] text-[#6D635A] md:text-[15px]">
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
