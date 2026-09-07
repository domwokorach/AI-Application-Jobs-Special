"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}) {
  const [internal, setInternal] = useState<Date | undefined>(value);
  const date = value ?? internal;
  const id = label.toLowerCase().replaceAll(/[^a-z0-9]/g, "-");

  function select(next: Date | undefined) {
    setInternal(next);
    onChange?.(next);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="w-full justify-start font-normal" id={id} variant="outline">
            <CalendarIcon className="mr-2 size-4" />
            {date ? format(date, "PPP") : "Choose a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" onSelect={select} selected={date} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
