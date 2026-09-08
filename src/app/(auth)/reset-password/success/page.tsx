import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";

export default function ResetPasswordSuccessPage() {
  return (
    <AuthLayout description="You can now sign in using your new password." title="Password updated">
      <div className="space-y-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">Your password has been changed successfully.</p>
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
