import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.spec.ts"],
    exclude: ["src/(?!tests)", "node_modules", "dist"],
    silent: false,
    testTimeout: 5000,

    reporters: ["verbose"],
    coverage: {
      enabled: true,
      provider: "istanbul",
      reportsDirectory: "coverage",
      include: ["src/"],
      exclude: ["src/tests/"],
    },

    browser: {
      enabled: true,
      headless: true,
      isolate: true,
      provider: playwright(),
      screenshotFailures: false,
      instances: [
        {
          name: "chromium",
          browser: "chromium",
        },
        {
          name: "firefox",
          browser: "firefox",
        },
        {
          name: "webkit",
          browser: "webkit",
        },
      ],
    },
  },

  worker: {
    format: "es",
  },
});
