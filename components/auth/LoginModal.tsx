"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_LOGIN_OTP, DEMO_LOGIN_PHONE } from "@/data/mockAccount";
import { clearPendingOtp, createPendingOtp, isDemoPhone, resolvePostAuthRedirect } from "@/lib/demoAuth";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";

type Step = "entry" | "otp";

function GoogleMark() {
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

type Props = {
  open: boolean;
  onClose: () => void;
  vendorName: string;
  startingFromPerPlate: number;
};

export default function LoginModal({ open, onClose, vendorName, startingFromPerPlate }: Props) {
  const router = useRouter();
  const { loginWithGoogle, loginWithOtp } = useDemoAuth();
  const selectedPackage = useBookingStore((s) => s.selectedPackage);
  const setMany = useBookingStore((s) => s.setMany);
  const [step, setStep] = useState<Step>("entry");
  const [phone, setPhone] = useState(DEMO_LOGIN_PHONE);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) {
      setStep("entry");
      setPhone(DEMO_LOGIN_PHONE);
      setDigits(["", "", "", "", "", ""]);
      setTimer(45);
      setLoading(false);
      clearPendingOtp();
    }
  }, [open]);

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const interval = window.setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => window.clearInterval(interval);
  }, [step, timer]);

  const finishAndContinue = (nextPath: string) => {
    onClose();
    router.push(nextPath);
  };

  const handleGoogle = () => {
    const next = loginWithGoogle("login");
    finishAndContinue(resolvePostAuthRedirect(next, "/book/details"));
  };

  const handleSendOtp = () => {
    const sanitized = phone.replace(/\D/g, "").slice(-10);
    if (!isDemoPhone(sanitized)) {
      useToastStore.getState().show(`Use ${DEMO_LOGIN_PHONE} for demo OTP login.`);
      return;
    }
    createPendingOtp(sanitized, "login");
    setMany({
      otpPhone: sanitized,
      customerPhone: sanitized,
      customerWhatsapp: sanitized,
    });
    setStep("otp");
    setTimer(45);
    useToastStore.getState().show(`Demo OTP sent. Use ${DEMO_LOGIN_OTP}.`);
  };

  const filled = digits.every((digit) => digit.length === 1);

  const handleVerify = () => {
    if (!filled) return;
    setLoading(true);
    window.setTimeout(() => {
      if (digits.join("") !== DEMO_LOGIN_OTP) {
        useToastStore.getState().show("Invalid OTP. Use 123456.");
        setLoading(false);
        return;
      }
      clearPendingOtp();
      const next = loginWithOtp({ mode: "login", phone });
      setLoading(false);
      finishAndContinue(resolvePostAuthRedirect(next, "/book/details"));
    }, 400);
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

  const onDigitKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const packageLabel = selectedPackage
    ? selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)
    : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="login-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
        >
          <button
            type="button"
            aria-label="Close backdrop"
            className="absolute inset-0"
            onClick={step === "entry" && !loading ? onClose : undefined}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="relative z-[61] w-full overflow-hidden rounded-t-[30px] bg-white sm:max-w-[440px] sm:rounded-[30px]"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#E5D9CC] sm:hidden" />

            <div className="flex items-start justify-between px-6 pb-4 pt-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">
                  Booking Login
                </p>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#161513]">
                  {step === "entry" ? "Continue to booking" : "Verify your number"}
                </h2>
              </div>
              <button
                type="button"
                onClick={step === "entry" ? onClose : () => setStep("entry")}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F2ED] text-[#5F554B]"
              >
                {step === "entry" ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-[24px] border border-[#E8DCCF] bg-[linear-gradient(180deg,#FFF9F1,#FFF3E4)] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Continuing booking for</p>
                <p className="mt-1 text-[18px] font-black tracking-tight text-[#1E1E1E]">{vendorName}</p>
                <p className="mt-2 text-[13px] font-semibold text-[#6D5F51]">
                  {(packageLabel ? `${packageLabel} · ` : "") + `₹${startingFromPerPlate}/plate`}
                </p>
                <p className="mt-2 text-[12px] text-[#75695E]">No payment now. Login only after booking intent.</p>
              </div>

              {step === "entry" ? (
                <>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#DDD3C5] bg-[#FCFBF9] text-[15px] font-bold text-[#1E1E1E] transition-all hover:border-[#D7C3AD] hover:bg-white"
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>

                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[#ECE3D7]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A8E81]">or</span>
                    <div className="h-px flex-1 bg-[#ECE3D7]" />
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-bold uppercase tracking-[0.14em] text-[#6C6156]">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-3 rounded-[22px] border border-[#E6DCCF] bg-[#FCFBF9] px-4 py-3">
                      <span className="rounded-full bg-[#F4ECE1] px-3 py-2 text-[13px] font-bold text-[#5F5347]">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="h-8 flex-1 border-0 bg-transparent text-[16px] font-semibold text-[#1E1E1E] outline-none"
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-[#8B7D6E]">
                      Demo mobile: <span className="font-bold text-[#1E1E1E]">{DEMO_LOGIN_PHONE}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#1F1E1B] px-5 text-[15px] font-bold text-white transition-colors hover:bg-[#302C28]"
                  >
                    Send OTP
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-6 text-[14px] leading-[1.7] text-[#6C6258]">
                    Enter the 6-digit code sent to <span className="font-bold text-[#1E1E1E]">+91 {phone}</span>
                  </p>

                  <div className="mt-5 flex justify-between gap-2">
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
                        onKeyDown={(event) => onDigitKeyDown(index, event)}
                        className="h-14 w-12 rounded-2xl border border-[#E5D8C8] bg-[#FCFBF9] text-center text-[22px] font-black text-[#1E1E1E] outline-none transition-all focus:border-[#8A3E1D] focus:bg-white"
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-[12px] text-[#8B7D6E]">
                    Demo OTP: <span className="font-bold text-[#1E1E1E]">{DEMO_LOGIN_OTP}</span>
                  </p>

                  <button
                    type="button"
                    disabled={!filled || loading}
                    onClick={handleVerify}
                    className={
                      "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold text-white transition-colors " +
                      (filled && !loading ? "bg-[#1F1E1B] hover:bg-[#302C28]" : "cursor-not-allowed bg-[#D5CABC]")
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

                  <div className="mt-4 flex items-center justify-between text-[13px]">
                    <button type="button" onClick={() => setStep("entry")} className="font-semibold text-[#8A3E1D]">
                      Change number
                    </button>
                    {timer > 0 ? (
                      <span className="text-[#7F7265]">
                        Resend OTP in 0:{timer < 10 ? "0" : ""}
                        {timer}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          createPendingOtp(phone, "login");
                          setDigits(["", "", "", "", "", ""]);
                          setTimer(45);
                          useToastStore.getState().show(`OTP resent. Use ${DEMO_LOGIN_OTP}.`);
                        }}
                        className="font-semibold text-[#8A3E1D]"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
