import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["node_modules", "dist"],
    silent: true,
    testTimeout: 1000,

    reporters: ["verbose"],

    browser: {
      name: "chrome",
      enabled: true,
      headless: true,
      isolate: true,
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
