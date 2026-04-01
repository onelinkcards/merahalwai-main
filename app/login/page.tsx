import { Suspense } from "react";
import AuthEntryScreen from "@/components/auth/AuthEntryScreen";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthEntryScreen mode="login" />
    </Suspense>
  );
}

