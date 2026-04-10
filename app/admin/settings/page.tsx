"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminButton, AdminInput, AdminPanel } from "@/components/admin/AdminUi";

export default function AdminSettingsPage() {
  const { state, saveSettings } = useAdmin();
  const [draft, setDraft] = useState(state.settings);

  return (
    <AdminShell
      title="Settings"
      description="Platform defaults, billing values, payment settings, category master, and pax controls."
      actions={<AdminButton onClick={() => saveSettings(draft)}>Save Settings</AdminButton>}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Platform settings" eyebrow="Core">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="Platform Name" value={draft.platformName} onChange={(event) => setDraft({ ...draft, platformName: event.target.value })} />
            <AdminInput label="Default City" value={draft.defaultCity} onChange={(event) => setDraft({ ...draft, defaultCity: event.target.value })} />
            <AdminInput label="Support Email" value={draft.supportEmail} onChange={(event) => setDraft({ ...draft, supportEmail: event.target.value })} />
            <AdminInput label="Support Phone" value={draft.supportPhone} onChange={(event) => setDraft({ ...draft, supportPhone: event.target.value })} />
            <AdminInput label="Admin Notification Email" value={draft.adminNotificationEmail} onChange={(event) => setDraft({ ...draft, adminNotificationEmail: event.target.value })} />
          </div>
        </AdminPanel>

        <AdminPanel title="Billing & payment" eyebrow="Finance">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput label="GST Rate" value={String(draft.gstRate)} onChange={(event) => setDraft({ ...draft, gstRate: Number(event.target.value) || 0 })} />
            <AdminInput label="Convenience Fee" value={String(draft.convenienceFee)} onChange={(event) => setDraft({ ...draft, convenienceFee: Number(event.target.value) || 0 })} />
            <AdminInput label="Slot Hold Duration (minutes)" value={String(draft.slotHoldDurationMinutes)} onChange={(event) => setDraft({ ...draft, slotHoldDurationMinutes: Number(event.target.value) || 0 })} />
            <AdminInput label="Payment Reminder Hours" value={String(draft.paymentReminderHours)} onChange={(event) => setDraft({ ...draft, paymentReminderHours: Number(event.target.value) || 0 })} />
            <AdminInput label="Payment Link Provider" value={draft.paymentLinkProvider} onChange={(event) => setDraft({ ...draft, paymentLinkProvider: event.target.value })} />
          </div>
        </AdminPanel>

        <AdminPanel title="Category master" eyebrow="Booking">
          <div className="grid gap-3 sm:grid-cols-2">
            {draft.categoryMaster.map((category) => (
              <div key={category.key} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] font-semibold text-[#1E293B]">
                {category.label}
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Pax slab master" eyebrow="Capacity">
          <div className="flex flex-wrap gap-2">
            {draft.paxSlabMaster.map((slab) => (
              <span key={slab} className="rounded-full border border-[#D9E1EC] bg-white px-4 py-2 text-[13px] font-semibold text-[#334155]">
                {slab}
              </span>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
