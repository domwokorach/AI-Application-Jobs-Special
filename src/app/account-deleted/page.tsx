import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";

export default function AccountDeletedPage() {
  return (
    <AuthLayout description="Your recruitment portal account has been closed." title="Account deleted">
      <div className="space-y-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">You have been signed out.</p>
        <Button asChild className="w-full">
          <Link href="/">Return to Jobs</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
