"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFFAF5] text-[#1E1E1E] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-[22px] font-bold">Mera Halwai — error</h1>
          <p className="max-w-md text-[13px] text-[#8B7355]">
            {process.env.NODE_ENV === "development" ? error.message : "A server error occurred. Please try again."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[#DE903E] px-6 py-3 text-[14px] font-bold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
