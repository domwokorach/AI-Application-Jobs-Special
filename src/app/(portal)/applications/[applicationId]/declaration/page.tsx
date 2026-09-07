import { redirect } from "next/navigation";

export default async function DeclarationPage({ params }: PageProps<"/applications/[applicationId]/declaration">) {
  const { applicationId } = await params;
  redirect(`/applications/${applicationId}/review`);
}
