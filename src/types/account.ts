export type AccountAddress = {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
};

/**
 * The full server-side account record, including the password hash. This type must never be
 * sent to the client — always map through `toPublicAccount` (accounts.service.ts) first.
 */
export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  title?: string;
  firstName: string;
  middleNames?: string;
  lastName: string;
  preferredName?: string;
  mobile: string;
  alternativePhone?: string;
  address?: AccountAddress;
  createdAt: string;
  updatedAt: string;
};

/** Client-safe view of an account — never includes passwordHash. */
export type PublicAccount = Omit<Account, "passwordHash">;

export function accountDisplayName(account: Pick<Account, "preferredName" | "firstName" | "lastName">): string {
  return account.preferredName?.trim() || `${account.firstName} ${account.lastName}`.trim();
}

export function accountFullName(account: Pick<Account, "title" | "firstName" | "middleNames" | "lastName">): string {
  return [account.title, account.firstName, account.middleNames, account.lastName].filter(Boolean).join(" ");
}
