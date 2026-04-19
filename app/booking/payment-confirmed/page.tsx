import { Suspense } from "react";
import PaymentConfirmedClient from "./PaymentConfirmedClient";

export default function PaymentConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FB]" />}>
      <PaymentConfirmedClient />
    </Suspense>
  );
}
