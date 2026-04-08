"use client";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPaymentStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdmin } from "@/components/admin/AdminProvider";
import { formatCurrency } from "@/data/mockAccount";

export default function AdminInvoicesPage() {
  const { state } = useAdmin();

  return (
    <AdminShell
      title="Invoices"
      description="Review invoices, open customer invoice view, download PDFs, and resend invoice communication to customers."
    >
      <section className="space-y-3">
        {state.invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-[18px] border border-[#E3E8F0] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[200px]">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2F6FED]">{invoice.invoiceNumber}</p>
                <p className="mt-1 text-[13px] text-[#6B7480]">Order {invoice.orderId}</p>
              </div>
              <div className="min-w-[200px] text-[13px] text-[#6B7480]">
                {invoice.customerName}
              </div>
              <div className="min-w-[200px] text-[13px] text-[#6B7480]">
                {invoice.vendorName}
              </div>
              <div className="min-w-[140px] text-[14px] font-bold text-[#1C2430]">
                {formatCurrency(invoice.amount)}
              </div>
              <div className="min-w-[160px]">
                <AdminPaymentStatusBadge status={invoice.paymentStatus} compact />
              </div>
              <Link
                href={`/invoice/${invoice.orderId}`}
                className="rounded-full border border-[#D7E3F4] px-3 py-2 text-[12px] font-bold text-[#2F6FED]"
              >
                View invoice
              </Link>
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
