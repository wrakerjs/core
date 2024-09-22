import {
  EventHandler,
  getMatchingLayers,
  joinpath,
  Layer,
  METHOD_ALL,
  subpath,
  type LayerEventPath,
  type LayerMethod,
  type WrakerAppNext,
} from "./Handler";
import { WrakerAppRequest } from "./WrakerAppRequest";
import { type EventPath, type Method, type WrakerRequest } from "../common";

export type WrakerRouterOptions = {
  path: EventPath;
};

export class WrakerRouter extends EventTarget {
  private _stack: Array<Layer> = new Array();
  private _path: EventPath;

  constructor(options?: Partial<WrakerRouterOptions>) {
    super();
    this._path = options?.path || "/";
  }

  private _method(
    method: LayerMethod,
    path: LayerEventPath,
    all: boolean,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    handlers.forEach((handler) => {
      this._stack.push({
        all,
        path: joinpath(this._path, path),
        method: method.toLowerCase() as Method,
        handler,
      });

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
    all: boolean,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method(METHOD_ALL, path, all, ...handlers);
  }

  public all(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._all(path, false, ...handlers);
  }
  public checkout(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("checkout", path, false, ...handlers);
  }
  public copy(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("copy", path, false, ...handlers);
  }
  public delete(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("delete", path, false, ...handlers);
  }
  public get(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("get", path, false, ...handlers);
  }
  public head(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("head", path, false, ...handlers);
  }
  public lock(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("lock", path, false, ...handlers);
  }
  public merge(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("merge", path, false, ...handlers);
  }
  public mkactivity(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("mkactivity", path, false, ...handlers);
  }
  public mkcol(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("mkcol", path, false, ...handlers);
  }
  public move(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("move", path, false, ...handlers);
  }
  public "m-search"(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("m-search", path, false, ...handlers);
  }
  public notify(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("notify", path, false, ...handlers);
  }
  public options(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("options", path, false, ...handlers);
  }
  public patch(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("patch", path, false, ...handlers);
  }
  public post(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("post", path, false, ...handlers);
  }
  public purge(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("purge", path, false, ...handlers);
  }
  public put(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("put", path, false, ...handlers);
  }
  public report(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("report", path, false, ...handlers);
  }
  public search(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("search", path, false, ...handlers);
  }
  public subscribe(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("subscribe", path, false, ...handlers);
  }
  public trace(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("trace", path, false, ...handlers);
  }
  public unlock(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("unlock", path, false, ...handlers);
  }
  public unsubscribe(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("unsubscribe", path, false, ...handlers);
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
        this._all(arg, false, handler);
      });

      return this;
    }

    this._all("/", true, arg);

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
    const { path } = _request;

    const layers = getMatchingLayers(_request, this);
    const request = new WrakerAppRequest(this, _request);

    for (const layer of layers) {
      if (layer.handler instanceof WrakerRouter) {
        await layer.handler._process({
          ..._request,
          path: subpath(path, layer.path),
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
