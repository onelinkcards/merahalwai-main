"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminSettingsPage() {
  const { state, saveSettings } = useAdmin();
  const [draft, setDraft] = useState(state.settings);

  return (
    <AdminShell
      title="Settings"
      description="Manage platform defaults, billing settings, payment configuration, categories, and pax slabs."
      actions={
        <button
          type="button"
          onClick={() => saveSettings(draft)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white"
        >
          Save Settings
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Platform Settings">
          <Field label="Platform Name" value={draft.platformName} onChange={(value) => setDraft({ ...draft, platformName: value })} />
          <Field label="Default City" value={draft.defaultCity} onChange={(value) => setDraft({ ...draft, defaultCity: value })} />
          <Field label="Support Email" value={draft.supportEmail} onChange={(value) => setDraft({ ...draft, supportEmail: value })} />
          <Field label="Support Phone" value={draft.supportPhone} onChange={(value) => setDraft({ ...draft, supportPhone: value })} />
          <Field label="Admin Notification Email" value={draft.adminNotificationEmail} onChange={(value) => setDraft({ ...draft, adminNotificationEmail: value })} />
        </Section>

        <Section title="Billing & Payment">
          <Field label="GST Rate" value={String(draft.gstRate)} onChange={(value) => setDraft({ ...draft, gstRate: Number(value) || 0 })} />
          <Field label="Convenience Fee" value={String(draft.convenienceFee)} onChange={(value) => setDraft({ ...draft, convenienceFee: Number(value) || 0 })} />
          <Field label="Slot Hold Duration (minutes)" value={String(draft.slotHoldDurationMinutes)} onChange={(value) => setDraft({ ...draft, slotHoldDurationMinutes: Number(value) || 0 })} />
          <Field label="Payment Reminder Hours" value={String(draft.paymentReminderHours)} onChange={(value) => setDraft({ ...draft, paymentReminderHours: Number(value) || 0 })} />
          <Field label="Payment Link Provider" value={draft.paymentLinkProvider} onChange={(value) => setDraft({ ...draft, paymentLinkProvider: value })} />
        </Section>

        <Section title="Category Master">
          <div className="space-y-3">
            {draft.categoryMaster.map((category) => (
              <div key={category.key} className="rounded-[20px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-3 text-[14px] font-semibold text-[#2A251F]">
                {category.label}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Pax Slab Master">
          <div className="flex flex-wrap gap-2">
            {draft.paxSlabMaster.map((slab) => (
              <span key={slab} className="rounded-full border border-[#E2D8CC] bg-[#FCFAF7] px-4 py-2 text-[13px] font-semibold text-[#3F352D]">
                {slab}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </AdminShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
      <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-12 w-full rounded-[20px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 text-[14px] font-medium text-[#1A1815] outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
