import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts", "tests/**/*.spec.ts"],
    exclude: ["node_modules", "dist"],
    silent: false,
    testTimeout: 1000,

    reporters: ["verbose"],
    coverage: {
      enabled: true,
      provider: "istanbul",
      reportsDirectory: "./.coverage",
      include: ["src/client", "src/server"],
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

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  worker: {
    format: "es",
  },
});
