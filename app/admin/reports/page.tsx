"use client";

import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";

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
      description="Monitor order volume, revenue, vendor performance, package mix, pending confirmation aging, and payment follow-up health."
      actions={
        <div className="flex gap-3">
          <button type="button" className="inline-flex h-11 items-center justify-center rounded-full border border-[#E6D9CB] bg-white px-5 text-[13px] font-bold text-[#3E352C]">
            Export CSV
          </button>
          <button type="button" className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white">
            Export PDF
          </button>
        </div>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Revenue", formatCurrency(totalRevenue)],
          ["Cancellation Count", String(cancellations)],
          ["Pending Confirmation Aging", String(pendingAging)],
          ["Top Customers", String(state.customers.filter((customer) => customer.totalOrders > 1).length)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[30px] border border-[#E7DED2] bg-white p-5 shadow-[0_18px_40px_rgba(24,20,16,0.05)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">{label}</p>
            <p className="mt-3 text-[30px] font-black tracking-[-0.04em] text-[#171511]">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">Vendor-wise Revenue</h2>
          <div className="mt-5 space-y-3">
            {vendorRevenue.map((vendor) => (
              <div key={vendor.name} className="flex items-center justify-between rounded-[20px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-3">
                <span className="font-semibold text-[#5D5248]">{vendor.name}</span>
                <span className="font-black text-[#171511]">{formatCurrency(vendor.revenue)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
          <h2 className="text-[24px] font-black tracking-[-0.04em] text-[#171511]">Package Usage</h2>
          <div className="mt-5 space-y-3">
            {["bronze", "silver", "gold"].map((tier) => (
              <div key={tier} className="flex items-center justify-between rounded-[20px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-3">
                <span className="font-semibold capitalize text-[#5D5248]">{tier}</span>
                <span className="font-black text-[#171511]">{state.orders.filter((order) => order.packageTier === tier).length} orders</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
