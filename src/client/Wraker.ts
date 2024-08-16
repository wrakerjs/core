import type { Method } from "../common";
import { v4 as uuid } from "uuid";

export type WrakerFetchOptions = {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
};

export type WrakerRequestId = string;
export type WrakerRequest = {};

export class TimeoutException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutException";
  }
}

export class Wraker {
  private _worker: Worker = null as unknown as Worker;
  private _requests: Map<
    WrakerRequestId,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
    }
  > = new Map();

  /**
   * Create a new Wraker instance
   * @param scriptURL URL of the worker script
   * @param options Worker options
   * @returns Wraker instance
   *
   * @example
   * const instance = new Wraker(new URL("worker.js", import.meta.url), {
   *  type: "module",
   * });
   */
  constructor(scriptURL?: string | URL, options?: WorkerOptions) {
    if (!scriptURL) return;

    this._worker = new Worker(scriptURL, options);
    this._init();
  }

  private _init(): void {
    this._worker.addEventListener("message", (event: MessageEvent<any>) => {
      const data = event.data;
      const { headers } = event.data;

      const xRequestId = headers["X-Request-ID"];
      const request = this._requests.get(xRequestId);
      if (!request) return;

      this._requests.delete(xRequestId);

      if (data.error) {
        request.reject(data);
        return;
      }
      request.resolve(data);
    });
  }

  /**
   * Initialize a Wraker instance from an existing Worker
   * @param worker Worker instance
   * @returns Wraker instance
   *
   * @example
   * const worker = new Worker("worker.js");
   * const instance = Wraker.fromWorker(worker);
   */
  public static fromWorker(worker: Worker) {
    const wraker = new Wraker();

    wraker._worker = worker;
    wraker._init.call(wraker);
    return wraker;
  }

  /**
   * Fetch data from the worker
   * @param path Path to fetch
   * @param options Fetch options
   * @returns Promise
   *
   * @example
   * const data = await instance.fetch("/hello");
   * console.log(data.body); // Hello, world!
   */
  public async fetch<Result = any>(
    path: string,
    options?: WrakerFetchOptions
  ): Promise<Result> {
    const xRequestId = uuid();
    const timeout = options?.timeout || 30 * 1000;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this._requests.delete(xRequestId);
        reject(new TimeoutException("Request timed out"));
      }, timeout);

      const method = options?.method || "GET";

      this._requests.set(xRequestId, { resolve, reject });

      this._worker.postMessage({
        headers: {
          "X-Request-ID": xRequestId,
          ...options?.headers,
        },
        path,
        body: options?.body || {},
        method,
      });
    });
  }
}
