"use client";

import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";
import { getAdminDisplayStatus } from "@/data/mockAdmin";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";
import { AdminMetricCard, AdminPanel } from "@/components/admin/AdminUi";

export default function AdminReportsPage() {
  const { state } = useAdmin();

  const closedOrders = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "confirmed");
  const totalRevenue = closedOrders.reduce(
    (sum, order) => sum + getCustomerFacingBillSummary(order.bill).customerGrandTotal,
    0
  );
  const pendingRequests = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "notConfirmed").length;
  const paymentPending = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "paymentPending").length;
  const confirmedBookings = state.orders.filter((order) => getAdminDisplayStatus(order.status) === "confirmed").length;

  return (
    <AdminShell
      title="Reports"
      description="Simple operational summary for bookings, closures, and revenue."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Closed Revenue" value={formatCurrency(totalRevenue)} tone="green" />
        <AdminMetricCard label="Not Confirmed" value={String(pendingRequests)} tone="amber" />
        <AdminMetricCard label="Payment Pending" value={String(paymentPending)} tone="blue" />
        <AdminMetricCard label="Confirmed Bookings" value={String(confirmedBookings)} tone="blue" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Vendor Performance" eyebrow="Summary">
          <div className="space-y-3">
            {state.vendors.map((vendor) => {
              const vendorOrders = state.orders.filter((order) => order.vendorId === vendor.id);
              const vendorRevenue = vendorOrders.reduce(
                (sum, order) => sum + getCustomerFacingBillSummary(order.bill).customerGrandTotal,
                0
              );
              return (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#0F172A]">{vendor.name}</p>
                    <p className="text-[12px] text-[#64748B]">{vendorOrders.length} orders</p>
                  </div>
                  <p className="text-[14px] font-bold text-[#0F172A]">{formatCurrency(vendorRevenue)}</p>
                </div>
              );
            })}
          </div>
        </AdminPanel>

        <AdminPanel title="Package Mix" eyebrow="Usage">
          <div className="space-y-3">
            {["bronze", "silver", "gold"].map((tier) => {
              const count = state.orders.filter((order) => order.packageTier === tier).length;
              return (
                <div
                  key={tier}
                  className="flex items-center justify-between rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
                >
                  <span className="text-[14px] font-medium capitalize text-[#334155]">{tier}</span>
                  <span className="text-[14px] font-bold text-[#0F172A]">{count} bookings</span>
                </div>
              );
            })}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
