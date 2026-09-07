export type DatabaseAdapter = {
  transaction<T>(operation: () => Promise<T>): Promise<T>;
};

export const db: DatabaseAdapter | undefined = undefined;
