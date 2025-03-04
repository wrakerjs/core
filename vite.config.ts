import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.spec.ts"],
    exclude: ["src/(?!tests)", "node_modules", "dist"],
    silent: false,
    testTimeout: 1000,

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
      provider: "playwright",
      screenshotFailures: false,
      instances: [
        {
          browser: "chromium",
        },
        {
          browser: "firefox",
        },
        {
          browser: "webkit",
        },
      ],
    },
  },

  worker: {
    format: "es",
  },
});
