import { it, describe, expect } from "vitest";

import { Wraker } from ".";
import fixtureWorkerUrl from "../tests/fixtures/worker?url";
import FixtureWorker from "../tests/fixtures/worker?worker";

describe("Wraker", () => {
  it("should initialize from Worker interface", async () => {
    const instance = new Wraker(fixtureWorkerUrl, {
      type: "module",
    });

    expect(instance).toBeDefined();
  });

  it("should initialize properly from existing worker", async () => {
    const worker = new FixtureWorker();
    const instance = Wraker.fromWorker(worker);

    expect(instance).toBeDefined();
  });

  it("should fetch data", async () => {
    const instance = new Wraker(fixtureWorkerUrl, {
      type: "module",
    });
    let data = await instance.fetch("/hello");
    expect(data.body).toEqual("Hello, world!");

    data = await instance.fetch("/reflect", {
      body: {
        field: "foo",
      },
    });
    expect(data.body).toEqual({
      field: "foo",
    });
  });

  it("should handle timeouts", async () => {
    const instance = new Wraker(fixtureWorkerUrl, {
      type: "module",
    });

    try {
      await instance.fetch("/wait", {
        body: {
          timeout: 100, // When will the worker answer?
        },

        timeout: 50, // How long can the request wait before timing out
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  }, 200);
});
