import { z } from "zod";
import { passwordSchema } from "./password-policy";

// Deliberately permissive — real names legitimately contain hyphens, apostrophes, spaces and
// accented/unicode characters (O'Brien, Anne-Marie, Zoë, Nguyễn). Only reject control characters
// and digits; anything a person would plausibly type as their name is allowed through.
const namePattern = /^[^\d\p{Cc}]+$/u;
const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(80, `${label[0].toUpperCase()}${label.slice(1)} is too long.`)
    .regex(namePattern, `Enter a valid ${label}.`);
const optionalNameField = (label: string) =>
  z
    .string()
    .trim()
    .max(80, `${label} is too long.`)
    .optional()
    .refine((value) => !value || namePattern.test(value), `Enter a valid ${label}.`);

// Permissive on purpose: accepts UK-style numbers (07..., +44...) and general international
// numbers, since candidates may be based outside the UK. Just checks it looks phone-number-shaped
// rather than forcing a single rigid format.
const phonePattern = /^\+?[0-9()\s-]{7,20}$/;
const optionalPhoneField = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || phonePattern.test(value), "Enter a valid phone number.");

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().max(254, "Email address is too long.").email("Enter a valid email address."),
    confirmEmail: z.string().trim().toLowerCase().min(1, "Confirm your email address."),

    title: optionalNameField("title"),
    firstName: nameField("first name"),
    middleNames: optionalNameField("middle name(s)"),
    lastName: nameField("last name"),
    preferredName: optionalNameField("preferred name"),

    mobile: z.string().trim().min(1, "Enter your mobile number.").regex(phonePattern, "Enter a valid phone number."),
    alternativePhone: optionalPhoneField,

    addressLine1: z.string().trim().min(1, "Enter your address."),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1, "Enter your town or city."),
    county: z.string().trim().optional(),
    postcode: z.string().trim().optional(),
    country: z.string().trim().min(1, "Select your country."),

    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),

    agreeToTerms: z.boolean().refine((value) => value === true, { message: "You must agree to the Terms & Conditions." }),
  })
  .refine((values) => values.email === values.confirmEmail, {
    message: "The email addresses do not match.",
    path: ["confirmEmail"],
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.country.toLowerCase() !== "united kingdom" || /^[A-Za-z0-9 ]{5,8}$/.test(values.postcode ?? ""), {
    message: "Enter a valid UK postcode.",
    path: ["postcode"],
  })
  .refine((values) => values.country.toLowerCase() === "united kingdom" || (values.postcode ?? "").length > 0, {
    message: "Enter your postal code.",
    path: ["postcode"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
