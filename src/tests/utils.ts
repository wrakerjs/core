import { expect } from "vitest";
import type { WrakerRequest } from "../common";

const TIMED_OUT = Symbol("TIMED_OUT");
const timeoutMs = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  }).then((_) => TIMED_OUT);

expect.extend({
  async toTimeOut(promise: Promise<any>, ms: number) {
    const [resolved] = await Promise.race([promise, timeoutMs(ms)])
      .then((x) => [x])
      .catch((err) => [undefined, err]);

    const pass = resolved === TIMED_OUT;

    return pass
      ? {
          pass: true,
          message: () => `Expected promise to complete within ${ms}ms`,
        }
      : {
          pass: false,
          message: () => `Expected promise not to complete within ${ms}ms`,
        };
  },

  toEqualCaseInsensitive(received: string, expected: string) {
    return received.localeCompare(expected, undefined, {
      sensitivity: "accent",
    }) === 0
      ? {
          pass: true,
          message: () =>
            `Expected "${received}" to equal ${expected} (case-insensitive)`,
          actual: received,
          expected,
        }
      : {
          pass: false,
          message: () =>
            `Expected "${received}" not to equal ${expected} (case-insensitive)`,
          actual: received,
          expected,
        };
  },
});

/**
 * Define default request processing options.
 *
 * @param options request options
 * @internal
 */
export function __dproc(
  options: Omit<Omit<WrakerRequest, "headers">, "body"> & Partial<WrakerRequest>
): WrakerRequest {
  return {
    ...options,
    headers: options.headers || {},
    body: options.body,
  };
}
