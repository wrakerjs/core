import { it, describe, expect } from "vitest";
import { Wraker } from "../..";

import workerUrl from "../fixtures/advanced?url";
import workerConstructor from "../fixtures/advanced?worker";

describe("[URL] advanced wraker", () => {
  it("should be defined as URL", async () => {
    const wraker = new Wraker(workerUrl, {
      type: "module",
    });
    expect(wraker).toBeDefined();
  });

  it("should follow the flow", async () => {
    const wraker = new Wraker(workerUrl, {
      type: "module",
    });

    let data = await wraker.fetch("/items");
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
    });
    json = JSON.parse(data.body);
    expect(json).toEqual({
      message: "Item succesfully added.",
    });

    data = await wraker.fetch("/items");
    json = JSON.parse(data.body);

    expect(json).toEqual([[item.id, item.value]]);
  });
});

describe("[Constructor] advanced wraker", () => {
  it("should be defined as constructor", async () => {
    const worker = new workerConstructor();
    const wraker = Wraker.fromWorker(worker);
    expect(wraker).toBeDefined();
  });

  it("should follow the flow", async () => {
    const worker = new workerConstructor();
    const wraker = Wraker.fromWorker(worker);

    let data = await wraker.fetch("/items");
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
    });
    json = JSON.parse(data.body);
    expect(json).toEqual({
      message: "Item succesfully added.",
    });

    data = await wraker.fetch("/items");
    json = JSON.parse(data.body);

    expect(json).toEqual([[item.id, item.value]]);
  });
});
