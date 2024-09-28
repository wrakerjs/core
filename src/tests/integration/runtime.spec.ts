import { describe, expect, it, vi } from "vitest";
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
