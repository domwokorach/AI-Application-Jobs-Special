import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Real `server-only`/`client-only` are aliased by Next.js's own build; under plain Node
      // (vitest) they don't resolve, so stub them out the same way.
      "server-only": path.resolve(__dirname, "./src/test/server-only-stub.ts"),
      "client-only": path.resolve(__dirname, "./src/test/server-only-stub.ts"),
    },
  },
});
