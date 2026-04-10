"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminButton, AdminTableCard } from "@/components/admin/AdminUi";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminInvoicesPage() {
  const { state } = useAdmin();

  return (
    <AdminShell
      title="Invoices"
      description="Invoice ledger for customer-facing bills, payment state, and operational access."
    >
      <AdminTableCard title="Invoice records" eyebrow="Billing Ledger">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
              <tr>
                {["Invoice", "Order", "Customer", "Vendor", "Amount", "Payment", "Action"].map((label) => (
                  <th key={label} className="px-5 py-4">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {state.invoices.map((invoice) => (
                <tr key={invoice.id} className="text-[14px] text-[#334155]">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#0F172A]">{invoice.invoiceNumber}</p>
                    <p className="text-[12px] text-[#64748B]">{invoice.createdDate}</p>
                  </td>
                  <td className="px-5 py-4">{invoice.orderId}</td>
                  <td className="px-5 py-4">{invoice.customerName}</td>
                  <td className="px-5 py-4">{invoice.vendorName}</td>
                  <td className="px-5 py-4 font-bold text-[#0F172A]">{formatCurrency(invoice.amount)}</td>
                  <td className="px-5 py-4"><AdminPaymentStatusBadge status={invoice.paymentStatus} compact /></td>
                  <td className="px-5 py-4">
                    <Link href={`/invoice/${invoice.orderId}`}>
                      <AdminButton variant="ghost">View invoice</AdminButton>
                    </Link>
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
