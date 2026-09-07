import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JobPage({ params }: PageProps<"/jobs/[jobId]">) {
  const { jobId } = await params;
  return <main className="mx-auto max-w-3xl px-5 py-10"><p className="text-sm font-medium text-emerald-700">Open opportunity</p><h1 className="mt-2 font-serif text-4xl">Customer Experience Associate</h1><Card className="mt-7"><CardHeader><CardTitle>About the role</CardTitle></CardHeader><CardContent className="space-y-5 text-sm leading-6 text-muted-foreground"><p>Help people get the most from Northstar through thoughtful, informed customer support.</p><Button asChild><Link href={`/applications/${jobId}/account`}>Start application</Link></Button></CardContent></Card></main>;
}
