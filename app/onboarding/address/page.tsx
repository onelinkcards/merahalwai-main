import { Suspense } from "react";
import AddressPageClient from "./AddressPageClient";

export default function OnboardingAddressPage() {
  return (
    <Suspense>
      <AddressPageClient />
    </Suspense>
  );
}
