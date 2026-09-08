"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/forms/password-input";
import { FormError } from "@/components/forms/form-error";
import { deleteAccountSchema, type DeleteAccountValues } from "@/features/profile/schemas/delete-account.schema";
import { authApi, ApiError } from "@/lib/api/auth-client";

type Step = "warning" | "confirm";

/**
 * Two-step destructive-action flow inside one AlertDialog (rather than stacked dialogs), so the
 * dimensions stay stable and there's no dialog-open/close flicker between steps — only the
 * content of the dialog body changes. Nothing closes the dialog except Cancel or a confirmed
 * server-side success; a failed deletion keeps the candidate signed in and the dialog open with
 * an inline error, per the "don't show success until the server confirms it" requirement.
 */
export function DeleteAccountDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("warning");
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountValues>({ resolver: zodResolver(deleteAccountSchema) });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep("warning");
      setFormError(undefined);
      reset();
    }
  }

  function onSubmit(values: DeleteAccountValues) {
    setFormError(undefined);
    startTransition(async () => {
      try {
        await authApi.deleteAccount(values);
      } catch (error) {
        setFormError(error instanceof ApiError ? error.message : "We couldn't delete your account. Your account has not been deleted.");
        return;
      }
      setOpen(false);
      router.push("/account-deleted");
    });
  }

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="size-4 shrink-0" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-h-[22rem]">
        {step === "warning" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action may permanently remove or deactivate your recruitment portal account. You may lose access to your
                applications and application history. Some recruitment records may need to be retained where the organisation has a
                lawful reason or legal obligation to keep them.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={() => setStep("confirm")}
                variant="destructive"
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm account deletion</AlertDialogTitle>
              <AlertDialogDescription>For your security, confirm your password and type DELETE to continue.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="delete-account-password">Password</Label>
                <PasswordInput autoComplete="current-password" id="delete-account-password" {...register("password")} />
                <FormError message={errors.password?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delete-account-confirm">
                  Type <span className="font-mono font-semibold">DELETE</span> to confirm
                </Label>
                <Input autoComplete="off" id="delete-account-confirm" {...register("confirm")} />
                <FormError message={errors.confirm?.message} />
              </div>
              <FormError message={formError} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending} type="button">
                Cancel
              </AlertDialogCancel>
              <Button disabled={pending} type="submit" variant="destructive">
                {pending ? "Deleting account…" : "Permanently Delete Account"}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
