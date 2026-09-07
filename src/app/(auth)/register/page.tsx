import { AuthLayout } from "@/components/layout/auth-layout";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout description="Save your application and come back whenever you need." title="Create an account">
      <RegisterForm />
    </AuthLayout>
  );
}
