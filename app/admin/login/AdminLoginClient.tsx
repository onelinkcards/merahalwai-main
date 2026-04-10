"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/data/mockAdmin";

const ACCESS_RULES = [
  "Booking requests, vendors, billing, and reports are controlled from this console.",
  "Only internal admins can change order states, vendor pricing, and payment follow-up.",
  "Every booking action should stay consistent with the customer-facing flow.",
];

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, session } = useAdmin();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirect = useMemo(() => searchParams.get("redirect") || "/admin", [searchParams]);

  useEffect(() => {
    if (session) {
      router.replace(redirect);
    }
  }, [session, redirect, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      router.replace(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EEF3F8] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <Link
          href="/caterers"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#CFD8E3] bg-white px-4 text-[13px] font-bold text-[#0F172A] shadow-[0_10px_18px_rgba(15,23,42,0.05)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_460px]">
          <section className="hidden rounded-[28px] border border-[#D9E1EC] bg-[linear-gradient(180deg,#101828_0%,#182230_100%)] p-8 text-white shadow-[0_18px_42px_rgba(15,23,42,0.18)] lg:block">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/10">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.24em] text-[#94A3B8]">
              Internal Console
            </p>
            <h1 className="mt-3 max-w-[520px] text-[42px] font-black tracking-[-0.05em] text-white">
              MeraHalwai admin access
            </h1>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.8] text-[#CBD5E1]">
              This panel is for operations control only. Use it to manage booking lifecycle, vendor responses,
              invoices, payouts, and production configuration.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/10">
                    <Workflow className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">Coverage</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">Orders, vendors, billing, reports</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/10">
                    <LockKeyhole className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">Access</p>
                    <p className="mt-1 text-[15px] font-semibold text-white">Protected internal operations only</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {ACCESS_RULES.map((rule) => (
                <div
                  key={rule}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] leading-[1.7] text-[#E2E8F0]"
                >
                  {rule}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#D9E1EC] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.08)] md:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#D9E1EC] bg-[#F8FAFC] text-[#0F172A]">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Admin Login</p>
            <h2 className="mt-3 text-[34px] font-black tracking-[-0.05em] text-[#0F172A]">Sign in</h2>
            <p className="mt-3 text-[15px] leading-[1.75] text-[#5B6574]">
              Use admin credentials to access booking operations, vendor controls, payment workflow, and system settings.
            </p>

            <div className="mt-6 rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Demo credentials</p>
              <div className="mt-3 space-y-1 text-[14px]">
                <p className="font-semibold text-[#0F172A]">{ADMIN_EMAIL}</p>
                <p className="text-[#64748B]">Password: {ADMIN_PASSWORD}</p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-[14px] border border-[#CBD5E1] bg-white px-4 text-[15px] font-medium text-[#0F172A] outline-none transition focus:border-[#64748B] focus:ring-2 focus:ring-[#E2E8F0]"
                  placeholder="admin@merahalwai.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-[14px] border border-[#CBD5E1] bg-white px-4 pr-14 text-[15px] font-medium text-[#0F172A] outline-none transition focus:border-[#64748B] focus:ring-2 focus:ring-[#E2E8F0]"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-[#64748B]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-[14px] border border-[#F1C7CE] bg-[#FFF1F3] px-4 py-3 text-[13px] font-medium text-[#BE123C]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0F172A] px-5 text-[15px] font-black text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign in to Admin Panel
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
