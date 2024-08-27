import { describe, expect, it, vitest, beforeEach, chai, vi } from "vitest";
const { AssertionError } = chai;
import {
  ResponseAlreadySentException,
  WrakerApp,
  WrakerAppRequest,
  WrakerAppResponse,
  WrakerHeaders,
  type WrakerResponse,
} from "../..";

class MockWrakerAppResponse extends WrakerAppResponse {
  constructor(req: WrakerAppRequest) {
    super(req);

    globalThis.postMessage = (data: any) => {
      globalThis.dispatchEvent(
        new CustomEvent("postMessage", {
          detail: data,
        })
      );
    };
  }
}

describe("WrakerAppResponse", () => {
  let app: WrakerApp;
  let request: WrakerAppRequest;

  beforeEach(() => {
    app = new WrakerApp();

    request = new WrakerAppRequest(app, {
      body: "body",
      headers: {
        "X-Request-Id": "123",
      },
      method: "GET",
      path: "/",
    });
  });

  it("should initialize properly", () => {
    const response = new WrakerAppResponse(request);

    expect(response).toBeDefined();
    expect(response.app).toBe(app);
    expect(response.req).toBe(request);
    expect(response.headers).toBeInstanceOf(WrakerHeaders);
  });

  it("should keep a given status code", () => {
    const response = new WrakerAppResponse(request);

    response.statusCode = 1;
    expect(response.statusCode).toEqual(1);

    const chaining = response.status(2);
    expect(chaining).toBe(response);
    expect(response.statusCode).toEqual(2);
  });

  it("can be ended and only once", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    response.end();
    const data = await promise;

    expect(data.body).toBeUndefined();
    expect(data.status).toEqual(200);

    try {
      response.end();

      expect.fail("Response.end should have failed.");
    } catch (error) {
      if (error instanceof AssertionError) throw error;

      expect(error).toBeInstanceOf(ResponseAlreadySentException);
    }
  });

  it("can send raw data and only once", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    response.status(300);
    response.send("anything");
    const data = await promise;

    expect(data.body).toEqual("anything");
    expect(data.status).toEqual(300);

    try {
      response.send("anything");

      expect.fail("Response.end should have failed.");
    } catch (error) {
      if (error instanceof AssertionError) throw error;

      expect(error).toBeInstanceOf(ResponseAlreadySentException);
    }
  });

  it("can send valid json data and only once", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    const jsonData = {
      key: "value",
    };

    response.json(jsonData);
    const data = await promise;

    expect(data.body).toEqual(JSON.stringify(jsonData));
    expect(new WrakerHeaders(data.headers).get("content-type")).toEqual(
      "application/json"
    );

    try {
      response.send("anything");

      expect.fail("Response.end should have failed.");
    } catch (error) {
      if (error instanceof AssertionError) throw error;

      expect(error).toBeInstanceOf(ResponseAlreadySentException);
    }
  });

  it("can send error and only once", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    const error = new Error("Woops, error");

    response.sendError(error);
    const data = await promise;

    expect(data.error.message).toEqual("Woops, error");
    expect(data.status).toEqual(500);

    try {
      response.send("anything");

      expect.fail("Response.end should have failed.");
    } catch (error) {
      if (error instanceof AssertionError) throw error;

      expect(error).toBeInstanceOf(ResponseAlreadySentException);
    }
  });
});
