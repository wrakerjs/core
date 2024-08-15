import { it, describe, expect, vi, afterEach, beforeEach, chai } from "vitest";
const { AssertionError } = chai;

import { TimeoutException, Wraker } from ".";
import fixtureWorkerUrl from "../tests/fixtures/basic?url";
import FixtureWorker from "../tests/fixtures/basic?worker";
class WorkerMock extends EventTarget {
  public static testing: string;

  postMessage(message: MessageEvent) {
    switch (WorkerMock.testing) {
      case "hello":
        {
          const body = "Hello, world!";
          const status = 200;
          this.dispatchEvent(
            new MessageEvent("message", { data: { ...message, body, status } })
          );
        }
        break;

      case "error":
        {
          const error = "Internal server error";
          const status = 500;
          this.dispatchEvent(
            new MessageEvent("message", { data: { ...message, error, status } })
          );
        }
        break;

      case "timeout":
        break;

      default:
        this.dispatchEvent(new MessageEvent("message", { data: message }));
        break;
    }
  }
}

describe("Wraker", () => {
  beforeEach(() => {
    vi.stubGlobal("Worker", WorkerMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should initialize from Worker interface", async () => {
    const instance = new Wraker(fixtureWorkerUrl, {
      type: "module",
    });

    expect(instance).toBeDefined();
  });

  it("should initialize properly from existing worker", async () => {
    const worker = new FixtureWorker();
    const instance = Wraker.fromWorker(worker);

    expect(instance).toBeDefined();
  });

  it("should send fetch requests", async () => {
    const postSpy = vi.spyOn(Worker.prototype, "postMessage");
    postSpy.mockImplementation(() => {});

    const instance = new Wraker("data:application/javascript,");

    instance.fetch("/hello");
    expect(postSpy).toHaveBeenNthCalledWith(1, {
      method: "GET",
      path: "/hello",
      body: {},
      headers: expect.anything(),
    });
  });

  it("should resolve on response", async () => {
    const postSpy = vi.spyOn(Worker.prototype, "postMessage");
    WorkerMock.testing = "hello";

    const instance = new Wraker("data:application/javascript,");
    const request = instance.fetch("/hello", {
      method: "GET",
    });

    expect(postSpy).toHaveBeenCalledOnce();
    const requestId = postSpy.mock.calls[0][0].headers["X-Request-ID"];

    try {
      const response = await request;

      expect(response.headers["X-Request-ID"]).toEqual(requestId);
      expect(response.body).toEqual("Hello, world!");
      expect(response.status).toEqual(200);
    } catch (error) {
      expect.fail("Request should have succeeded: " + error);
    }
  });

  it("should reject on error response", async () => {
    const postSpy = vi.spyOn(Worker.prototype, "postMessage");
    WorkerMock.testing = "error";

    const instance = new Wraker("data:application/javascript,");
    const request = instance.fetch("/error", {
      method: "GET",
    });

    expect(postSpy).toHaveBeenCalledOnce();
    const requestId = postSpy.mock.calls[0][0].headers["X-Request-ID"];

    try {
      await request;
      expect.fail("Request should have failed");
    } catch (error: any) {
      if (error instanceof AssertionError) throw error;

      expect(error).toBeDefined();
      expect(error.headers["X-Request-ID"]).toEqual(requestId);
      expect(error.status).toEqual(500);
      expect(error.error).toEqual("Internal server error");
    }
  });

  it("should handle timeouts", async () => {
    const postSpy = vi.spyOn(Worker.prototype, "postMessage");
    WorkerMock.testing = "timeout";

    const instance = new Wraker("data:application/javascript,");

    try {
      await instance.fetch("/timeout", {
        timeout: 50,
      });
      expect.fail("Request should have failed");
    } catch (error: any) {
      expect(postSpy).toHaveBeenCalledOnce();

      if (error instanceof AssertionError) throw error;
      expect(error).toBeInstanceOf(TimeoutException);
    }
  });
});
