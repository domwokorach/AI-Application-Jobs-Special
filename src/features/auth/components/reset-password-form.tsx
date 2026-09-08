"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/forms/password-input";
import { FormError } from "@/components/forms/form-error";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas/reset-password.schema";
import { resetPasswordAction } from "@/features/auth/actions/reset-password.actions";
import { passwordRequirements } from "@/features/auth/schemas/password-policy";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token } });

  function onSubmit(values: ResetPasswordValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await resetPasswordAction(values);
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      router.push("/reset-password/success");
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <ul className="grid gap-1 text-xs text-muted-foreground">
        {passwordRequirements.map((requirement) => (
          <li className="flex items-center gap-1.5" key={requirement}>
            <span aria-hidden="true">✓</span>
            {requirement}
          </li>
        ))}
      </ul>
      <input type="hidden" {...register("token")} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput autoComplete="new-password" id="password" {...register("password")} />
        <FormError message={errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput autoComplete="new-password" id="confirmPassword" {...register("confirmPassword")} />
        <FormError message={errors.confirmPassword?.message} />
      </div>
      <FormError message={formError} />
      <Button disabled={pending} type="submit">
        {pending ? "Resetting password…" : "Reset Password"}
      </Button>
    </form>
  );
}
