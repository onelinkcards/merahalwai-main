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
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
      <p className="text-[13px] font-medium leading-[1.55] text-[#0F172A]">{value}</p>
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
          margin: 5mm;
        }
        @media print {
          html,
          body {
            background: #ffffff !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #kry-invoice-a4 {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #kry-invoice-a4 section,
          #kry-invoice-a4 div,
          #kry-invoice-a4 table,
          #kry-invoice-a4 tr,
          #kry-invoice-a4 td {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          main {
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .invoice-shell {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        @media screen {
          #kry-invoice-a4 {
            width: 100%;
          }
        }
      `}</style>
      <div className="invoice-shell mx-auto max-w-[1080px]">
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
          className="mx-auto w-full max-w-[186mm] rounded-[8px] border border-[#D7DEE7] bg-white text-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.08)] print:max-w-none print:rounded-none print:border-0 print:text-[10.5px] print:shadow-none"
        >
          <div className="border-b border-[#E2E8F0] px-6 py-5 print:px-4 print:py-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_210px] print:gap-2">
              <div>
                <p className="text-[20px] font-black tracking-[-0.03em] text-[#0F172A] print:text-[16px]">{PLATFORM_INVOICE_COMPANY.brandName}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#334155] print:mt-0.5 print:text-[10px]">{PLATFORM_INVOICE_COMPANY.legalName}</p>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-black tracking-[-0.04em] text-[#0F172A] print:text-[18px]">Tax Invoice</p>
                <div className="mt-2 space-y-1 text-[12px] print:mt-1 print:space-y-0.5 print:text-[10px]">
                  <p><span className="text-[#64748B]">Invoice No:</span> <span className="font-semibold text-[#0F172A]">{invoice.invoiceNumber}</span></p>
                  <p><span className="text-[#64748B]">Invoice Date:</span> <span className="font-semibold text-[#0F172A]">{invoice.invoiceDate}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5 print:space-y-3 print:px-4 print:py-3">
            <div className="grid gap-4 md:grid-cols-2 print:gap-3">
              <section className="border border-[#E2E8F0] p-3.5 print:p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F172A] print:text-[9px]">Issued By</p>
                <div className="mt-2.5 space-y-1 text-[12px] leading-[1.5] text-[#334155] print:mt-1.5 print:space-y-0.5 print:text-[10px] print:leading-[1.35]">
                  <p className="font-semibold text-[#0F172A]">{PLATFORM_INVOICE_COMPANY.brandName}</p>
                  <p>{PLATFORM_INVOICE_COMPANY.legalName}</p>
                  <p>GSTIN: {PLATFORM_INVOICE_COMPANY.gstin}</p>
                  <p>CIN: {PLATFORM_INVOICE_COMPANY.cin}</p>
                  <p>Email: {PLATFORM_INVOICE_COMPANY.email}</p>
                  <p>{PLATFORM_INVOICE_COMPANY.addressLines.join(", ")}</p>
                </div>
              </section>

              <section className="border border-[#E2E8F0] p-3.5 print:p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F172A] print:text-[9px]">Bill To</p>
                <div className="mt-2.5 space-y-1 text-[12px] leading-[1.5] text-[#334155] print:mt-1.5 print:space-y-0.5 print:text-[10px] print:leading-[1.35]">
                  <p className="font-semibold text-[#0F172A]">{vendor.name}</p>
                  <p>{vendor.name}</p>
                  <p>{vendor.address}</p>
                  <p>{vendor.locality}, {vendor.city}, Rajasthan {vendor.pincode}</p>
                  <p>Phone: {vendor.phone}</p>
                  <p>Email: {vendor.email}</p>
                  <p>GST / Registration: {vendor.gstNumber || "Not Available"}</p>
                </div>
              </section>
            </div>

            <section className="border border-[#E2E8F0] p-3.5 print:p-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F172A] print:text-[9px]">Reference</p>
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 print:mt-1.5 print:gap-2">
                <InvoiceField label="Order ID" value={order.id} />
                <InvoiceField label="Event Date" value={formatDate(order.eventDate)} />
                <InvoiceField label="Customer Name" value={order.customer.name} />
                <InvoiceField label="Gross Booking Amount" value={formatCurrency(invoice.principalAmount)} />
              </div>
            </section>

            <section className="overflow-hidden border border-[#E2E8F0]">
              <div className="grid grid-cols-[minmax(0,1.7fr)_90px_55px_95px_105px] bg-[#0F172A] px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.11em] text-white print:grid-cols-[minmax(0,1.7fr)_78px_48px_82px_92px] print:px-2.5 print:py-2 print:text-[8px]">
                <span>Description</span>
                <span className="text-right">Commission</span>
                <span className="text-right">GST %</span>
                <span className="text-right">GST Amount</span>
                <span className="text-right">Total Payable</span>
              </div>
              <div className="grid grid-cols-[minmax(0,1.7fr)_90px_55px_95px_105px] border-t border-[#E2E8F0] px-3.5 py-3 text-[12px] text-[#334155] print:grid-cols-[minmax(0,1.7fr)_78px_48px_82px_92px] print:px-2.5 print:py-2 print:text-[10px]">
                <div className="pr-4 print:pr-2">
                  <p className="font-semibold text-[#0F172A]">Platform commission on booking order {order.id}</p>
                </div>
                <span className="text-right font-semibold text-[#0F172A]">{formatCurrency(invoice.commissionAmount)}</span>
                <span className="text-right">{Math.round(COMMISSION_GST_RATE * 100)}%</span>
                <span className="text-right font-semibold text-[#0F172A]">{formatCurrency(invoice.gstAmount)}</span>
                <span className="text-right font-semibold text-[#0F172A]">{formatCurrency(invoice.totalPayable)}</span>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px] print:gap-3 print:md:grid-cols-[minmax(0,1fr)_220px]">
              <section className="border border-[#E2E8F0] p-3.5 print:p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B] print:text-[9px]">Amount in Words</p>
                <p className="mt-2 text-[13px] font-semibold leading-[1.5] text-[#0F172A] print:mt-1.5 print:text-[10.5px] print:leading-[1.35]">{invoice.amountInWords}</p>
              </section>

              <section className="border border-[#E2E8F0] p-3.5 print:p-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B] print:text-[9px]">Summary</p>
                <div className="mt-2.5 space-y-2 print:mt-1.5 print:space-y-1.5">
                  <SummaryRow label="Taxable Value" value={formatCurrency(invoice.commissionAmount)} />
                  <SummaryRow label="GST" value={formatCurrency(invoice.gstAmount)} />
                  <SummaryRow label="Grand Total" value={formatCurrency(invoice.totalPayable)} strong />
                </div>
              </section>
            </div>

            <section className="border-t border-[#E2E8F0] pt-4 print:pt-2.5">
              <div className="text-[12px] leading-[1.6] text-[#64748B] print:text-[10px] print:leading-[1.3]">
                <p>This is a system-generated invoice.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
