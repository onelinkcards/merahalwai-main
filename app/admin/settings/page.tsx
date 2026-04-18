"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminButton, AdminInput, AdminPanel } from "@/components/admin/AdminUi";

export default function AdminSettingsPage() {
  const { state, saveSettings } = useAdmin();
  const [draft, setDraft] = useState(state.settings);

  const hasChanges = useMemo(
    () =>
      draft.platformName !== state.settings.platformName ||
      draft.defaultCity !== state.settings.defaultCity ||
      draft.supportEmail !== state.settings.supportEmail ||
      draft.supportPhone !== state.settings.supportPhone ||
      draft.gstRate !== state.settings.gstRate ||
      draft.slotHoldDurationMinutes !== state.settings.slotHoldDurationMinutes,
    [draft, state.settings]
  );

  return (
    <AdminShell
      title="Platform Settings"
      description="Keep only the platform values that affect live customer and admin operations."
      actions={
        <AdminButton onClick={() => saveSettings(draft)} disabled={!hasChanges}>
          Save Settings
        </AdminButton>
      }
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Platform" eyebrow="Core">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput
              label="Platform Name"
              value={draft.platformName}
              onChange={(event) => setDraft({ ...draft, platformName: event.target.value })}
            />
            <AdminInput
              label="Default City"
              value={draft.defaultCity}
              onChange={(event) => setDraft({ ...draft, defaultCity: event.target.value })}
            />
            <AdminInput
              label="Support Email"
              value={draft.supportEmail}
              onChange={(event) => setDraft({ ...draft, supportEmail: event.target.value })}
            />
            <AdminInput
              label="Support Phone"
              value={draft.supportPhone}
              onChange={(event) => setDraft({ ...draft, supportPhone: event.target.value })}
            />
          </div>
        </AdminPanel>

        <AdminPanel title="Booking & Payment" eyebrow="Live Logic">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminInput
              label="GST Rate"
              value={String(draft.gstRate)}
              onChange={(event) => setDraft({ ...draft, gstRate: Number(event.target.value) || 0 })}
            />
            <AdminInput
              label="Slot Hold Duration (minutes)"
              value={String(draft.slotHoldDurationMinutes)}
              onChange={(event) =>
                setDraft({ ...draft, slotHoldDurationMinutes: Number(event.target.value) || 0 })
              }
            />
          </div>

          <div className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-[13px] leading-[1.7] text-[#475569]">
            <p>Customer flow does not use coupons or convenience fee right now.</p>
            <p>Vendor phone is never shown to customers. Customer call and WhatsApp actions use the support phone.</p>
            <p>Payment link flow is already attached separately, so no extra provider or reminder controls are needed here.</p>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
