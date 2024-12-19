import {
  WrakerHeaders,
  type EventData,
  type EventPath,
  type WrakerRequest,
  type WrakerResponse,
} from "../common";
import { uuid } from "../lib/uuid";

export type WrakerFetchOptions = Omit<Partial<WrakerRequest>, "path"> & {
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
};

/**
 * Request ID
 */
export type WrakerRequestId = ReturnType<typeof uuid>;

/**
 * Timeout exception
 */
export class TimeoutException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutException";
  }
}

interface TypedWorker<Post, Receive> extends Worker {
  postMessage(message: Post, options?: Transferable[]): void;
  postMessage(message: Post, options?: StructuredSerializeOptions): void;
  postMessage(message: Post, options?: any): void;

  addEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: "message",
    listener: (this: Worker, ev: MessageEvent<Partial<Receive>>) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(type: unknown, listener: unknown, options?: unknown): void;
}

/**
 * The `Wraker` class provides an interface for interacting with a web worker.
 * It allows sending requests to the worker and handling responses asynchronously.
 *
 * @example
 * // Create a new Wraker instance with a worker script URL
 * const instance = new Wraker(new URL("worker.js", import.meta.url), {
 *   type: "module",
 * });
 *
 * @example
 * // Initialize a Wraker instance from an existing Worker
 * const worker = new Worker("worker.js");
 * const instance = Wraker.fromWorker(worker);
 *
 * @example
 * // Fetch data from the worker
 * const data = await instance.fetch("/hello");
 * console.log(data.body); // Hello, world!
 */
export class Wraker {
  private _worker = null as unknown as TypedWorker<
    WrakerRequest,
    WrakerResponse
  >;
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
    this._worker.addEventListener("message", (event) => {
      const data = event.data;
      const headers = new WrakerHeaders(event.data.headers);
      const xRequestId = headers.get("X-Request-ID");
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
  public async fetch<Result = EventData>(
    path: EventPath,
    options?: WrakerFetchOptions
  ): Promise<WrakerResponse<Result>> {
    const xRequestId = uuid();
    const timeout = options?.timeout || 30 * 1000;

    return new Promise((resolve, reject) => {
      this._requests.set(xRequestId, { resolve, reject });

      setTimeout(() => {
        this._requests.delete(xRequestId);
        reject(new TimeoutException(`Request timed out after ${timeout}ms`));
      }, timeout);

      const method = options?.method || "GET";
      const headers = new WrakerHeaders(options?.headers);

      headers.set("X-Request-ID", xRequestId);

      this._worker.postMessage({
        headers: headers.serialize(),
        path,
        method,
        body: options?.body,
      });
    });
  }

  /**
   * Terminate the worker
   */
  public kill(): void {
    this._worker.terminate();
  }
}
