import { describe, expect, it, vi } from "vitest";
import {
  defineWrakerApp,
  defineWrakerAppPlugin,
  WrakerAppBase,
} from "../../server";

describe("defineWrakerApp", () => {
  it("should return a new instance of WrakerAppBase", () => {
    const instance = defineWrakerApp();

    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(WrakerAppBase);
  });
});

describe("defineWrakerAppPlugin", () => {
  it("should return a new instance of WrakerAppPluginFactory", () => {
    const factory = defineWrakerAppPlugin({
      name: "test",
      description: "Test plugin",
      version: "1.0.0",
      init: vi.fn(),
      destroy: vi.fn(),
    });

    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(Function);

    expect(factory()).toBeDefined();
  });
});
