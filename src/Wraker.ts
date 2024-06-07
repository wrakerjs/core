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

  constructor(scriptURL: URL, options?: WorkerOptions) {
    this._worker = new Worker(scriptURL, options);
    this._init();
  }

  private _init(): void {
    this._worker.addEventListener("message", (event) => {
      const type = event.data.type;
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

  public on(command: string, callback: EventHandler): void {
    if (["message", "error"].includes(command)) {
      this._worker.addEventListener(command, (event) => {
        callback(event);
      });
      return;
    }

    this._addHandler(`wraker:${command}`, callback);
  }

  public once(command: string, callback: EventHandler): void {
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

    this._addHandler(`wraker:${command}`, callback, {
      once: true,
    });
  }

  public off(command: string, callback: () => void): void {
    if (["message", "error", "exit"].includes(command)) {
      this._worker.removeEventListener(command, callback);
      return;
    }

    this._removeHandler(`wraker:${command}`);
    callback();
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
