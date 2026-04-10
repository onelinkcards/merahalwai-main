"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  FileText,
  MessageCircle,
  Phone,
  BadgeCheck,
  UserRound,
} from "lucide-react";
import BookingStepper from "@/components/book/BookingStepper";
import { useBookingStore } from "@/store/bookingStore";

type SuccessSnapshot = {
  orderId: string;
  vendorName: string;
  selectedPackage: string | null;
  guestCount: number;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  customerName: string;
  grandTotal: number;
};

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessContent />
    </Suspense>
  );
}

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [snapshot, setSnapshot] = useState<SuccessSnapshot | null>(null);

  const queryOrderId = searchParams.get("orderId") ?? "";
  const effectiveOrderId = store.orderId || queryOrderId || snapshot?.orderId || "";

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("mh_last_success_booking");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SuccessSnapshot;
      setSnapshot(parsed);
    } catch {
      setSnapshot(null);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!effectiveOrderId) router.replace("/caterers");
  }, [mounted, effectiveOrderId, router]);

  const selectedPackage = store.selectedPackage || snapshot?.selectedPackage || null;
  const guestCount = store.guestCount || snapshot?.guestCount || 0;
  const eventType = store.eventType || snapshot?.eventType || "Event";
  const eventDate = store.eventDate || snapshot?.eventDate || "";
  const eventTime = store.eventTime || snapshot?.eventTime || "";
  const customerName = store.customerName || snapshot?.customerName || "Customer";
  const venueName = store.venueName || snapshot?.venueName || "";
  const venueAddress = store.venueAddress || snapshot?.venueAddress || "";
  const venueCity = store.venueCity || snapshot?.venueCity || "";
  const grandTotal = store.grandTotal || snapshot?.grandTotal || 0;
  const bookingValue = Math.round(((store.baseTotal ? store.baseTotal + store.addOnTotal : 0) || grandTotal / 1.054));

  if (!mounted || !effectiveOrderId) return null;

  const orderLabel = "MH-ORD-" + effectiveOrderId;
  const eventDateTime = [eventDate, eventTime].filter(Boolean).join(" • ");
  const venueValue = [venueName, venueAddress, venueCity].filter(Boolean).join(", ");
  const upfrontBase = Math.round(bookingValue * 0.3);
  const upfrontGst = Math.round(upfrontBase * 0.18);
  const advanceAmount = upfrontBase + upfrontGst;
  const remainingAmount = Math.max(0, bookingValue - upfrontBase);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FCFAF6_0%,#F7F0E6_55%,#F4EBDD_100%)] pb-14">
      <BookingStepper current={5} />

      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-[#E8DDCE] bg-white/95 p-5 shadow-[0_24px_64px_rgba(35,25,20,0.08)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#EAD9C6] bg-white px-3 py-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#682C13]" />
                <span className="text-[11px] font-semibold tracking-wide text-[#682C13]">BOOKING REQUEST CREATED</span>
              </div>
              <h1 className="mt-3 text-[32px] font-black leading-tight text-[#171513]">Booking Request Sent!</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6D6154]">
                We are checking availability. Confirmation update is usually shared within{" "}
                <span className="font-semibold text-[#682C13]">up to 2 hours</span>.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-semibold text-green-700">
              <BadgeCheck className="h-4 w-4" />
              Active Request
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionButton href="/my-bookings" label="Go to Orders" icon={<ArrowRight className="h-4 w-4" />} />
            <ActionButton
              asButton
              onClick={() => router.push("/invoice/" + effectiveOrderId)}
              label="View Invoice"
              icon={<FileText className="h-4 w-4" />}
              primary
            />
            <ActionButton href="https://wa.me/919876543210" label="WhatsApp" icon={<MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />} external />
            <ActionButton href="tel:+919876543210" label="Call Us" icon={<Phone className="h-4 w-4" />} external />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="order-2 rounded-[22px] border border-[#ECDFCF] bg-[linear-gradient(160deg,#FFF9F1_0%,#FFFFFF_60%,#FFF5E8_100%)] p-4 sm:p-5 lg:order-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8A7560]">Order Summary</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <KeyValue label="Order ID" value={orderLabel} mono />
                <KeyValue label="Package" value={packageTitle(selectedPackage)} />
                <KeyValue label="Guests" value={`${guestCount}`} />
                <KeyValue label="Total" value={`₹${grandTotal.toLocaleString("en-IN")}`} />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DetailLine icon={<UserRound className="h-4 w-4" />} label="Customer" value={customerName} />
                <DetailLine
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Event"
                  value={`${eventType}${eventDateTime ? ` • ${eventDateTime}` : ""}`}
                />
                <DetailLine icon={<MapPin className="h-4 w-4" />} label="Venue" value={venueValue || "Venue details pending"} full />
              </div>
            </div>

            <div className="order-1 h-fit self-start lg:order-2">
              <PaymentSplitCard
                advanceAmount={advanceAmount}
                remainingAmount={remainingAmount}
                upfrontBase={upfrontBase}
                upfrontGst={upfrontGst}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-[22px] border border-[#E7DDCF] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
            <TimelineCard done title="Request Received" sub="Your booking request is created." />
            <TimelineCard current title="Admin Review" sub="Availability validation in progress." />
            <TimelineCard title="Vendor Confirmation" sub="Vendor confirms slot and service." />
            <TimelineCard title="Payment Link" sub="30% payment link is shared post confirmation." />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#EADFCF] bg-[#FFFCF8] px-4 py-3">
            <div className="inline-flex items-center gap-2 text-[12px] text-[#6F6153]">
              <Clock3 className="h-4 w-4 text-[#682C13]" />
              Confirmation expected in up to 2 hours.
            </div>
            <div className="flex gap-2">
              <Link
                href="/account"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E7D8C6] bg-[#FFF9F2] px-4 text-[12px] font-semibold text-[#682C13]"
              >
                Go to Profile
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
              <Link
                href="/caterers"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E1D7CB] bg-white px-4 text-[12px] font-semibold text-[#3A342E]"
              >
                Browse Caterers
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActionButton({
  href,
  label,
  icon,
  external,
  asButton,
  onClick,
  primary,
}: {
  href?: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  asButton?: boolean;
  onClick?: () => void;
  primary?: boolean;
}) {
  const className =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition " +
    (primary
      ? "border-[#682C13] bg-[linear-gradient(135deg,#EB8B23_0%,#C86E17_46%,#682C13_100%)] text-white shadow-[0_10px_18px_rgba(104,44,19,0.18)] hover:opacity-95"
      : "border-[#E1D7CB] bg-white text-[#3A342E] hover:bg-[#FAF6F1]");

  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {icon}
        {label}
      </button>
    );
  }

  if (!href) return null;

  if (external) {
    return (
      <a href={href} className={className}>
        {icon}
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {icon}
      {label}
    </Link>
  );
}

