"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addInternalNote,
  authenticateAdmin,
  cancelOrder,
  confirmBooking,
  confirmVendor,
  createCouponRecord,
  createVendorRecord,
  declineVendor,
  getAdminSession,
  getAdminState,
  getAdminUserFromSession,
  logOrderCommunication,
  markPaymentDone,
  notifyVendor,
  persistAdminSession,
  reassignVendor,
  resetAdminState,
  sendPaymentLink,
  type AdminCouponRecord,
  type AdminSession,
  type AdminState,
  type AdminVendorRecord,
  updateCouponRecord,
  updateSettingsRecord,
  updateTemplateRecord,
  updateVendorRecord,
} from "@/data/mockAdmin";
import { clearAdminAuthCookie, setAdminAuthCookie } from "@/lib/adminAuthCookie";

type AdminContextValue = {
  ready: boolean;
  session: AdminSession | null;
  user: ReturnType<typeof getAdminUserFromSession>;
  state: AdminState;
  login: (email: string, password: string) => Promise<AdminSession>;
  logout: () => void;
  refresh: () => void;
  resetDemoData: () => void;
  notifyVendor: (orderId: string) => void;
  confirmVendor: (orderId: string) => void;
  declineVendor: (orderId: string) => void;
  sendPaymentLink: (orderId: string) => void;
  markPaymentDone: (orderId: string, reference: string) => void;
  confirmBooking: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  reassignVendor: (orderId: string, vendorId: string) => void;
  addInternalNote: (orderId: string, note: string) => void;
  updateVendor: (vendorId: string, partial: Partial<AdminVendorRecord>) => void;
  createVendor: (vendor: AdminVendorRecord) => void;
  updateCoupon: (couponId: string, partial: Partial<AdminCouponRecord>) => void;
  createCoupon: (coupon: AdminCouponRecord) => void;
  saveSettings: (partial: Partial<AdminState["settings"]>) => void;
  saveTemplate: (templateId: string, partial: Partial<AdminState["templates"][number]>) => void;
  logCommunication: (
    orderId: string,
    payload: {
      actor?: string;
      label: string;
      helper: string;
      tone?: AdminState["activityFeed"][number]["tone"];
    }
  ) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [state, setState] = useState<AdminState>(getAdminState());

  const refresh = useCallback(() => {
    setState(getAdminState());
    setSession(getAdminSession());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = authenticateAdmin(email, password);
    setAdminAuthCookie();
    setSession(nextSession);
    setState(getAdminState());
    return nextSession;
  }, []);

  const logout = useCallback(() => {
    persistAdminSession(null);
    clearAdminAuthCookie();
    setSession(null);
  }, []);

  const resetDemoData = useCallback(() => {
    resetAdminState();
    refresh();
  }, [refresh]);

  const runAndRefresh = useCallback((fn: () => void) => {
    fn();
    refresh();
  }, [refresh]);

  const value = useMemo<AdminContextValue>(() => {
    const user = getAdminUserFromSession(session);

    return {
      ready,
      session,
      user,
      state,
      login,
      logout,
      refresh,
      resetDemoData,
      notifyVendor: (orderId) => runAndRefresh(() => notifyVendor(orderId, user?.name ?? "Admin Desk")),
      confirmVendor: (orderId) => runAndRefresh(() => confirmVendor(orderId, user?.name ?? "Admin Desk")),
      declineVendor: (orderId) => runAndRefresh(() => declineVendor(orderId, user?.name ?? "Admin Desk")),
      sendPaymentLink: (orderId) => runAndRefresh(() => sendPaymentLink(orderId, user?.name ?? "Admin Desk")),
      markPaymentDone: (orderId, reference) =>
        runAndRefresh(() => markPaymentDone(orderId, reference, user?.name ?? "Admin Desk")),
      confirmBooking: (orderId) => runAndRefresh(() => confirmBooking(orderId, user?.name ?? "Admin Desk")),
      cancelOrder: (orderId) => runAndRefresh(() => cancelOrder(orderId, user?.name ?? "Admin Desk")),
      reassignVendor: (orderId, vendorId) =>
        runAndRefresh(() => reassignVendor(orderId, vendorId, user?.name ?? "Admin Desk")),
      addInternalNote: (orderId, note) =>
        runAndRefresh(() => addInternalNote(orderId, note, user?.name ?? "Admin Desk")),
      updateVendor: (vendorId, partial) => runAndRefresh(() => updateVendorRecord(vendorId, partial)),
      createVendor: (vendor) => runAndRefresh(() => createVendorRecord(vendor)),
      updateCoupon: (couponId, partial) => runAndRefresh(() => updateCouponRecord(couponId, partial)),
      createCoupon: (coupon) => runAndRefresh(() => createCouponRecord(coupon)),
      saveSettings: (partial) => runAndRefresh(() => updateSettingsRecord(partial)),
      saveTemplate: (templateId, partial) => runAndRefresh(() => updateTemplateRecord(templateId, partial)),
      logCommunication: (orderId, payload) => runAndRefresh(() => logOrderCommunication(orderId, payload)),
    };
  }, [ready, session, state, login, logout, refresh, resetDemoData, runAndRefresh]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }
  return context;
}
