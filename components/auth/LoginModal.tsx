"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolvePostAuthRedirect } from "@/lib/demoAuth";
import { useDemoAuth } from "@/components/auth/DemoAuthProvider";
import { useBookingStore } from "@/store/bookingStore";

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
  const { loginWithGoogle } = useDemoAuth();
  const selectedPackage = useBookingStore((s) => s.selectedPackage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
    }
  }, [open]);

  const finishAndContinue = (nextPath: string) => {
    onClose();
    router.push(nextPath);
  };

  const handleGoogle = () => {
    if (loading) return;
    setLoading(true);
    const next = loginWithGoogle("login");
    finishAndContinue(resolvePostAuthRedirect(next, "/book/details"));
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
          <button type="button" aria-label="Close backdrop" className="absolute inset-0" onClick={!loading ? onClose : undefined} />
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
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Booking Login</p>
                <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#161513]">Continue to booking</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F2ED] text-[#5F554B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-[24px] border border-[#E8DCCF] bg-[linear-gradient(180deg,#FFF9F1,#FFF3E4)] px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Continuing booking for</p>
                <p className="mt-1 text-[18px] font-black tracking-tight text-[#1E1E1E]">{vendorName}</p>
                <p className="mt-2 text-[13px] font-semibold text-[#6D5F51]">
                  {(packageLabel ? `${packageLabel} · ` : "") + `₹${startingFromPerPlate}/plate`}
                </p>
                <p className="mt-2 text-[12px] text-[#75695E]">
                  Continue with Google. Your email is fetched automatically and mobile setup happens next if needed.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#DDD3C5] bg-[#FCFBF9] text-[15px] font-bold text-[#1E1E1E] transition-all hover:border-[#D7C3AD] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
                {loading ? "Continuing..." : "Continue with Google"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
