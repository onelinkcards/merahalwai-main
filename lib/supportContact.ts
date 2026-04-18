import { getAdminSupportConfig } from "@/data/mockAdmin";

const FALLBACK_PHONE = "+91 90000 11111";

export function getSupportPhone() {
  try {
    return getAdminSupportConfig().supportPhone || FALLBACK_PHONE;
  } catch {
    return FALLBACK_PHONE;
  }
}

export function getSupportPhoneDigits() {
  return getSupportPhone().replace(/\D/g, "");
}

export function getSupportTelHref() {
  return `tel:${getSupportPhoneDigits()}`;
}

export function getSupportWhatsappHref(message?: string) {
  const base = `https://wa.me/${getSupportPhoneDigits()}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
