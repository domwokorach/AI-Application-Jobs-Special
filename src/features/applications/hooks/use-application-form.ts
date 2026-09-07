"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues } from "react-hook-form";
import type { ZodType } from "zod";

export function useApplicationForm<Values extends Record<string, unknown>>(
  schema: ZodType<Values>,
  defaultValues: DefaultValues<Values>,
) {
  return useForm<Values>({ resolver: zodResolver(schema), defaultValues });
}
