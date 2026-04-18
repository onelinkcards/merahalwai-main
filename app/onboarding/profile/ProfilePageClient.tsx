"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Mail, Phone, UserRound } from "lucide-react";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { resolvePostProfileRedirect } from "@/lib/demoAuth";
import { useToastStore } from "@/store/toastStore";

function inputClass(readOnly = false) {
  return (
    "h-12 w-full rounded-[18px] border border-[#E7E2DA] bg-white px-4 text-[14px] font-medium text-[#181512] outline-none transition focus:border-[#EC9925]" +
    (readOnly ? " cursor-not-allowed bg-[#F7F4F0] text-[#72675C]" : "")
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

  const phoneValid = normalizePhone(phone).length === 10;
  const confirmMatches = normalizePhone(phone) === normalizePhone(confirmPhone) && normalizePhone(confirmPhone).length === 10;

  if (!ready || !session) return null;

  const handleContinue = async () => {
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
    await Promise.resolve();

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(236,153,37,0.18),transparent_28%),linear-gradient(180deg,#FFFDF9_0%,#FFF7EE_46%,#F8F2E8_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[760px]">
        <button
          type="button"
          onClick={() => router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D7C6] bg-white px-4 text-[13px] font-semibold text-[#8A3E1D] transition-all hover:border-[#DDBB94] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#E7D5C4] bg-white shadow-[0_22px_52px_rgba(35,25,20,0.08)]">
          <div className="border-b border-[#F1E3D1] bg-[linear-gradient(135deg,rgba(236,153,37,0.10),rgba(138,62,29,0.03))] px-5 py-5 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A86D35]">Google Account Setup</p>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em] text-[#3A271C] sm:text-[34px]">Complete your account</h1>
            <p className="mt-2 max-w-[560px] text-[14px] leading-[1.75] text-[#6E594C]">
              Complete your account details to continue.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-7">
            <div className="mb-5 flex items-center gap-4 rounded-[22px] border border-[#EEE2D4] bg-[#FFFAF4] p-4">
              <label className="relative flex h-18 w-18 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#E8D7C6] bg-white text-[#8A3E1D] sm:h-20 sm:w-20">
                {photoUrl ? (
                  <Image src={photoUrl} alt="Profile preview" fill unoptimized className="object-cover" />
                ) : (
                  <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                  <UserRound className="h-3.5 w-3.5" />
                  Full Name *
                </span>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass()} />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                  <Mail className="h-3.5 w-3.5" />
                  Google Email
                </span>
                <input value={email} readOnly className={inputClass(true)} />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                  <Phone className="h-3.5 w-3.5" />
                  Mobile Number *
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  className={inputClass()}
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A7D6F]">
                  <Phone className="h-3.5 w-3.5" />
                  Confirm Mobile Number *
                </span>
                <input
                  value={confirmPhone}
                  onChange={(e) => setConfirmPhone(normalizePhone(e.target.value))}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Re-enter mobile number"
                  className={inputClass()}
                />
              </label>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#EEE6DA] bg-[#FFFBF6] px-4 py-3">
              <p className="text-[13px] font-medium text-[#695C50]">
                This same mobile number will be used for WhatsApp booking updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleContinue()}
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
          </div>
        </section>
      </div>
    </main>
  );
}
