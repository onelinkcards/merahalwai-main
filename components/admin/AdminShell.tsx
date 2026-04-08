"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import clsx from "clsx";
import { useAdmin } from "@/components/admin/AdminProvider";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Booking Requests", href: "/admin/orders", icon: ScrollText },
  { label: "Vendors", href: "/admin/vendors", icon: UtensilsCrossed },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reports", href: "/admin/reports", icon: WalletCards },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Admin Profile", href: "/admin/profile", icon: ShieldCheck },
];

export default function AdminShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, state, logout } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingCount = useMemo(
    () =>
      state.orders.filter((order) =>
        [
          "bookingRequestSubmitted",
          "slotHeld",
          "pendingAdminReview",
          "vendorNotified",
          "vendorDeclined",
        ].includes(order.status)
      ).length,
    [state.orders]
  );

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] text-[#1C2430]">
      <div className="flex min-h-screen">
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E3E8F0] bg-white transition-all duration-200",
            collapsed ? "w-[92px]" : "w-[280px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-[#E9EDF4] px-5 py-5">
            <div className={clsx("min-w-0", collapsed && "lg:hidden")}>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#2F6FED]">MeraHalwai</p>
              <h2 className="mt-1 text-[18px] font-black tracking-[-0.03em] text-[#1C2430]">Admin Panel</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setCollapsed((value) => !value);
                setMobileOpen(false);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E3E8F0] bg-white text-[#2C3B4A]"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold transition",
                      active
                        ? "bg-[#E8F0FF] text-[#1C2B3A] shadow-[0_10px_20px_rgba(46,111,237,0.15)]"
                        : "text-[#5A6470] hover:bg-[#F1F4F9] hover:text-[#1C2430]"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-[#2F6FED]" : "text-[#7B8694]")} />
                    <span className={clsx("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                    {item.href === "/admin/orders" && pendingCount > 0 ? (
                      <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-[#2F6FED] px-2 py-1 text-[11px] font-black text-white">
                        {pendingCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[#E9EDF4] p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#E3E8F0] bg-white px-4 py-3 text-left text-[14px] font-semibold text-[#1C2430] transition hover:bg-[#F1F4F9]"
            >
              <LogOut className="h-4 w-4" />
              <span className={clsx(collapsed && "lg:hidden")}>Logout</span>
            </button>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-[#140E09]/35 lg:hidden"
          />
        ) : null}

        <div className={clsx("flex min-h-screen flex-1 flex-col transition-all duration-200", collapsed ? "lg:pl-[92px]" : "lg:pl-[280px]")}>
          <header className="sticky top-0 z-20 border-b border-[#E3E8F0] bg-white/95 backdrop-blur">
            <div className="flex items-center gap-4 px-4 py-4 md:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E3E8F0] bg-white text-[#2C3B4A] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2F6FED]">MeraHalwai Admin</p>
                <h1 className="mt-1 truncate text-[26px] font-black tracking-[-0.03em] text-[#1C2430]">{title}</h1>
                {description ? <p className="mt-1 max-w-[880px] text-[14px] text-[#5A6470]">{description}</p> : null}
              </div>

              {actions ? <div className="hidden shrink-0 items-center gap-3 lg:flex">{actions}</div> : null}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E3E8F0] bg-white text-[#2C3B4A]"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {pendingCount > 0 ? (
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#2F6FED]" />
                  ) : null}
                </button>
                <div className="hidden items-center gap-3 rounded-2xl border border-[#E3E8F0] bg-white px-3 py-2 lg:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2F6FED] text-[13px] font-black text-white">
                    {user?.avatar ?? "MH"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[#1C2430]">{user?.name ?? "Admin"}</p>
                    <p className="text-[12px] font-medium text-[#7B8694]">Admin</p>
                  </div>
                </div>
              </div>
            </div>
            {actions ? <div className="px-4 pb-4 lg:hidden md:px-6 xl:px-8">{actions}</div> : null}
          </header>

          <main className="flex-1 px-4 py-6 md:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
