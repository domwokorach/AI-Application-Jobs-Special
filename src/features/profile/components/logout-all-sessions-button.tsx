"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { authApi, ApiError } from "@/lib/api/auth-client";

export function LogoutAllSessionsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function handleClick() {
    setError(undefined);
    startTransition(async () => {
      try {
        await authApi.logoutAll();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "We couldn't sign out of all devices. Please try again.");
        return;
      }
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Button className="w-full sm:w-auto" disabled={pending} onClick={handleClick} variant="outline">
        <LogOut className="size-4 shrink-0" />
        {pending ? "Signing out of all devices…" : "Sign out of all devices"}
      </Button>
      <FormError message={error} />
    </div>
  );
}
