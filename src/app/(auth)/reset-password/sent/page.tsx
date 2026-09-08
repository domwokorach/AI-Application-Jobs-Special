import { MailCheck } from "lucide-react";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";

export default function ResetPasswordSentPage() {
  return (
    <AuthLayout description="If we can process a password reset for that account, we'll send instructions to the email address." title="Check your email">
      <div className="space-y-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <MailCheck className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">Please check your inbox and spam/junk folder.</p>
        <Button asChild className="w-full">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
