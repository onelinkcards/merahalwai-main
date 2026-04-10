import { Suspense } from "react";
import AdminLoginClient from "@/app/admin/login/AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#EEF3F8] px-4 py-8">
          <div className="mx-auto max-w-[520px] rounded-[28px] border border-[#D9E1EC] bg-white p-8 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            <p className="text-[14px] font-semibold text-[#0F172A]">Loading admin login…</p>
          </div>
        </main>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
