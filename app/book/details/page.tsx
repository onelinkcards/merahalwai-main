"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, CheckCircle2, ChevronDown, MapPin, PencilLine, UserRound } from "lucide-react";
import BookingStepper from "@/components/book/BookingStepper";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { getDefaultAddress } from "@/lib/demoAuth";
import { getVendorDetailBySlug } from "@/data/vendors";
import { bookFormSchema, type BookFormValues } from "@/lib/bookFormSchema";
import { calculateBill, getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { useBookingStore } from "@/store/bookingStore";

function tomorrowDate() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  return value.toISOString().slice(0, 10);
}

function foodPreferenceLabel(value: string) {
  return value === "veg" ? "Pure Veg" : value === "veg_nonveg" ? "Veg + Non-Veg" : "Not selected";
}

function scrollFieldIntoView(target: HTMLElement) {
  window.setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 120);
}

function inputClass(hasError?: boolean) {
  return (
    "h-12 w-full rounded-2xl border bg-white px-4 text-[14px] font-medium text-stone-900 outline-none transition " +
    (hasError
      ? "border-red-400 focus:border-red-500"
      : "border-stone-200 focus:border-[#8A3E1D]")
  );
}

export default function BookDetailsPage() {
  const router = useRouter();
  const store = useBookingStore();
  const setMany = useBookingStore((state) => state.setMany);
  const { user } = useDemoAuth();

  useEffect(() => {
    if (!store.vendorSlug) router.replace("/caterers");
  }, [router, store.vendorSlug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const vendor = useMemo(
    () => (store.vendorSlug ? getVendorDetailBySlug(store.vendorSlug) : null),
    [store.vendorSlug]
  );
  const defaultAddress = useMemo(() => getDefaultAddress(user), [user]);
  const savedAddresses = user?.savedAddresses ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema) as Resolver<BookFormValues>,
    defaultValues: {
      guestCount: store.guestCount > 0 ? store.guestCount : 100,
      customerName: store.customerName,
      customerPhone: store.customerPhone || store.otpPhone,
      customerEmail: store.customerEmail,
      customerWhatsapp: store.customerWhatsapp || store.customerPhone || store.otpPhone,
      whatsappSameAsPhone: !store.customerWhatsapp || store.customerWhatsapp === store.customerPhone,
      whatsappOptIn: store.whatsappOptIn,
      eventType: store.eventType || "",
      eventDate: store.eventDate || tomorrowDate(),
      eventTime: store.eventTime || "7:00 PM",
      venueName: store.venueName,
      venueAddress: store.venueAddress,
      venueCity: store.venueCity || "Jaipur",
      venuePincode: store.venuePincode,
      venueState: store.venueState || "Rajasthan",
      specialNote: store.specialNote,
    },
  });

  const watchPhone = useWatch({ control, name: "customerPhone" });
  const watchSameAsPhone = useWatch({ control, name: "whatsappSameAsPhone" });
  const watchWhatsappOptIn = useWatch({ control, name: "whatsappOptIn" });
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (watchSameAsPhone && watchPhone) {
      setValue("customerWhatsapp", watchPhone);
    }
  }, [setValue, watchPhone, watchSameAsPhone]);

  const liveBill = useMemo(
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
      }),
    [
      store.addOnItems,
      store.foodPreference,
      store.guestCount,
      store.pricePerPlate,
      store.selectedItems,
      store.selectedPackage,
      store.vendorSlug,
      store.waterType,
    ]
  );

  const hasAutofill = Boolean(store.customerName || store.customerPhone || store.customerEmail || store.otpPhone);

  const applyAddress = (address: {
    id: string;
    venueName: string;
    address: string;
    city: string;
    pincode: string;
    state: string;
  }) => {
    setSelectedAddressId(address.id);
    setAddressPickerOpen(false);
    setValue("venueName", address.venueName);
    setValue("venueAddress", address.address);
    setValue("venueCity", address.city);
    setValue("venuePincode", address.pincode);
    setValue("venueState", address.state);
  };

  const onInvalid = () => {
    if (!store.eventType || !store.eventDate || !store.eventTime || !store.guestCount) {
      router.push("/book/basics?vendor=" + encodeURIComponent(store.vendorSlug) + "&mode=edit");
      return;
    }

    const firstError = document.querySelector("[aria-invalid='true']") as HTMLElement | null;
    if (firstError) {
      scrollFieldIntoView(firstError);
      firstError.focus();
    }
  };

  const onSubmit = (values: BookFormValues) => {
    const billSummary = getCustomerFacingBillSummary(liveBill);
    setMany({
      guestCount: values.guestCount,
      guestSlab: `${values.guestCount} guests`,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      customerWhatsapp: values.whatsappSameAsPhone
        ? values.customerPhone
        : values.customerWhatsapp || values.customerPhone,
      whatsappOptIn: values.whatsappOptIn,
      eventType: values.eventType,
      eventDate: values.eventDate,
      eventTime: values.eventTime,
      venueName: values.venueName || "",
      venueAddress: values.venueAddress,
      venueCity: values.venueCity,
      venuePincode: values.venuePincode,
      venueState: values.venueState,
      specialNote: values.specialNote || "",
      baseTotal: liveBill.baseAmount,
      addOnTotal: liveBill.addOnTotal + liveBill.waterAmount,
      gstAmount: billSummary.upfrontGst,
      convenienceFee: 0,
      grandTotal: billSummary.customerGrandTotal,
    });
    router.push("/book/review");
  };

  if (!store.vendorSlug || !vendor) return null;

  return (
    <main className="min-h-screen bg-[#F8F4EF] pb-28">
      <BookingStepper current={3} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.05)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-stone-100">
                <Image src={vendor.images[0]} alt={vendor.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[18px] font-bold text-stone-950">{vendor.name}</p>
                <p className="text-[13px] text-stone-500">
                  {store.selectedPackage} package · ₹{store.pricePerPlate}/plate · {store.guestCount} guests
                </p>
                <p className="mt-1 text-[12px] text-stone-500">
                  {foodPreferenceLabel(store.foodPreference)} · {store.eventDate} · {store.eventTime}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => router.push("/book/basics?vendor=" + encodeURIComponent(store.vendorSlug) + "&mode=edit")}
                className="flex min-w-[168px] items-center gap-3 rounded-[18px] border border-stone-200 bg-[#FFFCF8] px-4 py-3 text-left transition hover:border-[#8A3E1D] hover:bg-[#FFF7ED]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FCF3EE]">
                  <PencilLine className="h-4 w-4 text-[#8A3E1D]" />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Booking</span>
                  <span className="block text-[13px] font-bold text-stone-900">Edit Basics</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/book/customize?vendor=" + encodeURIComponent(store.vendorSlug))}
                className="flex min-w-[168px] items-center gap-3 rounded-[18px] border border-stone-200 bg-[#FFFCF8] px-4 py-3 text-left transition hover:border-[#8A3E1D] hover:bg-[#FFF7ED]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FCF3EE]">
                  <CalendarDays className="h-4 w-4 text-[#8A3E1D]" />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Selections</span>
                  <span className="block text-[13px] font-bold text-stone-900">Edit Menu</span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("guestCount")} />
          <input type="hidden" {...register("eventType")} />
          <input type="hidden" {...register("eventDate")} />
          <input type="hidden" {...register("eventTime")} />
          <input type="hidden" {...register("whatsappSameAsPhone")} />
          <input type="hidden" {...register("whatsappOptIn")} />

          <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Section 1</p>
                <h2 className="mt-1 text-[24px] font-black text-stone-950">Your Details</h2>
              </div>
              {hasAutofill ? (
                <span className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-700 sm:inline-flex">
                  <CheckCircle2 className="h-4 w-4" />
                  Auto-filled from your account
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Full Name *" error={isSubmitted ? errors.customerName?.message : undefined}>
                <input
                  {...register("customerName")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="Priya Sharma"
                  className={inputClass(Boolean(errors.customerName))}
                />
              </Field>
              <Field label="Phone Number *" error={isSubmitted ? errors.customerPhone?.message : undefined}>
                <input
                  {...register("customerPhone")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="9876543210"
                  className={inputClass(Boolean(errors.customerPhone))}
                />
              </Field>
              <Field label="Email *" error={isSubmitted ? errors.customerEmail?.message : undefined}>
                <input
                  {...register("customerEmail")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="priya@example.com"
                  className={inputClass(Boolean(errors.customerEmail))}
                />
              </Field>
              <Field label="WhatsApp Number">
                <input
                  {...register("customerWhatsapp")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="Same as phone"
                  disabled={watchSameAsPhone}
                  className={inputClass(Boolean(errors.customerWhatsapp)) + (watchSameAsPhone ? " opacity-60" : "")}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-2.5 md:grid-cols-2">
              <ToggleCard
                label="Same as phone"
                helper="Use your phone number for WhatsApp updates"
                checked={Boolean(watchSameAsPhone)}
                onChange={(next) => setValue("whatsappSameAsPhone", next)}
              />
              <ToggleCard
                label="Send booking updates on WhatsApp"
                helper="Receive status updates and reminders"
                checked={Boolean(watchWhatsappOptIn)}
                onChange={(next) => setValue("whatsappOptIn", next)}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCF3EE]">
                  <CalendarDays className="h-4 w-4 text-[#8A3E1D]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Booking Basics</p>
                  <h2 className="text-[24px] font-black text-stone-950">Already selected</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/book/basics?vendor=" + encodeURIComponent(store.vendorSlug) + "&mode=edit")}
                className="inline-flex items-center gap-2 self-start rounded-full border border-[#E8D5C4] bg-[#FFFCF8] px-4 py-2 text-[13px] font-semibold text-[#8A3E1D] transition hover:bg-[#FFF6EC]"
              >
                <PencilLine className="h-4 w-4" />
                Edit Basics
              </button>
            </div>

            <div className="mt-5 rounded-[24px] border border-stone-200 bg-[#FCFBF9] p-4">
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                <InfoTile label="Event Type" value={store.eventType || "Not set"} />
                <InfoTile label="Event Date" value={store.eventDate || "Not set"} />
                <InfoTile label="Event Time" value={store.eventTime || "Not set"} />
                <InfoTile label="Guests" value={`${store.guestCount} guests`} />
                <InfoTile label="Food Preference" value={foodPreferenceLabel(store.foodPreference)} />
                <InfoTile label="Package" value={`${store.selectedPackage || "Not set"} · ₹${store.pricePerPlate || 0}/plate`} />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCF3EE]">
                <MapPin className="h-4 w-4 text-[#8A3E1D]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Section 2</p>
                <h2 className="text-[24px] font-black text-stone-950">Your Address</h2>
              </div>
            </div>

            {!savedAddresses.length ? (
              <div className="mt-5 rounded-[22px] border border-[#E7D5C4] bg-[#FFF9F2] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-stone-900">Please select your address</p>
                    <p className="mt-1 text-[12px] text-stone-500">
                      Add your saved address first so booking details can be filled properly.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!user?.profileComplete ? (
                      <button
                        type="button"
                        onClick={() => router.push("/onboarding/profile?redirect=" + encodeURIComponent("/book/details"))}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-[#E3C9AF] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D]"
                      >
                        Complete Profile
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => router.push("/onboarding/address?redirect=" + encodeURIComponent("/book/details"))}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#8A3E1D] px-4 text-[13px] font-semibold text-white"
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {savedAddresses.length ? (
              <div className="relative mt-5 rounded-[22px] border border-[#E7D5C4] bg-[#FFF9F2] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-stone-900">Choose from saved addresses</p>
                    <p className="mt-1 text-[12px] text-stone-500">Pick your saved address and the form will fill instantly.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAddressPickerOpen((current) => !current)}
                      className="inline-flex h-11 min-w-[250px] items-center justify-between rounded-[18px] border border-[#E3C9AF] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D] shadow-sm"
                    >
                      <span className="truncate">
                        {selectedAddressId
                          ? (() => {
                              const chosen = savedAddresses.find((item) => item.id === selectedAddressId);
                              return chosen ? `${chosen.label} · ${chosen.venueName}` : "Select saved address";
                            })()
                          : "Select saved address"}
                      </span>
                      <ChevronDown className={"h-4 w-4 transition " + (addressPickerOpen ? "rotate-180" : "")} />
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/onboarding/address?redirect=" + encodeURIComponent("/book/details"))}
                      className="inline-flex h-11 items-center justify-center rounded-[18px] border border-[#E3C9AF] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D]"
                    >
                      Change Address
                    </button>
                  </div>
                </div>

                {addressPickerOpen ? (
                  <div className="absolute right-4 top-[calc(100%-2px)] z-20 mt-2 w-[min(320px,calc(100%-2rem))] rounded-[22px] border border-[#E3C9AF] bg-white p-2 shadow-[0_24px_50px_rgba(35,25,20,0.12)]">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => applyAddress(address)}
                        className={
                          "flex w-full items-start justify-between gap-3 rounded-[18px] px-3 py-3 text-left transition " +
                          (selectedAddressId === address.id ? "bg-[#FCF3EE]" : "hover:bg-[#FAF6F1]")
                        }
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-stone-950">{address.label}</p>
                          <p className="mt-1 text-[12px] font-medium text-stone-700">{address.venueName}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] text-stone-500">{address.address}</p>
                        </div>
                        {selectedAddressId === address.id ? <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#8A3E1D]" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : defaultAddress ? (
              <div className="mt-5 flex flex-col gap-3 rounded-[22px] border border-[#E7D5C4] bg-[#FFF9F2] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-stone-900">Use your saved default address</p>
                  <p className="mt-1 text-[12px] text-stone-500">
                    {defaultAddress.venueName} · {defaultAddress.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => applyAddress(defaultAddress)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#E3C9AF] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D]"
                >
                  Autofill Address
                </button>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="House / Flat / Building">
                <input
                  {...register("venueName")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="Flat / house / building name"
                  className={inputClass(Boolean(errors.venueName))}
                />
              </Field>
              <Field label="City *" error={isSubmitted ? errors.venueCity?.message : undefined}>
                <input
                  {...register("venueCity")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="Jaipur"
                  className={inputClass(Boolean(errors.venueCity))}
                />
              </Field>
              <Field label="Complete Address *" error={isSubmitted ? errors.venueAddress?.message : undefined}>
                <textarea
                  {...register("venueAddress")}
                  onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                  placeholder="Full customer address"
                  className={
                    "min-h-[120px] w-full rounded-2xl border bg-white px-4 py-4 text-[14px] font-medium text-stone-900 outline-none transition " +
                    (errors.venueAddress ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-[#8A3E1D]")
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pincode *" error={isSubmitted ? errors.venuePincode?.message : undefined}>
                  <input
                    {...register("venuePincode")}
                    onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                    placeholder="302020"
                    className={inputClass(Boolean(errors.venuePincode))}
                  />
                </Field>
                <Field label="State *" error={isSubmitted ? errors.venueState?.message : undefined}>
                  <input
                    {...register("venueState")}
                    onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                    placeholder="Rajasthan"
                    className={inputClass(Boolean(errors.venueState))}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(35,25,20,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCF3EE]">
                <UserRound className="h-4 w-4 text-[#8A3E1D]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-stone-500">Section 3</p>
                <h2 className="text-[24px] font-black text-stone-950">Special Requests</h2>
              </div>
            </div>

            <textarea
              {...register("specialNote")}
              onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
              placeholder="Allergies, live counter request, service timing notes, dietary restrictions..."
              className="mt-5 min-h-[140px] w-full rounded-2xl border border-stone-200 bg-white px-4 py-4 text-[14px] font-medium text-stone-900 outline-none transition focus:border-[#8A3E1D]"
            />
          </section>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-18px_40px_rgba(35,25,20,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] uppercase tracking-[0.24em] text-stone-400">Estimated Total</p>
            <p className="text-[22px] font-black text-stone-950">₹{liveBill.grandTotal.toLocaleString("en-IN")}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSubmit(onSubmit, onInvalid)()}
            className="flex h-12 items-center justify-center rounded-[18px] bg-[#EB8B23] px-6 text-[14px] font-bold text-white transition hover:bg-[#8A3E1D]"
          >
            Review Order
          </button>
        </div>
      </div>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{label}</p>
      <p className="mt-2 text-[14px] font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function ToggleCard({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string;
  helper: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "flex items-center justify-between rounded-[18px] border px-3.5 py-2.5 text-left transition " +
        (checked
          ? "border-[#8A3E1D] bg-[#FCF3EE] shadow-[0_12px_30px_rgba(138,62,29,0.06)]"
          : "border-stone-200 bg-[#FFFCF8] hover:border-[#D7B08E]")
      }
    >
      <div>
        <p className="text-[13px] font-bold text-stone-950">{label}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-stone-500">{helper}</p>
      </div>
      <span
        className={
          "relative ml-3 flex h-6 w-11 flex-shrink-0 rounded-full transition " +
          (checked ? "bg-[#8A3E1D]" : "bg-stone-200")
        }
      >
        <span
          className={
            "absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-all " +
            (checked ? "left-[21px]" : "left-0.5")
          }
        >
          {checked ? <Check className="h-3 w-3 text-[#8A3E1D]" /> : null}
        </span>
      </span>
    </button>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-500">{label}</label>
        {error ? <span className="text-[11px] font-medium text-red-500">{error}</span> : null}
      </div>
      {children}
    </div>
  );
}
