import { EventHandler } from "./Event";

export interface ListenerHandler {
  handler: EventHandler;
  options?: EventHandlerOptions;
}
export interface EventHandlerOptions {
  once?: boolean;
}

export class Wraker {
  private _worker: Worker;
  private _handlers: Map<string, ListenerHandler[]> = new Map();
  private _readyPromise: Promise<boolean>;

  constructor(scriptURL: URL, options?: WorkerOptions) {
    this._worker = new Worker(scriptURL, options);
    this._init();
    this._readyPromise = new Promise((resolve) => {
      this.once("ready", () => {
        resolve(true);
      });
    });
  }

  private _init(): void {
    this._worker.addEventListener("message", (__rawEvent) => {
      const event = __rawEvent.data;
      const { type } = event;
      if (!type) throw new Error("Missing type in event data");

      const handlers = this._handlers.get(type);
      if (!handlers) return;

      handlers.forEach((handler) => {
        handler.handler(event);

        if (handler.options?.once) {
          this._removeHandler(type);
        }
      });
    });
  }

  private _addHandler(
    command: string,
    callback: EventHandler,
    options?: EventHandlerOptions
  ): void {
    const handlers = this._handlers.get(command) || [];
    handlers.push({
      handler: callback,
      options: options,
    });
    this._handlers.set(command, handlers);
  }

  private _removeHandler(command: string): void {
    if (!this._handlers.has(command)) return;
    this._handlers.delete(command);
  }

  public on(command: "message", callback: (event: MessageEvent) => void): void;
  public on(command: "error", callback: (event: ErrorEvent) => void): void;
  public on(command: string, callback: (event: MessageEvent) => void): void;
  public on(command: string, callback: Function): void {
    if (["message", "error"].includes(command)) {
      this._worker.addEventListener(command, (event) => {
        callback(event);
      });
      return;
    }

    this._addHandler(`wraker:${command}`, callback as EventHandler);
  }

  public once(
    command: "message",
    callback: (event: MessageEvent) => void
  ): void;
  public once(command: "error", callback: (event: ErrorEvent) => void): void;
  public once(command: string, callback: (event: MessageEvent) => void): void;
  public once(command: string, callback: Function): void {
    if (["message", "error"].includes(command)) {
      this._worker.addEventListener(
        command,
        (event) => {
          callback(event);
        },
        {
          once: true,
        }
      );
      return;
    }

    this._addHandler(`wraker:${command}`, callback as EventHandler, {
      once: true,
    });
  }

  public off(command: "message", callback: () => void): void;
  public off(command: "error", callback: () => void): void;
  public off(command: string, callback: () => void): void;
  public off(command: string, callback: () => void): void {
    if (["message", "error", "exit"].includes(command)) {
      this._worker.removeEventListener(command, callback);
      return;
    }

    this._removeHandler(`wraker:${command}`);
    callback();
  }

  public ready() {
    return this._readyPromise;
  }

  public emit(command: string, data?: any): void {
    if (["error", "exit"].includes(command)) {
      throw new Error(`Cannot emit ${command} message event`);
    }

    if (["message"].includes(command)) {
      this._worker.postMessage(data);
      return;
    }

    this._worker.postMessage({
      type: `wraker:${command}`,
      data,
    });
  }
}
