"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminOrderStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  AdminEmptyState,
  AdminInfoGrid,
  AdminLinkButton,
  AdminMetricCard,
  AdminPanel,
  AdminTableCard,
} from "@/components/admin/AdminUi";
import { formatCurrency } from "@/data/mockAccount";
import { getAdminDisplayStatus } from "@/data/mockAdmin";
import { getCustomerFacingBillSummary } from "@/lib/calculateBill";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { state } = useAdmin();
  const customer = useMemo(() => state.customers.find((entry) => entry.id === params?.id) ?? null, [params?.id, state.customers]);
  const orders = useMemo(() => state.orders.filter((order) => order.customerId === params?.id), [params?.id, state.orders]);
  const openOrders = orders.filter((order) =>
    ["notConfirmed", "paymentPending"].includes(getAdminDisplayStatus(order.status))
  ).length;

  if (!customer) {
    return (
      <AdminShell title="Customer not found" description="The selected customer profile could not be loaded.">
        <AdminEmptyState title="Customer record unavailable" body="This customer could not be found in the current admin state." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={customer.name}
      description="Customer identity, saved addresses, booking history, and support context in one internal view."
      actions={
        <div className="flex flex-wrap gap-3">
          <a
            href={`tel:${customer.phone.replace(/\D/g, "")}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a
            href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-bold text-[#0F172A]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard label="Total Orders" value={String(customer.totalOrders)} helper="Customer booking count" />
          <AdminMetricCard label="Need Follow-up" value={String(openOrders)} helper="Not confirmed or payment pending" tone="amber" />
          <AdminMetricCard label="Lifetime Spend" value={formatCurrency(customer.lifetimeSpend)} helper="Across all bookings" tone="green" />
          <AdminMetricCard label="Account Status" value={customer.status === "active" ? "Active" : "Blocked"} helper={customer.authType.toUpperCase()} tone={customer.status === "active" ? "blue" : "rose"} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <AdminPanel
              eyebrow="Customer"
              title="Profile Details"
              description="Identity and access metadata synced to account and booking history."
            >
              <AdminInfoGrid
                columns={3}
                items={[
                  { label: "Full Name", value: customer.name },
                  { label: "Phone", value: customer.phone },
                  { label: "Email", value: customer.email },
                  { label: "WhatsApp", value: customer.whatsapp },
                  { label: "Auth Type", value: customer.authType.toUpperCase() },
                  { label: "Status", value: customer.status },
                ]}
              />
            </AdminPanel>

            <AdminPanel
              eyebrow="Address Book"
              title="Saved Addresses"
              description="Frequently used venue snippets stored for faster booking details autofill."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {customer.savedAddresses.map((address) => (
                  <div key={address.id} className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-bold text-[#0F172A]">{address.label}</p>
                      <span className="rounded-full border border-[#D7E3F4] bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                        {address.city}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] font-semibold text-[#0F172A]">{address.venueName}</p>
                    <p className="mt-2 text-[13px] leading-[1.7] text-[#5B6574]">
                      {address.address}, {address.city}, {address.state} · {address.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminTableCard title="Order History" eyebrow="Bookings">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                    <tr>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Vendor</th>
                      <th className="px-5 py-4">Event</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EDF4] text-[14px] text-[#0F172A]">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{order.id}</p>
                          <p className="mt-1 text-[12px] text-[#64748B]">{order.packageName}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{order.vendorName}</p>
                          <p className="mt-1 text-[12px] text-[#64748B]">{order.foodPreference === "veg" ? "Pure Veg" : "Veg + Non-Veg"}</p>
                        </td>
                        <td className="px-5 py-4">{order.eventType}</td>
                        <td className="px-5 py-4">{order.eventDate}</td>
                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(getCustomerFacingBillSummary(order.bill).customerGrandTotal)}
                        </td>
                        <td className="px-5 py-4">
                          <AdminOrderStatusBadge status={order.status} compact />
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[12px] font-bold text-[#0F172A]"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminTableCard>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <AdminPanel eyebrow="Snapshot" title="Account Summary">
              <div className="space-y-3">
                <SummaryRow label="Last Booking" value={new Date(customer.lastBooking).toLocaleDateString("en-IN")} />
                <SummaryRow label="Saved Addresses" value={String(customer.savedAddresses.length)} />
                <SummaryRow label="Primary City" value={customer.savedAddresses[0]?.city ?? "Jaipur"} />
              </div>
            </AdminPanel>

            <AdminPanel eyebrow="Support Notes" title="Internal Notes">
              <p className="text-[14px] leading-[1.8] text-[#5B6574]">{customer.notes}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <AdminLinkButton href="/admin/orders" variant="secondary">Booking Requests</AdminLinkButton>
                <AdminLinkButton href="/admin/invoices" variant="ghost">Commission Invoices</AdminLinkButton>
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px]">
      <span className="font-medium text-[#64748B]">{label}</span>
      <span className="font-semibold text-[#0F172A]">{value}</span>
    </div>
  );
}
