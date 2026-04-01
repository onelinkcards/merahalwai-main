import type { Metadata } from "next";
import "./globals.css";
import AppScaffold from "@/components/layout/AppScaffold";
import ToastHost from "@/components/ui/ToastHost";
import { DemoAuthProvider } from "@/components/auth/DemoAuthProvider";

export const metadata: Metadata = {
  title: "Mera Halwai",
  description: "Premium catering marketplace for Jaipur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FFFAF5] text-[#1E1E1E]">
        <DemoAuthProvider>
          <AppScaffold>
            <ToastHost />
            {children}
          </AppScaffold>
        </DemoAuthProvider>
      </body>
    </html>
  );
}
