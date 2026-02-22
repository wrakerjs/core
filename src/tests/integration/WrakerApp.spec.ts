import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  defineWrakerApp,
  defineWrakerAppPlugin,
  WrakerApp,
  WrakerRouter,
  type WrakerRequest,
  type WrakerResponse,
} from "../..";
import "../utils";

const listeners: { type: string; listener: Function }[] = [];
describe("WrakerApp", () => {
  beforeAll(() => {
    const originalAddEventListener = window.addEventListener;

    globalThis.addEventListener = (type: string, listener: any) => {
      const mockListener: any = (event: MessageEvent<any>) => {
        listener(event);
      };
      listeners.push({ type, listener: mockListener });
      originalAddEventListener(type, mockListener);
    };
  });

  afterEach(() => {
    for (const { type, listener } of listeners) {
      window.removeEventListener(type, listener as any);
    }
  });

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
    await instance.listen();

    const api = new WrakerApp();
    await api.listen();

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

  it("should throw on event received when not listening", async () => {
    const instance = new WrakerApp();

    const handler = vi.fn();
    instance.get("/something", handler);

    const event = new MessageEvent("message", {
      data: {
        method: "get",
        path: "/something",
      },
    });

    const promise = new Promise<WrakerResponse<string>>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);

    await expect(promise).toTimeOut(100);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it("should throw when listening twice", async () => {
    const instance = new WrakerApp();

    await instance.listen();
    await expect(instance.listen()).rejects.toThrow();
  });

  it("should process event", async () => {
    const app = new WrakerApp();
    await app.listen();

    const handler = vi.fn((_req, res) => {
      res.status(200).end();
    });
    app.get("/something", handler);

    const event = new MessageEvent<Partial<WrakerRequest>>("message", {
      data: {
        method: "get",
        path: "/something",
      },
    });
    const promise = new Promise<WrakerResponse<void>>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);
    const data = await promise;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(data.status).toEqual(200);
  });

  it("should not process if event is malformed", async () => {
    const app = new WrakerApp();
    await app.listen();

    const handler = vi.fn();

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

  it("should not emit lifecycle hooks if not listening", async () => {
    const init = vi.fn();
    const onBeforeMessageHandled = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init,
      onBeforeMessageHandled,
    });

    new WrakerApp({ plugins: [plugin()] });

    const event = new MessageEvent("message", {
      data: {
        method: "get",
        path: "/something",
      },
    });

    globalThis.dispatchEvent(event);

    expect(init).toHaveBeenCalledTimes(1);
    expect(onBeforeMessageHandled).toHaveBeenCalledTimes(0);
  });

  it("should emit lifecycle hooks", async () => {
    const init = vi.fn();
    const onBeforeMessageHandled = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init,
      onBeforeMessageHandled,
    });

    const app = new WrakerApp({ plugins: [plugin()] });
    await app.listen();

    expect(init).toHaveBeenCalledTimes(1);

    const event = new MessageEvent("message", {
      data: {
        method: "get",
        path: "/something",
      },
    });

    globalThis.dispatchEvent(event);

    expect(onBeforeMessageHandled).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple plugins", async () => {
    const init1 = vi.fn();
    const plugin1 = defineWrakerAppPlugin({
      name: "plugin1",
      init: init1,
    });

    const init2 = vi.fn();
    const plugin2 = defineWrakerAppPlugin({
      name: "plugin2",
      init: init2,
    });

    new WrakerApp({ plugins: [plugin1(), plugin2()] });

    expect(init1).toHaveBeenCalledTimes(1);
    expect(init2).toHaveBeenCalledTimes(1);
  });

  it("should stop propagation if hook returns false", async () => {
    const plugin = defineWrakerAppPlugin<{}, { prevent: boolean }>({
      name: "test",
      init: vi.fn(),
      onBeforeMessageHandled: (_a, options) => {
        if (options?.prevent) return false;
      },
    })({ prevent: true });

    const app = defineWrakerApp({
      plugins: [plugin],
    });
    await app.listen();

    const handler = vi.fn();
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
    await expect(promise).toTimeOut(100);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it("should keep processing if hook does not return false", async () => {
    const plugin = defineWrakerAppPlugin<{}, { prevent: boolean }>({
      name: "test",
      init: vi.fn(),
      onBeforeMessageHandled: vi.fn(),
    })({ prevent: false });

    const app = new WrakerApp({
      plugins: [plugin],
    });
    await app.listen();

    const handler = vi.fn((_req, res) => {
      res.status(200).end();
    });
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

    const data = await promise;

    expect(plugin.init).toHaveBeenCalledTimes(1);
    expect(plugin.onBeforeMessageHandled).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(data.status).toEqual(200);
  });

  it("should emit onListen hook when listen() is called", async () => {
    const onListen = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init: vi.fn(),
      onListen,
    });

    const app = new WrakerApp({ plugins: [plugin()] });

    expect(onListen).toHaveBeenCalledTimes(0);

    await app.listen();

    expect(onListen).toHaveBeenCalledTimes(1);
  });

  it("should emit onAfterMessageHandled hook after processing", async () => {
    const onBeforeMessageHandled = vi.fn();
    const onAfterMessageHandled = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageHandled,
      onAfterMessageHandled,
    });

    const app = new WrakerApp({ plugins: [plugin()] });
    await app.listen();

    const handler = vi.fn((_req, res) => {
      res.status(200).end();
    });
    app.get("/something", handler);

    const event = new MessageEvent<Partial<WrakerRequest>>("message", {
      data: {
        method: "get",
        path: "/something",
      },
    });

    const promise = new Promise<WrakerResponse<void>>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);
    await promise;

    // Wait a tick for the .then() to run
    await new Promise((r) => setTimeout(r, 0));

    expect(onBeforeMessageHandled).toHaveBeenCalledTimes(1);
    expect(onAfterMessageHandled).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should emit onError hook when a handler throws", async () => {
    const onError = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init: vi.fn(),
      onError,
    });

    const app = new WrakerApp({ plugins: [plugin()] });
    await app.listen();

    app.get("/fail", () => {
      throw new Error("handler error");
    });

    const event = new MessageEvent<Partial<WrakerRequest>>("message", {
      data: {
        method: "get",
        path: "/fail",
      },
    });

    const promise = new Promise<WrakerResponse<void>>((resolve) => {
      globalThis.postMessage = (message) => {
        resolve(message);
      };
    });

    globalThis.dispatchEvent(event);
    const data = await promise;

    expect(onError).toHaveBeenCalledTimes(1);
    expect(data.status).toEqual(500);
  });

  it("should emit onMount hook when a sub-router is mounted", async () => {
    const onMount = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init: vi.fn(),
      onMount,
    });

    const app = new WrakerApp({ plugins: [plugin()] });
    await app.listen();

    const router = new WrakerRouter();
    app.use("/api", router);

    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onMount.mock.calls[0][2]).toBe(router);
  });

  it("should emit onMount hook when a sub-app is mounted", async () => {
    const onMount = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init: vi.fn(),
      onMount,
    });

    const app = new WrakerApp({ plugins: [plugin()] });
    await app.listen();

    const subApp = new WrakerApp();
    app.use("/sub", subApp);

    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onMount.mock.calls[0][2]).toBeInstanceOf(WrakerApp);
  });

  it("should destroy and stop processing messages", async () => {
    const destroy = vi.fn();
    const plugin = defineWrakerAppPlugin({
      name: "test",
      init: vi.fn(),
      destroy,
    });

    const app = new WrakerApp({ plugins: [plugin()] });
    await app.listen();

    app.destroy();

    expect(destroy).toHaveBeenCalledTimes(1);

    const handler = vi.fn((_req, res) => {
      res.status(200).end();
    });
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

    await expect(promise).toTimeOut(100);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it("should throw when destroying without listening", () => {
    const app = new WrakerApp();

    expect(() => app.destroy()).toThrow("WrakerApp is not listening");
  });

  it("should forward plugin options to hooks", async () => {
    const init = vi.fn();
    const onListen = vi.fn();

    const plugin = defineWrakerAppPlugin<{}, { key: string }>({
      name: "test",
      init,
      onListen,
    })({ key: "value" });

    const app = new WrakerApp({ plugins: [plugin] });
    await app.listen();

    expect(init).toHaveBeenCalledTimes(1);
    expect(init.mock.calls[0][1]).toEqual({ key: "value" });

    expect(onListen).toHaveBeenCalledTimes(1);
    expect(onListen.mock.calls[0][1]).toEqual({ key: "value" });
  });

  it("should stop plugin iteration when a hook returns false", async () => {
    const init1 = vi.fn(() => false as const);
    const init2 = vi.fn();

    const plugin1 = defineWrakerAppPlugin({
      name: "plugin1",
      init: init1,
    });

    const plugin2 = defineWrakerAppPlugin({
      name: "plugin2",
      init: init2,
    });

    new WrakerApp({ plugins: [plugin1(), plugin2()] });

    expect(init1).toHaveBeenCalledTimes(1);
    expect(init2).toHaveBeenCalledTimes(0);
  });
});
