"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyStep3Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/book/basics");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#FFFAF5] text-[13px] text-[#8B7355]">
      Redirecting to booking…
    </div>
  );
}
