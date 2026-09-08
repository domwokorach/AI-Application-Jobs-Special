"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/forms/password-input";
import { FormError } from "@/components/forms/form-error";
import { changePasswordSchema, type ChangePasswordValues } from "@/features/profile/schemas/change-password.schema";
import { changePasswordAction } from "@/features/profile/actions/change-password.actions";
import { passwordRequirements } from "@/features/auth/schemas/password-policy";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  function onSubmit(values: ChangePasswordValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await changePasswordAction(values);
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      reset();
      toast.success("Password changed");
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput autoComplete="current-password" id="currentPassword" {...register("currentPassword")} />
        <FormError message={errors.currentPassword?.message} />
      </div>
      <ul className="grid gap-1 text-xs text-muted-foreground">
        {passwordRequirements.map((requirement) => (
          <li className="flex items-center gap-1.5" key={requirement}>
            <span aria-hidden="true">✓</span>
            {requirement}
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput autoComplete="new-password" id="newPassword" {...register("newPassword")} />
        <FormError message={errors.newPassword?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <PasswordInput autoComplete="new-password" id="confirmNewPassword" {...register("confirmNewPassword")} />
        <FormError message={errors.confirmNewPassword?.message} />
      </div>
      <FormError message={formError} />
      <Button className="w-full sm:w-auto" disabled={pending} type="submit">
        {pending ? "Changing password…" : "Change Password"}
      </Button>
    </form>
  );
}
