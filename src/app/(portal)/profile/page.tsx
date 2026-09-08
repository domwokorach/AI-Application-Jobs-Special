import { redirect } from "next/navigation";
import { PageHeader } from "@/components/application/page-header";
import { ProfileSections } from "@/features/profile/components/profile-sections";
import { getCandidateUser } from "@/lib/auth-session";

export default async function ProfilePage() {
  const account = await getCandidateUser();
  if (!account) redirect("/login?next=/profile");

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <PageHeader title="My profile" />
      <ProfileSections account={account} />
    </main>
  );
}
