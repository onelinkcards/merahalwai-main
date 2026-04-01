import { Suspense } from "react";
import ProfilePageClient from "./ProfilePageClient";

export default function OnboardingProfilePage() {
  return (
    <Suspense>
      <ProfilePageClient />
    </Suspense>
  );
}
