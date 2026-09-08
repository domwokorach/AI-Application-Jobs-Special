import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/application/page-header";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { LogoutAllSessionsButton } from "@/features/profile/components/logout-all-sessions-button";
import { DeleteAccountDialog } from "@/features/profile/components/delete-account-dialog";
import { getCandidateUser } from "@/lib/auth-session";

export default async function AccountSecurityPage() {
  const account = await getCandidateUser();
  if (!account) redirect("/login?next=/account/security");

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 py-10">
      <PageHeader title="Account settings" description="Manage your sign-in security." />
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Choose a new password for {account.email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Sign out everywhere if you think another device or browser still has access.</CardDescription>
        </CardHeader>
        <CardContent>
          <LogoutAllSessionsButton />
        </CardContent>
      </Card>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Account management</CardTitle>
          <CardDescription>
            Deleting your account is a permanent action and may affect your access to applications and application history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </main>
  );
}
