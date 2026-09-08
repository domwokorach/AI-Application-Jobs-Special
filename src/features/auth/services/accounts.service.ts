import "server-only";
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Account, AccountAddress, PublicAccount } from "@/types";

const accountsById = new Map<string, Account>();
const accountIdByEmail = new Map<string, string>();

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicAccount(account: Account): PublicAccount {
  const { passwordHash: _passwordHash, ...publicAccount } = account;
  void _passwordHash;
  return publicAccount;
}

export async function findAccountByEmail(email: string): Promise<Account | undefined> {
  const id = accountIdByEmail.get(normaliseEmail(email));
  return id ? accountsById.get(id) : undefined;
}

export async function findAccountById(id: string): Promise<Account | undefined> {
  return accountsById.get(id);
}

export type CreateAccountInput = {
  email: string;
  password: string;
  title?: string;
  firstName: string;
  middleNames?: string;
  lastName: string;
  preferredName?: string;
  mobile: string;
  alternativePhone?: string;
  address: AccountAddress;
  emailVerified: boolean;
};

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const email = normaliseEmail(input.email);
  if (accountIdByEmail.has(email)) {
    throw new Error("An account already exists with this email address.");
  }

  const now = new Date().toISOString();
  const account: Account = {
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(input.password),
    emailVerified: input.emailVerified,
    title: input.title,
    firstName: input.firstName,
    middleNames: input.middleNames,
    lastName: input.lastName,
    preferredName: input.preferredName,
    mobile: input.mobile,
    alternativePhone: input.alternativePhone,
    address: input.address,
    createdAt: now,
    updatedAt: now,
  };

  accountsById.set(account.id, account);
  accountIdByEmail.set(email, account.id);
  return account;
}

export async function verifyAccountCredentials(email: string, password: string): Promise<Account | undefined> {
  const account = await findAccountByEmail(email);
  if (!account) {
    // Run a hash anyway so login timing doesn't reveal whether the email is registered.
    await hashPassword(password);
    return undefined;
  }
  const valid = await verifyPassword(password, account.passwordHash);
  return valid ? account : undefined;
}

export async function markEmailVerified(accountId: string): Promise<void> {
  const account = accountsById.get(accountId);
  if (!account) return;
  account.emailVerified = true;
  account.updatedAt = new Date().toISOString();
}

export async function updateAccountPassword(accountId: string, newPassword: string): Promise<void> {
  const account = accountsById.get(accountId);
  if (!account) return;
  account.passwordHash = await hashPassword(newPassword);
  account.updatedAt = new Date().toISOString();
}

export type UpdatableProfileFields = Partial<
  Pick<
    Account,
    "title" | "firstName" | "middleNames" | "lastName" | "preferredName" | "mobile" | "alternativePhone" | "address"
  >
>;

export async function updateAccountProfile(accountId: string, fields: UpdatableProfileFields): Promise<Account | undefined> {
  const account = accountsById.get(accountId);
  if (!account) return undefined;
  Object.assign(account, fields);
  account.updatedAt = new Date().toISOString();
  return account;
}