function packageTitle(value: string | null) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function KeyValue({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#EFE4D6] bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#877664]">{label}</p>
      <p className={"mt-1 text-[14px] font-bold text-[#25201A] " + (mono ? "font-mono text-[#682C13]" : "")}>{value}</p>
    </div>
  );
}

function DetailLine({
  icon,
  label,
  value,
  full,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={"rounded-xl border border-[#EFE4D7] bg-white px-3 py-2.5 " + (full ? "sm:col-span-2" : "")}>
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#7D6D5D]">
        <span className="text-[#D57A1A]">{icon}</span>
        {label}
      </p>
      <p className="mt-1 text-[13px] font-medium text-[#2D2924]">{value}</p>
    </div>
  );
}

function PaymentSplitCard({
  advanceAmount,
  remainingAmount,
  upfrontBase,
  upfrontGst,
}: {
  advanceAmount: number;
  remainingAmount: number;
  upfrontBase: number;
  upfrontGst: number;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#E7D7C6] bg-[linear-gradient(180deg,#FFFBF6_0%,#FFF7ED_100%)] shadow-[0_16px_34px_rgba(35,25,20,0.06)]">
      <div className="border-b border-[#EEE1D2] px-4 py-4 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7D6853]">Payment Split (After Confirmation)</p>
        <p className="mt-1 text-[13px] leading-6 text-[#746656]">
          Booking is confirmed first. Then the payment link is shared for the upfront amount.
        </p>
      </div>

      <div className="px-4 pt-4 sm:px-5">
        <div className="overflow-hidden rounded-full bg-[#EFE5D7] p-1">
          <div className="grid grid-cols-[30%_70%] gap-1">
            <div className="flex h-10 items-center justify-center rounded-full bg-[#682C13] text-[12px] font-black uppercase tracking-[0.18em] text-white">
              30% now
            </div>
            <div className="flex h-10 items-center justify-center rounded-full bg-[#FAF4EA] text-[12px] font-black uppercase tracking-[0.18em] text-[#8F8577]">
              70% later
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:px-5 sm:pb-5">
        <div className="rounded-[18px] border border-[#E3CEB2] bg-[linear-gradient(135deg,#FFF4E4_0%,#FFE8C5_100%)] px-4 py-4 shadow-[0_12px_26px_rgba(104,44,19,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#682C13]">30% + GST Online</p>
          <p className="mt-2 text-[28px] font-black tracking-tight text-[#22150D]">₹{advanceAmount.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-[12px] leading-6 text-[#6D4A2D]">
            30% booking value ₹{upfrontBase.toLocaleString("en-IN")} + GST ₹{upfrontGst.toLocaleString("en-IN")}.
          </p>
        </div>
        <div className="rounded-[18px] border border-[#EBE3D7] bg-[#FBF8F3] px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8D8376]">70% At Property</p>
          <p className="mt-2 text-[28px] font-black tracking-tight text-[#645D55]">₹{remainingAmount.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-[12px] leading-6 text-[#8B8174]">
            Remaining amount is settled offline at the venue. Taxes apply as per vendor settlement.
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({
  done,
  current,
  title,
  sub,
}: {
  done?: boolean;
  current?: boolean;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#ECE3D7] bg-[#FFFCF8] px-3 py-3">
      <div
        className={
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full " +
          (done
          ? "bg-[#682C13] text-white"
            : current
              ? "bg-[#EB8B23] text-white ring-4 ring-[#EB8B23]/20"
              : "bg-[#EEE5D9] text-[#8A7868]")
        }
      >
        {done ? <Check className="h-3.5 w-3.5" /> : <span className="block h-2 w-2 rounded-full bg-current" />}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#28231D]">{title}</p>
        <p className="text-[11px] text-[#756656]">{sub}</p>
      </div>
    </div>
  );
}
