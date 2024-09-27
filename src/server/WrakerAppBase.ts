import { type WrakerRequest } from "../common";
import type {
  WrakerAppPlugin,
  WrakerAppPluginHook,
  WrakerAppPluginHookArgs,
  WrakerAppPluginHookKey,
} from "./WrakerAppPlugin";
import { WrakerRouter, WrakerRouterOptions } from "./WrakerRouter";

export interface WrakerAppOptions extends WrakerRouterOptions {
  plugins?: WrakerAppPlugin<any, any>[];
}

/**
 * Represents the base application class for Wraker, extending the functionality of WrakerRouter.
 * This class handles the initialization and configuration of the application, including mounting paths,
 * event listeners, and processing incoming requests.
 *
 * @extends WrakerRouter
 */
export class WrakerAppBase extends WrakerRouter {
  private _mountpath: string | string[];
  private _mountCallbacks: Array<Function> = new Array();
  private _plugins: WrakerAppPlugin<any, any>[];
  private _ready: boolean = false;

  /**
   * Creates a new WrakerAppBaseinstance.
   *
   * @param options - The options to configure the WrakerAppBaseinstance.
   */
  constructor(options?: Partial<WrakerAppOptions>) {
    super(options);
    this._mountpath = "/";
    this._plugins = options?.plugins || [];

    this._lifecycleEmit("init");

    this.addEventListener("wraker-router:mounted", (event) => {
      this._mountCallbacks.forEach((callback) => {
        if (event.detail.handler instanceof WrakerAppBase)
          callback(event.detail);
      });
    });

    globalThis.addEventListener(
      "message",
      (event: MessageEvent<Partial<WrakerRequest>>) => {
        this._lifecycleEmit("onBeforeMessageHandled", event);

        const data = event.data;
        if (!data) return;

        const headers = data.headers;

        if (!data.method || !data.path) return;

        this._process({
          method: data.method,
          path: data.path,
          headers: headers || {},
          body: data.body,
        });
      }
    );
  }

  /**
   * Executes the lifecycle hook for the specified event.
   */
  private _lifecycleEmit<K extends WrakerAppPluginHookKey>(
    hook: K,
    ...args: WrakerAppPluginHookArgs<K>
  ) {
    const hooks = this._plugins.filter((plugin) => !!plugin[hook]);

    hooks.forEach((plugin) => {
      const hookFn = plugin[hook] as WrakerAppPluginHook<any, any, any>;
      if (hookFn) {
        if (args.length > 0) {
          hookFn(this, {}, ...args);
        } else {
          hookFn(this, {});
        }
      }
    });
  }

  /**
   * Gets the path at which the application is mounted.
   */
  public get mountpath(): string | string[] {
    return this._mountpath;
  }

  /**
   * Adds a listener for the event.
   */
  public on(event: "mount", callback: (parent?: WrakerAppBase) => void): void;
  public on(event: string, callback: (parent?: WrakerAppBase) => void) {
    this._mountCallbacks.push(callback);
  }

  // public disable(name: string) {}
  // public disabled(name: string) {}
  // public enable(name: string) {}
  // public enabled(name: string) {}
  // public engine(name: string, callback: Function) {}

  /**
   * Starts the application and begins listening for incoming requests.
   *
   * @param callback - The callback function to execute when the application is ready.
   * @returns A promise that resolves when the application is ready.
   */
  public async listen(callback?: Function): Promise<void> {
    if (this._ready) throw new Error("WrakerAppBaseis already listening");
    this._ready = true;

    if (callback) callback();
    else return Promise.resolve();
  }

  //   public render(name: string, options: any, callback: Function) {}
  //   public set(setting: string, value: any) {}
}
