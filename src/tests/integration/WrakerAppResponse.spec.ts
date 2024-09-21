import { describe, expect, it, beforeEach, chai } from "vitest";

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
  });

  it("should have same x-request-id as request", () => {
    const response = new WrakerAppResponse(request);

    expect(response.get("X-Request-Id")).toEqual("123");
  });

  it("should have no x-request-id if request has none", () => {
    request["headers"].delete("X-Request-Id");

    const response = new WrakerAppResponse(request);

    expect(response.get("X-Request-Id")).toBeUndefined();
  });

  it("should set headers", () => {
    const response = new WrakerAppResponse(request);

    response.set("X-Response-Id", "321");
    expect(response.get("x-response-id")).toEqual("321");
  });

  it("should have sent headers", () => {
    const response = new WrakerAppResponse(request);

    expect(response.headersSent).toBe(false);

    response.send("anything");

    expect(response.headersSent).toBe(true);
  });

  it("should append headers", () => {
    const response = new WrakerAppResponse(request);

    response.append("h1", "321");
    expect(response.get("h1")).toEqual("321");

    response.append("h2", ["A", "B"]);
    expect(response.get("h2")).toEqual("A; B");
  });

  it("should have links", () => {
    const response = new WrakerAppResponse(request);

    response.links({
      next: "/next",
      last: "/last",
    });

    expect(response.get("Link")).toEqual(
      '</next>; rel="next", </last>; rel="last"'
    );
  });

  it("should send location", () => {
    const response = new WrakerAppResponse(request);

    response.location("/next");

    expect(response.get("Location")).toEqual("/next");
  });

  it("should send location back", () => {
    request["headers"].set("Referer", "/prev");
    const response = new WrakerAppResponse(request);

    response.location("back");

    expect(response.get("Location")).toEqual("/prev");
  });

  it("should send location back with no referer", () => {
    const response = new WrakerAppResponse(request);

    response.location("back");

    expect(response.get("Location")).toEqual("/");
  });

  it("should redirect", () => {
    const response = new WrakerAppResponse(request);

    response.redirect(301, "/next");

    expect(response.get("Location")).toEqual("/next");
    expect(response.statusCode).toEqual(301);
  });

  it("should redirect with status", () => {
    const response = new WrakerAppResponse(request);

    response.redirect("/next");

    expect(response.get("Location")).toEqual("/next");
    expect(response.statusCode).toEqual(302);
  });

  it("should keep a given status code", () => {
    const response = new WrakerAppResponse(request);

    response.statusCode = 1;
    expect(response.statusCode).toEqual(1);

    const chaining = response.status(2);
    expect(chaining).toBe(response);
    expect(response.statusCode).toEqual(2);
  });

  it("should send a default status code", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    response.send("anything");
    const data = await promise;

    expect(data.status).toEqual(200);
  });

  it("should send a default error status code", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    response.sendError("anything");
    const data = await promise;

    expect(data.status).toEqual(500);
  });

  it("should have cookies", (ctx) => {
    const response = new WrakerAppResponse(request);

    response
      .cookie("c1", "v1", {
        path: "/",
      })
      .cookie("c2", "v2");

    // TODO: Implement cookies test
  });

  it("should clear cookies", () => {
    const response = new WrakerAppResponse(request);

    response.cookie("name", "value");
    response.clearCookie("name");

    // TODO: Implement cookies test
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

  it("can send empty json data and only once", async () => {
    const response = new MockWrakerAppResponse(request);

    const promise = new Promise<WrakerResponse>((resolve) => {
      globalThis.addEventListener("postMessage", (event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        resolve(event.detail);
      });
    });

    response.json();
    const data = await promise;

    expect(data.body).toBeUndefined();
    expect(new WrakerHeaders(data.headers).get("content-type")).toBeUndefined();

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

    const error = new Error("404 - Not Found");

    response.status(404);
    response.sendError(error);
    const data = await promise;

    expect(data.error).toBeInstanceOf(Error);
    expect(data.status).toEqual(404);

    try {
      response.sendError("anything");

      expect.fail("Response.end should have failed.");
    } catch (error) {
      if (error instanceof AssertionError) throw error;

      expect(error).toBeInstanceOf(ResponseAlreadySentException);
    }
  });
});
