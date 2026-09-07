import { AuthLayout } from "@/components/layout/auth-layout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout description="Enter your email and we will send you a reset link." title="Reset your password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
