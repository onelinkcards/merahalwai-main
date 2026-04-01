"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import {
  formatCurrency,
  formatDateTime,
  getDemoOrderById,
  getMergedOrders,
  type DemoOrder,
} from "@/data/mockAccount";
import { useBookingStore } from "@/store/bookingStore";

export default function InvoiceClient() {
  const router = useRouter();
  const params = useParams<{ "order-id": string }>();
  const orderId = params?.["order-id"] ?? "";
  const store = useBookingStore();

  const order = useMemo<DemoOrder | null>(() => {
    return getMergedOrders(store).find((entry) => entry.id === orderId) ?? getDemoOrderById(orderId);
  }, [orderId, store]);

  const handleDownload = useCallback(async () => {
    const target = document.getElementById("invoice-print-area");
    if (!target) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(target, { scale: 2, useCORS: true });
    const dataUrl = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth() - 20;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(dataUrl, "PNG", 10, 10, width, height);
    pdf.save(`MeraHalwai-Invoice-${orderId}.pdf`);
  }, [orderId]);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F6F4EF]">
        <Navbar />
        <div className="mx-auto max-w-[720px] px-4 py-16">
          <div className="rounded-[30px] border border-[#E7DED3] bg-white px-6 py-14 text-center shadow-[0_18px_42px_rgba(24,20,16,0.05)]">
            <p className="text-[18px] font-bold text-[#1E1E1E]">Invoice unavailable</p>
            <p className="mt-2 text-[#6D6258]">This demo invoice could not be found.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-14 print:bg-white">
      <Navbar />
      <div className="mx-auto max-w-[1240px] px-4 pt-6 md:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E2D7CA] bg-white px-5 text-[13px] font-bold text-[#3E362F]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E2D7CA] bg-white px-5 text-[13px] font-bold text-[#3E362F]"
            >
              <Printer className="h-4 w-4" />
              View Invoice
            </button>
            <button
              type="button"
              onClick={() => void handleDownload()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1F1E1B] px-5 text-[13px] font-bold text-white"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div
          id="invoice-print-area"
          className="overflow-hidden rounded-[34px] border border-[#E7DED3] bg-white shadow-[0_20px_44px_rgba(24,20,16,0.05)] print:rounded-none print:border-0 print:shadow-none"
        >
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="px-6 py-7 md:px-8 md:py-8">
              <div className="flex flex-col gap-5 border-b border-[#EEE5DA] pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A3E1D]">Invoice</p>
                  <h1 className="mt-3 text-[34px] font-black tracking-[-0.03em] text-[#161513]">Tax Invoice</h1>
                  <p className="mt-2 text-[14px] text-[#6D6258]">
                    Invoice number {order.invoiceNumber ?? `INV-${order.id}`}
                  </p>
                </div>
                <div className="rounded-[24px] border border-[#EAE1D7] bg-[#FCFAF7] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Payment Status</p>
                  <p className="mt-2 text-[18px] font-black text-[#161513]">{order.paymentStatus}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Billed To</p>
                  <p className="mt-3 text-[18px] font-black text-[#1E1E1E]">{order.customer.fullName}</p>
                  <p className="mt-2 text-[14px] leading-[1.7] text-[#60574F]">{order.customer.phone}</p>
                  <p className="text-[14px] leading-[1.7] text-[#60574F]">{order.customer.email}</p>
                  <p className="text-[14px] leading-[1.7] text-[#60574F]">{order.customer.whatsapp}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Event Details</p>
                  <div className="mt-3 space-y-2 text-[14px] leading-[1.7] text-[#60574F]">
                    <p><span className="font-semibold text-[#1E1E1E]">Order ID:</span> {order.id}</p>
                    <p><span className="font-semibold text-[#1E1E1E]">Vendor:</span> {order.vendorName}</p>
                    <p><span className="font-semibold text-[#1E1E1E]">Package:</span> {order.packageName}</p>
                    <p><span className="font-semibold text-[#1E1E1E]">Event:</span> {order.eventType}</p>
                    <p><span className="font-semibold text-[#1E1E1E]">Date & Time:</span> {formatDateTime(order.eventDate, order.eventTime)}</p>
                    <p><span className="font-semibold text-[#1E1E1E]">Venue:</span> {order.venueName}, {order.venueAddress}</p>
                    <p><span className="font-semibold text-[#1E1E1E]">Guests:</span> {order.guests}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[26px] border border-[#EEE5DA]">
                <div className="grid grid-cols-[minmax(0,1fr)_160px] bg-[#FCFAF7] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#7A6E63]">
                  <span>Description</span>
                  <span className="text-right">Amount</span>
                </div>
                {[
                  ["Base Amount", order.bill.baseAmount],
                  ["Auto Add-ons", order.bill.autoAddOns],
                  ["Optional Add-ons", order.bill.optionalAddOns],
                  ["Water", order.bill.water],
                  ["Subtotal", order.bill.subtotal],
                  ["GST (18%)", order.bill.gst],
                  ["Convenience Fee", order.bill.convenienceFee],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="grid grid-cols-[minmax(0,1fr)_160px] border-t border-[#EEE5DA] px-4 py-3 text-[14px] text-[#524941]"
                  >
                    <span>{label}</span>
                    <span className="text-right font-semibold text-[#1E1E1E]">{formatCurrency(Number(value))}</span>
                  </div>
                ))}
                <div className="grid grid-cols-[minmax(0,1fr)_160px] border-t border-[#EEE5DA] bg-[#1F1E1B] px-4 py-4 text-white">
                  <span className="text-[13px] font-bold uppercase tracking-[0.14em]">Final Total</span>
                  <span className="text-right text-[20px] font-black">{formatCurrency(order.bill.finalTotal)}</span>
                </div>
              </div>

              <div className="mt-8 rounded-[26px] border border-[#EEE5DA] bg-[#FCFAF7] px-5 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Menu Snapshot</p>
                <div className="mt-4 space-y-3">
                  {order.menuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="text-[14px] font-black text-[#1E1E1E]">{group.label}</p>
                      <p className="mt-1 text-[13px] leading-[1.7] text-[#5F564E]">
                        {group.items.map((item) => item.name).join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="border-t border-[#EEE5DA] bg-[#FBF8F3] px-6 py-7 xl:border-l xl:border-t-0 md:px-8">
              <div className="rounded-[28px] border border-[#E8DED1] bg-white px-5 py-5 shadow-[0_18px_42px_rgba(24,20,16,0.04)]">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[20px] bg-[#F0E7DA]">
                    {order.vendorImage ? (
                      <Image src={order.vendorImage} alt={order.vendorName} fill className="object-cover" sizes="64px" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-black text-[#1E1E1E]">{order.vendorName}</p>
                    <p className="mt-1 text-[13px] text-[#7B7167]">{order.packageName} · {order.guests} guests</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-[#E8DED1] bg-white px-5 py-5 shadow-[0_18px_42px_rgba(24,20,16,0.04)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Actions</p>
                <div className="mt-4 space-y-3">
                  <Link
                    href={`/my-bookings/${order.id}`}
                    className="flex h-11 items-center justify-center rounded-full border border-[#E2D7CA] bg-white px-4 text-[13px] font-bold text-[#3A322B]"
                  >
                    View Order Detail
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    className="flex h-11 w-full items-center justify-center rounded-full bg-[#1F1E1B] px-4 text-[13px] font-bold text-white"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-[#E8DED1] bg-white px-5 py-5 shadow-[0_18px_42px_rgba(24,20,16,0.04)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A3E1D]">Billing Notes</p>
                <p className="mt-3 text-[14px] leading-[1.8] text-[#5E564E]">
                  Pricing remains per plate. Menu items inside the package do not carry separate base pricing. GST is included as a separate line item at 18%.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

