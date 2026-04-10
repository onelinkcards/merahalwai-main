"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export function AdminPanel({
  title,
  eyebrow,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        "rounded-[18px] border border-[#D5DAE2] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] md:p-6",
        className
      )}
    >
      {title || eyebrow || action ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#E9EDF2] pb-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#111827]">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-[760px] text-[14px] leading-[1.65] text-[#616B78]">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "slate",
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  tone?: "slate" | "blue" | "green" | "amber" | "rose";
}) {
  const toneMap = {
    slate: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
    blue: "bg-[#F1F5F9] text-[#1E3A8A] border-[#DBE6F3]",
    green: "bg-[#EEF7F1] text-[#166534] border-[#D0E5D6]",
    amber: "bg-[#FBF6ED] text-[#92400E] border-[#EADCC1]",
    rose: "bg-[#FBF1F2] text-[#9F1239] border-[#F0D6DD]",
  } as const;

  return (
    <article className="rounded-[18px] border border-[#D5DAE2] bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">{label}</p>
          <p className="mt-3 text-[28px] font-black tracking-[-0.04em] text-[#111827]">{value}</p>
          {helper ? <p className="mt-2 text-[13px] text-[#6B7280]">{helper}</p> : null}
        </div>
        {Icon ? (
          <span
            className={clsx(
              "inline-flex h-11 w-11 items-center justify-center rounded-[14px] border",
              toneMap[tone]
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function AdminButton({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex h-10 items-center justify-center rounded-[12px] border px-4 text-[13px] font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-[#111827] bg-[#111827] text-white hover:bg-[#1F2937]",
        variant === "secondary" && "border-[#D1D5DB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
        variant === "ghost" && "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563] hover:bg-[#F3F4F6]",
        variant === "danger" && "border-[#E7C8D0] bg-[#7F1D1D] text-white hover:bg-[#991B1B]",
        className
      )}
    />
  );
}

export function AdminInput({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</span>
      <input
        {...props}
        className={clsx(
          "h-11 w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3.5 text-[14px] font-medium text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#94A3B8] focus:ring-2 focus:ring-[#E5E7EB]",
          className
        )}
      />
      {hint ? <p className="mt-2 text-[12px] text-[#64748B]">{hint}</p> : null}
    </label>
  );
}

export function AdminSelect({
  label,
  hint,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</span>
      <select
        {...props}
        className={clsx(
          "h-11 w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3.5 text-[14px] font-medium text-[#111827] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#E5E7EB]",
          className
        )}
      >
        {children}
      </select>
      {hint ? <p className="mt-2 text-[12px] text-[#64748B]">{hint}</p> : null}
    </label>
  );
}

export function AdminTextarea({
  label,
  hint,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</span>
      <textarea
        {...props}
        className={clsx(
          "min-h-[120px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3.5 py-3 text-[14px] font-medium text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#94A3B8] focus:ring-2 focus:ring-[#E5E7EB]",
          className
        )}
      />
      {hint ? <p className="mt-2 text-[12px] text-[#64748B]">{hint}</p> : null}
    </label>
  );
}

export function AdminInfoGrid({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value: string; helper?: string }>;
  columns?: 2 | 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "md:grid-cols-2 xl:grid-cols-4"
      : columns === 3
        ? "md:grid-cols-2 xl:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <div className={clsx("grid gap-4", gridClass)}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="rounded-[14px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">{item.label}</p>
          <p className="mt-2 text-[15px] font-semibold leading-[1.55] text-[#111827]">{item.value || "—"}</p>
          {item.helper ? <p className="mt-2 text-[12px] text-[#6B7280]">{item.helper}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function AdminTableCard({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#D5DAE2] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E9EDF2] px-5 py-5">
        <div>
          {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">{eyebrow}</p> : null}
          <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#111827]">{title}</h2>
        </div>
        {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-12 text-center">
      <p className="text-[18px] font-bold text-[#111827]">{title}</p>
      <p className="mx-auto mt-2 max-w-[480px] text-[14px] leading-[1.7] text-[#6B7280]">{body}</p>
    </div>
  );
}
