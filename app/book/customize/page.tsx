import { Suspense } from "react";
import BookCustomizeClient from "@/components/book/BookCustomizeClient";

function CustomizeFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4">
      <p className="text-[13px] text-[#8B7355]">Loading...</p>
    </main>
  );
}

export default function BookCustomizePage() {
  return (
    <Suspense fallback={<CustomizeFallback />}>
      <BookCustomizeClient />
    </Suspense>
  );
}
