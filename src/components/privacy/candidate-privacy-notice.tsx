import { ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CandidatePrivacyNotice() {
  return (
    <Alert>
      <ShieldCheck />
      <AlertTitle>Protect your information</AlertTitle>
      <AlertDescription>
        This page contains personal information from your application. If you&apos;re using a shared or public device,
        remember to sign out when you&apos;ve finished.
      </AlertDescription>
    </Alert>
  );
}
