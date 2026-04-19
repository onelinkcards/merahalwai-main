"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { getAdminOrderById } from "@/data/mockAdmin";
import { getSupportTelHref, getSupportWhatsappHref } from "@/lib/supportContact";

export default function PaymentConfirmedClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const order = orderId ? getAdminOrderById(orderId) : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#FCFAF6_0%,#F7F0E6_55%,#F4EBDD_100%)] px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[#E7DCCB] bg-white px-6 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#15803D]">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="mt-6 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8A6A4B]">Payment Confirmed</p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-[#151310]">
            Order confirmed, payment done
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] text-[15px] leading-[1.75] text-[#5F564D]">
            We have received your payment successfully. Our team will contact you shortly with vendor details on WhatsApp.
          </p>
        </div>

        {order ? (
          <div className="mt-8 rounded-[20px] border border-[#E7DCCB] bg-[#FCFAF6] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6A4B]">Order ID</p>
                <p className="mt-2 text-[16px] font-bold text-[#151310]">{order.id}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6A4B]">Vendor</p>
                <p className="mt-2 text-[16px] font-bold text-[#151310]">{order.vendorName}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6A4B]">Event</p>
                <p className="mt-2 text-[15px] font-semibold text-[#151310]">{order.eventType} · {order.eventDate}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6A4B]">Guests</p>
                <p className="mt-2 text-[15px] font-semibold text-[#151310]">{order.guests} guests</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={getSupportWhatsappHref()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D6EFD9] bg-white px-5 text-[14px] font-semibold text-[#15803D]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Support
          </a>
          <a
            href={getSupportTelHref()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E7DCCB] bg-white px-5 text-[14px] font-semibold text-[#4D4338]"
          >
            <Phone className="h-4 w-4" />
            Call Support
          </a>
          <Link
            href="/account"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#682C13] px-5 text-[14px] font-semibold text-white hover:text-white"
          >
            Go to Account
          </Link>
        </div>
      </div>
    </main>
  );
}
