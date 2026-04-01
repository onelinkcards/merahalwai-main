"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LocateFixed, MapPinned, Search } from "lucide-react";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { resolveFinalAuthenticatedRedirect } from "@/lib/demoAuth";
import { geocodePlaceId, loadGoogleMapsBrowser, reverseGeocodeLatLng, searchGooglePlaces, type GoogleSuggestion } from "@/lib/googleMapsBrowser";
import { useToastStore } from "@/store/toastStore";

type AddressSuggestion = {
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  placeId?: string;
};

const JAIPUR_SUGGESTIONS = [
  { area: "C-Scheme", city: "Jaipur", state: "Rajasthan", pincode: "302001", landmark: "Near MI Road" },
  { area: "Vaishali Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302021", landmark: "Near Nursery Circle" },
  { area: "Mansarovar", city: "Jaipur", state: "Rajasthan", pincode: "302020", landmark: "Near VT Road" },
  { area: "Civil Lines", city: "Jaipur", state: "Rajasthan", pincode: "302006", landmark: "Near Collectorate Circle" },
  { area: "Malviya Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302017", landmark: "Near WTP" },
];

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
  const [query, setQuery] = useState("");
  const [house, setHouse] = useState(currentAddress?.house ?? currentAddress?.venueName ?? "");
  const [area, setArea] = useState(currentAddress?.address ?? "");
  const [landmark, setLandmark] = useState(currentAddress?.landmark ?? "");
  const [city, setCity] = useState(currentAddress?.city ?? "Jaipur");
  const [stateValue, setStateValue] = useState(currentAddress?.state ?? "Rajasthan");
  const [pincode, setPincode] = useState(currentAddress?.pincode ?? "");
  const [label, setLabel] = useState(currentAddress?.label ?? "Home");
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const [googleReady, setGoogleReady] = useState(false);
  const [googleHint, setGoogleHint] = useState("");
  const [liveSuggestions, setLiveSuggestions] = useState<GoogleSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsBrowser()
      .then(() => {
        if (cancelled) return;
        setGoogleReady(true);
        setGoogleHint("Live Google address search is ready.");
      })
      .catch((error) => {
        if (cancelled) return;
        setGoogleReady(false);
        setGoogleHint(error instanceof Error ? error.message : "Google address services are unavailable.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo<AddressSuggestion[]>(() => {
    if (liveSuggestions.length > 0) {
      return liveSuggestions.map((item) => ({
        area: item.primaryText,
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "",
        landmark: item.secondaryText,
        placeId: item.placeId,
      }));
    }
    const normalized = query.trim().toLowerCase();
    if (!normalized) return JAIPUR_SUGGESTIONS;
    return JAIPUR_SUGGESTIONS.filter((item) =>
      [item.area, item.landmark, item.city].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [liveSuggestions, query]);

  useEffect(() => {
    if (!googleReady || query.trim().length < 3) {
      setLiveSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      searchGooglePlaces(query.trim())
        .then((results) => setLiveSuggestions(results.slice(0, 5)))
        .catch(() => setLiveSuggestions([]))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [googleReady, query]);

  if (!ready || !session) return null;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      useToastStore.getState().show("Browser location is not available on this device.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCoords({ latitude, longitude });

        try {
          if (!googleReady) {
            throw new Error("Google address service is not ready yet.");
          }
          const result = await reverseGeocodeLatLng(latitude, longitude);
          setHouse("Current Location");
          setArea(result.formattedAddress || result.locality);
          setLandmark(result.landmark);
          setCity(result.city || "Jaipur");
          setStateValue(result.state || "Rajasthan");
          setPincode(result.pincode || "");
          useToastStore.getState().show("Current location fetched successfully.");
        } catch {
          setHouse("Pinned Location");
          setArea(`Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`);
          setLandmark("Review and complete the address before saving.");
          setCity("Jaipur");
          setStateValue("Rajasthan");
          useToastStore.getState().show("Location captured. Complete the remaining address details before saving.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        useToastStore.getState().show("Unable to access your location. Enter the address manually.");
      }
    );
  };

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
      latitude: coords.latitude,
      longitude: coords.longitude,
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
                Save a default address now so future booking details can be prefilled.
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
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Search Address
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search locality, street, or landmark"
                    className={inputClass() + " pl-11"}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-stone-500">
                  <span>{googleHint || "Type to search address suggestions."}</span>
                  {isSearching ? (
                    <span className="inline-flex items-center gap-1 text-[#8A3E1D]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Searching
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 space-y-2">
                  {suggestions.slice(0, 4).map((item) => (
                    <button
                      key={item.area}
                      type="button"
                      onClick={async () => {
                        if ("placeId" in item && item.placeId) {
                          try {
                            const result = await geocodePlaceId(item.placeId);
                            setHouse(item.area);
                            setArea(result.formattedAddress || item.area);
                            setLandmark(result.landmark || item.landmark);
                            setCity(result.city || "Jaipur");
                            setStateValue(result.state || "Rajasthan");
                            setPincode(result.pincode || "");
                            setCoords({ latitude: result.latitude, longitude: result.longitude });
                            return;
                          } catch {
                            useToastStore.getState().show("Could not fetch this place. You can still enter it manually.");
                          }
                        }

                        setArea(item.area);
                        setLandmark(item.landmark);
                        setCity(item.city || "Jaipur");
                        setStateValue(item.state || "Rajasthan");
                        setPincode(item.pincode);
                      }}
                      className="flex w-full items-start gap-3 rounded-[18px] border border-[#F0E5D8] bg-white px-4 py-3 text-left"
                    >
                      <MapPinned className="mt-0.5 h-4 w-4 text-[#8A3E1D]" />
                      <span>
                        <span className="block text-[14px] font-semibold text-stone-900">{item.area}</span>
                        <span className="mt-1 block text-[12px] text-stone-500">
                          {item.landmark} · {item.city} {item.pincode}
                        </span>
                      </span>
                    </button>
                  ))}
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
                  <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass()} />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    State *
                  </label>
                  <input value={stateValue} onChange={(e) => setStateValue(e.target.value)} className={inputClass()} />
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
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#E7D5C4] bg-[#FFF9F2] px-4 text-[14px] font-semibold text-[#8A3E1D] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                {isLocating ? "Fetching Location..." : "Use Current Location"}
              </button>

              <div className="rounded-[22px] border border-[#EEE2D4] bg-[#FFFAF4] p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">Address rules</p>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.7] text-stone-600">
                  <li>Save one default address now to speed up your next booking.</li>
                  <li>Use current location for a quick live-location style demo flow.</li>
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
