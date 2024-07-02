import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    extends: "./vite.config.ts",
    test: {
      name: "chrome",
      browser: {
        name: "chrome",
      },
    },
  },
  {
    extends: "./vite.config.ts",
    test: {
      name: "edge",
      browser: {
        name: "edge",
      },
    },
  },
  // TODO: Add Firefox
  // TODO: Add Safari
]);
