"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function PasswordInput(
  { className, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        className={`pr-10 ${className ?? ""}`}
        ref={ref}
        type={visible ? "text" : "password"}
        {...props}
      />
      <button
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
        tabIndex={-1}
        type="button"
      >
        {visible ? <EyeOff className="size-4 shrink-0" /> : <Eye className="size-4 shrink-0" />}
      </button>
    </div>
  );
});
