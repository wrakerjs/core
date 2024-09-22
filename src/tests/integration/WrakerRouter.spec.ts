import { it, describe, expect, vi, beforeEach, afterEach } from "vitest";

import {
  type LayerMethod,
  type Method,
  METHOD_ALL,
  type WrakerAppRequest,
  WrakerAppResponse,
  type WrakerRequest,
  WrakerRouter,
} from "../..";
import { __dproc } from "../utils";

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

describe("WrakerRouter", () => {
  beforeEach(() => {
    vi.stubGlobal("WrakerAppResponse", MockWrakerAppResponse);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be well defined", async () => {
    const router = new WrakerRouter();

    expect(router).toBeDefined();
    expect(router).toBeInstanceOf(WrakerRouter);
  });

  it("should have a base path", async () => {
    const router = new WrakerRouter();
    expect(router.path).toEqual("/");

    router.route("/api");
    expect(router.path).toEqual("/api");
  });

  it("should emit events on mount", async () => {
    const router = new WrakerRouter();
    const sub = new WrakerRouter();

    const promiseRouter = new Promise<CustomEvent>((resolve) => {
      router.addEventListener("wraker-router:mounted", (event) => {
        resolve(event);
      });
    });
    const promiseSub = new Promise<CustomEvent>((resolve) => {
      sub.addEventListener("wraker-router:mount", (event) => {
        resolve(event);
      });
    });

    router.use("/sub", sub);

    const events = await Promise.all([promiseRouter, promiseSub]);
    expect(events[0].detail.handler).toBe(sub);
    expect(events[1].detail.app).toBe(router);
  });

  it("should register routes", async () => {
    const router = new WrakerRouter();

    const handler = vi.fn();
    const handler2 = vi.fn();
    router.get("/model", handler).post("/model", handler2);

    expect(router.stack).toHaveLength(2);
    expect(router.stack[0].method).toEqual("get");
    expect(router.stack[0].path).toEqual("/model");
    expect(router.stack[0].handler).toBe(handler);
    expect(router.stack[1].method).toEqual("post");
    expect(router.stack[1].path).toEqual("/model");
    expect(router.stack[1].handler).toBe(handler2);
  });

  it("should register all methods", async () => {
    const methods: LayerMethod[] = [
      "checkout",
      "copy",
      "delete",
      "get",
      "head",
      "lock",
      "merge",
      "mkactivity",
      "mkcol",
      "move",
      "m-search",
      "notify",
      "options",
      "patch",
      "post",
      "purge",
      "put",
      "report",
      "search",
      "subscribe",
      "trace",
      "unlock",
      "unsubscribe",
      METHOD_ALL,
    ];

    const handler = vi.fn();
    const handler2 = vi.fn();
    methods.forEach((method: LayerMethod) => {
      const router = new WrakerRouter();

      const _method: Lowercase<Method> =
        method.toLowerCase() as Lowercase<Method>;
      router[_method]("/model", handler, handler2);

      expect(router.stack).toHaveLength(2);
      expect(router.stack[0].method).toEqual(_method);
      expect(router.stack[0].path).toEqual("/model");
      expect(router.stack[0].handler).toBe(handler);

      expect(router.stack[1].method).toEqual(_method);
      expect(router.stack[1].path).toEqual("/model");
      expect(router.stack[1].handler).toBe(handler2);
    });
  });

  it("should use without path", async () => {
    const router = new WrakerRouter();
    const sub = new WrakerRouter();
    const sub2 = new WrakerRouter();
    router.use(sub, sub2);

    expect(router.stack).toHaveLength(2);
    expect(router.stack[0].method).toEqual(METHOD_ALL);
    expect(router.stack[0].all).toEqual(true);
    expect(router.stack[0].handler).toBe(sub);

    expect(router.stack[1].method).toEqual(METHOD_ALL);
    expect(router.stack[1].all).toEqual(true);
    expect(router.stack[1].handler).toBe(sub2);
  });

  it("should use with path", async () => {
    const router = new WrakerRouter();
    const sub = new WrakerRouter();
    const sub2 = new WrakerRouter();
    router.use("/sub", sub, sub2);

    expect(router.stack).toHaveLength(2);
    expect(router.stack[0].method).toEqual(METHOD_ALL);
    expect(router.stack[0].path).toEqual("/sub");
    expect(router.stack[0].handler).toBe(sub);

    expect(router.stack[1].method).toEqual(METHOD_ALL);
    expect(router.stack[1].path).toEqual("/sub");
    expect(router.stack[1].handler).toBe(sub2);
  });

  it("should call first handler that match path", async () => {
    const router = new WrakerRouter();
    const handler = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    router.get("/no-match", handler);
    router.get("/match", handler2);
    router.post("/match", handler2);
    router.get("/match", handler3);

    const request: WrakerRequest<void> = __dproc({
      method: "GET",
      path: "/match",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(0);
  });

  it("should call first handler that match path (all)", async () => {
    const router = new WrakerRouter();
    const handler = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    router.get("/no-match", handler);
    router.use(handler2);
    router.all("/match", handler3);

    const request: WrakerRequest<void> = __dproc({
      method: "GET",
      path: "/match",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(0);
  });

  it("should call first handler that match method", async () => {
    const router = new WrakerRouter();
    const handler = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    router.get("/match", handler);
    router.post("/match", handler2);
    router.get("/match", handler3);

    const request: WrakerRequest<void> = __dproc({
      method: "POST",
      path: "/match",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(0);
  });

  it("should call first handler that match method (all)", async () => {
    const router = new WrakerRouter();
    const handler = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();

    router.get("/match", handler);
    router.all("/match", handler2);
    router.post("/match", handler3);

    const request: WrakerRequest<void> = __dproc({
      method: "POST",
      path: "/match",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(0);
  });

  it("should call sub router that partially match path", async () => {
    const router = new WrakerRouter();
    const sub = new WrakerRouter();
    const sub2 = new WrakerRouter();
    const sub3 = new WrakerRouter();
    const handler = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();
    const handler4 = vi.fn();

    router.use("/no-foo", sub);
    sub.get("/bar", handler);

    router.use("/fo", sub2);
    sub2.get("/o/bar", handler2);

    router.use("/foo", sub3);
    sub3.get("/no-bar", handler2);
    sub3.get("/bar", handler3);
    sub3.post("/bar", handler3);

    router.get("/foo/bar", handler4);

    const request: WrakerRequest<void> = __dproc({
      method: "GET",
      path: "/foo/bar",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(0);
    expect(handler3).toHaveBeenCalledTimes(1);
    expect(handler4).toHaveBeenCalledTimes(1);
  });

  it("should match (batch test)", async () => {
    const router = new WrakerRouter();

    let logs: string[] = [];

    router.use((_req, _res, next) => {
      logs.push("all@all");
      next();
    });
    router.use("/match", (_req, _res, next) => {
      logs.push("all@/match");
      next();
    });
    router.get("/match", (_req, _res, next) => {
      logs.push("get@/match");
      next();
    });
    router.get("/match/", (_req, _res, next) => {
      logs.push("get@/match/");
      next();
    });

    const sub = new WrakerRouter({ path: "/match" });
    sub.all("/", (_req, _res, next) => {
      logs.push("all@sub/:/match:/");
      next();
    });
    router.use(sub);

    const sub2 = new WrakerRouter();
    sub2.all("/", (_req, _res, next) => {
      logs.push("all@sub2/match:/");
      next();
    });
    router.use("/match", sub2);

    await router["_process"](
      __dproc({
        method: "GET",
        path: "/match",
      })
    );
    expect(logs).toEqual([
      "all@all",
      "all@/match",
      "get@/match",
      "all@sub/:/match:/",
      "all@sub2/match:/",
    ]);

    logs = [];
    await router["_process"](
      __dproc({
        method: "GET",
        path: "/match/",
      })
    );

    expect(logs).toEqual(["all@all", "get@/match/", "all@sub2/match:/"]);
  });

  it("should match WrakerRouter with path", async () => {
    const router = new WrakerRouter();
    const sub = new WrakerRouter({ path: "/match" });
    const sub2 = new WrakerRouter();
    const sub3 = new WrakerRouter();

    const logs: string[] = [];

    router.use("/", sub);
    sub.get("/", (_req, _res, next) => {
      logs.push("get@/match:/:/");
      next();
    });

    router.use("/", sub2);
    sub2.get("/match", (_req, _res, next) => {
      logs.push("get@/:/:/match");
      next();
    });

    router.use("/match", sub3);
    sub3.get("/", (_req, _res, next) => {
      logs.push("get@/:/match:/");
      next();
    });

    const request: WrakerRequest<void> = __dproc({
      method: "GET",
      path: "/match",
    });

    await router["_process"](request);

    expect(logs).toEqual([
      "get@/match:/:/",
      "get@/:/:/match",
      "get@/:/match:/",
    ]);
  });

  it("should use next handler", async () => {
    const router = new WrakerRouter();
    const handler = vi.fn((_req, _res, next) => {
      next();
    });
    const handler2 = vi.fn((_req, res) => {
      res.send("OK");
    });
    const handler3 = vi.fn();

    router.use("/match", handler, handler2, handler3);

    const request: WrakerRequest<void> = __dproc({
      method: "GET",
      path: "/match",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
    expect(handler3).toHaveBeenCalledTimes(0);
  });

  it("should use next handler with error", async () => {
    const router = new WrakerRouter();
    const handler = vi.fn((_req, _res, next) => {
      next(new Error("Error"));
    });
    const handler2 = vi.fn((_req, res) => {
      res.send("OK");
    });
    const handler3 = vi.fn();

    router.use("/match", handler, handler2, handler3);

    const request: WrakerRequest<void> = __dproc({
      method: "GET",
      path: "/match",
    });

    await router["_process"](request);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(0);
    expect(handler3).toHaveBeenCalledTimes(0);
  });

  it("should handle route groups", async () => {
    const router = new WrakerRouter();
    const middleware = vi.fn((_req, _res, next) => next());
    const handler = vi.fn();
    const handler2 = vi.fn();

    router
      .route("/users")
      .use(middleware)
      .get("/", handler)
      .get("/new", handler2);

    await router["_process"](
      __dproc({
        method: "GET",
        path: "/users",
      })
    );
    expect(middleware).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(0);

    await router["_process"](
      __dproc({
        method: "GET",
        path: "/users/new",
      })
    );

    expect(middleware).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
