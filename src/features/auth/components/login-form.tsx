"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/forms/password-input";
import { FormError } from "@/components/forms/form-error";
import { loginSchema, type LoginValues } from "@/features/auth/schemas/login.schema";
import { authApi, ApiError } from "@/lib/api/auth-client";
import { safeRedirectTarget } from "@/lib/safe-redirect";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      try {
        await authApi.login(values);
      } catch (error) {
        setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
        return;
      }
      router.push(safeRedirectTarget(searchParams.get("next"), "/"));
      router.refresh();
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input autoComplete="email" id="email" type="email" {...register("email")} />
        <FormError message={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput autoComplete="current-password" id="password" {...register("password")} />
        <FormError message={errors.password?.message} />
      </div>
      <Link className="-mt-1 text-sm text-foreground underline" href="/forgot-password">
        Forgot password?
      </Link>
      <FormError message={formError} />
      <Button disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign In"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-foreground underline" href="/register">
          Create Account
        </Link>
      </p>
    </form>
  );
}
