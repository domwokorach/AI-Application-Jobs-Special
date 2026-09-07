import { z } from "zod";

const dateOfBirthSchema = z.string().superRefine((value, context) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(value);
  if (!match) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter your date of birth in DD/MM/YY format." });
    return;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const twoDigitYear = Number(yearText);
  const today = new Date();
  const year = twoDigitYear <= today.getFullYear() % 100 ? 2000 + twoDigitYear : 1900 + twoDigitYear;
  const dateOfBirth = new Date(year, month - 1, day);

  if (
    dateOfBirth.getFullYear() !== year ||
    dateOfBirth.getMonth() !== month - 1 ||
    dateOfBirth.getDate() !== day
  ) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date of birth." });
    return;
  }

  const eighteenthBirthday = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  if (dateOfBirth > eighteenthBirthday) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "You must be 18 years old or over to apply." });
  }
});

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  mobile: z.string().min(10, "Enter a valid mobile number."),
  dateOfBirth: dateOfBirthSchema,
  address: z.string().min(5, "Enter your address."),
  postcode: z.string().min(5, "Enter a valid postcode."),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;
