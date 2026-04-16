"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { AdminButton, AdminEmptyState } from "@/components/admin/AdminUi";
import { formatCurrency } from "@/data/mockAccount";
import {
  buildCommissionInvoice,
  COMMISSION_GST_RATE,
  PLATFORM_INVOICE_COMPANY,
} from "@/lib/commissionInvoice";

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

  const handleDownloadPdf = useCallback(async () => {
    if (!invoice) return;
    const target = document.getElementById("invoice-print-area");
    if (!target) return;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imageData, "PNG", 10, 10, pageWidth, pageHeight);
    pdf.save(invoice.fileName);
  }, [invoice]);

  if (!ready) {
    return <div className="min-h-screen bg-[#F3F4F6]" />;
  }

  if (!session) {
    return null;
  }

  if (!order || !vendor || !invoice) {
    return (
      <main className="min-h-screen bg-[#F3F4F6] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-6">
            <Link href="/admin/orders" className="inline-flex">
              <AdminButton variant="secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </AdminButton>
            </Link>
          </div>
          <AdminEmptyState
            title="Commission invoice unavailable"
            body="The related admin order or vendor billing record could not be loaded."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEF2F6] print:bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-8 print:px-0 print:py-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/orders/${order.id}`} className="inline-flex">
              <AdminButton variant="secondary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Order
              </AdminButton>
            </Link>
            <AdminButton variant="secondary" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </AdminButton>
            <AdminButton onClick={() => void handleDownloadPdf()}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </AdminButton>
          </div>
          <div className="rounded-[14px] border border-[#D5DAE2] bg-white px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">Vendor Billing</p>
            <p className="mt-1 text-[15px] font-bold text-[#111827]">{vendor.name}</p>
          </div>
        </div>

        <div
          id="invoice-print-area"
          className="mx-auto max-w-[210mm] overflow-hidden rounded-[22px] border border-[#D5DAE2] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)] print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        >
          <div className="border-b border-[#E5E7EB] bg-[#FAFBFC] px-8 py-7">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#6B7280]">
                  {PLATFORM_INVOICE_COMPANY.brandName}
                </p>
                <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em] text-[#111827]">TAX INVOICE</h1>
                <p className="mt-2 text-[14px] font-medium text-[#4B5563]">Platform Commission Invoice</p>
              </div>

              <div className="rounded-[18px] border border-[#D5DAE2] bg-white px-5 py-4">
                <div className="space-y-3 text-[13px] text-[#374151]">
                  <InvoiceMetaRow label="Invoice Number" value={invoice.invoiceNumber} />
                  <InvoiceMetaRow label="Invoice Date" value={invoice.invoiceDate} />
                  <InvoiceMetaRow label="Place of Supply" value={invoice.placeOfSupply} />
                  <InvoiceMetaRow label="Reverse Charge" value={invoice.reverseCharge} />
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-[18px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Issued By</p>
                <div className="mt-3 space-y-1.5 text-[14px] leading-[1.7] text-[#374151]">
                  <p className="font-bold text-[#111827]">{PLATFORM_INVOICE_COMPANY.brandName}</p>
                  <p>{PLATFORM_INVOICE_COMPANY.legalName}</p>
                  <p>GSTIN: {PLATFORM_INVOICE_COMPANY.gstin}</p>
                  <p>CIN: {PLATFORM_INVOICE_COMPANY.cin}</p>
                  <p>Email: {PLATFORM_INVOICE_COMPANY.email}</p>
                  <p>Constitution: {PLATFORM_INVOICE_COMPANY.constitution}</p>
                  <p>Registration Type: {PLATFORM_INVOICE_COMPANY.registrationType}</p>
                  <p>Date of Incorporation: {PLATFORM_INVOICE_COMPANY.incorporationDate}</p>
                  <p>GST Certificate Issue Date: {PLATFORM_INVOICE_COMPANY.gstCertificateIssueDate}</p>
                  <p>{PLATFORM_INVOICE_COMPANY.addressLines.join(", ")}</p>
                </div>
              </section>

              <section className="rounded-[18px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Bill To</p>
                <div className="mt-3 space-y-1.5 text-[14px] leading-[1.7] text-[#374151]">
                  <p className="font-bold text-[#111827]">{vendor.name}</p>
                  <p>Business Name: {vendor.name}</p>
                  <p>Contact Person: {vendor.ownerName}</p>
                  <p>Phone: {vendor.phone}</p>
                  <p>Email: {vendor.email}</p>
                  <p>Address: {vendor.address}</p>
                  <p>City: {vendor.city}</p>
                  <p>State: Rajasthan</p>
                  <p>Pincode: {vendor.pincode}</p>
                  <p>Vendor GST Number: —</p>
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-[18px] border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Booking Reference</p>
              </div>
              <div className="grid gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
                <ReferenceItem label="Order ID" value={order.id} />
                <ReferenceItem label="Booking ID" value={order.id} />
                <ReferenceItem label="Customer Name" value={order.customer.name} />
                <ReferenceItem label="Event Date" value={order.eventDate} />
                <ReferenceItem label="Package Name" value={order.packageName} />
                <ReferenceItem label="Booking Gross Amount / Principal Amount" value={formatCurrency(invoice.principalAmount)} />
                <ReferenceItem label="Vendor Name" value={vendor.name} />
                <ReferenceItem label="Booking Reference Date" value={invoice.bookingReferenceDate} />
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-[18px] border border-[#D5DAE2]">
              <div className="grid grid-cols-[72px_minmax(0,1fr)_180px_120px_160px_180px] bg-[#F8FAFC] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">
                <span>Sr. No.</span>
                <span>Description</span>
                <span className="text-right">Taxable Amount</span>
                <span className="text-right">GST Rate</span>
                <span className="text-right">GST Amount</span>
                <span className="text-right">Total Amount</span>
              </div>
              <div className="grid grid-cols-[72px_minmax(0,1fr)_180px_120px_160px_180px] border-t border-[#E5E7EB] px-5 py-4 text-[14px] text-[#374151]">
                <span className="font-semibold text-[#111827]">01</span>
                <div>
                  <p className="font-semibold text-[#111827]">{invoice.lineDescription}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">Commission charged as per agreed vendor commercial terms</p>
                </div>
                <span className="text-right font-semibold text-[#111827]">{formatCurrency(invoice.commissionAmount)}</span>
                <span className="text-right">{Math.round(COMMISSION_GST_RATE * 100)}%</span>
                <span className="text-right font-semibold text-[#111827]">{formatCurrency(invoice.gstAmount)}</span>
                <span className="text-right font-semibold text-[#111827]">{formatCurrency(invoice.totalPayable)}</span>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-[18px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Amount in Words</p>
                  <p className="mt-3 text-[15px] font-semibold leading-[1.8] text-[#111827]">{invoice.amountInWords}</p>
                </section>

                <section className="rounded-[18px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Terms & Conditions</p>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] leading-[1.75] text-[#374151]">
                    {invoice.terms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ol>
                </section>
              </div>

              <section className="rounded-[18px] border border-[#D5DAE2] bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Summary</p>
                <div className="mt-4 space-y-3 text-[14px]">
                  <SummaryRow label="Taxable Value" value={formatCurrency(invoice.commissionAmount)} />
                  <SummaryRow label="GST Amount" value={formatCurrency(invoice.gstAmount)} />
                  <SummaryRow label="Rounded Off" value={formatCurrency(0)} />
                </div>
                <div className="mt-4 rounded-[16px] border border-[#111827] bg-[#111827] px-4 py-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Grand Total</p>
                  <p className="mt-2 text-[28px] font-black tracking-[-0.04em]">{formatCurrency(invoice.totalPayable)}</p>
                </div>
              </section>
            </div>

            <section className="mt-8 flex items-end justify-between gap-5 border-t border-[#E5E7EB] pt-8">
              <div className="text-[12px] leading-[1.7] text-[#6B7280]">
                <p className="font-semibold text-[#374151]">{PLATFORM_INVOICE_COMPANY.legalName}</p>
                <p>This is a system-generated invoice and does not require physical signature.</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">For {PLATFORM_INVOICE_COMPANY.legalName}</p>
                <div className="mt-10 h-px w-[180px] bg-[#9CA3AF]" />
                <p className="mt-2 text-[13px] font-semibold text-[#111827]">Authorized Signatory</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function InvoiceMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#6B7280]">{label}</span>
      <span className="text-right font-semibold text-[#111827]">{value}</span>
    </div>
  );
}

function ReferenceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-[14px] font-semibold leading-[1.6] text-[#111827]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-semibold text-[#111827]">{value}</span>
    </div>
  );
}
