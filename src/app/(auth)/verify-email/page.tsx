import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/features/auth/actions/verify-email.actions";

export default async function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const result = token ? await verifyEmailAction(token) : { success: false as const, message: "This verification link is missing its token." };

  if (!result.success) {
    return (
      <AuthLayout description="You can request a new verification email from your account." title="Link no longer valid">
        <div className="space-y-5 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <AlertTriangle className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <Button asChild className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout description="Thanks for confirming it's really you." title="Email verified">
      <div className="space-y-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">Your email address has been verified.</p>
        <Button asChild className="w-full">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
