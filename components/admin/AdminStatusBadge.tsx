"use client";

import clsx from "clsx";
import { getAdminPaymentMeta, getAdminStatusMeta, type AdminOrderStatus, type AdminPaymentStatus } from "@/data/mockAdmin";

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
        "inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-bold",
        meta.chipClass,
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
        "inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-bold",
        meta.chipClass,
        compact && "px-2.5 py-1 text-[11px]"
      )}
    >
      {meta.label}
    </span>
  );
}
