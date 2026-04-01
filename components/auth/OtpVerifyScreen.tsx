"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import LogoOrange from "@/logos/Horizontal/MH_Logo_Horizontal_Orange.png";
import { useToastStore } from "@/store/toastStore";
import { DEMO_LOGIN_OTP, DEMO_LOGIN_PHONE } from "@/data/mockAccount";
import { clearPendingOtp, createPendingOtp, getPendingOtp, isDemoPhone, resolvePostAuthRedirect } from "@/lib/demoAuth";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";

export default function OtpVerifyScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const mode = (searchParams.get("mode") as "login" | "register" | null) ?? "login";
  const { ready, isAuthenticated, session, loginWithOtp } = useDemoAuth();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const redirectStartedRef = useRef(false);

  const challenge = useMemo(() => getPendingOtp(), []);

  useEffect(() => {
    if (ready && isAuthenticated && session && !redirectStartedRef.current) {
      redirectStartedRef.current = true;
      router.replace(resolvePostAuthRedirect(session, redirect));
    }
  }, [isAuthenticated, ready, redirect, router, session]);

  useEffect(() => {
    if (!challenge) {
      router.replace(`/${mode === "register" ? "register" : "login"}?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [challenge, mode, redirect, router]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = window.setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => window.clearInterval(interval);
  }, [timer]);

  const filled = digits.every((digit) => digit.length === 1);

  const handleBack = () => {
    router.push(`/${mode === "register" ? "register" : "login"}?redirect=${encodeURIComponent(redirect)}`);
  };

  const verify = useCallback(() => {
    if (!challenge || !filled || loading) return;

    setLoading(true);
    setError("");

    const entered = digits.join("");
    if (!isDemoPhone(challenge.phone) || entered !== DEMO_LOGIN_OTP) {
      setLoading(false);
      setError("Invalid OTP. Use 123456 for demo verification.");
      useToastStore.getState().show("Invalid OTP. Use 123456.");
      return;
    }

    clearPendingOtp();
    const next = loginWithOtp({ mode: challenge.mode, phone: challenge.phone });
    redirectStartedRef.current = true;
    router.replace(resolvePostAuthRedirect(next, redirect));
  }, [challenge, digits, filled, loading, loginWithOtp, redirect, router]);

  const resendOtp = () => {
    if (!challenge || timer > 0) return;
    createPendingOtp(challenge.phone, challenge.mode);
    setDigits(["", "", "", "", "", ""]);
    setTimer(45);
    setError("");
    setResent(true);
    useToastStore.getState().show(`OTP resent. Use ${DEMO_LOGIN_OTP}.`);
    window.setTimeout(() => setResent(false), 2000);
  };

  const onDigitChange = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });
    if (nextDigit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(236,153,37,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(138,62,29,0.16),transparent_38%),linear-gradient(180deg,#FFFDF9_0%,#FFF7EE_44%,#F9F3EA_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-4 py-4 md:px-6 md:py-8">
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

          <span className="hidden rounded-full border border-[#E7D5C4] bg-white/95 px-4 py-2 text-[12px] font-semibold text-[#8A3E1D] md:inline-flex">
            Demo OTP: {DEMO_LOGIN_OTP}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-2 md:py-8">
          <div className="w-full max-w-[440px] rounded-[30px] border border-[#E8D7C6] bg-white/92 px-5 py-6 shadow-[0_22px_56px_rgba(118,73,28,0.1)] backdrop-blur-sm md:px-7 md:py-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A86D35]">Verify your number</p>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.04em] text-[#3A271C] md:text-[34px]">
              Enter the 6-digit code
            </h1>
            <p className="mt-2 text-[14px] leading-[1.75] text-[#716255] md:text-[15px]">
              Enter the code sent to <span className="font-semibold text-[#8A3E1D]">+91 {challenge?.phone ?? DEMO_LOGIN_PHONE}</span>
            </p>

            <div className="mt-5 flex justify-between gap-2.5">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    inputsRef.current[index] = node;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => onDigitChange(index, event.target.value)}
                  onKeyDown={(event) => onKeyDown(index, event)}
                  className="h-14 w-11 rounded-[18px] border border-[#E8D7C6] bg-[#FFF9F2] text-center text-[22px] font-black text-[#8A3E1D] outline-none transition-colors focus:border-[#EC9925] focus:bg-white md:h-16 md:w-14"
                />
              ))}
            </div>

            {error ? (
              <p className="mt-4 rounded-[18px] border border-[#F0D3D3] bg-[#FFF6F6] px-4 py-3 text-[13px] font-medium text-[#B64545]">
                {error}
              </p>
            ) : null}

            {resent ? (
              <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-[#D8EBCF] bg-[#F4FBF0] px-4 py-3 text-[13px] font-medium text-[#2F7C3B]">
                <CheckCircle2 className="h-4 w-4" />
                OTP resent successfully.
              </div>
            ) : null}

            <button
              type="button"
              disabled={!filled || loading}
              onClick={verify}
              aria-busy={loading}
              className={
                "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[18px] text-[14px] font-semibold text-white transition-all " +
                (filled && !loading
                  ? "bg-[linear-gradient(135deg,#EC9925_0%,#D97F1D_48%,#8A3E1D_100%)] shadow-[0_18px_36px_rgba(138,62,29,0.2)] hover:brightness-[1.03] active:scale-[0.99]"
                  : "cursor-not-allowed bg-[#DCC6AE]")
              }
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </button>

            <div className="mt-4 flex items-center justify-between gap-4 text-[13px]">
              <button type="button" onClick={handleBack} className="font-semibold text-[#8A3E1D]">
                Change number
              </button>

              {timer > 0 ? (
                <span className="text-[#8C7A6C]">
                  Resend OTP in 0:{timer < 10 ? "0" : ""}
                  {timer}
                </span>
              ) : (
                <button type="button" onClick={resendOtp} className="inline-flex items-center gap-2 font-semibold text-[#8A3E1D]">
                  <RefreshCcw className="h-4 w-4" />
                  Resend OTP
                </button>
              )}
            </div>

            <p className="mt-4 text-[12px] leading-[1.7] text-[#8C7A6C]">
              Demo verification uses <span className="font-semibold text-[#8A3E1D]">{DEMO_LOGIN_PHONE}</span> and{" "}
              <span className="font-semibold text-[#8A3E1D]">{DEMO_LOGIN_OTP}</span>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
