import type { Address } from "./application";

export type Candidate = {
  id: string;
  fullName: string;
  preferredName?: string;
  email: string;
  mobile?: string;
  address?: Address;
};
