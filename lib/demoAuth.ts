import { clearAuthCookie, hasAuthCookie, setAuthCookie } from "@/lib/authCookie";
import {
  buildDemoUser,
  createGoogleRegisterDemoUser,
  createOtpDemoUser,
  DEMO_LOGIN_OTP,
  DEMO_LOGIN_PHONE,
  DEMO_USER,
  type DemoAccountUser,
  type DemoAddress,
} from "@/data/mockAccount";
import { useBookingStore } from "@/store/bookingStore";

export type DemoAuthMethod = "google" | "otp";
export type DemoAuthMode = "login" | "register";

export type DemoAuthSession = {
  user: DemoAccountUser;
  method: DemoAuthMethod;
  loggedInAt: string;
  isNewUser: boolean;
};

type PendingOtpChallenge = {
  phone: string;
  otp: string;
  mode: DemoAuthMode;
  createdAt: string;
};

const SESSION_KEY = "mh_demo_auth_session_v2";
const USERS_KEY = "mh_demo_users_v2";
const PENDING_OTP_KEY = "mh_demo_pending_otp_v1";
const DELETED_USERS_KEY = "mh_demo_deleted_users_v1";

function canUseBrowser() {
  return typeof window !== "undefined";
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

function createSession(user: DemoAccountUser, method: DemoAuthMethod, isNewUser = false): DemoAuthSession {
  return {
    user: buildDemoUser(user),
    method,
    loggedInAt: new Date().toISOString(),
    isNewUser,
  };
}

function getDeletedUserIds() {
  if (!canUseBrowser()) return new Set<string>();
  const raw = window.localStorage.getItem(DELETED_USERS_KEY);
  if (!raw) return new Set<string>();

  try {
    return new Set<string>(JSON.parse(raw) as string[]);
  } catch {
    return new Set<string>();
  }
}

function persistDeletedUserIds(ids: Set<string>) {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(Array.from(ids)));
}

function getSeedUsers() {
  const deleted = getDeletedUserIds();
  return [buildDemoUser(DEMO_USER)].filter((user) => !deleted.has(user.id));
}

export function getStoredUsers(): DemoAccountUser[] {
  if (!canUseBrowser()) return getSeedUsers();
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return getSeedUsers();

  try {
    const parsed = JSON.parse(raw) as DemoAccountUser[];
    return parsed.length ? parsed.map(buildDemoUser) : getSeedUsers();
  } catch {
    return getSeedUsers();
  }
}

function persistStoredUsers(users: DemoAccountUser[]) {
  if (!canUseBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users.map(buildDemoUser)));
}

function upsertStoredUser(user: DemoAccountUser) {
  const normalized = buildDemoUser(user);
  const users = getStoredUsers();
  const index = users.findIndex((entry) => entry.id === normalized.id);

  if (index >= 0) {
    users[index] = normalized;
  } else {
    users.push(normalized);
  }

  persistStoredUsers(users);
  return normalized;
}

function findUserById(id: string) {
  return getStoredUsers().find((user) => user.id === id) ?? null;
}

function findOtpUser(phone: string) {
  const normalized = normalizePhone(phone);
  return (
    getStoredUsers().find(
      (user) => user.authProvider === "otp" && normalizePhone(user.phone) === normalized
    ) ?? null
  );
}

export function getDefaultAddress(user: DemoAccountUser | null | undefined): DemoAddress | null {
  if (!user) return null;
  return (
    user.savedAddresses.find((address) => address.id === user.defaultAddressId) ??
    user.savedAddresses[0] ??
    null
  );
}

export function createDefaultSession(method: DemoAuthMethod): DemoAuthSession {
  return createSession(DEMO_USER, method);
}

export function getDemoSession(): DemoAuthSession | null {
  if (!canUseBrowser()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    if (!hasAuthCookie()) return null;
    const fallback = createDefaultSession("google");
    persistDemoSession(fallback);
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as DemoAuthSession;
    return {
      ...parsed,
      user: buildDemoUser(parsed.user),
    };
  } catch {
    return null;
  }
}

