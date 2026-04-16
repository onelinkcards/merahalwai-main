"use client";

import Link from "next/link";
import { ArrowRight, MapPin, PencilLine, Phone, UserRound } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import StatusBadge from "@/components/account/StatusBadge";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { formatCurrency, formatDateTime, getMergedOrders } from "@/data/mockAccount";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { useBookingStore } from "@/store/bookingStore";

export default function AccountPage() {
  const { user, logout } = useDemoAuth();
  const store = useBookingStore();
  const orders = getMergedOrders(store);
  const recentOrders = orders.slice(0, 3);

  return (
    <AccountShell active="account" title="Account" description="Profile info and recent bookings." mobileBackHref="/caterers">
      <div className="space-y-4">
        {!user?.onboardingComplete ? (
          <section className="rounded-[22px] border border-[#E7D5C4] bg-[#FFF7EC] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A3E1D]">Setup Pending</p>
            <p className="mt-2 text-[14px] font-medium text-[#5F4A37]">
              Complete profile and address to auto-fill booking details.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!user?.profileComplete ? (
                <Link
                  href="/onboarding/profile?redirect=%2Faccount"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 text-[12px] font-semibold text-white"
                >
                  Complete Profile
                </Link>
              ) : null}
              {!user?.addressComplete ? (
                <Link
                  href="/onboarding/address?redirect=%2Faccount"
                  className="inline-flex h-9 items-center justify-center rounded-full border border-[#E2CEB6] bg-white px-4 text-[12px] font-semibold text-[#8A3E1D]"
                >
                  Add Address
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(20,14,8,0.05)]">
          <h2 className="text-[20px] font-black tracking-[-0.02em] text-[#12100E]">Account Information</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <InfoRow icon={<UserRound className="h-4 w-4" />} label="Full Name" value={user?.fullName ?? "—"} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Mobile" value={user?.phone ?? "—"} />
            <InfoRow label="Email" value={user?.email ?? "—"} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="City" value={user?.preferredCity ?? "Jaipur"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/account/profile"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#E6D8C9] bg-[#FFF9F2] px-4 text-[13px] font-semibold text-[#8A3E1D]"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </Link>
            <Link
              href="/my-bookings"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#E5D9CC] bg-white px-4 text-[13px] font-semibold text-[#3F382F]"
            >
              My Orders
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => logout("/login")}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#E7D6C2] bg-[#FFF9F2] px-4 text-[13px] font-semibold text-[#8A3E1D]"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(20,14,8,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[18px] font-black text-[#12100E]">Recent Orders</h3>
            <Link href="/my-bookings" className="text-[12px] font-semibold text-[#8A3E1D]">
              View all
            </Link>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/my-bookings/${order.id}`}
                className="block rounded-[16px] border border-[#EDE8E1] bg-[#FCFAF7] px-3.5 py-3 transition hover:border-[#E2D2BF]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-[#181512]">{order.vendorName}</p>
                    <p className="mt-0.5 text-[12px] text-[#6A6159]">
                      {order.eventType} · {formatDateTime(order.eventDate, order.eventTime)}
                    </p>
                    <p className="mt-1 text-[12px] text-[#6A6159]">
                      {order.guests} guests · {formatCurrency(getCustomerFacingBillSummary(order.bill).customerGrandTotal)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} compact />
                </div>
              </Link>
            ))}

            {!recentOrders.length ? (
              <div className="rounded-[14px] border border-dashed border-[#DFD9D2] px-4 py-6 text-center text-[13px] text-[#7A7168]">
                No orders yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AccountShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#ECE6DE] bg-[#FFFCF9] px-3 py-2.5">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[14px] font-semibold text-[#1D1915]">{value}</p>
    </div>
  );
}
