import { LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Static banner shown above highly sensitive internal recruitment pages. Deliberately has no
 * conditional height, animation, or async data — it renders in its final state on the server so
 * there's no layout shift once the page becomes interactive.
 */
export function ConfidentialityNotice() {
  return (
    <Alert className="border-warning/45 bg-warning/10">
      <LockKeyhole />
      <AlertTitle>🔒 Confidential candidate information</AlertTitle>
      <AlertDescription>
        This page contains personal candidate information. Do not capture, photograph, copy or share this information
        outside authorised recruitment processes.
      </AlertDescription>
    </Alert>
  );
}
