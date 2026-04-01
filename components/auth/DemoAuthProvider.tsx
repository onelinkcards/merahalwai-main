"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type DemoAccountUser, type DemoAddress } from "@/data/mockAccount";
import {
  authenticateWithGoogle,
  authenticateWithOtp,
  clearDemoSession,
  completeProfile as persistCompletedProfile,
  deleteCurrentDemoAccount,
  getDemoSession,
  persistDemoSession,
  saveAddressForCurrentUser,
  syncBookingIdentity,
  updateSessionUser,
  type DemoAuthMode,
  type DemoAuthSession,
} from "@/lib/demoAuth";
import { useToastStore } from "@/store/toastStore";

type DemoAuthContextValue = {
  ready: boolean;
  isAuthenticated: boolean;
  session: DemoAuthSession | null;
  user: DemoAccountUser | null;
  loginWithGoogle: (mode?: DemoAuthMode) => DemoAuthSession;
  loginWithOtp: (input?: { mode?: DemoAuthMode; phone?: string }) => DemoAuthSession;
  updateProfile: (partial: Partial<DemoAccountUser>) => void;
  completeProfile: (input: { fullName: string; email: string; profilePhotoUrl?: string }) => DemoAuthSession | null;
  saveAddress: (
    input: Omit<DemoAddress, "id"> & { id?: string },
    options?: { setDefault?: boolean }
  ) => DemoAuthSession | null;
  deleteAccount: (redirectTo?: string) => void;
  logout: (redirectTo?: string) => void;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<DemoAuthSession | null>(null);

  useEffect(() => {
    const existing = getDemoSession();
    if (existing) {
      persistDemoSession(existing);
      syncBookingIdentity(existing.user);
      setSession(existing);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const onStorage = () => {
      setSession(getDemoSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<DemoAuthContextValue>(
    () => ({
      ready,
      isAuthenticated: Boolean(session),
      session,
      user: session?.user ?? null,
      loginWithGoogle: (mode = "login") => {
        const next = authenticateWithGoogle(mode);
        setSession(next);
        useToastStore.getState().show(
          next.user.onboardingComplete
            ? "Signed in with demo Google account."
            : "Google sign-in complete. Finish your profile to continue."
        );
        return next;
      },
      loginWithOtp: (input) => {
        const next = authenticateWithOtp(input?.phone ?? "");
        setSession(next);
        useToastStore.getState().show(
          next.user.onboardingComplete
            ? "Phone verified. You are now logged in."
            : "Phone verified. Complete your profile to continue."
        );
        return next;
      },
      updateProfile: (partial) => {
        const next = updateSessionUser(partial);
        if (!next) return;
        setSession(next);
        useToastStore.getState().show("Profile updated.");
      },
      completeProfile: (input) => {
        const next = persistCompletedProfile(input);
        if (!next) return null;
        setSession(next);
        useToastStore.getState().show("Profile saved.");
        return next;
      },
      saveAddress: (input, options) => {
        const next = saveAddressForCurrentUser(input, options);
        if (!next) return null;
        setSession(next);
        useToastStore.getState().show("Address saved.");
        return next;
      },
      deleteAccount: (redirectTo) => {
        const deleted = deleteCurrentDemoAccount();
        if (!deleted) return;
        setSession(null);
        useToastStore.getState().show("Account deleted for this device.");
        router.push(redirectTo ?? "/register");
        router.refresh();
      },
      logout: (redirectTo) => {
        clearDemoSession();
        setSession(null);
        useToastStore.getState().show("Logged out.");
        router.push(redirectTo ?? "/");
        router.refresh();
      },
    }),
    [ready, router, session]
  );

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }
  return context;
}
