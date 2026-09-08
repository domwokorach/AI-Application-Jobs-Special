import "server-only";
import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Account, AccountAddress, AccountStatus, PublicAccount, UserRole } from "@/types";

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
  mobile?: string;
  alternativePhone?: string;
  address?: AccountAddress;
  emailVerified: boolean;
  /** Defaults to CANDIDATE. Only ever passed explicitly by the dev-only staff seed below —
   * never accept this from client/registration input. */
  role?: UserRole;
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
    role: input.role ?? "CANDIDATE",
    status: "ACTIVE",
    title: input.title,
    firstName: input.firstName,
    middleNames: input.middleNames,
    lastName: input.lastName,
    preferredName: input.preferredName,
    mobile: input.mobile ?? "",
    alternativePhone: input.alternativePhone,
    address: input.address,
    createdAt: now,
    updatedAt: now,
  };

  accountsById.set(account.id, account);
  accountIdByEmail.set(email, account.id);
  return account;
}

export type CredentialCheckResult =
  | { outcome: "valid"; account: Account }
  | { outcome: "invalid-credentials" }
  | { outcome: "account-inactive"; account: Account };

/** Verifies credentials and reports account-status separately from wrong-password so callers can
 * apply the right authorization semantics — an active account gets the generic "wrong details"
 * message either way (no enumeration), but a *correctly authenticated* deleted/suspended account
 * gets a distinct, non-enumerating rejection. */
export async function checkAccountCredentials(email: string, password: string): Promise<CredentialCheckResult> {
  const account = await findAccountByEmail(email);
  if (!account) {
    // Run a hash anyway so login timing doesn't reveal whether the email is registered.
    await hashPassword(password);
    return { outcome: "invalid-credentials" };
  }
  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) return { outcome: "invalid-credentials" };
  if (account.status !== "ACTIVE") return { outcome: "account-inactive", account };
  return { outcome: "valid", account };
}

/** @deprecated kept only for any lingering direct callers; prefer `checkAccountCredentials`. */
export async function verifyAccountCredentials(email: string, password: string): Promise<Account | undefined> {
  const result = await checkAccountCredentials(email, password);
  return result.outcome === "valid" ? result.account : undefined;
}

export async function updateAccountStatus(accountId: string, status: AccountStatus): Promise<void> {
  const account = accountsById.get(accountId);
  if (!account) return;
  account.status = status;
  account.updatedAt = new Date().toISOString();
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

/**
 * Dev-only staff accounts (RECRUITMENT/HIRING_MANAGER/HR/ADMIN) so the recruitment-side RBAC
 * gates have something real to test against locally. Never seeded in production, and the
 * password is only ever printed to the server console — it is not embedded in any client bundle
 * or route response.
 */
const MOCK_STAFF_ACCOUNTS: ReadonlyArray<{ email: string; role: UserRole; firstName: string; lastName: string }> = [
  { email: "recruiter@example.test", role: "RECRUITMENT", firstName: "Rae", lastName: "Recruiter" },
  { email: "hiring-manager@example.test", role: "HIRING_MANAGER", firstName: "Hal", lastName: "HiringManager" },
  { email: "hr@example.test", role: "HR", firstName: "Harper", lastName: "HR" },
  { email: "admin@example.test", role: "ADMIN", firstName: "Ada", lastName: "Admin" },
];
const MOCK_STAFF_PASSWORD = "DevPassword123!";

let staffSeeded = false;

export async function ensureMockStaffAccountsSeeded(): Promise<void> {
  if (staffSeeded || process.env.NODE_ENV === "production") return;
  staffSeeded = true;

  for (const staff of MOCK_STAFF_ACCOUNTS) {
    if (accountIdByEmail.has(normaliseEmail(staff.email))) continue;
    await createAccount({
      email: staff.email,
      password: MOCK_STAFF_PASSWORD,
      firstName: staff.firstName,
      lastName: staff.lastName,
      emailVerified: true,
      role: staff.role,
    });
  }

  console.info(
    `[auth] Seeded dev-only staff accounts (password: ${MOCK_STAFF_PASSWORD}): ${MOCK_STAFF_ACCOUNTS.map((s) => `${s.email} (${s.role})`).join(", ")}`,
  );
}

// Fire-and-forget at module load so a fresh dev server always has staff accounts to sign in
// with, without every call site needing to remember to seed first.
void ensureMockStaffAccountsSeeded();
