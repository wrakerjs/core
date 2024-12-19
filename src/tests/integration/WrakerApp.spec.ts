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

  it("should stop propagation if event is prevented", async () => {
    const plugin = defineWrakerAppPlugin<{}, { prevent: boolean }>({
      name: "test",
      init: vi.fn(),
      onBeforeMessageHandled: (_a, options, event) => {
        if (options?.prevent) event.stopImmediatePropagation();
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
  });

  it("should keep processing if event is not prevented", async () => {
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
});
