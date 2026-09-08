import { AuthLayout } from "@/components/layout/auth-layout";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout description="We'll help you get back into your account." title="Forgot your password?">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
