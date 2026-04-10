"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import LogoOrange from "@/logos/Horizontal/MH_Logo_Horizontal_Orange.png";
import { useBookingStore } from "@/store/bookingStore";
import { resolvePostAuthRedirect } from "@/lib/demoAuth";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";

type Mode = "login" | "register";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function BookingContextBanner({
  vendorName,
  selectedPackage,
  pricePerPlate,
}: {
  vendorName: string;
  selectedPackage: string | null;
  pricePerPlate: number;
}) {
  return (
    <div className="rounded-[22px] border border-[#ECECEF] bg-[#F8F8FA] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C8C96]">Continuing booking for</p>
      <p className="mt-1 text-[18px] font-black tracking-[-0.03em] text-[#121212]">{vendorName}</p>
      <p className="mt-2 text-[13px] font-semibold text-[#55555C]">
        {(selectedPackage ? `${selectedPackage} · ` : "") + `₹${pricePerPlate || 0}/plate`}
      </p>
    </div>
  );
}

export default function AuthEntryScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const { ready, isAuthenticated, session, loginWithGoogle } = useDemoAuth();
  const vendorName = useBookingStore((s) => s.vendorName);
  const selectedPackage = useBookingStore((s) => s.selectedPackage);
  const pricePerPlate = useBookingStore((s) => s.pricePerPlate);
  const [loading, setLoading] = useState(false);
  const redirectStartedRef = useRef(false);

  const isBookingContext = redirect.startsWith("/book") || redirect.startsWith("/booking");
  const heading = mode === "login" ? "Welcome back" : "Create your account";
  const subheading =
    mode === "login"
      ? "Continue with Google to access your bookings and account."
      : "Continue with Google to create your MeraHalwai account.";

  useEffect(() => {
    if (ready && isAuthenticated && session && !redirectStartedRef.current) {
      redirectStartedRef.current = true;
      router.replace(resolvePostAuthRedirect(session, redirect));
    }
  }, [isAuthenticated, ready, redirect, router, session]);

  const packageLabel = useMemo(
    () => (selectedPackage ? selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1) : null),
    [selectedPackage]
  );

  const handleGoogle = () => {
    if (loading) return;
    setLoading(true);
    const next = loginWithGoogle(mode);
    redirectStartedRef.current = true;
    router.replace(resolvePostAuthRedirect(next, redirect));
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/caterers");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(236,153,37,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(138,62,29,0.16),transparent_38%),linear-gradient(180deg,#FFFDF9_0%,#FFF7EE_44%,#F9F3EA_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1080px] flex-col px-4 py-4 md:px-6 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8D7C6] bg-white/95 px-4 text-[13px] font-semibold text-[#8A3E1D] shadow-[0_14px_30px_rgba(118,73,28,0.08)] transition-all hover:border-[#DDBB94] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <Link href="/caterers" className="flex items-center gap-3">
            <Image src={LogoOrange} alt="Mera Halwai" className="h-9 w-auto object-contain md:h-10" priority />
          </Link>

          <Link
            href={`${mode === "login" ? "/register" : "/login"}?redirect=${encodeURIComponent(redirect)}`}
            className="hidden rounded-full border border-[#E7D5C4] bg-white/95 px-4 py-2 text-[13px] font-semibold text-[#8A3E1D] shadow-[0_12px_24px_rgba(118,73,28,0.05)] md:inline-flex"
          >
            {mode === "login" ? "Create account" : "Login"}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-2 md:py-6">
          <div className="grid w-full max-w-[940px] gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-[34px] border border-[#EDD8C0] bg-[linear-gradient(145deg,#FFF9F0_0%,#FFF2E0_48%,#FBE7CF_100%)] text-[#442A1B] shadow-[0_28px_64px_rgba(118,73,28,0.12)]">
                <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-[#EC9925]/20 blur-3xl" />
                <div className="absolute -right-10 bottom-8 h-44 w-44 rounded-full bg-[#8A3E1D]/14 blur-3xl" />
                <div className="relative border-b border-[#F1DDC8] px-6 py-5">
                  <Image src={LogoOrange} alt="Mera Halwai" className="h-8 w-auto object-contain" priority />
                </div>
                <div className="px-6 pb-7 pt-8">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#A86D35]">Google Sign-in</p>
                  <h1 className="mt-3 text-[40px] font-black leading-[0.98] tracking-[-0.04em] text-[#8A3E1D]">
                    One sign-in, cleaner bookings.
                  </h1>
                  <p className="mt-4 max-w-[420px] text-[15px] leading-[1.75] text-[#6E594C]">
                    Sign in with Google for faster access to bookings, invoices, and account details.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full rounded-[30px] border border-[#E8D7C6] bg-white/90 px-5 py-6 shadow-[0_22px_56px_rgba(118,73,28,0.1)] backdrop-blur-sm md:px-7 md:py-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A86D35]">
                {mode === "login" ? "Customer Login" : "Create Customer Account"}
              </p>
              <h2 className="mt-2 text-[30px] font-black tracking-[-0.04em] text-[#3A271C] md:text-[34px]">{heading}</h2>
              <p className="mt-2 text-[14px] leading-[1.75] text-[#716255] md:text-[15px]">{subheading}</p>

              {isBookingContext && vendorName ? (
                <div className="mt-5">
                  <BookingContextBanner
                    vendorName={vendorName}
                    selectedPackage={packageLabel}
                    pricePerPlate={pricePerPlate}
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                aria-busy={loading}
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-[18px] border border-[#E8D7C6] bg-white text-[15px] font-semibold text-[#5A4437] transition-all hover:bg-[#FFF8F1] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                {loading ? "Continuing..." : "Continue with Google"}
              </button>

              <p className="mt-4 text-[12px] leading-[1.7] text-[#877567]">
                By continuing, you agree to MeraHalwai’s Terms and Privacy Policy.
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-[#EEE0D1] pt-4 text-[13px]">
                <p className="text-[#7B6A5D]">
                  {mode === "login" ? "New to MeraHalwai?" : "Already have an account?"}
                </p>
                <Link
                  href={`${mode === "login" ? "/register" : "/login"}?redirect=${encodeURIComponent(redirect)}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#8A3E1D]"
                >
                  {mode === "login" ? "Create account" : "Login"}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
