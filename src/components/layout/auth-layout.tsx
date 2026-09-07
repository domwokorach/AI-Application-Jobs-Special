import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthLayout({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return <main className="grid min-h-screen place-items-center bg-stone-50 p-5"><Card className="w-full max-w-md"><CardHeader><p className="font-serif text-xl text-emerald-900">AI Application Fast Specialist</p><CardTitle className="pt-5 font-serif text-3xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card></main>;
}
