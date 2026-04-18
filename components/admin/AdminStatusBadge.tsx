"use client";

import clsx from "clsx";
import { getAdminPaymentMeta, getAdminStatusMeta, type AdminOrderStatus, type AdminPaymentStatus } from "@/data/mockAdmin";

function toToneClass(label: string) {
  const key = label.toLowerCase();
  if (key.includes("confirmed") || key.includes("paid")) return "border-[#BBF7D0] bg-[#ECFDF5] text-[#15803D]";
  if (key.includes("cancel") || key.includes("declined")) return "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]";
  if (key.includes("pending") || key.includes("held") || key.includes("link")) return "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]";
  if (key.includes("not started") || key.includes("expired")) return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
  return "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]";
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
        "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]",
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
        "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]",
        toToneClass(meta.label),
        compact && "px-2.5 py-1 text-[11px]"
      )}
    >
      {meta.label}
    </span>
  );
}
