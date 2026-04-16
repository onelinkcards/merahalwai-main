"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Clock,
  Loader2,
  Lock,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import BookingStepper from "@/components/book/BookingStepper";
import CustomerPaymentSplit from "@/components/booking/CustomerPaymentSplit";
import { VegDotInline } from "@/components/booking/VegDotInline";
import { getVendorDetailBySlug } from "@/data/vendors";
import { calculateBill, getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { groupMenuItemsForReview } from "@/lib/bookingMenuHelpers";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";

function ReviewSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F4EF] pb-10">
      <BookingStepper current={4} />
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="h-40 animate-pulse rounded-2xl bg-[#E8D5B7]/60" />
      </div>
    </div>
  );
}

function foodPreferenceLabel(value: string) {
  return value === "veg" ? "Pure Veg" : value === "veg_nonveg" ? "Veg + Non-Veg" : "Not selected";
}

function formatSelectedAddOn(name: string, selections: Record<string, string[]>) {
  const chosen = selections[name];
  if (!chosen?.length) return name;
  return `${name} (${chosen.join(", ")})`;
}

export default function BookReviewPage() {
  const router = useRouter();
  const store = useBookingStore();
  const setMany = useBookingStore((s) => s.setMany);
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!store.vendorSlug) router.replace("/caterers");
    if (store.vendorSlug && !store.customerName) router.replace("/book/details");
  }, [mounted, router, store.customerName, store.vendorSlug]);

  const vendor = useMemo(
    () => (store.vendorSlug ? getVendorDetailBySlug(store.vendorSlug) : null),
    [store.vendorSlug]
  );

  const bill = useMemo(
    () =>
      calculateBill({
        vendorSlug: store.vendorSlug,
        selectedPackage: store.selectedPackage,
        pricePerPlate: store.pricePerPlate,
        guestCount: store.guestCount,
        selectedItems: store.selectedItems,
        addOnItems: store.addOnItems,
        waterType: store.waterType,
        foodPreference: store.foodPreference,
        couponDiscount: store.couponDiscount,
      }),
    [
      store.addOnItems,
      store.couponDiscount,
      store.foodPreference,
      store.guestCount,
      store.pricePerPlate,
      store.selectedItems,
      store.selectedPackage,
      store.vendorSlug,
      store.waterType,
    ]
  );

  const grouped = useMemo(() => {
    if (!store.vendorSlug || !store.selectedPackage) return [];
    return groupMenuItemsForReview(
      store.vendorSlug,
      store.selectedPackage,
      store.selectedItems,
      store.foodPreference
    );
  }, [store.foodPreference, store.selectedItems, store.selectedPackage, store.vendorSlug]);

  if (!mounted || !vendor || !store.customerName) return <ReviewSkeleton />;

  const { bookingValue, upfrontGst, upfrontTotal, remainingAmount, customerGrandTotal } =
    getCustomerFacingBillSummary(bill);
  const orderGrandTotal = customerGrandTotal;

  const toggleCat = (name: string) => setOpenCats((prev) => ({ ...prev, [name]: !prev[name] }));

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === "FLAT10") {
      setMany({ couponCode: "FLAT10", couponDiscount: 500 });
      useToastStore.getState().show("Coupon applied.");
      return;
    }
    if (code) {
      useToastStore.getState().show("Invalid coupon.");
    }
  };

  const clearCoupon = () => {
    setMany({ couponCode: "", couponDiscount: 0 });
  };

  const confirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(useBookingStore.getState()),
      });
      const data = (await res.json()) as { orderId?: string };
      const id = data.orderId ?? "2026-" + String(Math.floor(100000 + Math.random() * 899999));
      setMany({
        orderId: id,
        bookingTimestamp: new Date().toISOString(),
        orderStatus: "pending",
        baseTotal: bill.baseAmount,
        addOnTotal: bill.addOnTotal + bill.waterAmount,
        gstAmount: upfrontGst,
        convenienceFee: 0,
        grandTotal: orderGrandTotal,
      });
      if (typeof window !== "undefined") {
        const snapshot = {
          orderId: id,
          vendorName: store.vendorName,
          selectedPackage: store.selectedPackage,
          guestCount: store.guestCount,
          eventType: store.eventType,
          eventDate: store.eventDate,
          eventTime: store.eventTime,
          venueName: store.venueName,
          venueAddress: store.venueAddress,
          venueCity: store.venueCity,
          customerName: store.customerName,
          grandTotal: orderGrandTotal,
        };
        window.localStorage.setItem("mh_last_success_booking", JSON.stringify(snapshot));
      }
      router.push(`/booking/success?orderId=${encodeURIComponent(id)}`);
    } catch {
      useToastStore.getState().show("Could not place request. Try again.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4EF] pb-32 lg:pb-12">
      <BookingStepper current={4} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-stone-100">
                <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[20px] font-black text-stone-950">{vendor.name}</p>
                <p className="mt-1 text-[13px] text-stone-500">
                  {store.selectedPackage} package · ₹{store.pricePerPlate}/plate · {store.guestCount} guests
                </p>
                <p className="mt-1 text-[12px] text-stone-500">
                  {store.eventType} · {store.eventDate} · {store.eventTime}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/book/details")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E7D5C4] bg-[#FFFCF8] px-4 text-[13px] font-semibold text-[#8A3E1D] transition hover:bg-[#FFF5EA]"
            >
              <PencilLine className="h-4 w-4" />
              Edit Details
            </button>
          </div>
        </section>


        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="lg:hidden">
              <ReviewSection
                kicker="Review Total"
                title={`₹${orderGrandTotal.toLocaleString("en-IN")}`}
                actionLabel="Edit"
                onAction={() => router.push("/book/details")}
              >
                <p className="text-[13px] font-medium text-stone-500">Scroll to view full bill summary</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MobileBillMini label="Pay now" value={upfrontTotal} />
                  <MobileBillMini label="Pay later" value={remainingAmount} />
                </div>
                <div className="mt-4 rounded-[20px] border border-[#F0E4D8] bg-[#FFFCF8] p-4">
                  <div className="space-y-2.5">
                    <MobileBillRow label="Base Amount" value={bill.baseAmount} />
                    <MobileBillRow label="Optional Add-ons" value={bill.optionalAddOnAmount} />
                    <MobileBillRow label="Water" value={bill.waterAmount} />
                    <MobileBillRow label="Booking value" value={bookingValue} />
                  </div>
                </div>
                <div className="mt-4">
                  <CustomerPaymentSplit
                    advanceAmount={upfrontTotal}
                    remainingAmount={remainingAmount}
                    compact
                    title="Payment Terms"
                  />
                </div>
              </ReviewSection>
            </div>

            <ReviewSection
              kicker="Summary"
              title="Vendor & Event Summary"
              actionLabel="Edit"
              onAction={() => router.push("/book/details")}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow label="Vendor" value={store.vendorName} />
                <InfoRow label="Package" value={packageTitle(store.selectedPackage)} />
                <InfoRow label="Event Type" value={store.eventType} />
                <InfoRow label="Food Preference" value={foodPreferenceLabel(store.foodPreference)} />
                <InfoRow label="Guests" value={`${store.guestCount} guests`} />
                <InfoRow label="Date" value={store.eventDate} />
                <InfoRow label="Time" value={store.eventTime} />
                <InfoRow label="Venue" value={store.venueName || "—"} />
                <InfoRow label="Address" value={`${store.venueAddress}, ${store.venueCity} ${store.venuePincode}`} />
              </div>
            </ReviewSection>

            <ReviewSection kicker="Menu" title="Menu Summary">
              <div className="space-y-3">
                {grouped.map((group) => {
                  const open = openCats[group.label] ?? false;
                  return (
                    <div key={group.categoryKey} className="rounded-[20px] border border-stone-200 bg-[#FCFBF9] px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleCat(group.label)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <div>
                          <p className="text-[15px] font-bold text-stone-950">{group.label}</p>
                          <p className="mt-1 text-[12px] text-stone-500">{group.items.length} selected</p>
                        </div>
                        <ChevronDown className={"h-4 w-4 text-stone-400 transition " + (open ? "rotate-180" : "")} />
                      </button>

                      {open ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <span
                              key={item.key}
                              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] text-stone-700"
                            >
                              <VegDotInline isVeg={item.isVeg} size={14} />
                              {item.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <SmallBlock
                  title="Optional Add-ons"
                  value={
                    store.addOnItems.length
                      ? store.addOnItems
                          .map((item) => formatSelectedAddOn(item, store.addOnSelections))
                          .join(", ")
                      : "None selected"
                  }
                />
                <SmallBlock title="Water" value={store.waterLabel || "Selection pending"} />
                <SmallBlock title="Note for Caterer" value={store.specialNote || "No note added"} />
              </div>
            </ReviewSection>

            <ReviewSection
              kicker="Customer"
              title="Customer Details"
              actionLabel="Edit"
              onAction={() => router.push("/book/details")}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow label="Name" value={store.customerName} />
                <InfoRow label="Phone" value={`+91 ${store.customerPhone}`} />
                <InfoRow label="Email" value={store.customerEmail} />
                <InfoRow label="WhatsApp" value={`+91 ${store.customerWhatsapp}`} />
              </div>
            </ReviewSection>

            <ReviewSection kicker="Coupon" title="Apply Coupon">
              {!store.couponCode ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="h-12 w-full min-w-0 flex-1 rounded-[18px] border border-stone-200 bg-[#FCFBF9] px-4 text-[13px] font-semibold uppercase outline-none transition focus:border-[#8A3E1D] sm:h-11"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-stone-900 px-5 text-[13px] font-semibold text-white transition hover:bg-[#8A3E1D] sm:h-11 sm:w-auto sm:min-w-[140px]"
                  >
                    Apply Coupon
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-[18px] border border-green-200 bg-green-50 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-green-800">{store.couponCode} applied</p>
                    <p className="text-[12px] text-green-700">₹{store.couponDiscount} discount</p>
                  </div>
                  <button type="button" onClick={clearCoupon} className="text-[12px] font-semibold text-green-800">
                    Remove
                  </button>
                </div>
              )}
            </ReviewSection>
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="rounded-[30px] border border-stone-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFCF8_100%)] p-6 shadow-[0_24px_56px_rgba(35,25,20,0.08)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-stone-500">Billing</p>
              <h2 className="mt-2 text-[24px] font-black text-stone-950">Review your total</h2>
              <p className="mt-1 text-[12px] text-stone-500">Final amount before booking request submission.</p>

              <div className="mt-5 space-y-3">
                <BillRow label="Base Amount" value={bill.baseAmount} helper={`${store.guestCount} guests × ₹${store.pricePerPlate}/plate`} />
                <BillRow label="Optional Add-ons" value={bill.optionalAddOnAmount} />
                <BillRow label="Water" value={bill.waterAmount} />
                {store.couponDiscount > 0 ? <BillRow label={`Coupon (${store.couponCode})`} value={-store.couponDiscount} positive /> : null}
                <div className="border-t border-stone-200 pt-3">
                  <BillRow label="Booking value" value={bookingValue} />
                </div>
                <CustomerPaymentSplit
                  advanceAmount={upfrontTotal}
                  remainingAmount={remainingAmount}
                  compact
                  title="Payment Terms"
                />
              </div>

              <button
                type="button"
                disabled={confirming}
                onClick={() => void confirm()}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#EB8B23] text-[14px] font-bold text-white transition hover:bg-[#8A3E1D] disabled:cursor-wait disabled:bg-stone-300"
              >
                {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {confirming ? "Submitting..." : "Confirm Booking Request"}
              </button>

              <div className="mt-4 space-y-2 text-[12px] text-stone-500">
                <p className="inline-flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-[#8A3E1D]" />
                  No payment at request stage
                </p>
                <p className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#8A3E1D]" />
                  30% now (incl. 18% tax)
                </p>
                <p className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8A3E1D]" />
                  70% at event
                </p>
                <p className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8A3E1D]" />
                  Taxes (if applicable) as per vendor invoice
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/96 px-4 py-3 shadow-[0_-18px_40px_rgba(35,25,20,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Pay after confirmation</p>
            <p className="mt-1 text-[24px] font-black tracking-tight text-stone-950">
              ₹{upfrontTotal.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[12px] font-medium text-stone-500">
              30% now (incl. 18% tax) · 70% at event
            </p>
          </div>
          <button
            type="button"
            disabled={confirming}
            onClick={() => void confirm()}
            className="flex h-[56px] min-w-[186px] items-center justify-center gap-2 rounded-[18px] bg-[#EB8B23] px-5 text-[14px] font-bold text-white transition hover:bg-[#8A3E1D] disabled:cursor-wait disabled:bg-stone-300"
          >
            {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {confirming ? "Submitting..." : "Confirm Booking Request"}
          </button>
        </div>
      </div>
    </main>
  );
}

function packageTitle(value: string | null) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ReviewSection({
  kicker,
  title,
  children,
  actionLabel,
  onAction,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-stone-500">{kicker}</p>
          <h2 className="mt-2 text-[22px] font-black text-stone-950">{title}</h2>
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E7D5C4] bg-[#FFFCF8] px-4 text-[12px] font-semibold text-[#8A3E1D] transition hover:bg-[#FFF5EA] sm:text-[13px]"
          >
            <PencilLine className="h-3.5 w-3.5" />
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function SmallBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-[#FCFBF9] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{title}</p>
      <p className="mt-2 text-[13px] font-medium leading-[1.7] text-stone-800">{value}</p>
    </div>
  );
}

function BillRow({
  label,
  value,
  helper,
  positive,
}: {
  label: string;
  value: number;
  helper?: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] text-stone-600">{label}</p>
        {helper ? <p className="mt-1 text-[11px] text-stone-400">{helper}</p> : null}
      </div>
      <p className={"text-[13px] font-semibold " + (positive ? "text-green-700" : "text-stone-900")}>
        {value < 0 ? "-" : ""}₹{Math.abs(value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function MobileBillMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-[#F0E4D8] bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className="mt-1 text-[14px] font-bold text-stone-900">₹{value.toLocaleString("en-IN")}</p>
    </div>
  );
}

function MobileBillRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-stone-600">{label}</span>
      <span className="font-semibold text-stone-950">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
