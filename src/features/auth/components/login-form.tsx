"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/form-error";
import { loginSchema, type LoginValues } from "@/features/auth/schemas/login.schema";
import { loginAction } from "@/features/auth/actions/login.actions";

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await loginAction(values);
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
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        <FormError message={errors.password?.message} />
      </div>
      <FormError message={formError} />
      <Button disabled={pending} type="submit">
        Sign in
      </Button>
      <Link className="text-sm text-foreground underline" href="/forgot-password">
        Forgot your password?
      </Link>
    </form>
  );
}
