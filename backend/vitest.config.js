import { defineConfig } from "vitest/config";
import { config } from "dotenv";

// Load .env.test first (isolated test DB, optional), then .env as the fallback.
// dotenv never overrides an already-set variable, so .env.test wins where present.
config({ path: ".env.test" });
config();

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
