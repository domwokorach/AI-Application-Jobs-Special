"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, CircleUserRound, FileText, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/auth-client";
import { flushPendingSaves } from "@/hooks/use-pending-save-registry";
import { accountDisplayName } from "@/types/account";
import type { PublicAccount } from "@/types";
import { toast } from "sonner";

export function UserAccountMenu({ account }: { account?: PublicAccount }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!account) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
    );
  }

  function handleLogout() {
    startTransition(async () => {
      const savedCleanly = await flushPendingSaves();
      if (!savedCleanly) {
        toast.warning("Some changes may not have saved before signing out.");
      }
      await authApi.logout().catch(() => undefined);
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={pending} variant="ghost">
          <CircleUserRound className="size-4 shrink-0" />
          {accountDisplayName(account)}
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-foreground">{accountDisplayName(account)}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{account.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <CircleUserRound className="size-4 shrink-0" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/applications">
            <FileText className="size-4 shrink-0" />
            My Applications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/security">
            <Settings className="size-4 shrink-0" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={pending} onSelect={handleLogout} variant="destructive">
          <LogOut className="size-4 shrink-0" />
          {pending ? "Signing out…" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
