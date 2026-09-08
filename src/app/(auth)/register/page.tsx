import { AuthLayout } from "@/components/layout/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      description="Create an account to apply for jobs, save your progress and track your applications."
      maxWidthClassName="max-w-2xl"
      title="Create your account"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
