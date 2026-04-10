"use client";

import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";
import { AdminButton, AdminMetricCard, AdminPanel } from "@/components/admin/AdminUi";

export default function AdminReportsPage() {
  const { state } = useAdmin();

  const totalRevenue = state.orders
    .filter((order) => ["paymentDone", "bookingConfirmed"].includes(order.status))
    .reduce((sum, order) => sum + order.bill.finalTotal, 0);
  const cancellations = state.orders.filter((order) => ["cancelled", "vendorDeclined", "expired"].includes(order.status)).length;
  const pendingAging = state.orders.filter((order) => ["bookingRequestSubmitted", "slotHeld", "pendingAdminReview"].includes(order.status)).length;

  const vendorRevenue = state.vendors.map((vendor) => ({
    name: vendor.name,
    revenue: state.orders.filter((order) => order.vendorId === vendor.id).reduce((sum, order) => sum + order.bill.finalTotal, 0),
  }));

  return (
    <AdminShell
      title="Reports"
      description="High-level ops reporting for revenue, cancellations, package mix, and vendor performance."
      actions={
        <div className="flex gap-3">
          <AdminButton variant="secondary">Export CSV</AdminButton>
          <AdminButton>Export PDF</AdminButton>
        </div>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} tone="green" />
        <AdminMetricCard label="Cancellation Count" value={String(cancellations)} tone="rose" />
        <AdminMetricCard label="Pending Confirmation" value={String(pendingAging)} tone="amber" />
        <AdminMetricCard label="Repeat Customers" value={String(state.customers.filter((customer) => customer.totalOrders > 1).length)} tone="blue" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Vendor-wise revenue" eyebrow="Breakdown">
          <div className="space-y-3">
            {vendorRevenue.map((vendor) => (
              <div key={vendor.name} className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <span className="font-medium text-[#334155]">{vendor.name}</span>
                <span className="font-bold text-[#0F172A]">{formatCurrency(vendor.revenue)}</span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Package usage" eyebrow="Mix">
          <div className="space-y-3">
            {["bronze", "silver", "gold"].map((tier) => (
              <div key={tier} className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <span className="font-medium capitalize text-[#334155]">{tier}</span>
                <span className="font-bold text-[#0F172A]">{state.orders.filter((order) => order.packageTier === tier).length} orders</span>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
