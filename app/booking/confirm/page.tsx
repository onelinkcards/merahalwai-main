"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyConfirmRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/book/review");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#FFFAF5] text-[13px] text-[#8B7355]">
      Redirecting to review…
    </div>
  );
}
