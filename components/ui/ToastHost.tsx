"use client";

import { useToastStore } from "@/store/toastStore";

export default function ToastHost() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;
  return (
    <div className="fixed right-4 top-4 z-[300] max-w-sm rounded-xl border border-[#E8D5B7] bg-white px-4 py-3 text-[13px] font-semibold text-[#1E1E1E] shadow-lg">
      {message}
    </div>
  );
}
