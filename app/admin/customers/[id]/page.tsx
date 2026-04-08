"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminOrderStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { state } = useAdmin();
  const customer = useMemo(() => state.customers.find((entry) => entry.id === params?.id) ?? null, [params?.id, state.customers]);
  const orders = useMemo(() => state.orders.filter((order) => order.customerId === params?.id), [params?.id, state.orders]);

  if (!customer) {
    return (
      <AdminShell title="Customer not found" description="The selected customer profile could not be loaded.">
        <div className="rounded-[30px] border border-[#E7DED2] bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(24,20,16,0.05)]">
          Customer record unavailable.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={customer.name}
      description="Customer profile, saved addresses, booking history, spend summary, and internal support context."
      actions={
        <div className="flex flex-wrap gap-3">
          <a href={`tel:${customer.phone.replace(/\D/g, "")}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E6D9CB] bg-white px-5 text-[13px] font-bold text-[#3E352C]">
            <Phone className="h-4 w-4" />
            Call
          </a>
          <a href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F6B544_0%,#E58C28_54%,#8A3E1D_100%)] px-5 text-[13px] font-bold text-white">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card title="Profile Details" eyebrow="Customer">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Name" value={customer.name} />
              <Info label="Phone" value={customer.phone} />
              <Info label="Email" value={customer.email} />
              <Info label="WhatsApp" value={customer.whatsapp} />
              <Info label="Auth Type" value={customer.authType.toUpperCase()} />
              <Info label="Status" value={customer.status} />
            </div>
          </Card>

          <Card title="Saved Addresses" eyebrow="Address Book">
            <div className="space-y-4">
              {customer.savedAddresses.map((address) => (
                <div key={address.id} className="rounded-[24px] border border-[#ECE2D6] bg-[#FCFAF7] px-5 py-4">
                  <p className="text-[16px] font-black text-[#171511]">{address.label} · {address.venueName}</p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#65594D]">
                    {address.address}, {address.city}, {address.state} · {address.pincode}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Order History" eyebrow="Bookings">
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-[24px] border border-[#ECE2D6] bg-[#FCFAF7] px-5 py-4 transition hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">{order.id}</p>
                      <p className="mt-1 text-[18px] font-black text-[#171511]">{order.vendorName}</p>
                      <p className="mt-1 text-[14px] text-[#65594D]">{order.eventType} · {order.eventDate} · {order.guests} guests</p>
                    </div>
                    <AdminOrderStatusBadge status={order.status} compact />
                  </div>
                  <p className="mt-3 text-[15px] font-bold text-[#171511]">{formatCurrency(order.bill.finalTotal)}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card title="Account Summary" eyebrow="Snapshot">
            <div className="space-y-3">
              <Summary label="Total Orders" value={String(customer.totalOrders)} />
              <Summary label="Lifetime Spend" value={formatCurrency(customer.lifetimeSpend)} />
              <Summary label="Last Booking" value={new Date(customer.lastBooking).toLocaleDateString("en-IN")} />
            </div>
          </Card>

          <Card title="Notes" eyebrow="Internal">
            <p className="text-[14px] leading-[1.8] text-[#65594D]">{customer.notes}</p>
          </Card>
        </aside>
      </div>
    </AdminShell>
  );
}

function Card({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[32px] border border-[#E7DED2] bg-white p-6 shadow-[0_20px_44px_rgba(24,20,16,0.05)]">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">{eyebrow}</p>
      <h2 className="mt-2 text-[26px] font-black tracking-[-0.04em] text-[#171511]">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9E8368]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-[#171511]">{value}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[#ECE2D6] bg-[#FCFAF7] px-4 py-3">
      <span className="font-semibold text-[#5D5248]">{label}</span>
      <span className="font-bold text-[#171511]">{value}</span>
    </div>
  );
}
