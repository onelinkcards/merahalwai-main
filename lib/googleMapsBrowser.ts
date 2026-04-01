"use client";

export type GoogleAddressResult = {
  formattedAddress: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
};

export type GoogleSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        Geocoder: new () => {
          geocode: (
            request: Record<string, unknown>,
            callback: (results: Array<Record<string, unknown>> | null, status: string) => void
          ) => void;
        };
        places?: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: Record<string, unknown>,
              callback: (
                predictions: Array<Record<string, unknown>> | null,
                status: string
              ) => void
            ) => void;
          };
        };
      };
    };
    __mhGoogleMapsReady__?: () => void;
  }
}

const SCRIPT_ID = "mh-google-maps-sdk";
let loaderPromise: Promise<void> | null = null;

function getAddressPart(components: Array<Record<string, unknown>>, type: string) {
  const component = components.find((entry) =>
    Array.isArray(entry.types) && entry.types.includes(type)
  );
  return (component?.long_name as string | undefined) ?? "";
}

function normalizeGeocodeResult(result: Record<string, unknown>): GoogleAddressResult {
  const components = (result.address_components as Array<Record<string, unknown>>) ?? [];
  const geometry = result.geometry as { location?: { lat: () => number; lng: () => number } } | undefined;

  return {
    formattedAddress: (result.formatted_address as string | undefined) ?? "",
    city:
      getAddressPart(components, "locality") ||
      getAddressPart(components, "administrative_area_level_2"),
    state: getAddressPart(components, "administrative_area_level_1"),
    pincode: getAddressPart(components, "postal_code"),
    locality:
      getAddressPart(components, "sublocality_level_1") ||
      getAddressPart(components, "sublocality") ||
      getAddressPart(components, "route"),
    landmark: getAddressPart(components, "point_of_interest") || getAddressPart(components, "premise"),
    latitude: geometry?.location?.lat?.(),
    longitude: geometry?.location?.lng?.(),
  };
}

export async function loadGoogleMapsBrowser() {
  if (typeof window === "undefined") throw new Error("Google Maps requires a browser.");
  if (window.google?.maps?.Geocoder && window.google?.maps?.places?.AutocompleteService) return;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
  }

  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")), { once: true });
      return;
    }

    window.__mhGoogleMapsReady__ = () => resolve();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=" +
      encodeURIComponent(apiKey) +
      "&libraries=places&callback=__mhGoogleMapsReady__";
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export async function reverseGeocodeLatLng(latitude: number, longitude: number) {
  await loadGoogleMapsBrowser();
  const geocoder = new window.google!.maps!.Geocoder();

  return new Promise<GoogleAddressResult>((resolve, reject) => {
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status !== "OK" || !results?.[0]) {
        reject(new Error("Unable to reverse geocode current location."));
        return;
      }
      resolve(normalizeGeocodeResult(results[0]));
    });
  });
}

export async function geocodePlaceId(placeId: string) {
  await loadGoogleMapsBrowser();
  const geocoder = new window.google!.maps!.Geocoder();

  return new Promise<GoogleAddressResult>((resolve, reject) => {
    geocoder.geocode({ placeId }, (results, status) => {
      if (status !== "OK" || !results?.[0]) {
        reject(new Error("Unable to fetch place details."));
        return;
      }
      resolve(normalizeGeocodeResult(results[0]));
    });
  });
}

export async function searchGooglePlaces(input: string) {
  await loadGoogleMapsBrowser();
  const service = new window.google!.maps!.places!.AutocompleteService();

  return new Promise<GoogleSuggestion[]>((resolve, reject) => {
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        if (status !== "OK" || !predictions) {
          reject(new Error("Unable to fetch address suggestions."));
          return;
        }

        resolve(
          predictions.map((prediction) => ({
            placeId: (prediction.place_id as string) ?? "",
            primaryText:
              (prediction.structured_formatting as { main_text?: string } | undefined)?.main_text ??
              ((prediction.description as string | undefined) ?? ""),
            secondaryText:
              (prediction.structured_formatting as { secondary_text?: string } | undefined)?.secondary_text ??
              "",
          }))
        );
      }
    );
  });
}
