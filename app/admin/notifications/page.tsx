"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";

const GROUPS = [
  { key: "booking", label: "Booking Notifications" },
  { key: "vendor", label: "Vendor Notifications" },
  { key: "payment", label: "Payment Notifications" },
  { key: "emailTemplates", label: "Email Templates" },
  { key: "whatsappTemplates", label: "WhatsApp Templates" },
] as const;

export default function AdminNotificationsPage() {
  const { state, saveTemplate } = useAdmin();
  const [activeGroup, setActiveGroup] = useState<(typeof GROUPS)[number]["key"]>("booking");
  const templates = useMemo(() => state.templates.filter((template) => template.group === activeGroup), [activeGroup, state.templates]);

  return (
    <AdminShell
      title="Notifications"
      description="Manage booking, vendor, payment, email, and WhatsApp communication templates from one place."
    >
      <section className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
        <div className="flex flex-wrap gap-3">
          {GROUPS.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
              className={`rounded-full px-5 py-3 text-[13px] font-bold ${activeGroup === group.key ? "bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] text-white" : "border border-[#E8DDD0] bg-[#FCFAF7] text-[#4B4138]"}`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {templates.map((template) => (
          <article key={template.id} className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">{template.channel}</p>
                <h2 className="mt-2 text-[24px] font-black tracking-[-0.04em] text-[#171511]">{template.name}</h2>
                <p className="mt-2 text-[14px] text-[#6B6055]">Trigger: {template.triggerEvent}</p>
              </div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8A7C6B]">
                Updated {new Date(template.lastUpdated).toLocaleDateString("en-IN")}
              </p>
            </div>
            <textarea
              value={template.body}
              onChange={(event) => saveTemplate(template.id, { body: event.target.value })}
              className="mt-5 min-h-[140px] w-full rounded-[24px] border border-[#E8DDD0] bg-[#FCFAF7] px-4 py-4 text-[14px] leading-[1.8] text-[#1A1815] outline-none"
            />
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
