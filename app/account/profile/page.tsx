"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import AccountShell from "@/components/account/AccountShell";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { useToastStore } from "@/store/toastStore";

const inputClass =
  "h-11 rounded-[18px] border border-[#E6E7EB] bg-white px-4 text-[14px] font-medium text-[#141414] outline-none transition-colors focus:border-[#141414]";

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useDemoAuth();
  const primaryAddress =
    user?.savedAddresses.find((address) => address.id === user.defaultAddressId) ?? user?.savedAddresses[0];
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    whatsapp: user?.whatsapp ?? "",
    whatsappUpdates: user?.whatsappUpdates ?? true,
    emailInvoices: user?.emailInvoices ?? true,
    preferredCity: user?.preferredCity ?? "Jaipur",
    commonEventType: user?.commonEventType ?? "Wedding",
    commonGuestRange: user?.commonGuestRange ?? "100–150 guests",
    addressLabel: primaryAddress?.label ?? "Home Venue",
    venueName: primaryAddress?.venueName ?? "",
    venueAddress: primaryAddress?.address ?? "",
    pincode: primaryAddress?.pincode ?? "",
  }));

  const initials = useMemo(
    () =>
      (form.fullName || "MH")
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join(""),
    [form.fullName]
  );

  const handleSave = () => {
    if (saving) return;
    if (!form.fullName.trim()) {
      useToastStore.getState().show("Enter your full name before saving.");
      return;
    }
    if (!form.email.trim()) {
      useToastStore.getState().show("Enter your email before saving.");
      return;
    }

    setSaving(true);

    const hasAddressInput = [form.addressLabel, form.venueName, form.venueAddress, form.pincode].some((value) =>
      value.trim()
    );

    const nextSavedAddresses = (() => {
      if (!hasAddressInput) return user?.savedAddresses ?? [];

      const addressId = primaryAddress?.id ?? `saved-${Date.now().toString(36)}`;
      const nextPrimary = {
        ...(primaryAddress ?? {}),
        id: addressId,
        label: form.addressLabel.trim() || primaryAddress?.label || "Home Venue",
        venueName: form.venueName.trim(),
        address: form.venueAddress.trim(),
        city: primaryAddress?.city ?? (form.preferredCity.trim() || "Jaipur"),
        state: primaryAddress?.state ?? "Rajasthan",
        pincode: form.pincode.trim(),
      };
      const others = (user?.savedAddresses ?? []).filter((address) => address.id !== addressId);
      return [nextPrimary, ...others];
    })();

    updateProfile({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim(),
      whatsappUpdates: form.whatsappUpdates,
      emailInvoices: form.emailInvoices,
      preferredCity: form.preferredCity.trim(),
      commonEventType: form.commonEventType.trim(),
      commonGuestRange: form.commonGuestRange.trim(),
      savedAddresses: nextSavedAddresses,
      defaultAddressId: nextSavedAddresses[0]?.id ?? user?.defaultAddressId,
    });

    setSaving(false);
  };

  return (
    <AccountShell
      active="profile"
      title="Profile"
      description="Update your contact details, account preferences, and commonly used booking defaults."
      actions={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-4 text-[13px] font-semibold text-white shadow-[0_18px_32px_rgba(138,62,29,0.16)] transition-all hover:brightness-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#EC9925_0%,#8A3E1D_100%)] text-[24px] font-black text-white shadow-[0_18px_32px_rgba(138,62,29,0.16)] md:h-20 md:w-20 md:text-[28px]">
              {initials}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A9AA3]">Personal account</p>
              <h2 className="mt-2 text-[26px] font-black tracking-[-0.03em] text-[#111111]">{form.fullName}</h2>
              <p className="mt-2 text-[14px] text-[#67676E]">Manage your contact details and notification preferences.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-6">
            <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
              <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Personal Info</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Full Name</label>
                  <input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Verified Mobile Number</label>
                  <input value={form.phone} readOnly className={inputClass + " cursor-not-allowed bg-[#F8F8FA] text-[#6E6E75]"} />
                  <p className="text-[12px] text-[#8A8A91]">Number changes use OTP verification in a separate flow.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Email</label>
                  <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">WhatsApp Number</label>
                  <input value={form.whatsapp} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
              <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Saved Event Defaults</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Preferred City</label>
                  <input value={form.preferredCity} onChange={(e) => setForm((prev) => ({ ...prev, preferredCity: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Common Event Type</label>
                  <input value={form.commonEventType} onChange={(e) => setForm((prev) => ({ ...prev, commonEventType: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Common Guest Range</label>
                  <input value={form.commonGuestRange} onChange={(e) => setForm((prev) => ({ ...prev, commonGuestRange: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)] md:px-6">
              <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Saved Venue Snippet</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Label</label>
                  <input value={form.addressLabel} onChange={(e) => setForm((prev) => ({ ...prev, addressLabel: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Venue / Hall Name</label>
                  <input value={form.venueName} onChange={(e) => setForm((prev) => ({ ...prev, venueName: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Complete Address</label>
                  <textarea
                    value={form.venueAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, venueAddress: e.target.value }))}
                    className="min-h-[120px] rounded-[22px] border border-[#E6E7EB] bg-white px-4 py-4 text-[14px] font-medium text-[#141414] outline-none transition-colors focus:border-[#141414]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#777780]">Pincode</label>
                  <input value={form.pincode} onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-[28px] border border-[#E7E8EC] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.05)]">
              <h3 className="text-[22px] font-black tracking-[-0.03em] text-[#111111]">Preferences</h3>
              <div className="mt-5 space-y-4">
                <label className="flex items-center justify-between gap-4 rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                  <span>
                    <span className="block text-[14px] font-semibold text-[#111111]">WhatsApp booking updates</span>
                    <span className="mt-1 block text-[12px] text-[#7A7A82]">Get status updates and reminders on WhatsApp.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.whatsappUpdates}
                    onChange={(e) => setForm((prev) => ({ ...prev, whatsappUpdates: e.target.checked }))}
                    className="h-5 w-5 rounded border-stone-300 accent-[#8A3E1D]"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-[20px] border border-[#ECECF0] bg-[#F8F8FA] px-4 py-4">
                  <span>
                    <span className="block text-[14px] font-semibold text-[#111111]">Email invoices</span>
                    <span className="mt-1 block text-[12px] text-[#7A7A82]">Receive invoice links and payment confirmations by email.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.emailInvoices}
                    onChange={(e) => setForm((prev) => ({ ...prev, emailInvoices: e.target.checked }))}
                    className="h-5 w-5 rounded border-stone-300 accent-[#8A3E1D]"
                  />
                </label>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#E7D5C4] bg-[linear-gradient(145deg,#FFF5E8_0%,#F9E6CC_52%,#F2D1AF_100%)] px-5 py-6 text-[#5F4635] shadow-[0_16px_40px_rgba(118,73,28,0.12)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A66D39]">Profile note</p>
              <p className="mt-3 text-[14px] leading-[1.8] text-[#6C5647]">
                These defaults will be ready to prefill future booking requests once real account sync is connected.
              </p>
            </article>

            <article className="rounded-[28px] border border-[#F1D4D0] bg-[#FFF8F7] px-5 py-6 shadow-[0_16px_40px_rgba(12,12,14,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B64545]">Danger zone</p>
              <p className="mt-3 text-[14px] leading-[1.8] text-[#7B5C5C]">
                Delete this account from the current device. This clears the local demo profile, addresses, and order access.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("Delete this account from this device?")) return;
                  deleteAccount("/register");
                }}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#E6B9B2] px-4 text-[13px] font-semibold text-[#B64545] transition-colors hover:bg-[#FFF1EF]"
              >
                Delete Account
              </button>
            </article>
          </aside>
        </div>
      </div>
    </AccountShell>
  );
}
