import { expect } from "vitest";

const TIMED_OUT = Symbol("TIMED_OUT");
const timeoutMs = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  }).then((_) => TIMED_OUT);

expect.extend({
  async toTimeOut(promise, ms) {
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
});
