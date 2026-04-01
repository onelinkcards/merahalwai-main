"use client";

import clsx from "clsx";
import type { ComponentType } from "react";
import { AlertCircle, CheckCircle2, Clock3, TimerReset, WalletCards, XCircle } from "lucide-react";
import { getOrderStatusMeta, type DemoOrderStatus } from "@/data/mockAccount";

const iconMap = {
  slotHeld: TimerReset,
  pendingConfirmation: Clock3,
  confirmed: CheckCircle2,
  paymentPending: WalletCards,
  paymentDone: CheckCircle2,
  cancelled: XCircle,
} satisfies Record<DemoOrderStatus, ComponentType<{ className?: string }>>;

export default function StatusBadge({
  status,
  withHelper = false,
  compact = false,
}: {
  status: DemoOrderStatus;
  withHelper?: boolean;
  compact?: boolean;
}) {
  const meta = getOrderStatusMeta(status);
  const Icon = iconMap[status] ?? AlertCircle;

  return (
    <div className={clsx("flex flex-col gap-1.5", compact && "gap-1")}>
      <span
        className={clsx(
          "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-bold",
          meta.chipClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </span>
      {withHelper ? <p className={clsx("text-[12px] font-medium", meta.softClass, "rounded-full px-3 py-1.5")}>{meta.helper}</p> : null}
    </div>
  );
}
