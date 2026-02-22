import type { WrakerRequest } from "../common";
import type {
  WrakerAppPlugin,
  WrakerAppPluginHook,
  WrakerAppPluginHookArgs,
  WrakerAppPluginHookKey,
} from "./WrakerAppPlugin";
import type { WrakerAppResponse } from "./WrakerAppResponse";
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
export class WrakerApp extends WrakerRouter {
  private _mountpath: string | string[];
  private _mountCallbacks: Array<Function> = new Array();
  private _plugins: WrakerAppPlugin<any, any>[];
  private _ready: boolean = false;
  private _messageHandler: (
    event: MessageEvent<Partial<WrakerRequest>>,
  ) => void;

  /**
   * Creates a new WrakerApp instance.
   *
   * @param options - The options to configure the WrakerApp instance.
   */
  constructor(options?: Partial<WrakerAppOptions>) {
    super(options);
    this._mountpath = "/";
    this._plugins = options?.plugins || [];

    this._lifecycleEmit("init");

    this.addEventListener("wraker-router:mounted", (event) => {
      this._mountCallbacks.forEach((callback) => {
        if (event.detail.handler instanceof WrakerApp) callback(event.detail);
      });
      this._lifecycleEmit("onMount", event.detail.handler);
    });

    this._messageHandler = (event: MessageEvent<Partial<WrakerRequest>>) => {
      if (!this._ready) return;

      const prevented = this._lifecycleEmit("onBeforeMessageHandled", event);
      if (prevented === false) return;

      const data = event.data;
      if (!data) return;

      if (!data.method || !data.path) return;
      const headers = data.headers;

      this._process({
        method: data.method,
        path: data.path,
        headers: headers || {},
        body: data.body,
      }).then(() => {
        this._lifecycleEmit("onAfterMessageHandled", event);
      });
    };

    globalThis.addEventListener("message", this._messageHandler);
  }

  /**
   * Executes the lifecycle hook for the specified event.
   * Returns false if any plugin hook returns false (stopping propagation).
   * Returns true if all hooks ran without interruption.
   *
   * @param hook - The lifecycle hook to execute.
   * @param args - The arguments to pass to the hook.
   * @returns false if propagation was stopped, true otherwise.
   */
  private _lifecycleEmit<K extends WrakerAppPluginHookKey>(
    hook: K,
    ...args: WrakerAppPluginHookArgs<K>
  ): boolean {
    const plugins = this._plugins.filter((plugin) => plugin[hook]);
    for (const plugin of plugins) {
      const hookFn = plugin[hook] as WrakerAppPluginHook<any, any, any>;
      let result: boolean | void;
      if (args.length > 0) {
        result = hookFn(this, plugin.options, ...args);
      } else {
        result = hookFn(this, plugin.options);
      }
      if (result === false) return false;
    }
    return true;
  }

  /**
   * Called when an error occurs during request processing.
   * Emits the onError lifecycle hook before delegating to the base implementation.
   *
   * @param error - The error that occurred.
   * @param res - The response object.
   */
  protected override _onError(error: unknown, res: WrakerAppResponse): void {
    this._lifecycleEmit("onError", error);
    super._onError(error, res);
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
  public on(event: "mount", callback: (parent?: WrakerApp) => void): void;
  public on(event: string, callback: (parent?: WrakerApp) => void) {
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
    if (this._ready) throw new Error("WrakerApp is already listening");
    this._ready = true;

    this._lifecycleEmit("onListen");

    if (callback) callback();
    else return Promise.resolve();
  }

  /**
   * Stops the application and removes the message listener.
   * Calls the destroy lifecycle hook on all plugins.
   *
   * @throws Error if the app is not currently listening.
   */
  public destroy(): void {
    if (!this._ready) throw new Error("WrakerApp is not listening");
    this._lifecycleEmit("destroy");
    globalThis.removeEventListener("message", this._messageHandler);
    this._ready = false;
  }

  //   public render(name: string, options: any, callback: Function) {}
  //   public set(setting: string, value: any) {}
}
