import { Wraker } from "..";
import worker from "./fixtures/worker?url";

import { it, describe, expect, beforeEach } from "vitest";

describe("Wraker", () => {
  beforeEach((ctx) => {
    console.log(`---- ${ctx.task.name} ----`);
  });

  it("should be defined", async () => {
    const instance = new Wraker(new URL(worker, import.meta.url), {
      name: "wraker",
      type: "module",
    });

    expect(instance).toBeDefined();
  });

  it("should notify ready status", async () => {
    const instance = new Wraker(new URL(worker, import.meta.url), {
      name: "wraker",
      type: "module",
    });

    const promise = new Promise((resolve, reject) => {
      instance.on("ready", () => {
        resolve(true);
      });

      instance.on("error", (e) => {
        reject(e);
      });
    });

    await promise;

    expect(instance).toBeDefined();
  });

  it("should wait until status is ready", async () => {
    const instance = new Wraker(new URL(worker, import.meta.url), {
      name: "wraker",
      type: "module",
    });

    const ready = await instance.ready();
    expect(ready).toBe(true);
  });
});
