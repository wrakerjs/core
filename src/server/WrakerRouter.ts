import {
  EventHandler,
  Layer,
  METHOD_ALL,
  PATH_ALL,
  type LayerEventPath,
  type LayerMethod,
  type WrakerAppNext,
} from "./Handler";
import { WrakerAppRequest } from "./WrakerAppRequest";
import { type EventPath, type WrakerRequest } from "../common";

export type WrakerRouterOptions = {
  path: EventPath;
};

export class WrakerRouter extends EventTarget {
  private _stack: Array<Layer> = new Array();
  private _path: LayerEventPath;

  constructor(options?: Partial<WrakerRouterOptions>) {
    super();
    this._path = options?.path || "/";
  }

  private _method(
    method: LayerMethod,
    path: LayerEventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    handlers.forEach((handler) => {
      this._stack.push({ path, method, handler });

      if (handler instanceof WrakerRouter) {
        this.dispatchEvent(
          new CustomEvent("wraker-router:mounted", {
            detail: {
              handler,
            },
          })
        );

        handler.dispatchEvent(
          new CustomEvent("wraker-router:mount", {
            detail: {
              app: this,
            },
          })
        );
      }
    });
    return this;
  }

  private _all(
    path: LayerEventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method(METHOD_ALL, path, ...handlers);
  }

  public all(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._all(path, ...handlers);
  }
  public checkout(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("checkout", path, ...handlers);
  }
  public copy(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("copy", path, ...handlers);
  }
  public delete(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("delete", path, ...handlers);
  }
  public get(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("get", path, ...handlers);
  }
  public head(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("head", path, ...handlers);
  }
  public lock(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("lock", path, ...handlers);
  }
  public merge(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("merge", path, ...handlers);
  }
  public mkactivity(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("mkactivity", path, ...handlers);
  }
  public mkcol(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("mkcol", path, ...handlers);
  }
  public move(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("move", path, ...handlers);
  }
  public "m-search"(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("m-search", path, ...handlers);
  }
  public notify(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("notify", path, ...handlers);
  }
  public options(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("options", path, ...handlers);
  }
  public patch(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("patch", path, ...handlers);
  }
  public post(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("post", path, ...handlers);
  }
  public purge(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("purge", path, ...handlers);
  }
  public put(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("put", path, ...handlers);
  }
  public report(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("report", path, ...handlers);
  }
  public search(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("search", path, ...handlers);
  }
  public subscribe(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("subscribe", path, ...handlers);
  }
  public trace(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("trace", path, ...handlers);
  }
  public unlock(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("unlock", path, ...handlers);
  }
  public unsubscribe(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("unsubscribe", path, ...handlers);
  }

  //  public  param(name: string, handler: ParamEventHandler): void;
  public route(path: EventPath): WrakerRouter {
    this._path = path;
    return this;
  }

  public use(...handlers: EventHandler[]): WrakerRouter;
  public use(path: EventPath, ...handlers: EventHandler[]): WrakerRouter;
  public use(arg: EventPath | EventHandler, ...handlers: EventHandler[]) {
    if (typeof arg === "string") {
      handlers.forEach((handler) => {
        this.all(arg, handler);
      });

      return this;
    }

    this._all(PATH_ALL, arg);

    if (handlers && handlers.length > 0) this.use(...handlers);

    return this;
  }

  public get path() {
    return this._path;
  }

  public get stack() {
    return this._stack;
  }

  protected async _process(_request: WrakerRequest) {
    const { method, path } = _request;

    const layers = this._stack.filter(
      (handler) =>
        (handler.path === PATH_ALL ||
          handler.path === path ||
          (handler.handler instanceof WrakerRouter &&
            path.startsWith(handler.path))) &&
        [method.toLowerCase(), METHOD_ALL].includes(handler.method)
    );

    const request = new WrakerAppRequest(this, _request);

    for (const layer of layers) {
      if (layer.handler instanceof WrakerRouter) {
        await layer.handler._process({
          ..._request,
          path: `/${path.slice(layer.path.length)}`,
        });
        continue;
      }

      let nextUsed = false;
      let nextError: any;
      const next: WrakerAppNext = (err?: any) => {
        nextUsed = true;
        nextError = err;
      };

      try {
        await layer.handler(request, request.res, next);
        if (!nextUsed) return;

        if (nextError) throw nextError;
      } catch (error) {
        request.res.sendError(error);
        return;
      }
    }

    request.res.status(404);
    request.res.sendError("Not Found");
  }
}
