"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileDown, Printer } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminButton, AdminEmptyState } from "@/components/admin/AdminUi";
import { formatCurrency } from "@/data/mockAccount";
import {
  buildCommissionInvoice,
  COMMISSION_GST_RATE,
  PLATFORM_INVOICE_COMPANY,
} from "@/lib/commissionInvoice";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function InvoiceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">{label}</p>
      <p className="text-[13px] font-semibold leading-[1.6] text-[#0F172A]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "text-[13px] font-semibold text-[#0F172A]" : "text-[13px] text-[#475569]"}>{label}</span>
      <span className={strong ? "text-[14px] font-bold text-[#0F172A]" : "text-[13px] font-semibold text-[#0F172A]"}>{value}</span>
    </div>
  );
}

export default function AdminCommissionInvoicePage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { ready, session, state } = useAdmin();
  const orderId = params?.orderId ?? "";

  const order = useMemo(
    () => state.orders.find((entry) => entry.id === orderId) ?? null,
    [state.orders, orderId]
  );
  const vendor = useMemo(
    () => state.vendors.find((entry) => entry.id === order?.vendorId || entry.slug === order?.vendorSlug) ?? null,
    [state.vendors, order]
  );
  const invoice = useMemo(
    () => (order && vendor ? buildCommissionInvoice(order, vendor) : null),
    [order, vendor]
  );

  const gstHalf = useMemo(() => (invoice ? Math.round(invoice.gstAmount / 2) : 0), [invoice]);

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    if (invoice) {
      document.title = invoice.fileName.replace(/\.pdf$/i, "");
    }
  }, [ready, session, router, invoice]);

  if (!ready) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  if (!session) {
    return null;
  }

  if (!order || !vendor || !invoice) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[900px]">
          <AdminEmptyState
            title="Commission invoice unavailable"
            body="The vendor billing record could not be loaded for this order."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 md:px-6 print:bg-white print:px-0 print:py-0">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 14mm;
        }
        @media print {
          html,
          body {
            background: #ffffff !important;
          }
          #kry-invoice-a4 {
            width: 210mm !important;
            min-height: auto !important;
            margin: 0 !important;
          }
        }
      `}</style>
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-5 flex justify-end gap-3 print:hidden">
          <AdminButton variant="secondary" onClick={() => window.print()} className="h-10 px-4">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </AdminButton>
          <AdminButton variant="secondary" onClick={() => window.print()} className="h-10 px-4">
            <FileDown className="mr-2 h-4 w-4" />
            Save as PDF
          </AdminButton>
        </div>

        <section
          id="kry-invoice-a4"
          className="mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-hidden rounded-[10px] border border-[#D7DEE7] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] print:min-h-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        >
          <div className="border-b border-[#E2E8F0] px-8 py-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-3">
                <div>
                  <p className="text-[24px] font-black tracking-[-0.03em] text-[#0F172A]">{PLATFORM_INVOICE_COMPANY.brandName}</p>
                  <p className="text-[13px] font-semibold text-[#334155]">{PLATFORM_INVOICE_COMPANY.legalName}</p>
                </div>
                <div className="grid gap-1 text-[13px] leading-[1.7] text-[#334155]">
                  <p>GSTIN: {PLATFORM_INVOICE_COMPANY.gstin}</p>
                  <p>CIN: {PLATFORM_INVOICE_COMPANY.cin}</p>
                  <p>Email: {PLATFORM_INVOICE_COMPANY.email}</p>
                  <p>{PLATFORM_INVOICE_COMPANY.addressLines.join(", ")}</p>
                </div>
              </div>

              <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-5 py-5 text-right">
                <p className="text-[34px] font-black tracking-[-0.04em] text-[#0F172A]">TAX INVOICE</p>
                <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">Platform Commission Invoice</p>
                <div className="mt-5 space-y-2 text-[13px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748B]">Invoice No</span>
                    <span className="font-bold text-[#0F172A]">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748B]">Date</span>
                    <span className="font-semibold text-[#0F172A]">{invoice.invoiceDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748B]">Place of Supply</span>
                    <span className="font-semibold text-[#0F172A]">{invoice.placeOfSupply}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#64748B]">Reverse Charge</span>
                    <span className="font-semibold text-[#0F172A]">{invoice.reverseCharge}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F172A]">Bill To</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InvoiceField label="Vendor Name" value={vendor.name} />
                  <InvoiceField label="Business Name" value={vendor.name} />
                  <InvoiceField label="Contact Person" value={vendor.ownerName} />
                  <InvoiceField label="Phone Number" value={vendor.phone} />
                  <InvoiceField label="Email" value={vendor.email} />
                  <InvoiceField label="Vendor GST Number" value={vendor.gstNumber || "Not Available"} />
                  <InvoiceField label="Locality" value={vendor.locality} />
                  <InvoiceField label="City / State" value={`${vendor.city}, Rajasthan`} />
                  <InvoiceField label="Pincode" value={vendor.pincode} />
                  <div className="sm:col-span-2">
                    <InvoiceField label="Full Billing Address" value={vendor.address} />
                  </div>
                </div>
              </section>

              <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F172A]">Booking Context</p>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="Order ID" value={order.id} />
                  <SummaryRow label="Booking ID" value={order.id} />
                  <SummaryRow label="Customer Name" value={order.customer.name} />
                  <SummaryRow label="Event Date" value={formatDate(order.eventDate)} />
                  <SummaryRow label="Package Name" value={order.packageName} />
                  <SummaryRow label="Vendor Name" value={vendor.name} />
                  <SummaryRow label="Gross Booking Amount" value={formatCurrency(invoice.principalAmount)} strong />
                </div>
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-[10px] border border-[#E2E8F0]">
              <div className="grid grid-cols-[68px_minmax(0,1fr)_160px_110px_140px_160px] bg-[#0F172A] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                <span>Sr. No.</span>
                <span>Description</span>
                <span className="text-right">Taxable Amount</span>
                <span className="text-right">GST Rate</span>
                <span className="text-right">GST Amount</span>
                <span className="text-right">Total Amount</span>
              </div>
              <div className="grid grid-cols-[68px_minmax(0,1fr)_160px_110px_140px_160px] border-t border-[#E2E8F0] px-5 py-5 text-[14px] text-[#334155]">
                <span className="font-semibold text-[#0F172A]">01</span>
                <div>
                  <p className="font-bold text-[#0F172A]">{invoice.lineDescription}</p>
                  <p className="mt-1 text-[12px] leading-[1.6] text-[#64748B]">
                    Commission charged as per agreed vendor commercial terms
                  </p>
                </div>
                <span className="text-right font-semibold text-[#0F172A]">{formatCurrency(invoice.commissionAmount)}</span>
                <span className="text-right">{Math.round(COMMISSION_GST_RATE * 100)}%</span>
                <span className="text-right font-semibold text-[#0F172A]">{formatCurrency(invoice.gstAmount)}</span>
                <span className="text-right font-semibold text-[#0F172A]">{formatCurrency(invoice.totalPayable)}</span>
              </div>
            </section>

            <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Terms</p>
                  <ol className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-[1.7] text-[#334155]">
                    {invoice.terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ol>
                </section>

                <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Amount in Words</p>
                  <p className="mt-3 text-[15px] font-semibold leading-[1.8] text-[#0F172A]">{invoice.amountInWords}</p>
                </section>
              </div>

              <section className="rounded-[10px] border border-[#E2E8F0] bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">Invoice Summary</p>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="Taxable Value" value={formatCurrency(invoice.commissionAmount)} />
                  <SummaryRow label="CGST @ 9%" value={formatCurrency(gstHalf)} />
                  <SummaryRow label="SGST @ 9%" value={formatCurrency(invoice.gstAmount - gstHalf)} />
                </div>
                <div className="mt-5 border-t border-[#E2E8F0] pt-4">
                  <SummaryRow label="Grand Total" value={formatCurrency(invoice.totalPayable)} strong />
                </div>
              </section>
            </div>

            <section className="mt-8 flex items-end justify-between gap-6 border-t border-[#E2E8F0] pt-8">
              <div className="max-w-[420px] text-[12px] leading-[1.7] text-[#64748B]">
                <p className="font-semibold text-[#334155]">For {PLATFORM_INVOICE_COMPANY.legalName}</p>
                <p>This is a system-generated invoice and does not require physical signature.</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#64748B]">Authorized Signatory</p>
                <div className="mt-10 h-px w-[180px] bg-[#94A3B8]" />
                <p className="mt-2 text-[13px] font-semibold text-[#0F172A]">{PLATFORM_INVOICE_COMPANY.brandName}</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
