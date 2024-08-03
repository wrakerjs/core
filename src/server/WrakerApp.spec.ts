import { it, describe, expect, vitest } from "vitest";
import "../tests/utils";

import { WrakerRouter, WrakerApp, WrakerAppResponse } from ".";
import { EventOptions } from "../common";

import workerUrl from "../tests/fixtures/basic?url";

describe("WrakerApp", () => {
  it("should be defined", async () => {
    const instance = new WrakerApp();
    expect(instance).toBeDefined();
  });

  it("should have a mountpath", async () => {
    const instance = new WrakerApp();
    expect(instance.mountpath).toBeDefined();
  });

  it("should have a locals object", async () => {
    const instance = new WrakerApp();
    expect(instance.locals).toBeDefined();
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

  it("should process request", async () => {
    const app = new WrakerApp();
    const handler = vitest.fn();
    app.get("/path", handler);

    await app.process({
      method: "get",
      path: "/path",
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should process event", async () => {
    const app = new WrakerApp();
    const handler = vitest.fn();

    app.get("/something", handler);

    const event = new MessageEvent<EventOptions>("message", {
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

  it("should interact with client", async () => {
    const worker = new Worker(workerUrl, { type: "module" });

    const promise = new Promise<WrakerAppResponse>((resolve) => {
      worker.onmessage = (event: MessageEvent<WrakerAppResponse>) => {
        resolve(event.data);
      };
    });

    worker.postMessage({
      method: "get",
      path: "/",
      headers: {
        "X-Request-ID": "123",
      },
    });

    const response = await promise;
    expect(response.body).toEqual({
      status: 200,
    });
    expect(response.headers["X-Request-ID"]).toBe("123");
  });
});
