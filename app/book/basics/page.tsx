import { Suspense } from "react";
import BookBasicsClient from "@/components/book/BookBasicsClient";

function BasicsFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4">
      <p className="text-[13px] text-[#8B7355]">Loading booking basics...</p>
    </main>
  );
}

export default function BookBasicsPage() {
  return (
    <Suspense fallback={<BasicsFallback />}>
      <BookBasicsClient />
    </Suspense>
  );
}
