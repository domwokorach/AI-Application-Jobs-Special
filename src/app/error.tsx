"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="font-serif text-3xl">Something went wrong</h1><p className="mt-3 text-muted-foreground">We could not load this page. Please try again.</p><Button className="mt-6" onClick={reset}>Try again</Button></div></main>;
}
