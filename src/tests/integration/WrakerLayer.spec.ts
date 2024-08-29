import { describe, expect, it } from "vitest";
import { getMatchingLayers, joinpath, subpath, WrakerRouter } from "../..";
import { __dproc } from "../utils";

describe("WrakerLayer", () => {
  describe("subpath", () => {
    it("should return '/' if prefix is equal to path", () => {
      expect(subpath("/foo", "/foo")).toBe("/");
    });

    it("should return the path if prefix is not a prefix of path", () => {
      expect(subpath("/foo", "/bar")).toBe("/foo");
    });

    it("should return the path without the prefix if prefix is a prefix of path", () => {
      expect(subpath("/foo/bar", "/foo")).toBe("/bar");
    });

    it("should return the path without the prefix if prefix is a full prefix of path", () => {
      expect(subpath("/foo/bar", "/fo")).toBe("/foo/bar");
    });
  });

  describe("joinpath", () => {
    it("should return the suffix if path is '/'", () => {
      expect(joinpath("/", "/foo")).toBe("/foo");
    });

    it("should return the path if suffix is '/'", () => {
      expect(joinpath("/foo", "/")).toBe("/foo");
    });

    it("should return the path with the suffix appended if path ends with '/'", () => {
      expect(joinpath("/foo/", "/bar")).toBe("/foo/bar");
    });

    it("should return the path with the suffix appended if path does not end with '/'", () => {
      expect(joinpath("/foo", "/bar")).toBe("/foo/bar");
    });

    it("should return paths", () => {
      expect(joinpath("/", joinpath("/match", "/"))).toBe("/match");
    });

    it("should not keep the trailing slash", () => {
      expect(joinpath("/api", "/")).toBe("/api");
    });
  });

  describe("getMatchingLayers", () => {
    it("should return all layers that match the request", () => {
      const router = new WrakerRouter();
      const sub = new WrakerRouter();
      const sub2 = new WrakerRouter();

      router.use("/foo", () => {}); // full path doesn't match

      router.use("/foo", sub); // router doesn't have a handler that matches
      sub.post("/bar", () => {}); // <-- specific method

      router.use("/foo", sub2); // router has a handler that matches
      sub2.get("/bar", () => {}); // <-- specific method

      router.use("/foo/bar", () => {}); // full path matches

      router.use("/foo/bar", sub); // router doesn't have a handler that matches

      router.use("/bar", () => {}); // path doesn't match

      router.use("/bar", sub); // path doesn't match

      router.use(() => {}); // all paths match

      router.use(sub); // all paths match

      let request = __dproc({
        method: "get",
        path: "/foo/bar",
      });

      let layers = getMatchingLayers(request, router);

      expect(layers[0]).toBe(router.stack[2]);
      expect(layers[1]).toBe(router.stack[3]);
      expect(layers[2]).toBe(router.stack[7]);
      expect(layers[3]).toBe(router.stack[8]);

      request = __dproc({
        method: "post",
        path: "/foo/bar",
      });

      layers = getMatchingLayers(request, router);

      expect(layers[0]).toBe(router.stack[1]);
      expect(layers[1]).toBe(router.stack[3]);
      expect(layers[2]).toBe(router.stack[7]);
      expect(layers[3]).toBe(router.stack[8]);
    });
  });
});
