import { z } from "zod";

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  mobile: z.string().min(10, "Enter a valid mobile number."),
  address: z.string().min(5, "Enter your address."),
  postcode: z.string().min(5, "Enter a valid postcode."),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;
