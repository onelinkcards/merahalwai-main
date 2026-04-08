"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { resolvePostProfileRedirect } from "@/lib/demoAuth";
import { useToastStore } from "@/store/toastStore";

function inputClass(readOnly = false) {
  return (
    "h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-[14px] font-medium text-stone-900 outline-none transition focus:border-[#8A3E1D]" +
    (readOnly ? " cursor-not-allowed bg-stone-50 text-stone-500" : "")
  );
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export default function ProfilePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const { ready, session, completeProfile } = useDemoAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const redirectStartedRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    const normalizedPhone = normalizePhone(session.user.phone);
    setFullName(session.user.fullName);
    setEmail(session.user.email);
    setPhone(normalizedPhone);
    setConfirmPhone(normalizedPhone);
    setPhotoUrl(session.user.profilePhotoUrl ?? "");
  }, [session]);

  useEffect(() => {
    if (!ready || !session) return;
    if (session.user.profileComplete && !redirectStartedRef.current) {
      redirectStartedRef.current = true;
      router.replace(resolvePostProfileRedirect(session, redirect));
    }
  }, [ready, redirect, router, session]);

  const phoneValid = useMemo(() => normalizePhone(phone).length === 10, [phone]);
  const confirmMatches = useMemo(
    () => normalizePhone(phone) === normalizePhone(confirmPhone) && normalizePhone(confirmPhone).length === 10,
    [confirmPhone, phone]
  );

  if (!ready || !session) return null;

  const handleContinue = () => {
    if (saving) return;
    if (!fullName.trim()) {
      useToastStore.getState().show("Enter your full name to continue.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      useToastStore.getState().show("Google email is missing. Please sign in again.");
      return;
    }
    if (!phoneValid) {
      useToastStore.getState().show("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!confirmMatches) {
      useToastStore.getState().show("Mobile number confirmation does not match.");
      return;
    }

    setSaving(true);

    const next = completeProfile({
      fullName,
      email,
      phone,
      whatsapp: phone,
      profilePhotoUrl: photoUrl,
    });

    if (!next) {
      setSaving(false);
      return;
    }

    redirectStartedRef.current = true;
    router.replace(resolvePostProfileRedirect(next, redirect));
  };

  const handleBack = () => {
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <main className="min-h-screen bg-[#FBF7F1] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[760px]">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D7C6] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D] transition-all hover:border-[#DDBB94] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <section className="mt-5 rounded-[28px] border border-[#E7D5C4] bg-white p-5 shadow-[0_18px_40px_rgba(35,25,20,0.05)] sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A06D38]">Step 1 of 2</p>
          <h1 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#151515]">Set up your account</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-stone-600">
            Your Google email is already linked. Add your mobile number once and we will use it for WhatsApp booking updates too.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-[24px] border border-[#EEE2D4] bg-[#FFFAF4] p-4">
            <label className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#E8D7C6] bg-white text-[#8A3E1D]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setPhotoUrl(URL.createObjectURL(file));
                }}
              />
            </label>
            <div>
              <p className="text-[15px] font-semibold text-stone-900">Profile photo</p>
              <p className="mt-1 text-[13px] text-stone-600">Optional. You can skip this for now.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Full Name *
              </label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass()} />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Google Email
              </label>
              <input value={email} readOnly className={inputClass(true)} />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Mobile Number *
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                className={inputClass()}
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Confirm Mobile Number *
              </label>
              <input
                value={confirmPhone}
                onChange={(e) => setConfirmPhone(normalizePhone(e.target.value))}
                inputMode="numeric"
                maxLength={10}
                placeholder="Re-enter mobile number"
                className={inputClass()}
              />
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#EEE4D8] bg-[#FFF9F2] px-4 py-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8A6D4B]">WhatsApp updates</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-[#6F6257]">
              The same mobile number will be used for booking alerts and WhatsApp updates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] px-5 text-[14px] font-semibold text-white shadow-[0_18px_36px_rgba(138,62,29,0.16)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Account...
              </span>
            ) : (
              "Continue to Address Setup"
            )}
          </button>
        </section>
      </div>
    </main>
  );
}
