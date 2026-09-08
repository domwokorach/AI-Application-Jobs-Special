import { z } from "zod";

const namePattern = /^[^\d\p{Cc}]+$/u;
const phonePattern = /^\+?[0-9()\s-]{7,20}$/;

export const personalDetailsSchema = z.object({
  title: z.string().trim().max(80).optional(),
  firstName: z.string().trim().min(1, "Enter your first name.").max(80).regex(namePattern, "Enter a valid first name."),
  middleNames: z.string().trim().max(80).optional(),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80).regex(namePattern, "Enter a valid last name."),
  preferredName: z.string().trim().max(80).optional(),
});
export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const contactDetailsSchema = z.object({
  mobile: z.string().trim().min(1, "Enter your mobile number.").regex(phonePattern, "Enter a valid phone number."),
  alternativePhone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || phonePattern.test(value), "Enter a valid phone number."),
});
export type ContactDetailsValues = z.infer<typeof contactDetailsSchema>;

export const addressDetailsSchema = z
  .object({
    addressLine1: z.string().trim().min(1, "Enter your address."),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1, "Enter your town or city."),
    county: z.string().trim().optional(),
    postcode: z.string().trim().optional(),
    country: z.string().trim().min(1, "Select your country."),
  })
  .refine((values) => values.country.toLowerCase() !== "united kingdom" || /^[A-Za-z0-9 ]{5,8}$/.test(values.postcode ?? ""), {
    message: "Enter a valid UK postcode.",
    path: ["postcode"],
  })
  .refine((values) => values.country.toLowerCase() === "united kingdom" || (values.postcode ?? "").length > 0, {
    message: "Enter your postal code.",
    path: ["postcode"],
  });
export type AddressDetailsValues = z.infer<typeof addressDetailsSchema>;
