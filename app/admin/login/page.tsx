import { Suspense } from "react";
import AdminLoginClient from "@/app/admin/login/AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[linear-gradient(180deg,#FFFDF9_0%,#F7F2EA_100%)] px-4 py-8">
          <div className="mx-auto max-w-[520px] rounded-[36px] border border-[#E7DED2] bg-white/95 p-8 shadow-[0_28px_90px_rgba(89,57,26,0.12)]">
            <p className="text-[14px] font-semibold text-[#8A3E1D]">Loading admin login…</p>
          </div>
        </main>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
