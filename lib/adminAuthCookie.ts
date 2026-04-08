const ADMIN_AUTH_KEY = "mh_admin_auth";

export function setAdminAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_AUTH_KEY}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

export function clearAdminAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_AUTH_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function hasAdminAuthCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${ADMIN_AUTH_KEY}=`));
}

export { ADMIN_AUTH_KEY };
