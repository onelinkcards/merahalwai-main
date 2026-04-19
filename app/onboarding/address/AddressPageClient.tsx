"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { resolveFinalAuthenticatedRedirect } from "@/lib/demoAuth";
import { useToastStore } from "@/store/toastStore";

function inputClass() {
  return "h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-[14px] font-medium text-stone-900 outline-none transition focus:border-[#8A3E1D]";
}

export default function AddressPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const bookingRequired = redirect.startsWith("/book") || redirect.startsWith("/booking");
  const { ready, session, saveAddress } = useDemoAuth();

  const currentAddress = session?.user.savedAddresses[0];
  const [house, setHouse] = useState(currentAddress?.house ?? currentAddress?.venueName ?? "");
  const [area, setArea] = useState(currentAddress?.address ?? "");
  const [landmark, setLandmark] = useState(currentAddress?.landmark ?? "");
  const [city] = useState("Jaipur");
  const [stateValue] = useState("Rajasthan");
  const [pincode, setPincode] = useState(currentAddress?.pincode ?? "");
  const [label, setLabel] = useState(currentAddress?.label ?? "Home");
  const [isSaving, setIsSaving] = useState(false);
  const redirectStartedRef = useRef(false);

  useEffect(() => {
    if (!ready || !session) return;
    if (!session.user.profileComplete) {
      router.replace(`/onboarding/profile?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    if (session.user.addressComplete && !redirectStartedRef.current) {
      redirectStartedRef.current = true;
      router.replace(resolveFinalAuthenticatedRedirect(redirect));
    }
  }, [ready, redirect, router, session]);

  if (!ready || !session) return null;

  const handleSave = () => {
    if (isSaving) return;
    if (!area.trim() || !city.trim() || !stateValue.trim() || !pincode.trim()) {
      useToastStore.getState().show("Complete the required address details before saving.");
      return;
    }

    setIsSaving(true);
    const next = saveAddress({
      label,
      venueName: house.trim() || `${label} Address`,
      address: [house.trim(), area.trim(), landmark.trim()].filter(Boolean).join(", "),
      city: city.trim(),
      state: stateValue.trim(),
      pincode: pincode.trim(),
      house: house.trim(),
      landmark: landmark.trim(),
    });

    if (!next) {
      setIsSaving(false);
      return;
    }

    redirectStartedRef.current = true;
    router.replace(resolveFinalAuthenticatedRedirect(redirect));
  };

  const handleSkip = () => {
    redirectStartedRef.current = true;
    router.replace(resolveFinalAuthenticatedRedirect(redirect));
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(`/onboarding/profile?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <main className="min-h-screen bg-[#FBF7F1] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[860px]">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D7C6] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D] transition-all hover:border-[#DDBB94] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <section className="mt-5 rounded-[28px] border border-[#E7D5C4] bg-white p-5 shadow-[0_18px_40px_rgba(35,25,20,0.05)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A06D38]">Step 2 of 2</p>
              <h1 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#151515]">Add your address</h1>
              <p className="mt-2 text-[14px] leading-[1.7] text-stone-600">
                Save your Jaipur address now so booking details can be prefilled correctly.
              </p>
            </div>
            {!bookingRequired ? (
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#E7D5C4] px-4 text-[13px] font-semibold text-[#8A3E1D]"
              >
                Skip for now
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-[#EEE2D4] bg-[#FFFAF4] p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">Address Notes</p>
                <div className="mt-3 space-y-2 text-[13px] leading-[1.7] text-stone-600">
                  <p>Enter the delivery and event contact address manually.</p>
                  <p>City stays fixed to Jaipur and state stays fixed to Rajasthan.</p>
                  <p>Save one default address now so booking details can be reused later.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    House / Flat / Building
                  </label>
                  <input value={house} onChange={(e) => setHouse(e.target.value)} className={inputClass()} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Area / Street / Locality *
                  </label>
                  <input value={area} onChange={(e) => setArea(e.target.value)} className={inputClass()} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Landmark
                  </label>
                  <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className={inputClass()} />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    City *
                  </label>
                  <input value={city} readOnly className={inputClass() + " bg-stone-50 text-stone-500"} />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    State *
                  </label>
                  <input value={stateValue} readOnly className={inputClass() + " bg-stone-50 text-stone-500"} />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Pincode *
                  </label>
                  <input value={pincode} onChange={(e) => setPincode(e.target.value)} className={inputClass()} />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Address Label
                  </label>
                  <select value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass()}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[22px] border border-[#EEE2D4] bg-[#FFFAF4] p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">Address rules</p>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.7] text-stone-600">
                  <li>Save one default customer address now to speed up your next booking.</li>
                  <li>Only Jaipur addresses are accepted in the current booking flow.</li>
                  <li>Booking flow requires saving an address before continuing.</li>
                </ul>
              </div>
            </aside>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-5 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(138,62,29,0.16)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Address...
              </span>
            ) : (
              "Save Address & Continue"
            )}
          </button>
        </section>
      </div>
    </main>
  );
}
