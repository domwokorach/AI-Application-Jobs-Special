"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/form-error";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas/forgot-password.schema";
import { authApi, ApiError } from "@/lib/api/auth-client";

export function ForgotPasswordForm() {
  const router = useRouter();
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
      try {
        await authApi.forgotPassword(values);
      } catch (error) {
        setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
        return;
      }
      router.push("/reset-password/sent");
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-muted-foreground">
        Enter the email address associated with your account. If we can process a password reset for that account,
        we&apos;ll send instructions to the email address.
      </p>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input autoComplete="email" id="email" type="email" {...register("email")} />
        <FormError message={errors.email?.message} />
      </div>
      <FormError message={formError} />
      <Button disabled={pending} type="submit">
        {pending ? "Sending…" : "Send Reset Instructions"}
      </Button>
      <Link className="text-center text-sm text-foreground underline" href="/login">
        Back to Login
      </Link>
    </form>
  );
}
