import { WrakerHeaders, type WrakerRequest } from "../common";
import { WrakerRouter, WrakerRouterOptions } from "./WrakerRouter";

export interface WrakerAppOptions extends WrakerRouterOptions {}

export class WrakerApp extends WrakerRouter {
  private _mountpath: string | string[];
  private _mountCallbacks: Array<Function> = new Array();
  private _ready: boolean = false;

  constructor(options?: Partial<WrakerAppOptions>) {
    super(options);
    this._mountpath = "/";

    this.addEventListener("wraker-router:mounted", (event) => {
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
