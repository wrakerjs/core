import { describe, expect, it } from "vitest";
import "../utils";

import { WrakerApp, WrakerAppRequest, WrakerAppResponse } from "../..";

describe("WrakerAppRequest", () => {
  it("should initialize properly", () => {
    const app = new WrakerApp();

    const request = new WrakerAppRequest(app, {
      body: "body",
      headers: {
        "X-Request-Id": "123",
      },
      method: "GET",
      path: "/",
    });

    expect(request).toBeDefined();
    expect(request.app).toBe(app);
    expect(request.body).toEqual("body");
    expect(request.get("x-request-id")).toEqual("123");
    expect(request.method).toEqualCaseInsensitive("GET");
    expect(request.path).toEqual("/");
    expect(request.res).toBeInstanceOf(WrakerAppResponse);
    expect(request.cookies).toBeDefined();
  });

  it("should get header", () => {
    const app = new WrakerApp();

    const request = new WrakerAppRequest(app, {
      path: "/any",
      method: "GET",
      headers: {
        "X-Request-Id": "123",
      },
      body: {},
    });

    expect(request.get("x-request-id")).toEqual("123");
    expect(request.get("does-not-exist")).toBeUndefined();
  });
});
