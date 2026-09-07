import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AuthLayout description="Sign in to continue your application." title="Welcome back">
      <LoginForm />
    </AuthLayout>
  );
}
