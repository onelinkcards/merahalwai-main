"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminButton, AdminInput, AdminPanel, AdminTableCard } from "@/components/admin/AdminUi";

export default function AdminCouponsPage() {
  const { state, createCoupon, updateCoupon } = useAdmin();
  const [draftCode, setDraftCode] = useState("");

  return (
    <AdminShell
      title="Coupons"
      description="Simple coupon control for booking promotions, package applicability, and active state."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminTableCard title="Coupon list" eyebrow="Promotions">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                <tr>
                  {["Code", "Type", "Value", "Min Order", "Usage", "Expiry", "Status", "Action"].map((label) => (
                    <th key={label} className="px-5 py-4">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {state.coupons.map((coupon) => (
                  <tr key={coupon.id} className="text-[14px] text-[#334155]">
                    <td className="px-5 py-4 font-bold text-[#0F172A]">{coupon.code}</td>
                    <td className="px-5 py-4">{coupon.type}</td>
                    <td className="px-5 py-4">{coupon.type === "flat" ? `₹${coupon.value}` : `${coupon.value}%`}</td>
                    <td className="px-5 py-4">₹{coupon.minOrderValue}</td>
                    <td className="px-5 py-4">{coupon.usage}</td>
                    <td className="px-5 py-4">{coupon.expiry}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${coupon.status === "active" ? "border-[#B7E4C7] bg-[#ECFDF3] text-[#166534]" : "border-[#D7DEE8] bg-[#F8FAFC] text-[#475569]"}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <AdminButton
                        variant="ghost"
                        onClick={() => updateCoupon(coupon.id, { status: coupon.status === "active" ? "inactive" : "active" })}
                      >
                        Toggle
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminTableCard>

        <AdminPanel title="Create coupon" eyebrow="New">
          <div className="space-y-4">
            <AdminInput
              label="Coupon Code"
              value={draftCode}
              onChange={(event) => setDraftCode(event.target.value.toUpperCase())}
              placeholder="NEWCODE"
            />
            <AdminButton
              className="w-full"
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
            >
              Create Coupon
            </AdminButton>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
