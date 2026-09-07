"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/form-error";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas/forgot-password.schema";
import { forgotPasswordAction } from "@/features/auth/actions/forgot-password.actions";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  function onSubmit(values: ForgotPasswordValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await forgotPasswordAction(values);
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
      <FormError message={formError} />
      <Button disabled={pending} type="submit">
        Send reset link
      </Button>
    </form>
  );
}
