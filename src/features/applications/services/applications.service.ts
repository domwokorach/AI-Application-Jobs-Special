import "server-only";
import type { Application, ApplicationStepId } from "@/types";

export async function getApplication(applicationId: string): Promise<Application | undefined> {
  void applicationId;
  return undefined;
}

export async function saveApplicationStep(
  applicationId: string,
  step: ApplicationStepId,
  data: Record<string, unknown>,
): Promise<void> {
  void applicationId;
  void step;
  void data;
  throw new Error("Application persistence has not been configured. Connect a database in src/lib/db.ts.");
}

export async function submitApplication(applicationId: string): Promise<void> {
  void applicationId;
  throw new Error("Application persistence has not been configured. Connect a database in src/lib/db.ts.");
}
