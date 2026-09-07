import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-dvh place-items-center bg-background p-6 text-center text-foreground"><div><p className="text-sm font-semibold text-foreground">404</p><h1 className="mt-2 font-serif text-4xl">Page not found</h1><p className="mt-3 text-muted-foreground">The page you requested does not exist or is no longer available.</p><Button asChild className="mt-6"><Link href="/">Return to dashboard</Link></Button></div></main>;
}
