"use client";

import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminPanel, AdminTextarea } from "@/components/admin/AdminUi";

const GROUPS = [
  { key: "booking", label: "Booking" },
  { key: "vendor", label: "Vendor" },
  { key: "payment", label: "Payment" },
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
      description="Operational template control for booking, vendor, payment, email, and WhatsApp events."
    >
      <AdminPanel title="Template groups" eyebrow="Channels">
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
              className={`rounded-[12px] px-4 py-2.5 text-[13px] font-bold transition ${activeGroup === group.key ? "bg-[#0F172A] text-white" : "border border-[#D9E1EC] bg-white text-[#334155] hover:bg-[#F8FAFC]"}`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </AdminPanel>

      <div className="mt-6 space-y-6">
        {templates.map((template) => (
          <AdminPanel
            key={template.id}
            title={template.name}
            eyebrow={template.channel}
            description={`Trigger: ${template.triggerEvent} · Updated ${new Date(template.lastUpdated).toLocaleDateString("en-IN")}`}
          >
            <AdminTextarea
              label="Template Body"
              value={template.body}
              onChange={(event) => saveTemplate(template.id, { body: event.target.value })}
              className="min-h-[160px]"
            />
          </AdminPanel>
        ))}
      </div>
    </AdminShell>
  );
}
