import {
  WrakerAppRequest,
  EventHandler,
  Routable,
  StructuredEventHandler as Layer,
  WrakerAppPath,
  type WrakerAppRequestOptions,
} from "./Handler";
import { Method } from "../common";

export type WrakerRouterOptions = {
  path: WrakerAppPath;
};

export class WrakerRouter extends EventTarget implements Routable {
  private _stack: Array<Layer> = new Array();
  private _path: WrakerAppPath;

  constructor(options?: Partial<WrakerRouterOptions>) {
    super();
    this._path = options?.path || "/";
  }

  private _method(
    method: Method,
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    handlers.forEach((handler) => {
      this._stack.push({ path, method, handler });

      if (handler instanceof WrakerRouter)
        this.dispatchEvent(
          new CustomEvent("wraker-router:mount", {
            detail: {
              app: this,
              handler,
            },
          })
        );
    });
    return this;
  }

  public all(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("all", path, ...handlers);
  }
  public checkout(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("checkout", path, ...handlers);
  }
  public copy(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("copy", path, ...handlers);
  }
  public delete(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("delete", path, ...handlers);
  }
  public get(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("get", path, ...handlers);
  }
  public head(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("head", path, ...handlers);
  }
  public lock(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("lock", path, ...handlers);
  }
  public merge(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("merge", path, ...handlers);
  }
  public mkactivity(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("mkactivity", path, ...handlers);
  }
  public mkcol(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("mkcol", path, ...handlers);
  }
  public move(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("move", path, ...handlers);
  }
  public "m-search"(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("m-search", path, ...handlers);
  }
  public notify(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("notify", path, ...handlers);
  }
  public options(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("options", path, ...handlers);
  }
  public patch(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("patch", path, ...handlers);
  }
  public post(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("post", path, ...handlers);
  }
  public purge(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("purge", path, ...handlers);
  }
  public put(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("put", path, ...handlers);
  }
  public report(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("report", path, ...handlers);
  }
  public search(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("search", path, ...handlers);
  }
  public subscribe(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("subscribe", path, ...handlers);
  }
  public trace(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("trace", path, ...handlers);
  }
  public unlock(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("unlock", path, ...handlers);
  }
  public unsubscribe(
    path: WrakerAppPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("unsubscribe", path, ...handlers);
  }

  //  public  param(name: string, handler: ParamEventHandler): void;
  public route(path: WrakerAppPath): WrakerRouter {
    this._path = path;
    return this;
  }

  public use(...handlers: EventHandler[]): WrakerRouter;
  public use(path: WrakerAppPath, ...handlers: EventHandler[]): WrakerRouter;
  public use(arg: WrakerAppPath | EventHandler, ...handlers: EventHandler[]) {
    if (typeof arg === "string") {
      handlers?.forEach((handler) => {
        this.all(arg, handler);
      });

      return this;
    }

    this.all("*", arg);

    if (handlers && handlers.length > 0) this.use(...handlers);

    return this;
  }

  public get path() {
    return this._path;
  }

  public get stack() {
    return this._stack;
  }

  private _send(args: {
    headers: Record<string, string>;
    status: number;
    data: any;
  }) {
    globalThis.postMessage({
      headers: args.headers,
      status: args.status,
      body: args.data,
    });
  }

  private _sendError(args: {
    headers: Record<string, string>;
    status: number;
    message: any;
  }) {
    globalThis.postMessage({
      headers: args.headers,
      status: args.status,
      error: args.message,
    });
  }

  public async process(_request: WrakerAppRequestOptions) {
    const { method, path } = _request;
    if (!method || !path) {
      this._sendError({
        headers: _request.headers || {},
        message: "Baq Request",
        status: 400,
      });
      return;
    }

    if (path === "/something") {
    }

    const layers = this._stack.filter(
      (handler) =>
        (handler.path === "*" ||
          handler.path === path ||
          (handler.handler instanceof WrakerRouter &&
            path.startsWith(handler.path))) &&
        [method.toLowerCase(), "all"].includes(handler.method)
    );

    const request = new WrakerAppRequest(this, {
      ..._request,
      sendFn: this._send.bind(this),
      sendErrorFn: this._sendError.bind(this),
    });
    request.res.headers = request.headers || {};

    let finished = false;
    for (const layer of layers) {
      if (finished) break;

      if (layer.handler instanceof WrakerRouter) {
        await layer.handler.process({
          ..._request,
          path: path.slice(layer.path.length) ?? "/",
        });
        continue;
      }

      let nextUsed = false;
      function next() {
        nextUsed = true;
      }

      try {
        await layer.handler(request, request.res, next);
        if (!nextUsed) return;
      } catch (error) {
        if (request.res.statusCode === 0) request.res.statusCode = 500;

        this._sendError({
          headers: request.res.headers,
          message: error instanceof Error ? error.message : error,
          status: request.res.statusCode,
        });
        return;
      }
    }

    if (!finished) {
      this._sendError({
        headers: _request.headers || {},
        message: "Not Found",
        status: 404,
      });
    }
  }
}
