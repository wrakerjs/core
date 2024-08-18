import type { WrakerRequest } from "../common";
import { WrakerRouter, WrakerRouterOptions } from "./WrakerRouter";

export interface WrakerAppLocals {
  [key: string]: any;
}

export interface WrakerAppOptions extends WrakerRouterOptions {
  locals?: WrakerAppLocals;
}

export class WrakerApp extends WrakerRouter {
  public locals: WrakerAppLocals = {};
  private _mountpath: string | string[];
  private _mountCallbacks: Array<Function> = new Array();
  private _ready: boolean = false;

  constructor(options?: Partial<WrakerAppOptions>) {
    super(options);
    this._mountpath = "/";

    this.addEventListener("wraker-router:mount", (event) => {
      if (!(event instanceof CustomEvent)) return;

      this._mountCallbacks.forEach((callback) => {
        if (event.detail.handler instanceof WrakerApp) callback(event.detail);
      });
    });

    globalThis.addEventListener(
      "message",
      (event: MessageEvent<Partial<WrakerRequest>>) => {
        const data = event.data;
        if (!data) return;

        if (!data.method || !data.path) {
          this._sendError({
            headers: data.headers || {},
            error: "Baq Request",
            status: 400,
          });
          return;
        }

        if (data.headers === undefined || data.headers === null)
          data.headers = {};

        this._process({
          method: data.method,
          path: data.path,
          headers: data.headers,
          body: data.body,
        });
      }
    );
  }

  public get mountpath(): string | string[] {
    return this._mountpath;
  }

  public on(event: "mount", callback: (parent?: WrakerApp) => void) {
    this._mountCallbacks.push(callback);
  }

  public disable(name: string) {}
  public disabled(name: string) {}
  public enable(name: string) {}
  public enabled(name: string) {}

  public engine(name: string, callback: Function) {
    // TODO: Implement or discard
    throw new Error("Method not implemented.");
  }

  public async listen(callback?: Function): Promise<void> {
    if (this._ready) throw new Error("WrakerApp is already listening");
    this._ready = true;

    if (callback) callback();
    else return Promise.resolve();
  }
  public render(name: string, options: any, callback: Function) {
    // TODO: Implement or discard
    throw new Error("Method not implemented.");
  }

  public set(setting: string, value: any) {}
}
