"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminProfilePage() {
  const { user } = useAdmin();
  const [password, setPassword] = useState("");

  const admin = useMemo(() => user, [user]);

  return (
    <AdminShell title="Admin Profile" description="Manage your admin identity, password preferences, and account session details.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Profile</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Name" value={admin?.name ?? ""} readOnly />
            <Field label="Email" value={admin?.email ?? ""} readOnly />
            <Field label="Access Level" value="Admin" readOnly />
            <Field label="Last Login" value={admin ? new Date(admin.lastLogin).toLocaleString("en-IN") : ""} readOnly />
          </div>
        </article>

        <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Password Change</p>
          <div className="mt-5 space-y-4">
            <Field label="New Password" value={password} onChange={setPassword} />
            <button
              type="button"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white"
            >
              Update Password
            </button>
          </div>
        </article>
      </div>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">{label}</span>
      <input
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        readOnly={readOnly}
        className="h-12 w-full rounded-[20px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 text-[14px] font-medium text-[#1A1815] outline-none"
      />
    </label>
  );
}
