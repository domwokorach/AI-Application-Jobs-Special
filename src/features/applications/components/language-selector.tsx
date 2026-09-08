"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supportedLanguageOptions } from "@/features/applications/data/language-options";
import {
  type LanguageProficiency,
  type LanguageSelection,
} from "@/features/applications/schemas/languages.schema";

export interface LanguageSelectorProps {
  value: LanguageSelection[];
  onChange: (value: LanguageSelection[]) => void;
  disabled?: boolean;
  required?: boolean;
  maxSelections?: number;
  allowOther?: boolean;
  showProficiency?: boolean;
  className?: string;
}

const proficiencyOptions: Array<{ value: LanguageProficiency; label: string }> = [
  { value: "BASIC", label: "Basic" },
  { value: "CONVERSATIONAL", label: "Conversational" },
  { value: "PROFESSIONAL", label: "Professional working proficiency" },
  { value: "FLUENT", label: "Fluent" },
  { value: "NATIVE", label: "Native / First language" },
];

function normaliseOtherName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function LanguageSelector({
  value,
  onChange,
  disabled = false,
  required = false,
  maxSelections = 20,
  allowOther = true,
  showProficiency = true,
  className,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const availableOptions = useMemo(() => {
    const normalisedQuery = query.trim().toLocaleLowerCase();
    return supportedLanguageOptions.filter((option) => {
      if (!allowOther && option.type === "OTHER") return false;
      const isSelected = value.some((language) => language.code === option.code);
      return !isSelected && (!normalisedQuery || option.label.toLocaleLowerCase().includes(normalisedQuery));
    });
  }, [allowOther, query, value]);

  function addLanguage(code: string) {
    const option = supportedLanguageOptions.find((candidate) => candidate.code === code);
    if (!option || value.length >= maxSelections || value.some((language) => language.code === code)) return;
    onChange([...value, { code: option.code, name: option.type === "OTHER" ? "" : option.label, type: option.type }]);
    setQuery("");
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function removeLanguage(code: string) {
    onChange(value.filter((language) => language.code !== code));
  }

  function updateLanguage(code: string, updates: Partial<LanguageSelection>) {
    onChange(value.map((language) => language.code === code ? { ...language, ...updates } : language));
  }

  return (
    <div className={`w-full max-w-2xl space-y-4 ${className ?? ""}`}>
      <div className="space-y-1">
        <Label id="languages-label">Languages{required && <span aria-hidden="true" className="text-destructive"> *</span>}</Label>
        <p className="text-sm text-muted-foreground">Select the languages you can communicate in. You can select more than one.</p>
      </div>
      <Popover
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) requestAnimationFrame(() => searchRef.current?.focus());
        }}
        open={open}
      >
        <PopoverTrigger asChild>
          <Button
            aria-controls="language-options"
            aria-expanded={open}
            aria-labelledby="languages-label"
            className="w-full min-h-11 justify-between border border-input px-3 font-normal transition-colors"
            disabled={disabled || value.length >= maxSelections}
            id="language-selector-trigger"
            type="button"
            variant="outline"
          >
            <span className="truncate">{query || "Search languages..."}</span>
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] gap-0 p-0 data-open:zoom-in-100 data-closed:zoom-out-100"
        >
          <div className="relative border-b border-border p-2">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search languages"
              className="min-h-11 border-input pl-9"
              disabled={disabled}
              id="language-search"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  optionRefs.current[0]?.focus();
                } else if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="Search languages..."
              ref={searchRef}
              value={query}
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-1" id="language-options" role="listbox">
            {availableOptions.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">{query ? "No language found." : "All available languages are selected."}</p>
            ) : (
              availableOptions.map((option, index) => (
                <Button
                  className="min-h-11 w-full justify-start whitespace-normal text-left font-normal"
                  disabled={disabled}
                  key={option.code}
                  onClick={() => addLanguage(option.code)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      optionRefs.current[index + 1]?.focus();
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      if (index === 0) searchRef.current?.focus();
                      else optionRefs.current[index - 1]?.focus();
                    } else if (event.key === "Escape") {
                      setOpen(false);
                    }
                  }}
                  ref={(element) => { optionRefs.current[index] = element; }}
                  role="option"
                  type="button"
                  variant="ghost"
                >
                  <Check aria-hidden="true" className="size-4 opacity-0" />
                  {option.label}
                </Button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      <div aria-live="polite" className="min-h-5 text-xs text-muted-foreground">
        {value.length >= maxSelections ? `Maximum of ${maxSelections} languages selected.` : ""}
      </div>
      <section aria-label="Selected languages">
        <p className="mb-2 text-sm font-medium">Selected:</p>
        <div className="flex min-h-11 flex-wrap content-start gap-2">
          {value.length === 0 ? (
            <p className="pt-2 text-sm text-muted-foreground">No languages selected.</p>
          ) : (
            value.map((language) => (
              <span className="flex min-h-11 max-w-full items-center gap-1 rounded-md bg-muted px-3 py-2 text-sm" key={language.code}>
                <span className="break-words">{language.name || "Other language"}</span>
                <button aria-label={`Remove ${language.name || "other language"}`} className="grid size-6 shrink-0 place-items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={disabled} onClick={() => removeLanguage(language.code)} type="button">
                  <X aria-hidden="true" className="size-4" />
                </button>
              </span>
            ))
          )}
        </div>
      </section>
      {value.map((language) => (
        <div className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)_auto] md:items-center" key={`details-${language.code}`}>
          <div className="min-w-0">
            <p className="break-words font-medium">{language.name || "Other language"}</p>
          {language.type === "OTHER" && (
            <div className="grid gap-2">
              <Label htmlFor="other-language-name">Other language</Label>
              <Input
                className="min-h-11"
                disabled={disabled}
                id="other-language-name"
                onChange={(event) => {
                  const name = event.target.value;
                  const duplicate = value.some((selected) => selected.code === "other" && selected !== language && normaliseOtherName(selected.name) === normaliseOtherName(name));
                  if (!duplicate) updateLanguage(language.code, { name });
                }}
                placeholder="Enter language name"
                value={language.name}
              />
            </div>
          )}
          </div>
          {showProficiency && (
            <div className="grid min-w-0 gap-2">
              <Label htmlFor={`language-proficiency-${language.code}`}>Proficiency</Label>
              <Select disabled={disabled} onValueChange={(proficiency) => updateLanguage(language.code, { proficiency: proficiency as LanguageProficiency })} value={language.proficiency ?? ""}>
                <SelectTrigger className="min-h-11 w-full min-w-0" id={`language-proficiency-${language.code}`}>
                  <SelectValue placeholder="Select proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {proficiencyOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button aria-label={`Remove ${language.name || "other language"}`} className="min-h-11 w-full md:size-11 md:w-11" disabled={disabled} onClick={() => removeLanguage(language.code)} type="button" variant="outline">
            <X aria-hidden="true" className="size-4" />
            <span className="md:sr-only">Remove</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
