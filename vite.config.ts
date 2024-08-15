import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.spec.ts"],
    exclude: ["src/!tests/*.ts", "node_modules", "dist"],
    silent: false,
    testTimeout: 1000,

    reporters: ["verbose"],
    coverage: {
      enabled: true,
      provider: "istanbul",
      reportsDirectory: "./.coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/tests/**/*.ts"],
    },

    browser: {
      name: "chromium",
      enabled: true,
      headless: true,
      isolate: true,
      provider: "playwright",
      screenshotFailures: false,
    },
  },

  worker: {
    format: "es",
  },
});
