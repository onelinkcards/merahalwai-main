"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  Users,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";
import clsx from "clsx";
import { useAdmin } from "@/components/admin/AdminProvider";
import LogoOrange from "@/logos/Horizontal/MH_Logo_Horizontal_Orange.png";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Booking Requests", href: "/admin/orders", icon: ScrollText },
  { label: "Vendors", href: "/admin/vendors", icon: UtensilsCrossed },
  { label: "Platform Menu", href: "/admin/menu", icon: UtensilsCrossed },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Reports", href: "/admin/reports", icon: WalletCards },
  { label: "System Health", href: "/admin/system", icon: Activity },
  { label: "Platform Settings", href: "/admin/settings", icon: Settings },
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
  const { user, logout } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="flex min-h-screen">
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E2E8F0] bg-[#F1F5F9] text-[#0F172A] transition-all duration-200",
            collapsed ? "xl:w-[92px]" : "xl:w-[248px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0",
            "w-[248px]"
          )}
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-5">
            <div className={clsx("min-w-0", collapsed && "xl:hidden")}>
              <Image src={LogoOrange} alt="Mera Halwai Admin" className="h-auto w-[142px]" />
            </div>
            <button
              type="button"
              onClick={() => {
                setCollapsed((value) => !value);
                setMobileOpen(false);
              }}
              className="hidden h-10 w-10 items-center justify-center rounded-[12px] border border-[#CBD5E1] bg-white text-[#475569] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC] xl:inline-flex"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
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
                      "group flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-semibold transition",
                      active
                        ? "bg-[#DBEAFE] text-[#1D4ED8] shadow-[0_1px_2px_rgba(37,99,235,0.08)]"
                        : "text-[#475569] hover:bg-white hover:text-[#0F172A]"
                    )}
                    >
                    <Icon className={clsx("h-4 w-4 shrink-0", active ? "text-[#2563EB]" : "text-[#64748B]")} />
                    <span className={clsx("truncate", collapsed && "md:hidden")}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-[#E2E8F0] p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-[14px] border border-[#CBD5E1] bg-white px-4 py-3 text-left text-[14px] font-semibold text-[#334155] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
            >
              <LogOut className="h-4 w-4" />
              <span className={clsx(collapsed && "md:hidden")}>Logout</span>
            </button>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] md:hidden"
          />
        ) : null}

        <div
          className={clsx(
            "flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden transition-all duration-200",
            collapsed ? "xl:pl-[92px]" : "xl:pl-[248px]"
          )}
        >
          <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-[rgba(248,250,252,0.92)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-4 px-4 py-4 md:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#CBD5E1] bg-white text-[#334155] xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Admin Workspace</p>
                <h1 className="mt-1 truncate text-[26px] font-black tracking-[-0.03em] text-[#0F172A]">{title}</h1>
                {description ? <p className="mt-1 max-w-[880px] text-[14px] text-[#64748B]">{description}</p> : null}
              </div>

              {actions ? <div className="hidden min-w-0 shrink-0 items-center gap-3 md:flex">{actions}</div> : null}

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/notifications"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#CBD5E1] bg-white text-[#334155] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
                >
                  <Bell className="h-4.5 w-4.5" />
                </Link>
                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((value) => !value)}
                    className="flex items-center gap-3 rounded-[14px] border border-[#CBD5E1] bg-white px-3 py-2 transition hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#DBEAFE] text-[13px] font-black text-[#1D4ED8]">
                      {user?.avatar ?? "MH"}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-[14px] font-bold text-[#0F172A]">{user?.name ?? "Admin"}</p>
                      <p className="text-[12px] font-medium text-[#64748B]">Super Admin</p>
                    </div>
                  </button>
                  {profileOpen ? (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[220px] rounded-[16px] border border-[#E2E8F0] bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                      <Link
                        href="/admin/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                      >
                        Admin Profile
                      </Link>
                      <Link
                        href="/admin/notifications"
                        onClick={() => setProfileOpen(false)}
                        className="flex rounded-[12px] px-3 py-3 text-[13px] font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                      >
                        Notifications
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full rounded-[12px] px-3 py-3 text-left text-[13px] font-semibold text-[#DC2626] transition hover:bg-[#FEF2F2]"
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {actions ? <div className="px-4 pb-4 md:hidden">{actions}</div> : null}
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
