import { it, describe, expect, vitest } from "vitest";
import { WrakerRouter, type WrakerAppRequest } from "../..";
import { __dproc } from "../utils";

describe("WrakerRouter", () => {
  it("should be well defined", async () => {
    const router = new WrakerRouter();

    expect(router).toBeDefined();
    expect(router).toBeInstanceOf(WrakerRouter);
  });

  it("should have a common base route", async () => {
    const router = new WrakerRouter();
    expect(router.path).toBe("/"); // default path

    router.route("/api");
    expect(router.path).toBe("/api");
  });

  it("should have a method for each major HTTP verb", async () => {
    const router = new WrakerRouter();

    expect(router.all).toBeInstanceOf(Function);
    expect(router.delete).toBeInstanceOf(Function);
    expect(router.get).toBeInstanceOf(Function);
    expect(router.head).toBeInstanceOf(Function);
    expect(router.options).toBeInstanceOf(Function);
    expect(router.patch).toBeInstanceOf(Function);
    expect(router.post).toBeInstanceOf(Function);
    expect(router.put).toBeInstanceOf(Function);
  });

  it("should contain registered routes", async () => {
    const router = new WrakerRouter();

    router.get("/", () => {});
    router.post("/", () => {});
    router.put("/", () => {});
    router.delete("/", () => {});

    expect(router.stack).toHaveLength(4);
  });

  it("should keep track of the route path", async () => {
    const router = new WrakerRouter();

    router.get("/path", () => {});
    expect(router.stack[0].path).toBe("/path");
  });

  it("should keep track of the route method", async () => {
    const router = new WrakerRouter();

    router.get("/path", () => {});
    expect(router.stack[0].method).toEqual("get");

    router.post("/path", () => {});
    expect(router.stack[1].method).toEqual("post");
  });

  it("should keep track of the route handler", async () => {
    const router = new WrakerRouter();
    const handler = vitest.fn();

    router.get("/path", handler);
    expect(router.stack[0].handler).toBe(handler);
  });

  it("should allow chaining of route methods", async () => {
    const router = new WrakerRouter();

    router.get("/path", () => {}).post("/path", () => {});

    expect(router.stack).toHaveLength(2);
  });

  it("should execute the route handler", async () => {
    const router = new WrakerRouter();

    const handler = vitest.fn();
    router.get("/path", handler);

    router["_process"](
      __dproc({
        method: "get",
        path: "/path",
      })
    );

    router["_process"](
      __dproc({
        method: "GET",
        path: "/path",
      })
    );

    expect(handler).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it("should execute all matching route handlers", async () => {
    const router = new WrakerRouter();

    const handler = vitest.fn((_req, _res, next) => {
      next();
    });
    router
      .get("/nope", handler)
      .get("/path", handler)
      .get("/path", handler)
      .get("/path", handler)
      .get("/path/sub", handler)
      .post("/path", handler)
      .all("/path", handler);

    await router["_process"](
      __dproc({
        method: "get",
        path: "/path",
      })
    );

    expect(handler).toHaveBeenNthCalledWith(
      4,
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it("should use handlers", async () => {
    const router = new WrakerRouter();

    const handler = vitest.fn((_req, _res, next) => {
      next();
    });
    router.use("/", handler).use(handler).use(handler, handler);

    await router["_process"](
      __dproc({
        method: "get",
        path: "/",
      })
    );
    expect(handler).toHaveBeenNthCalledWith(
      4,
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it("should use handlers and break handler chain", async () => {
    const router = new WrakerRouter();

    const handler = vitest.fn((_req, _res, next) => {
      next();
    });
    const handlerNoNext = vitest.fn();

    router.use("/", handler).use(handlerNoNext).use(handler, handler);

    await router["_process"](
      __dproc({
        method: "get",
        path: "/",
      })
    );
    expect(handler).toHaveBeenCalledOnce();
  });

  it("should use subrouter", async () => {
    const router = new WrakerRouter();
    const outerHandler = vitest.fn();
    router.get("/path", outerHandler);

    const inner = new WrakerRouter();
    router.use("/inner", inner);
    const innerHandler = vitest.fn();
    inner.get("/path", innerHandler);

    await router["_process"](
      __dproc({
        method: "get",
        path: "/path",
      })
    );

    expect(outerHandler).toHaveBeenCalledTimes(1);
    expect(innerHandler).toHaveBeenCalledTimes(0);

    await router["_process"](
      __dproc({
        method: "get",
        path: "/inner/path",
      })
    );

    expect(outerHandler).toHaveBeenCalledTimes(1);
    expect(innerHandler).toHaveBeenCalledTimes(1);

    await router["_process"](
      __dproc({
        method: "get",
        path: "/inner/none",
      })
    );

    expect(outerHandler).toHaveBeenCalledTimes(1);
    expect(innerHandler).toHaveBeenCalledTimes(1);
  });

  it("should handle next handlers", async () => {
    const router = new WrakerRouter();
    const handler = vitest.fn();

    router.use("/", (req, _res, next) => {
      req.body = {
        hasNext: true,
      };

      next();
    });
    router.get("/", (req, res) => {
      handler(req.body.hasNext);
      res.end();
    });

    await router["_process"](
      __dproc({
        method: "get",
        path: "/",
      })
    );

    expect(handler).toHaveBeenNthCalledWith(1, true);
  });

  it("should handle websockets", async () => {});
});
