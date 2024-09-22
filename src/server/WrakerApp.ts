import { type WrakerRequest } from "../common";
import { WrakerRouter, WrakerRouterOptions } from "./WrakerRouter";

export interface WrakerAppOptions extends WrakerRouterOptions {}

/**
 * Represents the main application class for Wraker, extending the functionality of WrakerRouter.
 * This class handles the initialization and configuration of the application, including mounting paths,
 * event listeners, and processing incoming requests.
 *
 * @extends WrakerRouter
 */
export class WrakerApp extends WrakerRouter {
  private _mountpath: string | string[];
  private _mountCallbacks: Array<Function> = new Array();
  private _ready: boolean = false;

  /**
   * Creates a new WrakerApp instance.
   *
   * @param options - The options to configure the WrakerApp instance.
   */
  constructor(options?: Partial<WrakerAppOptions>) {
    super(options);
    this._mountpath = "/";

    this.addEventListener("wraker-router:mounted", (event) => {
      this._mountCallbacks.forEach((callback) => {
        if (event.detail.handler instanceof WrakerApp) callback(event.detail);
      });
    });

    globalThis.addEventListener(
      "message",
      (event: MessageEvent<Partial<WrakerRequest>>) => {
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
   * Mounts the application at the specified path.
   *
   * @param path - The path to mount the application at.
   */
  public get mountpath(): string | string[] {
    return this._mountpath;
  }

  /**
   * Mounts the application at the specified path.
   *
   * @param path - The path to mount the application at.
   */
  public on(_e: "mount", callback: (parent?: WrakerApp) => void) {
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

    if (callback) callback();
    else return Promise.resolve();
  }
  //   public render(name: string, options: any, callback: Function) {}
  //   public set(setting: string, value: any) {}
}
