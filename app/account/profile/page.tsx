"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, Mail, MapPin, Phone, Trash2, UserRound } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";

const inputClass =
  "h-11 rounded-[14px] border border-[#E7E2DA] bg-white px-3.5 text-[14px] font-medium text-[#181512] outline-none transition focus:border-[#EC9925]";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export default function ProfilePage() {
  const { user, updateProfile, logout, deleteAccount } = useDemoAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(normalizePhone(user?.phone ?? ""));
  const [confirmPhone, setConfirmPhone] = useState(normalizePhone(user?.phone ?? ""));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const initials = useMemo(
    () =>
      (fullName || "MH")
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join(""),
    [fullName]
  );

  const currentPhone = normalizePhone(user?.phone ?? "");
  const dirty = fullName.trim() !== (user?.fullName ?? "").trim() || phone !== currentPhone;
  const phoneValid = phone.length === 10;
  const confirmMatches = phone === confirmPhone && confirmPhone.length === 10;
  const canUpdate = dirty && fullName.trim().length > 0 && phoneValid && confirmMatches && !saving;

  const handleSave = () => {
    if (!canUpdate) return;
    setSaving(true);
    updateProfile({
      fullName: fullName.trim(),
      phone: `+91 ${phone}`,
      whatsapp: `+91 ${phone}`,
      mobileVerified: true,
    });
    setSaving(false);
  };

  const handleDelete = () => {
    deleteAccount("/register");
  };

  return (
    <AccountShell
      active="account"
      title="Edit Account Details"
      description="Update your name and contact number. Your Google email stays linked to this account."
      mobileBackHref="/account"
      actions={
        canUpdate ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={!canUpdate}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 text-[12px] font-semibold text-white disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Updating..." : "Update Profile"}
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        <section className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(20,14,8,0.05)] md:px-5 md:py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-[17px] font-black text-white">
              {initials || "MH"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[20px] font-black text-[#111111]">{fullName || "MeraHalwai User"}</p>
              <p className="truncate text-[13px] text-[#7A6D60]">{user?.email}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(20,14,8,0.05)]">
          <h2 className="text-[18px] font-black text-[#12100E]">Account Information</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                <UserRound className="h-3.5 w-3.5" />
                Full Name
              </span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
            </label>

            <label className="block">
              <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                <Phone className="h-3.5 w-3.5" />
                Mobile Number
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                inputMode="numeric"
                maxLength={10}
                className={inputClass}
                placeholder="Enter 10-digit mobile number"
              />
            </label>

            <label className="block">
              <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                <Phone className="h-3.5 w-3.5" />
                Confirm Mobile Number
              </span>
              <input
                value={confirmPhone}
                onChange={(e) => setConfirmPhone(normalizePhone(e.target.value))}
                inputMode="numeric"
                maxLength={10}
                className={inputClass}
                placeholder="Re-enter mobile number"
              />
            </label>

            <label className="block">
              <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                <Mail className="h-3.5 w-3.5" />
                Google Email
              </span>
              <input
                value={user?.email ?? ""}
                readOnly
                className={inputClass + " cursor-not-allowed bg-[#F7F4F0] text-[#72675C]"}
              />
            </label>

            <label className="block">
              <span className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                <MapPin className="h-3.5 w-3.5" />
                City
              </span>
              <input
                value={user?.preferredCity ?? "Jaipur"}
                readOnly
                className={inputClass + " cursor-not-allowed bg-[#F7F4F0] text-[#72675C]"}
              />
            </label>
          </div>

          <div className="mt-4 rounded-[18px] border border-[#ECE4DA] bg-[#FFF9F2] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8A6E4A]">WhatsApp-ready number</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-[#6C6157]">
              This mobile number is also used for WhatsApp booking updates and order alerts.
            </p>
          </div>

          {!confirmMatches && confirmPhone.length > 0 ? (
            <p className="mt-3 text-[12px] font-medium text-[#B34E24]">Mobile number confirmation does not match.</p>
          ) : null}
        </section>

        <section className="rounded-[22px] border border-[#E7E2DA] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(20,14,8,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/my-bookings"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#E6D8C9] bg-white px-4 text-[13px] font-semibold text-[#3F382F]"
            >
              My Orders
            </Link>
            <button
              type="button"
              onClick={() => logout("/login")}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#E7D6C2] bg-[#FFF9F2] px-4 text-[13px] font-semibold text-[#8A3E1D]"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#F1D3CD] bg-[#FFF7F5] px-4 py-4 shadow-[0_12px_30px_rgba(20,14,8,0.04)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FDE3DC] text-[#B34E24]">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-black text-[#241A16]">Delete Account</p>
              <p className="mt-1 text-[13px] leading-[1.6] text-[#765E55]">
                This removes your saved profile and demo account data from this device.
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#E4BBB0] bg-white px-4 text-[13px] font-semibold text-[#A44624]"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[420px] rounded-[24px] border border-[#E8D7C6] bg-white p-5 shadow-[0_24px_60px_rgba(20,14,8,0.18)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A86D35]">Delete account</p>
            <h3 className="mt-2 text-[24px] font-black tracking-[-0.03em] text-[#161513]">Are you sure?</h3>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#6A5E54]">
              Your saved profile, addresses, and local demo login session will be removed from this device.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#E6D8C9] bg-white px-4 text-[13px] font-semibold text-[#3F382F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#B34E24] px-4 text-[13px] font-semibold text-white"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AccountShell>
  );
}
