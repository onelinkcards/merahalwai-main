"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminCouponsPage() {
  const { state, createCoupon, updateCoupon } = useAdmin();
  const [draftCode, setDraftCode] = useState("");

  return (
    <AdminShell
      title="Coupons"
      description="Create and manage booking coupons with package applicability, order minimums, expiry dates, and active state."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-[32px] border border-[#E7DED2] bg-white shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#FCFAF7] text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">
                <tr>
                  {["Code", "Type", "Value", "Min Order", "Usage", "Expiry", "Status", "Actions"].map((label) => (
                    <th key={label} className="px-6 py-4">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DE]">
                {state.coupons.map((coupon) => (
                  <tr key={coupon.id} className="text-[14px] text-[#4F463E]">
                    <td className="px-6 py-5 font-bold text-[#171511]">{coupon.code}</td>
                    <td className="px-6 py-5">{coupon.type}</td>
                    <td className="px-6 py-5">{coupon.type === "flat" ? `₹${coupon.value}` : `${coupon.value}%`}</td>
                    <td className="px-6 py-5">₹{coupon.minOrderValue}</td>
                    <td className="px-6 py-5">{coupon.usage}</td>
                    <td className="px-6 py-5">{coupon.expiry}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${coupon.status === "active" ? "bg-[#EAF7ED] text-[#166534]" : "bg-[#FFF1F1] text-[#B54545]"}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => updateCoupon(coupon.id, { status: coupon.status === "active" ? "inactive" : "active" })}
                        className="rounded-full border border-[#E6D9CB] px-3 py-2 text-[12px] font-bold text-[#3E352C]"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Create Coupon</p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">Code</span>
              <input
                value={draftCode}
                onChange={(event) => setDraftCode(event.target.value.toUpperCase())}
                className="h-12 w-full rounded-[20px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 text-[14px] font-medium text-[#1A1815] outline-none"
                placeholder="NEWCODE"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (!draftCode.trim()) return;
                createCoupon({
                  id: `coupon-${draftCode.toLowerCase()}`,
                  code: draftCode.trim().toUpperCase(),
                  type: "flat",
                  value: 1500,
                  minOrderValue: 25000,
                  usage: 0,
                  expiry: "2026-05-31",
                  status: "active",
                  validFrom: "2026-04-01",
                  validTill: "2026-05-31",
                  applicablePackages: ["bronze", "silver"],
                });
                setDraftCode("");
              }}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white"
            >
              Create Coupon
            </button>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
