"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CatererBookRedirectPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? "";

  useEffect(() => {
    if (slug) {
      router.replace("/book/basics?vendor=" + encodeURIComponent(slug));
    } else {
      router.replace("/caterers");
    }
  }, [slug, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAF5] px-4">
      <p className="text-[13px] text-[#8B7355]">Redirecting...</p>
    </main>
  );
}
