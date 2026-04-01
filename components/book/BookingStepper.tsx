import { Check } from "lucide-react";

const STEPS = ["Basics", "Menu", "Details", "Review", "Done"] as const;

export default function BookingStepper({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="sticky top-0 z-40 border-b border-stone-200 bg-white/92 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center overflow-x-auto rounded-[22px] border border-stone-200 bg-[#FBF9F6] px-3 py-3 shadow-[0_12px_28px_rgba(35,25,20,0.04)]">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < current;
          const isActive = stepNumber === current;

          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center px-2">
                <div
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold shadow-sm transition-colors " +
                    (isDone
                      ? "border-[#8A3E1D] bg-[#8A3E1D] text-white"
                      : isActive
                        ? "border-[#EB8B23] bg-[#EB8B23] text-white"
                        : "border-stone-300 bg-stone-50 text-stone-500")
                  }
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={
                    "mt-1 whitespace-nowrap text-[11px] font-semibold " +
                    (isActive ? "text-[#8A3E1D]" : isDone ? "text-[#8A3E1D]" : "text-stone-500")
                  }
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <div className="mx-1 h-px w-6 flex-shrink-0 bg-stone-200 sm:w-12" />
              ) : null}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
