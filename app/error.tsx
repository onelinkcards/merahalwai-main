"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[#FFFAF5] px-6 py-16 text-center">
      <h1 className="text-[20px] font-bold text-[#1E1E1E]">Something went wrong</h1>
      <p className="max-w-md text-[13px] text-[#8B7355]">
        {process.env.NODE_ENV === "development" ? error.message : "Please refresh the page or try again in a moment."}
      </p>
      {error.digest ? (
        <p className="font-mono text-[11px] text-[#8B7355]">Ref: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-[#DE903E] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#804226]"
      >
        Try again
      </button>
    </div>
  );
}
