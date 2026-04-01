const AUTH_KEY = "mh_auth";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function setAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie =
    AUTH_KEY +
    "=1; path=/; max-age=" +
    String(MAX_AGE_SEC) +
    "; SameSite=Lax";
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = AUTH_KEY + "=; path=/; max-age=0";
}

export function hasAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(AUTH_KEY + "="));
}
