import { z } from "zod";

export const languageProficiencies = [
  "BASIC",
  "CONVERSATIONAL",
  "PROFESSIONAL",
  "FLUENT",
  "NATIVE",
] as const;

export type LanguageProficiency = (typeof languageProficiencies)[number];
export type LanguageType = "SPOKEN" | "SIGNED" | "OTHER";

export interface LanguageSelection {
  code: string;
  name: string;
  type: LanguageType;
  proficiency?: LanguageProficiency;
}

export const DEFAULT_MAX_LANGUAGE_SELECTIONS = 20;

const languageSelectionBaseSchema = z.object({
  code: z.string().min(1),
  name: z.string(),
  type: z.enum(["SPOKEN", "SIGNED", "OTHER"]),
  proficiency: z.enum(languageProficiencies).optional(),
});

export const languageSelectionSchema = languageSelectionBaseSchema
  .extend({ name: z.string().trim().min(1, "Enter the other language name.") });

function uniqueLanguages<T extends { code: string; name: string }>(languages: T[], context: z.RefinementCtx) {
  const seen = new Set<string>();
  for (const [index, language] of languages.entries()) {
    const key = language.code === "other"
      ? `other:${language.name.trim().replace(/\s+/g, " ").toLocaleLowerCase()}`
      : language.code;
    if (seen.has(key)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Each language can only be selected once.", path: [index] });
    }
    seen.add(key);
  }
}

export function createLanguagesSchema(maxSelections = DEFAULT_MAX_LANGUAGE_SELECTIONS) {
  return z.array(languageSelectionSchema).max(maxSelections, `Select no more than ${maxSelections} languages.`)
    .superRefine(uniqueLanguages);
}

export function createLanguagesAutosaveSchema(maxSelections = DEFAULT_MAX_LANGUAGE_SELECTIONS) {
  return z.array(languageSelectionSchema).max(maxSelections, `Select no more than ${maxSelections} languages.`)
    .superRefine(uniqueLanguages);
}

export const languagesSchema = createLanguagesSchema();
export const languagesAutosaveSchema = createLanguagesAutosaveSchema();
export const languagesAutosaveDataSchema = z.object({ languages: languagesAutosaveSchema });
