import { it, describe, expect, vitest } from "vitest";
import "../utils";

import { WrakerRouter, WrakerApp } from "../..";

describe("WrakerApp", () => {
  it("should be defined", async () => {
    const instance = new WrakerApp();
    expect(instance).toBeDefined();
  });

  it("should have a mountpath", async () => {
    const instance = new WrakerApp();
    expect(instance.mountpath).toBeDefined();
  });

  it("should receive mount event", async () => {
    const instance = new WrakerApp();
    const api = new WrakerApp();

    const promise = new Promise((resolve) => {
      instance.on("mount", () => resolve(true));
    });

    instance.use("/api", api);

    expect(await promise).toBe(true);
  });

  it("should not receive mount event", async () => {
    const instance = new WrakerApp();
    const api = new WrakerRouter();

    const promise = new Promise((resolve) => {
      instance.on("mount", () => resolve(true));
    });

    instance.use("/api", api);

    await expect(promise).toTimeOut(100);
  });

  it("should execute listening callback", async () => {
    const instance = new WrakerApp();

    const promise = new Promise<boolean>((resolve) => {
      instance.listen(() => {
        resolve(true);
      });
    });

    expect(await promise).toBe(true);
  });

  it("should execute listening callback (promise chaining)", async () => {
    const instance = new WrakerApp();

    const promise = new Promise<boolean>((resolve) => {
      instance.listen().then(() => {
        resolve(true);
      });
    });

    expect(await promise).toBe(true);
  });

  it("should throw when listening twice", async () => {
    const instance = new WrakerApp();

    instance.listen();
    await expect(instance.listen()).rejects.toThrow();
  });

  it("should process event", async () => {
    const app = new WrakerApp();
    const handler = vitest.fn();

    app.get("/something", handler);

    const event = new MessageEvent("message", {
      data: {
        method: "get",
        path: "/something",
      },
    });

    const promise = new Promise<any>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);

    await promise;
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should not process if event is malformed", async () => {
    const app = new WrakerApp();
    const handler = vitest.fn();

    app.get("/something", handler);

    let event = new MessageEvent("message", {});
    let promise = new Promise<any>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);

    await expect(promise).toTimeOut(100);
    expect(handler).toHaveBeenCalledTimes(0);

    event = new MessageEvent("message", {
      data: {
        method: "get",
      },
    });
    promise = new Promise<any>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);

    await expect(promise).toTimeOut(100);
    expect(handler).toHaveBeenCalledTimes(0);

    event = new MessageEvent("message", {
      data: {
        path: "/something",
      },
    });
    promise = new Promise<any>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);

    await expect(promise).toTimeOut(100);
    expect(handler).toHaveBeenCalledTimes(0);
  });
});
