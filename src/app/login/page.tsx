import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from "react";

function LoginPageContent() {
  return (
    <div className="container flex items-center justify-center py-12 min-h-[calc(100vh-14rem)]">
      <AuthForm mode="login" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
