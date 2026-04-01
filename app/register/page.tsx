import { Suspense } from "react";
import AuthEntryScreen from "@/components/auth/AuthEntryScreen";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthEntryScreen mode="register" />
    </Suspense>
  );
}

