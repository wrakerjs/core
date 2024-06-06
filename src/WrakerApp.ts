import { WrakerHandler } from "./WrakerHandler";

export class WrakerApp {
  private _handlers: Map<string, WrakerHandler> = new Map();
  private _exposed: boolean = false;

  constructor() {
    this._init();
  }

  private _init(): void {
    globalThis.addEventListener("message", (event) => {
      const type = event.data.type;
      if (!type) throw new Error("Missing type in event data");

      const handler = this._handlers.get(type);
      if (!handler) return;

      handler(
        { body: event },
        {
          send: (data) => {
            globalThis.postMessage({ type, data });
          },
        }
      );
    });
  }

  private _addHandler(name: string, handler: WrakerHandler): void {
    if (this._handlers.has(name)) {
      throw new Error(`Handler with name ${name} already exists!`);
    }

    this._handlers.set(name, handler);
  }

  public use(name: string, handler: WrakerHandler): void {
    this._addHandler(`wraker:${name}`, handler);
  }

  public async expose(callback?: () => void): Promise<void> {
    if (this._exposed) {
      throw new Error("WrakerApp is already exposed.");
    }
    this._exposed = true;

    globalThis.postMessage({
      type: "wraker:ready",
    });

    if (callback) {
      callback();
      return;
    }

    return Promise.resolve();
  }

  public close(): void {
    globalThis.close();
  }
}
