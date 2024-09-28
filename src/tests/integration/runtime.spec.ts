import { describe, expect, it } from "vitest";
import {
  defineWrakerApp,
  defineWrakerAppPlugin,
  WrakerApp,
} from "../../server";

describe("defineWrakerApp", () => {
  it("should return a new instance of WrakerApp", () => {
    const instance = defineWrakerApp();

    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(WrakerApp);
  });
});

describe("defineWrakerAppPlugin", () => {
  it("should return a new instance of WrakerAppPluginFactory", () => {
    const factory = defineWrakerAppPlugin<
      { test: number },
      { initial: number }
    >({
      name: "test",
      version: "1.0.0",
      init: (app, options) => {
        if (!options) return;

        app.test = options.initial;
      },
    });

    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(Function);

    expect(factory()).toBeDefined();

    const app = defineWrakerApp({
      plugins: [factory({ initial: 1 })],
    });

    expect(app.test).toBe(1);
  });
});
