"use client";

import { useMemo } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminTableCard } from "@/components/admin/AdminUi";

export default function AdminNotificationsPage() {
  const { state } = useAdmin();
  const activity = useMemo(() => state.activityFeed.slice(0, 10), [state.activityFeed]);

  return (
    <AdminShell title="Activity" description="Core order, payment, and vendor confirmation updates.">
      <AdminTableCard title="Recent activity" eyebrow="Activity">
        <div className="overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {activity.map((item) => (
                <tr key={item.id} className="text-[13px] text-[#334155]">
                  <td className="px-4 py-3 font-semibold text-[#0F172A]">{item.label}</td>
                  <td className="px-4 py-3 text-[#64748B]">{item.helper}</td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(item.at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </AdminShell>
  );
}
