"use client";

import { useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CharacterLimitTextareaProps {
  name: string;
  label: string;
  description?: string;
  maxLength: number;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export function CharacterLimitTextarea({
  name,
  label,
  description,
  maxLength,
  required = false,
  placeholder,
  disabled = false,
  rows = 6,
}: CharacterLimitTextareaProps) {
  const generatedId = useId();
  const inputId = `${generatedId}-input`;
  const descriptionId = `${generatedId}-description`;
  const limitId = `${generatedId}-limit`;
  const errorId = `${generatedId}-error`;
  const { control, getFieldState, register, setValue } = useFormContext();
  const value = useWatch({ control, name }) ?? "";
  const fieldError = getFieldState(name).error?.message;
  const charactersUsed = typeof value === "string" ? value.length : 0;
  const charactersRemaining = Math.max(maxLength - charactersUsed, 0);
  const counterText = `${charactersRemaining.toLocaleString()} ${charactersRemaining === 1 ? "character" : "characters"} left`;
  const describedBy = [description ? descriptionId : undefined, limitId, fieldError ? errorId : undefined]
    .filter(Boolean)
    .join(" ");

  const field = register(name);

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true" className="text-destructive"> *</span>}
        </Label>
        <span className="text-xs text-muted-foreground">{required ? "Required" : "Optional"}</span>
      </div>
      {description && <p className="text-sm leading-6 text-muted-foreground" id={descriptionId}>{description}</p>}
      <Textarea
        {...field}
        aria-describedby={describedBy}
        aria-invalid={Boolean(fieldError)}
        disabled={disabled}
        id={inputId}
        maxLength={maxLength}
        onPaste={(event) => {
          const pastedText = event.clipboardData.getData("text");
          const textarea = event.currentTarget;
          const selectedLength = textarea.selectionEnd - textarea.selectionStart;
          const availableLength = maxLength - (textarea.value.length - selectedLength);
          if (pastedText.length <= availableLength) return;

          event.preventDefault();
          const nextValue = `${textarea.value.slice(0, textarea.selectionStart)}${pastedText.slice(0, Math.max(availableLength, 0))}${textarea.value.slice(textarea.selectionEnd)}`;
          setValue(name, nextValue, { shouldDirty: true, shouldValidate: true });
        }}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      <div className="flex min-h-5 items-center justify-start sm:justify-end">
        <p className="text-xs tabular-nums text-muted-foreground" id={limitId}>
          <span className="sr-only">Maximum {maxLength.toLocaleString()} characters. </span>
          {counterText}
        </p>
      </div>
      <div className="min-h-5">
        {fieldError && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive" id={errorId} role="alert">
            <AlertCircle className="size-3.5" />
            {fieldError}
          </p>
        )}
      </div>
    </div>
  );
}
