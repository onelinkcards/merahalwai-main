"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, ReceiptText, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import StatusBadge from "@/components/account/StatusBadge";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { formatCurrency, formatDateTime, getMergedOrders } from "@/data/mockAccount";
import { useBookingStore } from "@/store/bookingStore";

export default function AccountDashboardPage() {
  const { user, logout } = useDemoAuth();
  const store = useBookingStore();
  const orders = getMergedOrders(store);
  const needsProfile = !user?.profileComplete;
  const needsAddress = !user?.addressComplete;
  const activeOrders = orders.filter((order) =>
    ["slotHeld", "pendingConfirmation", "confirmed", "paymentPending"].includes(order.status)
  );
  const recentOrders = orders.slice(0, 5);
  const pendingPayments = orders.filter((order) => order.status === "paymentPending").length;

  return (
    <AccountShell
      active="dashboard"
      title="My Account"
      description="Your profile and current bookings in one place."
    >
      <div className="space-y-6">
        {!user?.onboardingComplete ? (
          <section className="rounded-[26px] border border-[#E7D5C4] bg-[linear-gradient(145deg,#FFF9F1_0%,#FFF3E4_100%)] px-5 py-5 shadow-[0_16px_32px_rgba(138,62,29,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A06D38]">Finish setup</p>
            <h2 className="mt-2 text-[22px] font-black tracking-[-0.03em] text-[#111111]">Your account needs one quick setup pass.</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#6B5A4B]">
              Complete your profile and add a default address so bookings can resume without re-entering the same details.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {needsProfile ? (
                <Link
                  href="/onboarding/profile?redirect=%2Faccount"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 text-[13px] font-semibold text-white"
                >
                  Complete Profile
                </Link>
              ) : null}
              {needsAddress ? (
                <Link
                  href="/onboarding/address?redirect=%2Faccount"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#E3C9AF] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D]"
                >
                  Add Address
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[30px] border border-[#E7D5C4] bg-[linear-gradient(145deg,#2B211C_0%,#1F1B1A_56%,#151313_100%)] text-white shadow-[0_20px_48px_rgba(38,22,12,0.22)]">
          <div className="bg-[radial-gradient(circle_at_top_right,rgba(236,153,37,0.18),transparent_34%),linear-gradient(180deg,transparent,transparent)] px-5 py-5 md:px-6">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-[#D9A66E] bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-[22px] font-black text-white shadow-[0_14px_28px_rgba(138,62,29,0.24)]">
                {(user?.fullName ?? "MH")
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[28px] font-black tracking-[-0.04em] text-white">
                  {user?.firstName ?? "Priya"}
                </p>
                <p className="mt-1 truncate text-[14px] text-white/68">{user?.email}</p>
                <Link
                  href="/account/profile"
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#F4C98D]"
                >
                  Edit profile
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/46">Active bookings</p>
                <p className="mt-1 text-[20px] font-black text-white">{activeOrders.length}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/46">Pending payments</p>
                <p className="mt-1 text-[20px] font-black text-white">{pendingPayments}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A06D38]">Bookings</p>
              <h2 className="mt-2 text-[24px] font-black tracking-[-0.03em] text-[#111111]">Current booking activity</h2>
            </div>
            <Link
              href="/my-bookings"
              className="hidden text-[13px] font-semibold text-[#8A3E1D] md:inline-flex"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {(activeOrders.length ? activeOrders : recentOrders.slice(0, 3)).map((order) => (
              <Link
                key={order.id}
                href={`/my-bookings/${order.id}`}
                className="group block rounded-[22px] border border-[#ECECF0] bg-[#FCFBF9] px-4 py-4 transition-all hover:border-[#E7D5C4] hover:bg-white"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[18px] font-black text-[#111111]">{order.vendorName}</p>
                      <span className="rounded-full border border-[#E7DCCF] bg-white px-3 py-1 text-[11px] font-medium text-[#6F645B]">
                        {order.packageName}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] text-[#66666D]">
                      {order.eventType} · {formatDateTime(order.eventDate, order.eventTime)}
                    </p>
                    <p className="mt-1 text-[13px] text-[#8A8A91]">
                      {order.guests} guests · {formatCurrency(order.total)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                    <StatusBadge status={order.status} compact />
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#8A3E1D]">
                      View details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/my-bookings"
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#8A3E1D] md:hidden"
          >
            View all bookings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {[
            { label: "My Orders", href: "/my-bookings", icon: <ReceiptText className="h-4 w-4" /> },
            { label: "Profile", href: "/account/profile", icon: <UserRound className="h-4 w-4" /> },
            { label: "Payment status", href: "/my-bookings", icon: <WalletCards className="h-4 w-4" /> },
            { label: "Need help", href: "/my-bookings", icon: <ShieldCheck className="h-4 w-4" /> },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-3 rounded-[24px] border border-[#E7E8EC] bg-white px-5 py-5 text-[15px] font-semibold text-[#2B2B31] shadow-[0_16px_36px_rgba(12,12,14,0.05)] transition-all hover:border-[#E7D5C4] hover:bg-[#FFFCF8]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4E8] text-[#8A3E1D]">
                  {item.icon}
                </span>
                {item.label}
              </span>
              <ChevronRight className="h-4 w-4 text-[#B2B2BA]" />
            </Link>
          ))}
        </section>

        <section className="rounded-[28px] border border-[#E7D5C4] bg-[linear-gradient(145deg,#FFF7EC_0%,#FBEBD7_100%)] px-5 py-5 shadow-[0_16px_36px_rgba(138,62,29,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A06D38]">Next step</p>
              <p className="mt-2 text-[18px] font-bold text-[#4A311F]">Browse caterers for your next event.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/caterers"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(138,62,29,0.14)]"
              >
                Start new booking
              </Link>
              <button
                type="button"
                onClick={() => logout("/login")}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#E6C9AA] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D]"
              >
                Log out
              </button>
            </div>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}
