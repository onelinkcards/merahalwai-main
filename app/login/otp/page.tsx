import { Suspense } from "react";
import OtpVerifyScreen from "@/components/auth/OtpVerifyScreen";

export default function OtpPage() {
  return (
    <Suspense>
      <OtpVerifyScreen />
    </Suspense>
  );
}

