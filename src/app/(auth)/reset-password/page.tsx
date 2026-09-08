import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { checkResetTokenAction } from "@/features/auth/actions/reset-password.actions";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  // A non-consuming pre-check so an expired/used link shows the correct state immediately,
  // without ever burning the token itself — actual submission re-validates (and consumes) it
  // server-side in resetPasswordAction, since the presence of a token in the URL is never
  // treated as proof of authorization on its own.
  const validation = token ? await checkResetTokenAction(token) : { valid: false as const, reason: "not-found" as const };

  if (!validation.valid) {
    return (
      <AuthLayout description="You'll need to request a fresh reset link to continue." title="Link no longer valid">
        <div className="space-y-5 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <AlertTriangle className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            This password reset link is no longer valid. It may have expired or already been used.
          </p>
          <div className="grid gap-2">
            <Button asChild>
              <Link href="/forgot-password">Request a New Link</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout description="Use the same password requirements as when you created your account." title="Create a new password">
      <ResetPasswordForm token={token as string} />
    </AuthLayout>
  );
}
