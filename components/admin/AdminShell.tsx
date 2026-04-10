"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
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
  { label: "System Health", href: "/admin/system", icon: Activity },
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
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827]">
      <div className="flex min-h-screen">
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#1F232A] bg-[#111317] text-[#E5E7EB] transition-all duration-200",
            collapsed ? "w-[92px]" : "w-[268px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className={clsx("min-w-0", collapsed && "lg:hidden")}>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9CA3AF]">Internal Console</p>
              <h2 className="mt-1 text-[18px] font-black tracking-[-0.03em] text-white">Super Admin</h2>
              <p className="mt-1 text-[12px] leading-[1.6] text-[#6B7280]">
                Manage bookings, vendors, billing, and live operations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCollapsed((value) => !value);
                setMobileOpen(false);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-[#CBD5E1]"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5">
            <div className={clsx("mb-5 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3", collapsed && "lg:hidden")}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">Queue</p>
              <p className="mt-2 text-[26px] font-black tracking-[-0.05em] text-white">{pendingCount}</p>
              <p className="mt-1 text-[12px] text-[#9CA3AF]">Orders need action</p>
            </div>

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
                      "group flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-semibold transition",
                      active
                        ? "bg-[#E5E7EB] text-[#111827] shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                        : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-[#111827]" : "text-[#6B7280]")} />
                    <span className={clsx("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                    {item.href === "/admin/orders" && pendingCount > 0 ? (
                      <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-[#374151] px-2 py-1 text-[10px] font-black text-white">
                        {pendingCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-left text-[14px] font-semibold text-white transition hover:bg-white/10"
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
            className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] lg:hidden"
          />
        ) : null}

        <div className={clsx("flex min-h-screen flex-1 flex-col transition-all duration-200", collapsed ? "lg:pl-[92px]" : "lg:pl-[268px]")}>
          <header className="sticky top-0 z-20 border-b border-[#DFE3E8] bg-[rgba(243,244,246,0.94)] backdrop-blur">
            <div className="flex items-center gap-4 px-4 py-4 md:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#D1D5DB] bg-white text-[#374151] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]">Admin Workspace</p>
                <h1 className="mt-1 truncate text-[26px] font-black tracking-[-0.03em] text-[#111827]">{title}</h1>
                {description ? <p className="mt-1 max-w-[880px] text-[14px] text-[#6B7280]">{description}</p> : null}
              </div>

              {actions ? <div className="hidden shrink-0 items-center gap-3 lg:flex">{actions}</div> : null}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#D1D5DB] bg-white text-[#374151]"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {pendingCount > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#DC2626]" /> : null}
                </button>
                <div className="hidden items-center gap-3 rounded-[14px] border border-[#D1D5DB] bg-white px-3 py-2 lg:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#111827] text-[13px] font-black text-white">
                    {user?.avatar ?? "MH"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[#111827]">{user?.name ?? "Admin"}</p>
                    <p className="text-[12px] font-medium text-[#6B7280]">Super Admin</p>
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
