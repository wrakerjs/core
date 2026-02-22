import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../utils";

import { defineWraker, defineWrakerPlugin, Wraker } from "../..";

class WorkerMock extends Worker {
  public static testing: string;

  postMessage(message: any) {
    switch (WorkerMock.testing) {
      case "hello": {
        const body = "Hello, world!";
        const status = 200;
        this.dispatchEvent(
          new MessageEvent("message", { data: { ...message, body, status } }),
        );
        break;
      }

      case "error": {
        const error = "Internal server error";
        const status = 500;
        this.dispatchEvent(
          new MessageEvent("message", { data: { ...message, error, status } }),
        );
        break;
      }

      case "custom": {
        // Send a message without X-Request-ID (plugin-specific traffic)
        this.dispatchEvent(
          new MessageEvent("message", {
            data: { _custom: true, payload: "plugin-data" },
          }),
        );
        break;
      }

      case "timeout":
        break;

      default:
        this.dispatchEvent(new MessageEvent("message", { data: message }));
        break;
    }
  }
}

describe("WrakerPlugin (client)", () => {
  beforeEach(() => {
    vi.stubGlobal("Worker", WorkerMock);
    WorkerMock.testing = "default";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ─── Plugin factory ────────────────────────────────────────────────

  it("should create a plugin via defineWrakerPlugin", () => {
    const factory = defineWrakerPlugin({
      name: "test-plugin",
      init: vi.fn(),
    });

    const plugin = factory();
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe("test-plugin");
    expect(plugin.init).toBeTypeOf("function");
  });

  it("should forward options through the factory", () => {
    const factory = defineWrakerPlugin<{}, { key: string }>({
      name: "test-plugin",
      init: vi.fn(),
    });

    const plugin = factory({ key: "value" });
    expect(plugin.options).toEqual({ key: "value" });
  });

  // ─── init hook ─────────────────────────────────────────────────────

  it("should call init when plugin is used in Wraker constructor", () => {
    const init = vi.fn();
    const plugin = defineWrakerPlugin({
      name: "test",
      init,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    expect(wraker).toBeDefined();
    expect(init).toHaveBeenCalledTimes(1);
  });

  it("should call init when plugin is used in defineWraker", () => {
    const init = vi.fn();
    const plugin = defineWrakerPlugin({
      name: "test",
      init,
    });

    defineWraker("data:application/javascript,", { plugins: [plugin()] });

    expect(init).toHaveBeenCalledTimes(1);
  });

  it("should call init when using fromWorker with plugins", () => {
    const init = vi.fn();
    const plugin = defineWrakerPlugin({
      name: "test",
      init,
    });

    const worker = new Worker("data:application/javascript,");
    Wraker.fromWorker(worker, { plugins: [plugin()] });

    expect(init).toHaveBeenCalledTimes(1);
  });

  it("should pass the wraker instance to init hook", () => {
    const init = vi.fn();
    const plugin = defineWrakerPlugin({
      name: "test",
      init,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    expect(init.mock.calls[0][0]).toBe(wraker);
  });

  it("should forward plugin options to hooks", () => {
    const init = vi.fn();
    const plugin = defineWrakerPlugin<{}, { prefix: string }>({
      name: "test",
      init,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin({ prefix: "[test]" })],
    });

    expect(wraker).toBeDefined();
    expect(init).toHaveBeenCalledTimes(1);
    expect(init.mock.calls[0][1]).toEqual({ prefix: "[test]" });
  });

  // ─── Multiple plugins ─────────────────────────────────────────────

  it("should handle multiple plugins", () => {
    const init1 = vi.fn();
    const init2 = vi.fn();

    const plugin1 = defineWrakerPlugin({ name: "p1", init: init1 });
    const plugin2 = defineWrakerPlugin({ name: "p2", init: init2 });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin1(), plugin2()],
    });

    expect(wraker).toBeDefined();
    expect(init1).toHaveBeenCalledTimes(1);
    expect(init2).toHaveBeenCalledTimes(1);
  });

  it("should stop plugin iteration when a hook returns false", () => {
    const init1 = vi.fn(() => false as const);
    const init2 = vi.fn();

    const plugin1 = defineWrakerPlugin({ name: "p1", init: init1 });
    const plugin2 = defineWrakerPlugin({ name: "p2", init: init2 });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin1(), plugin2()],
    });

    expect(wraker).toBeDefined();
    expect(init1).toHaveBeenCalledTimes(1);
    expect(init2).toHaveBeenCalledTimes(0);
  });

  // ─── Extension typing via defineWraker ─────────────────────────────

  it("should allow plugins to extend the wraker instance", () => {
    type TestExtension = { greeting: string };

    const plugin = defineWrakerPlugin<TestExtension>({
      name: "test",
      init(wraker) {
        wraker.greeting = "hello";
      },
    });

    const wraker = defineWraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    expect(wraker.greeting).toBe("hello");
  });

  // ─── destroy hook ──────────────────────────────────────────────────

  it("should call destroy hook when kill() is called", () => {
    const destroy = vi.fn();
    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      destroy,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    wraker.kill();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("should call destroy before worker is terminated", () => {
    const order: string[] = [];

    const destroy = vi.fn(() => {
      order.push("destroy");
    });
    const terminateSpy = vi
      .spyOn(Worker.prototype, "terminate")
      .mockImplementation(() => {
        order.push("terminate");
      });

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      destroy,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    wraker.kill();

    expect(order).toEqual(["destroy", "terminate"]);
    terminateSpy.mockRestore();
  });

  // ─── onBeforeMessageSent hook ──────────────────────────────────────

  it("should call onBeforeMessageSent when fetch is called", async () => {
    const onBeforeMessageSent = vi.fn();
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageSent,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    await wraker.fetch("/hello");

    expect(onBeforeMessageSent).toHaveBeenCalledTimes(1);
    // Third arg (after wraker, options) is the WrakerRequest message
    const message = onBeforeMessageSent.mock.calls[0][2];
    expect(message.path).toBe("/hello");
    expect(message.method).toBe("GET");
    expect(message.headers).toBeDefined();
  });

  it("should prevent message sending when onBeforeMessageSent returns false", async () => {
    const postSpy = vi.spyOn(Worker.prototype, "postMessage");
    WorkerMock.testing = "timeout";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageSent: () => false,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    const request = wraker.fetch("/blocked");

    // postMessage should never have been called
    await expect(request).toTimeOut(100);
    expect(postSpy).not.toHaveBeenCalled();
  });

  // ─── onAfterMessageSent hook ───────────────────────────────────────

  it("should call onAfterMessageSent after postMessage", async () => {
    const onAfterMessageSent = vi.fn();
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onAfterMessageSent,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    await wraker.fetch("/hello");

    expect(onAfterMessageSent).toHaveBeenCalledTimes(1);
    const message = onAfterMessageSent.mock.calls[0][2];
    expect(message.path).toBe("/hello");
  });

  it("should not call onAfterMessageSent if sending was prevented", async () => {
    const onAfterMessageSent = vi.fn();
    WorkerMock.testing = "timeout";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageSent: () => false,
      onAfterMessageSent,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    const request = wraker.fetch("/blocked");
    await expect(request).toTimeOut(100);

    expect(onAfterMessageSent).not.toHaveBeenCalled();
  });

  // ─── onBeforeMessageReceived hook ──────────────────────────────────

  it("should call onBeforeMessageReceived when worker sends a message", async () => {
    const onBeforeMessageReceived = vi.fn();
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageReceived,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    await wraker.fetch("/hello");

    expect(onBeforeMessageReceived).toHaveBeenCalledTimes(1);
    const event = onBeforeMessageReceived.mock.calls[0][2];
    expect(event).toBeInstanceOf(MessageEvent);
  });

  it("should prevent default handling when onBeforeMessageReceived returns false", async () => {
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageReceived: () => false,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    // Fetch will never resolve because the response is intercepted
    const request = wraker.fetch("/hello");
    await expect(request).toTimeOut(100);
  });

  it("should allow plugin to intercept custom messages", async () => {
    WorkerMock.testing = "custom";
    const received: any[] = [];

    const plugin = defineWrakerPlugin({
      name: "interceptor",
      init: vi.fn(),
      onBeforeMessageReceived: (_wraker, _opts, event) => {
        const data = event.data as any;
        if (data?._custom) {
          received.push(data);
          return false; // Don't pass to default handler
        }
      },
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    // Trigger a fetch which makes the mock send a custom message
    const request = wraker.fetch("/trigger");
    await expect(request).toTimeOut(100);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ _custom: true, payload: "plugin-data" });
  });

  // ─── onAfterMessageReceived hook ───────────────────────────────────

  it("should call onAfterMessageReceived after response is handled", async () => {
    const onAfterMessageReceived = vi.fn();
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onAfterMessageReceived,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    await wraker.fetch("/hello");

    expect(onAfterMessageReceived).toHaveBeenCalledTimes(1);
    const event = onAfterMessageReceived.mock.calls[0][2];
    expect(event).toBeInstanceOf(MessageEvent);
    expect(event.data.body).toBe("Hello, world!");
  });

  it("should call onAfterMessageReceived after error response is handled", async () => {
    const onAfterMessageReceived = vi.fn();
    WorkerMock.testing = "error";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onAfterMessageReceived,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    try {
      await wraker.fetch("/error");
    } catch {
      // expected
    }

    expect(onAfterMessageReceived).toHaveBeenCalledTimes(1);
    const event = onAfterMessageReceived.mock.calls[0][2];
    expect(event.data.error).toBe("Internal server error");
  });

  it("should not call onAfterMessageReceived if onBeforeMessageReceived prevents handling", async () => {
    const onAfterMessageReceived = vi.fn();
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageReceived: () => false,
      onAfterMessageReceived,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    const request = wraker.fetch("/hello");
    await expect(request).toTimeOut(100);

    expect(onAfterMessageReceived).not.toHaveBeenCalled();
  });

  // ─── onError hook ─────────────────────────────────────────────────

  it("should call onError hook when onBeforeMessageReceived throws", async () => {
    const onError = vi.fn();
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "test",
      init: vi.fn(),
      onBeforeMessageReceived: () => {
        throw new Error("plugin error");
      },
      onError,
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    // The fetch will not resolve because the error prevented handling
    const request = wraker.fetch("/hello");
    await expect(request).toTimeOut(100);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][2]).toBeInstanceOf(Error);
  });

  // ─── Full lifecycle ────────────────────────────────────────────────

  it("should implement all hooks", () => {
    const hooks = {
      init: vi.fn(),
      destroy: vi.fn(),
      onBeforeMessageSent: vi.fn(),
      onAfterMessageSent: vi.fn(),
      onBeforeMessageReceived: vi.fn(),
      onAfterMessageReceived: vi.fn(),
      onError: vi.fn(),
    };

    const plugin = defineWrakerPlugin({
      name: "full-plugin",
      ...hooks,
    });

    const p = plugin();
    expect(p.init).toBeTypeOf("function");
    expect(p.destroy).toBeTypeOf("function");
    expect(p.onBeforeMessageSent).toBeTypeOf("function");
    expect(p.onAfterMessageSent).toBeTypeOf("function");
    expect(p.onBeforeMessageReceived).toBeTypeOf("function");
    expect(p.onAfterMessageReceived).toBeTypeOf("function");
    expect(p.onError).toBeTypeOf("function");
  });

  it("should call hooks in the correct order during a full fetch cycle", async () => {
    const order: string[] = [];
    WorkerMock.testing = "hello";

    const plugin = defineWrakerPlugin({
      name: "order-tracker",
      init: () => {
        order.push("init");
      },
      onBeforeMessageSent: () => {
        order.push("onBeforeMessageSent");
      },
      onAfterMessageSent: () => {
        order.push("onAfterMessageSent");
      },
      onBeforeMessageReceived: () => {
        order.push("onBeforeMessageReceived");
      },
      onAfterMessageReceived: () => {
        order.push("onAfterMessageReceived");
      },
    });

    const wraker = new Wraker("data:application/javascript,", {
      plugins: [plugin()],
    });

    await wraker.fetch("/hello");

    // Note: With a synchronous mock, postMessage dispatches the response
    // synchronously, so onBeforeMessageReceived/onAfterMessageReceived fire
    // inside postMessage — before onAfterMessageSent.
    expect(order).toEqual([
      "init",
      "onBeforeMessageSent",
      "onBeforeMessageReceived",
      "onAfterMessageReceived",
      "onAfterMessageSent",
    ]);
  });

  // ─── Backwards compatibility ───────────────────────────────────────

  it("should work without plugins (no regression)", async () => {
    WorkerMock.testing = "hello";

    const wraker = new Wraker("data:application/javascript,");
    const response = await wraker.fetch("/hello");

    expect(response.body).toBe("Hello, world!");
    expect(response.status).toBe(200);
  });

  it("should work with fromWorker without plugins (no regression)", async () => {
    WorkerMock.testing = "hello";

    const worker = new Worker("data:application/javascript,");
    const wraker = Wraker.fromWorker(worker);
    const response = await wraker.fetch("/hello");

    expect(response.body).toBe("Hello, world!");
    expect(response.status).toBe(200);
  });
});
