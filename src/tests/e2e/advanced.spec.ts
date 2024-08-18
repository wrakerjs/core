import { it, describe, expect, beforeEach } from "vitest";
import { Wraker } from "../..";

import workerUrl from "../fixtures/advanced?url";
import workerConstructor from "../fixtures/advanced?worker";

describe.each(["url", "constructor"])("[Advanced] Wraker", (type) => {
  let wraker: Wraker;
  beforeEach(() => {
    switch (type) {
      case "constructor":
        const worker = new workerConstructor();
        wraker = Wraker.fromWorker(worker);
        break;
      case "url":
        wraker = new Wraker(workerUrl, { type: "module" });
        break;
    }
  });

  it(`should be defined from ${type}`, async () => {
    expect(wraker).toBeDefined();
  });

  it("should follow the flow", async () => {
    let data = await wraker.fetch("/items", {
      headers: {
        Authorization: "Bearer SUPER_SECRET_TOKEN",
      },
    });

    let json = JSON.parse(data.body);
    expect(json).toEqual([]);

    const item = {
      id: 1,
      value: "First!",
    };

    data = await wraker.fetch("/items", {
      method: "post",
      body: {
        item,
      },
      headers: {
        Authorization: "Bearer SUPER_SECRET_TOKEN",
      },
    });

    json = JSON.parse(data.body);
    expect(json).toEqual({
      message: "Item succesfully added.",
    });

    data = await wraker.fetch("/items", {
      headers: {
        Authorization: "Bearer SUPER_SECRET_TOKEN",
      },
    });
    json = JSON.parse(data.body);

    expect(json).toEqual([[item.id, item.value]]);
  });

  it("should catch errors", async () => {
    try {
      await wraker.fetch("/items", {
        method: "post",
        body: {
          useless: "data",
        },
        headers: {
          Authorization: "Bearer SUPER_SECRET_TOKEN",
        },
      });
      expect.fail("Fetch should fail.");
    } catch (data: any) {
      expect(data.error).toBeInstanceOf(Error);
      expect(data.error.message).toBe("Item data is missing.");
      expect(data.status).toBe(400);
    }
  });

  it("should fail on missing auth", async () => {
    try {
      await wraker.fetch("/items", {
        method: "post",
        body: {
          useless: "data",
        },
      });
      expect.fail("Fetch should fail.");
    } catch (data: any) {
      expect(data.error).toBeInstanceOf(Error);
      expect(data.error.message).toBe("Unauthorized.");
      expect(data.status).toBe(401);
    }
  });

  it("should fail on invalid auth", async () => {
    try {
      await wraker.fetch("/items", {
        method: "post",
        body: {
          useless: "data",
        },
        headers: {
          Authorization: "Bearer WRONG_SECRET:(",
        },
      });
      expect.fail("Fetch should fail.");
    } catch (data: any) {
      expect(data.error).toBeInstanceOf(Error);
      expect(data.error.message).toBe("Forbidden.");
      expect(data.status).toBe(403);
    }
  });
});
