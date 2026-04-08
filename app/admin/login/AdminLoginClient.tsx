"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/data/mockAdmin";

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
    setError("");
    setSubmitting(true);

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
    <main className="min-h-screen bg-[#F5F5F5] px-4 py-8">
      <div className="mx-auto max-w-[520px]">
        <Link
          href="/caterers"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E6E6E6] bg-white px-5 text-[13px] font-bold text-[#111111]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mt-8">
          <section className="rounded-[28px] border border-[#E6E6E6] bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.08)] md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#111111] text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.2em] text-[#111111]">Admin Login</p>
            <h2 className="mt-3 text-[32px] font-black tracking-[-0.04em] text-[#111111]">Welcome back</h2>
            <p className="mt-3 text-[15px] leading-[1.7] text-[#4F4F4F]">
              Sign in to manage booking requests, vendors, invoices, and settings.
            </p>

            <div className="mt-6 rounded-[18px] border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#111111]">Demo Access</p>
              <p className="mt-2 text-[15px] font-black text-[#111111]">{ADMIN_EMAIL}</p>
              <p className="mt-1 text-[13px] font-medium text-[#666666]">Password: {ADMIN_PASSWORD}</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#111111]">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-[14px] border border-[#E6E6E6] bg-white px-4 text-[15px] font-medium text-[#111111] outline-none transition focus:border-[#111111]"
                  placeholder="admin@merahalwai.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#111111]">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-[14px] border border-[#E6E6E6] bg-white px-4 pr-14 text-[15px] font-medium text-[#111111] outline-none transition focus:border-[#111111]"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-[#666666]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {error ? (
                <div className="rounded-[14px] border border-[#F2B3B3] bg-[#FFF1F1] px-4 py-3 text-[13px] font-medium text-[#B34A4A]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#111111] px-5 text-[15px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Login to Admin Panel
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-[13px] font-medium text-[#666666]">
              <span>Forgot password</span>
              <span className="rounded-full border border-[#E6E6E6] bg-[#FAFAFA] px-3 py-1">Admin access only</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
