import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from "react";

function RegisterPageContent() {
  return (
    <div className="container flex items-center justify-center py-12 min-h-[calc(100vh-14rem)]">
      <AuthForm mode="register" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}
