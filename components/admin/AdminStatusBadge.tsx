"use client";

import clsx from "clsx";
import { getAdminPaymentMeta, getAdminStatusMeta, type AdminOrderStatus, type AdminPaymentStatus } from "@/data/mockAdmin";

function toToneClass(label: string) {
  const key = label.toLowerCase();
  if (key.includes("confirmed") || key.includes("paid")) return "border-[#D3E2D8] bg-[#F4FAF6] text-[#166534]";
  if (key.includes("cancel") || key.includes("declined")) return "border-[#E7D7DB] bg-[#FBF4F5] text-[#9F1239]";
  if (key.includes("pending") || key.includes("held") || key.includes("link")) return "border-[#E6DDCB] bg-[#FBF8F2] text-[#8A5A12]";
  if (key.includes("not started") || key.includes("expired")) return "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]";
  return "border-[#D8E3F0] bg-[#F4F7FB] text-[#1D4ED8]";
}

export function AdminOrderStatusBadge({
  status,
  compact = false,
}: {
  status: AdminOrderStatus;
  compact?: boolean;
}) {
  const meta = getAdminStatusMeta(status);
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]",
        toToneClass(meta.label),
        compact && "px-2.5 py-1 text-[11px]"
      )}
    >
      {meta.label}
    </span>
  );
}

export function AdminPaymentStatusBadge({
  status,
  compact = false,
}: {
  status: AdminPaymentStatus;
  compact?: boolean;
}) {
  const meta = getAdminPaymentMeta(status);
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]",
        toToneClass(meta.label),
        compact && "px-2.5 py-1 text-[11px]"
      )}
    >
      {meta.label}
    </span>
  );
}
