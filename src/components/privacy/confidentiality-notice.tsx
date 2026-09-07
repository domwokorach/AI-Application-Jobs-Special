import { LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ConfidentialityNotice() {
  return (
    <Alert className="border-warning/45 bg-warning/10">
      <LockKeyhole />
      <AlertTitle>Confidential candidate information</AlertTitle>
      <AlertDescription>
        Screenshots, photographs and unauthorised sharing may expose personal information. Please handle this page securely.
      </AlertDescription>
    </Alert>
  );
}
