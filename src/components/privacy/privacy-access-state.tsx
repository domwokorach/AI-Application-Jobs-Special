import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <LockKeyhole className="mb-2 size-8 text-destructive" />
          <CardTitle className="text-2xl">Access denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to view this candidate information. If you believe you should have access, contact your administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export function SecureSessionExpired() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <LockKeyhole className="mb-2 size-8 text-warning" />
          <CardTitle className="text-2xl">Your secure session has expired</CardTitle>
          <CardDescription>For your security, please sign in again to continue viewing candidate information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
