"use client";

import clsx from "clsx";
import Link, { type LinkProps } from "next/link";
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
        "rounded-[18px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] md:p-6",
        className
      )}
    >
      {title || eyebrow || action ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#0F172A]">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-[760px] text-[14px] leading-[1.65] text-[#64748B]">{description}</p> : null}
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
    slate: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
    blue: "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]",
    green: "bg-[#ECFDF5] text-[#16A34A] border-[#BBF7D0]",
    amber: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    rose: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  } as const;

  return (
    <article className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
          <p className="mt-3 text-[28px] font-black tracking-[-0.04em] text-[#0F172A]">{value}</p>
          {helper ? <p className="mt-2 text-[13px] text-[#64748B]">{helper}</p> : null}
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
        adminButtonStyles(variant),
        className
      )}
    />
  );
}

export function AdminLinkButton({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }) {
  return (
    <Link
      href={href}
      {...props}
      className={clsx(adminButtonStyles(variant), className)}
    >
      {children}
    </Link>
  );
}

export function adminButtonStyles(variant: "primary" | "secondary" | "ghost" | "danger" = "primary") {
  return clsx(
    "inline-flex h-9 items-center justify-center rounded-[12px] border px-3.5 text-[13px] font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "border-[#2563EB] bg-[#2563EB] text-white hover:border-[#1D4ED8] hover:bg-[#1D4ED8]",
    variant === "secondary" && "border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]",
    variant === "ghost" && "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]",
    variant === "danger" && "border-[#EF4444] bg-[#EF4444] text-white hover:bg-[#DC2626]"
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
          "h-11 w-full rounded-[12px] border border-[#E2E8F0] bg-white px-3.5 text-[14px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]",
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
          "h-11 w-full rounded-[12px] border border-[#E2E8F0] bg-white px-3.5 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]",
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
          "min-h-[120px] w-full rounded-[12px] border border-[#E2E8F0] bg-white px-3.5 py-3 text-[14px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE]",
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
        <div key={`${item.label}-${item.value}`} className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">{item.label}</p>
          <p className="mt-2 text-[15px] font-semibold leading-[1.55] text-[#0F172A]">{item.value || "—"}</p>
          {item.helper ? <p className="mt-2 text-[12px] text-[#64748B]">{item.helper}</p> : null}
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
    <div className="overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] px-5 py-5">
        <div>
          {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">{eyebrow}</p> : null}
          <h2 className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#0F172A]">{title}</h2>
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
    <div className="rounded-[18px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-6 py-12 text-center">
      <p className="text-[18px] font-bold text-[#0F172A]">{title}</p>
      <p className="mx-auto mt-2 max-w-[480px] text-[14px] leading-[1.7] text-[#64748B]">{body}</p>
    </div>
  );
}
