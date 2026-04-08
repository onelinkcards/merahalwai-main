"use client";

import { useParams } from "next/navigation";
import VendorEditor from "@/components/admin/VendorEditor";

export default function EditVendorPage() {
  const params = useParams<{ id: string }>();
  return <VendorEditor mode="edit" vendorId={params?.id} />;
}
