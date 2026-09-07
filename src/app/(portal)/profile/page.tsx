import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/application/page-header";

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <PageHeader title="Your profile" />
      <Card>
        <CardHeader>
          <CardTitle>Alex Morgan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">alex.morgan@example.com</CardContent>
      </Card>
    </main>
  );
}
