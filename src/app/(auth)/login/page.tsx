import { Suspense } from "react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthLayout description="Sign in to continue your applications and track your progress." title="Welcome back">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