export function persistDemoSession(session: DemoAuthSession) {
  if (!canUseBrowser()) return;
  const normalized = {
    ...session,
    user: buildDemoUser(session.user),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  setAuthCookie();
}

export function clearDemoSession() {
  if (!canUseBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(PENDING_OTP_KEY);
  clearAuthCookie();
}

export function syncBookingIdentity(user: DemoAccountUser) {
  const current = useBookingStore.getState();
  const defaultAddress = getDefaultAddress(user);
  useBookingStore.getState().setMany({
    customerName: user.fullName || current.customerName,
    customerPhone: normalizePhone(user.phone) || current.customerPhone,
    customerEmail: user.email || current.customerEmail,
    customerWhatsapp: normalizePhone(user.whatsapp || user.phone) || current.customerWhatsapp,
    otpPhone: normalizePhone(user.phone) || current.otpPhone,
    venueName: current.venueName || defaultAddress?.venueName || "",
    venueAddress: current.venueAddress || defaultAddress?.address || "",
    venueCity: current.venueCity || defaultAddress?.city || "",
    venuePincode: current.venuePincode || defaultAddress?.pincode || "",
    venueState: current.venueState || defaultAddress?.state || "Rajasthan",
  });
}

export function createPendingOtp(phone: string, mode: DemoAuthMode) {
  if (!canUseBrowser()) return;
  const challenge: PendingOtpChallenge = {
    phone: normalizePhone(phone),
    otp: DEMO_LOGIN_OTP,
    mode,
    createdAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(challenge));
}

export function getPendingOtp(): PendingOtpChallenge | null {
  if (!canUseBrowser()) return null;
  const raw = window.sessionStorage.getItem(PENDING_OTP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingOtpChallenge;
  } catch {
    return null;
  }
}

export function clearPendingOtp() {
  if (!canUseBrowser()) return;
  window.sessionStorage.removeItem(PENDING_OTP_KEY);
}

export function isDemoPhone(phone: string) {
  return normalizePhone(phone) === DEMO_LOGIN_PHONE;
}

export function authenticateWithOtp(phone: string): DemoAuthSession {
  const normalizedPhone = normalizePhone(phone);
  const existing = findOtpUser(normalizedPhone);
  const user = existing ?? createOtpDemoUser(normalizedPhone);
  const stored = upsertStoredUser(user);
  const session = createSession(stored, "otp", !existing);
  persistDemoSession(session);
  syncBookingIdentity(session.user);
  return session;
}

export function authenticateWithGoogle(mode: DemoAuthMode): DemoAuthSession {
  if (mode === "register") {
    const existing = findUserById("mh-demo-google-register");
    const user = upsertStoredUser(existing ?? createGoogleRegisterDemoUser());
    const session = createSession(user, "google", !existing);
    persistDemoSession(session);
    syncBookingIdentity(session.user);
    return session;
  }

  const deleted = getDeletedUserIds().has(DEMO_USER.id);
  const existing = findUserById(DEMO_USER.id) ?? (deleted ? createGoogleRegisterDemoUser() : DEMO_USER);
  const user = upsertStoredUser(existing);
  const session = createSession(user, "google", deleted);
  persistDemoSession(session);
  syncBookingIdentity(session.user);
  return session;
}

export function updateSessionUser(partial: Partial<DemoAccountUser>) {
  const current = getDemoSession();
  if (!current) return null;

  const nextUser = upsertStoredUser({
    ...current.user,
    ...partial,
    savedAddresses: partial.savedAddresses ?? current.user.savedAddresses,
    defaultAddressId: partial.defaultAddressId ?? current.user.defaultAddressId,
  });
  const nextSession = { ...current, user: nextUser };
  persistDemoSession(nextSession);
  syncBookingIdentity(nextSession.user);
  return nextSession;
}

export function completeProfile(input: {
  fullName: string;
  email: string;
  profilePhotoUrl?: string;
}) {
  return updateSessionUser({
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    profilePhotoUrl: input.profilePhotoUrl ?? "",
    mobileVerified: true,
  });
}

export function saveAddressForCurrentUser(
  input: Omit<DemoAddress, "id"> & { id?: string },
  options?: { setDefault?: boolean }
) {
  const current = getDemoSession();
  if (!current) return null;

  const nextAddress: DemoAddress = {
    ...input,
    id: input.id ?? "addr-" + Date.now().toString(36),
  };

  const remaining = current.user.savedAddresses.filter((address) => address.id !== nextAddress.id);
  const nextAddresses = [nextAddress, ...remaining];

  return updateSessionUser({
    savedAddresses: nextAddresses,
    defaultAddressId:
      options?.setDefault === false
        ? current.user.defaultAddressId
        : current.user.defaultAddressId || nextAddress.id,
  });
}

export function resolveFinalAuthenticatedRedirect(redirectTo?: string) {
  if (!redirectTo || redirectTo === "/" || redirectTo === "/login" || redirectTo === "/register") {
    return "/account";
  }

  if (redirectTo.startsWith("/book") || redirectTo.startsWith("/booking")) {
    return "/book/details";
  }

  return redirectTo;
}

export function resolvePostAuthRedirect(session: DemoAuthSession, redirectTo?: string) {
  const finalRedirect = resolveFinalAuthenticatedRedirect(redirectTo);
  if (!session.user.profileComplete) {
    return `/onboarding/profile?redirect=${encodeURIComponent(finalRedirect)}`;
  }
  if (!session.user.addressComplete) {
    return `/onboarding/address?redirect=${encodeURIComponent(finalRedirect)}`;
  }
  return finalRedirect;
}

export function resolvePostProfileRedirect(session: DemoAuthSession, redirectTo?: string) {
  const finalRedirect = resolveFinalAuthenticatedRedirect(redirectTo);
  if (!session.user.addressComplete) {
    return `/onboarding/address?redirect=${encodeURIComponent(finalRedirect)}`;
  }
  return finalRedirect;
}

export function deleteCurrentDemoAccount() {
  const current = getDemoSession();
  if (!current) return false;

  const users = getStoredUsers().filter((user) => user.id !== current.user.id);
  persistStoredUsers(users);

  const deletedIds = getDeletedUserIds();
  deletedIds.add(current.user.id);
  persistDeletedUserIds(deletedIds);

  useBookingStore.getState().reset();
  clearDemoSession();
  return true;
}
