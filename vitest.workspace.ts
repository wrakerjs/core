import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vite.config.ts",
    test: {
      name: "chromium",
      browser: {
        name: "chromium",
      },
    },
  },
  {
    extends: "./vite.config.ts",
    test: {
      name: "webkit",
      browser: {
        name: "webkit",
      },
    },
  },
  {
    extends: "./vite.config.ts",
    test: {
      name: "firefox",
      browser: {
        name: "firefox",
      },
    },
  },
]);
