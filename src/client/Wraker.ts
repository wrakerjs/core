import type { Method } from "../common";
import type { AppResponse } from "../server";

const uuid = crypto.randomUUID.bind(crypto);

export type WrakerFetchOptions = {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
};

export type WrakerRequestId = string;
export type WrakerRequest = {};

export class Wraker {
  private _worker: Worker;
  private _requests: Map<
    WrakerRequestId,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
    }
  > = new Map();

  constructor(scriptURL: string | URL, options?: WorkerOptions) {
    this._worker = new Worker(scriptURL, options);

    this._init();
  }

  protected _init(): void {
    this._worker.addEventListener(
      "message",
      (event: MessageEvent<AppResponse>) => {
        const data = event.data;
        const { headers } = event.data;

        const xRequestId = headers["X-Request-ID"];
        const request = this._requests.get(xRequestId);
        if (!request) return;

        this._requests.delete(xRequestId);
        request.resolve(data);
      }
    );
  }

  public static fromWorker(worker: Worker) {
    const wraker = new Wraker("");
    wraker._worker = worker;
    return wraker;
  }

  public async fetch(path: string, options?: WrakerFetchOptions): Promise<any> {
    const xRequestId = uuid();
    const timeout = options?.timeout || 30 * 1000;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, timeout);

      const method = options?.method || "GET";

      this._worker.postMessage({
        headers: {
          "X-Request-ID": xRequestId,
          ...options?.headers,
        },
        path,
        body: options?.body || {},
        method,
      });

      this._requests.set(xRequestId, { resolve, reject });
    });
  }
}
