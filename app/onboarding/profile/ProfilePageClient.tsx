"use client";

import { useEffect, useRef, useState } from "react";
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

export default function ProfilePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const { ready, session, completeProfile } = useDemoAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const redirectStartedRef = useRef(false);

  useEffect(() => {
    if (!session) return;
    setFullName(session.user.fullName);
    setEmail(session.user.email);
    setPhotoUrl(session.user.profilePhotoUrl ?? "");
  }, [session]);

  useEffect(() => {
    if (!ready || !session) return;
    if (session.user.profileComplete && !redirectStartedRef.current) {
      redirectStartedRef.current = true;
      router.replace(resolvePostProfileRedirect(session, redirect));
    }
  }, [ready, redirect, router, session]);

  if (!ready || !session) return null;

  const handleContinue = () => {
    if (saving) return;
    if (!fullName.trim()) {
      useToastStore.getState().show("Enter your full name to continue.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      useToastStore.getState().show("Enter a valid email address.");
      return;
    }

    setSaving(true);

    const next = completeProfile({
      fullName,
      email,
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
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <main className="min-h-screen bg-[#FBF7F1] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[720px]">
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
          <h1 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#151515]">Complete your profile</h1>
          <p className="mt-2 text-[14px] leading-[1.7] text-stone-600">
            Save the details we need to identify your account and prefill future bookings.
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
                Email Address *
              </label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass()} />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Verified Mobile Number
              </label>
              <input value={session.user.phone} readOnly className={inputClass(true)} />
              <p className="mt-2 text-[12px] text-stone-500">
                This number came from your verified sign-in. Change number uses a separate OTP flow later.
              </p>
            </div>
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
                Saving Profile...
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
