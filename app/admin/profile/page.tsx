"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminButton, AdminInput, AdminPanel } from "@/components/admin/AdminUi";

export default function AdminProfilePage() {
  const { user } = useAdmin();
  const [password, setPassword] = useState("");

  const admin = useMemo(() => user, [user]);

  return (
    <AdminShell title="Admin Profile" description="Identity, access visibility, and password maintenance for the current admin session.">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AdminPanel title="Profile details" eyebrow="Identity">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Name" value={admin?.name ?? ""} readOnly />
            <AdminInput label="Email" value={admin?.email ?? ""} readOnly />
            <AdminInput label="Access Level" value="Super Admin" readOnly />
            <AdminInput label="Last Login" value={admin ? new Date(admin.lastLogin).toLocaleString("en-IN") : ""} readOnly />
          </div>
        </AdminPanel>

        <AdminPanel title="Password change" eyebrow="Security">
          <div className="space-y-4">
            <AdminInput label="New Password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <AdminButton className="w-full">Update Password</AdminButton>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
