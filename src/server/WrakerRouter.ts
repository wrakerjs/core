import { type EventPath, type Method, type WrakerRequest } from "../common";
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

/**
 * Router options
 */
export type WrakerRouterOptions = {
  /**
   * The base path for the router.
   */
  path: EventPath;
};

/**
 * Router
 */
export class WrakerRouter extends EventTarget {
  private _stack: Array<Layer> = new Array();
  private _path: EventPath;

  /**
   * Creates a new WrakerRouter instance.
   *
   * @param options - The options to configure the WrakerRouter instance
   */
  constructor(options?: Partial<WrakerRouterOptions>) {
    super();
    this._path = options?.path || "/";
  }

  /**
   * Create a route handler
   *
   * @param method - The method to handle.
   * @param path - The path to handle.
   * @param all - Whether to match all paths.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   *
   * @internal
   */
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

  /**
   * Create a route handler for all methods
   *
   * @param path - The path to handle.
   * @param all - Whether to match all paths.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  private _all(
    path: LayerEventPath,
    all: boolean,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method(METHOD_ALL, path, all, ...handlers);
  }

  /**
   * Handle all methods
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public all(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._all(path, false, ...handlers);
  }

  /**
   * Handle the checkout method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public checkout(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("checkout", path, false, ...handlers);
  }

  /**
   * Handle the copy method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public copy(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("copy", path, false, ...handlers);
  }

  /**
   * Handle the delete method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public delete(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("delete", path, false, ...handlers);
  }

  /**
   * Handle the get method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public get(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("get", path, false, ...handlers);
  }

  /**
   * Handle the head method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public head(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("head", path, false, ...handlers);
  }

  /**
   * Handle the lock method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public lock(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("lock", path, false, ...handlers);
  }

  /**
   * Handle the merge method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public merge(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("merge", path, false, ...handlers);
  }

  /**
   * Handle the mkactivity method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public mkactivity(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("mkactivity", path, false, ...handlers);
  }

  /**
   * Handle the mkcalendar method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public mkcol(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("mkcol", path, false, ...handlers);
  }

  /**
   * Handle the move method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public move(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("move", path, false, ...handlers);
  }

  /**
   * Handle the m-search method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public "m-search"(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("m-search", path, false, ...handlers);
  }

  /**
   * Handle the notify method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public notify(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("notify", path, false, ...handlers);
  }

  /**
   * Handle the options method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public options(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("options", path, false, ...handlers);
  }

  /**
   * Handle the patch method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public patch(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("patch", path, false, ...handlers);
  }

  /**
   * Handle the post method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public post(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("post", path, false, ...handlers);
  }

  /**
   * Handle the purge method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public purge(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("purge", path, false, ...handlers);
  }

  /**
   * Handle the put method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public put(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("put", path, false, ...handlers);
  }

  /**
   * Handle the report method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public report(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("report", path, false, ...handlers);
  }

  /**
   * Handle the search method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public search(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("search", path, false, ...handlers);
  }

  /**
   * Handle the subscribe method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public subscribe(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("subscribe", path, false, ...handlers);
  }

  /**
   * Handle the trace method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public trace(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("trace", path, false, ...handlers);
  }

  /**
   * Handle the unlock method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public unlock(path: EventPath, ...handlers: EventHandler[]): WrakerRouter {
    return this._method("unlock", path, false, ...handlers);
  }

  /**
   * Handle the unsubscribe method
   *
   * @param path - The path to handle.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public unsubscribe(
    path: EventPath,
    ...handlers: EventHandler[]
  ): WrakerRouter {
    return this._method("unsubscribe", path, false, ...handlers);
  }

  //  public  param(name: string, handler: ParamEventHandler): void;

  /**
   * Set the path for the router
   *
   * @param path - The path to set.
   * @returns The WrakerRouter instance.
   */
  public route(path: EventPath): WrakerRouter {
    this._path = path;
    return this;
  }

  /**
   * Use the specified handlers
   *
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
  public use(...handlers: EventHandler[]): WrakerRouter;
  /**
   * Use the specified handlers for the specified path
   *
   * @param path - The path to use the handlers for.
   * @param handlers - The handlers to use.
   * @returns The WrakerRouter instance.
   */
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

  /**
   * The path for the router
   */
  public get path() {
    return this._path;
  }

  /**
   * The stack for the router
   */
  public get stack() {
    return this._stack;
  }

  /**
   * Process the request
   *
   * @param _request - The request object.
   *
   * @internal
   */
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
