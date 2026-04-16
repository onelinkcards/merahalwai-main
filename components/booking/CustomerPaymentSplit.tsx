"use client";

type CustomerPaymentSplitProps = {
  advanceAmount: number;
  remainingAmount: number;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
};

export default function CustomerPaymentSplit({
  advanceAmount,
  remainingAmount,
  title = "Payment Split",
  subtitle,
  compact = false,
  className = "",
}: CustomerPaymentSplitProps) {
  return (
    <div
      className={
        "overflow-hidden rounded-[22px] border border-[#E7D7C6] bg-[linear-gradient(180deg,#FFFBF6_0%,#FFF7ED_100%)] shadow-[0_16px_34px_rgba(35,25,20,0.06)] " +
        className
      }
    >
      <div className={"border-b border-[#EEE1D2] " + (compact ? "px-4 py-3" : "px-4 py-4 sm:px-5")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7D6853]">{title}</p>
        {subtitle ? <p className="mt-1 text-[13px] leading-6 text-[#746656]">{subtitle}</p> : null}
      </div>

      <div className={compact ? "grid gap-3 p-4" : "grid gap-3 p-4 sm:grid-cols-2 sm:px-5 sm:pb-5"}>
        <div className="rounded-[18px] border border-[#E3CEB2] bg-[linear-gradient(135deg,#FFF4E4_0%,#FFE8C5_100%)] px-4 py-4 shadow-[0_12px_26px_rgba(104,44,19,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#682C13]">
            30% now (incl. 18% tax)
          </p>
          <p className="mt-2 text-[28px] font-black tracking-tight text-[#22150D]">
            ₹{advanceAmount.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-[18px] border border-[#EBE3D7] bg-[#FBF8F3] px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8D8376]">70% at event</p>
          <p className="mt-2 text-[28px] font-black tracking-tight text-[#645D55]">
            ₹{remainingAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className={compact ? "px-4 pb-4" : "px-4 pb-4 sm:px-5 sm:pb-5"}>
        <div className="rounded-[16px] border border-[#E8DDD0] bg-white/85 px-4 py-3">
          <div className="space-y-1.5 text-[12px] leading-5 text-[#695C4D]">
            <p>30% now (incl. 18% tax)</p>
            <p>70% at event</p>
            <p>Taxes (if applicable) as per vendor invoice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
