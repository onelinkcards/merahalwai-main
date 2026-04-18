"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminButton, AdminTableCard } from "@/components/admin/AdminUi";
import { useAdmin } from "@/components/admin/AdminProvider";
import { buildCommissionInvoice } from "@/lib/commissionInvoice";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminInvoicesPage() {
  const { state } = useAdmin();

  const records = state.orders
    .map((order) => {
      const vendor = state.vendors.find((entry) => entry.id === order.vendorId || entry.slug === order.vendorSlug);
      if (!vendor) return null;
      return {
        order,
        vendor,
        invoice: buildCommissionInvoice(order, vendor),
      };
    })
    .filter(Boolean);

  return (
    <AdminShell
      title="Invoices"
      description="Vendor commission invoices only. Customer invoices are not managed here."
    >
      <AdminTableCard title="Vendor Commission Invoices" eyebrow="Commission Billing">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
              <tr>
                {["Invoice", "Order", "Vendor", "Principal", "Commission Total", "Action"].map((label) => (
                  <th key={label} className="px-5 py-4">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {records.map((record) => {
                if (!record) return null;
                return (
                  <tr key={record.invoice.invoiceNumber} className="text-[14px] text-[#334155]">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#0F172A]">{record.invoice.invoiceNumber}</p>
                      <p className="text-[12px] text-[#64748B]">{record.invoice.invoiceDate}</p>
                    </td>
                    <td className="px-5 py-4">{record.order.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F172A]">{record.vendor.name}</p>
                      <p className="text-[12px] text-[#64748B]">{record.vendor.gstNumber || "GST not added"}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#0F172A]">
                      {formatCurrency(record.invoice.principalAmount)}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0F172A]">
                      {formatCurrency(record.invoice.totalPayable)}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${record.order.id}/commission-invoice`} target="_blank" rel="noreferrer">
                        <AdminButton variant="ghost">View Invoice</AdminButton>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </AdminShell>
  );
}
