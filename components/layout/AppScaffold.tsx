"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function AppScaffold({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBookingFlow = pathname?.startsWith("/book") || pathname?.startsWith("/booking");
  const isAccountFlow =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/account") ||
    pathname?.startsWith("/my-bookings") ||
    pathname?.startsWith("/invoice");
  const isAdminFlow = pathname?.startsWith("/admin") || pathname?.startsWith("/vendor-order");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      {!isBookingFlow && !isAccountFlow && !isAdminFlow ? <Footer /> : null}
    </div>
  );
}
