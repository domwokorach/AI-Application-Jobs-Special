"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/form-error";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas/register.schema";
import { registerAction } from "@/features/auth/actions/register.actions";

export function RegisterForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await registerAction(values);
      if (!result.success) setFormError(result.message);
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" {...register("email")} />
        <FormError message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Create password</Label>
        <Input id="password" type="password" {...register("password")} />
        <p className="text-xs text-muted-foreground">Use at least 12 characters.</p>
        <FormError message={errors.password?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        <FormError message={errors.confirmPassword?.message} />
      </div>
      <FormError message={formError} />
      <Button className="w-full" disabled={pending} type="submit">
        Create account
      </Button>
    </form>
  );
}
