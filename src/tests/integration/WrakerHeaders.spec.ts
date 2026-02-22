import { describe, expect, it } from "vitest";
import { WrakerHeaders } from "../..";

describe("WrakerHeaders", () => {
  it("should be well defined", async () => {
    const headers = new WrakerHeaders();

    expect(headers).toBeDefined();
    expect(headers).toBeInstanceOf(WrakerHeaders);
  });

  it("can be initialized with entries", async () => {
    const headers = new WrakerHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer token",
    });

    expect(headers).toBeDefined();
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer token");
  });

  it("can set and get headers (case-insensitive)", async () => {
    const headers = new WrakerHeaders();

    headers.set("Content-Type", "application/json");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("Content-Type")).toBe(headers.get("content-type"));
  });

  it("can check if a header exists (case-insensitive)", async () => {
    const headers = new WrakerHeaders();

    headers.set("Content-Type", "application/json");
    expect(headers.has("Content-Type")).toBe(true);
    expect(headers.has("content-type")).toBe(true);
  });

  it("can delete a header (case-insensitive)", async () => {
    const headers = new WrakerHeaders();

    headers.set("Content-Type", "application/json");
    headers.delete("Content-Type");
    expect(headers.has("Content-Type")).toBe(false);

    headers.set("Content-Type", "application/json");
    headers.delete("content-type");
    expect(headers.has("content-type")).toBe(false);
  });

  it("can serialize the headers", async () => {
    const headers = new WrakerHeaders();

    headers.set("Content-Type", "application/json");
    headers.set("Authorization", "Bearer token");

    const serialized = headers.serialize();
    expect(serialized).toEqual({
      "content-type": "application/json",
      authorization: "Bearer token",
    });
  });
});
