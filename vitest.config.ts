import { defineConfig } from "vitest/config";
import { config } from "dotenv";

export default defineConfig(() => {
  if (!process.env.CI) {
    const result = config({
      path: ".env.test",
      override: true,
      quiet: true,
    });

    if (result.error) {
      throw new Error("Failed to loav .env.test");
    }
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing in .env.test");
  }

  const databaseName = new URL(databaseUrl).pathname.slice(1);

  if (databaseName !== "authentication_service_test") {
    throw new Error("Tests must use authentication_service_test database");
  }

  return {
    test: {
      environment: "node",
      fileParallelism: false,
      include: ["src/tests/**/*.test.ts"],
      exclude: ["**/node_modules/**", "**/dist/**"],
    },
  };
});
