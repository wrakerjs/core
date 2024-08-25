import {
  EventData,
  WrakerErrorResponse,
  WrakerHeaders,
  WrakerSuccessResponse,
} from "../common";
import type { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerRouter } from "./WrakerRouter";

export interface WrakerAppResponseOptions {
  req: WrakerAppRequest;
}

export interface WrakerAppResponseConstructorOptions
  extends WrakerAppResponseOptions {
  sendFn: (args: WrakerSuccessResponse) => void;
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

export class WrakerAppResponse implements WrakerAppResponseOptions {
  public readonly app: WrakerRouter;
  private _status: number = 0;
  public readonly headers: WrakerHeaders = new WrakerHeaders();
  public body: EventData;

  private _sendFn: (args: WrakerSuccessResponse) => void;
  private _sendErrorFn: (args: WrakerErrorResponse) => void;

  public readonly req: WrakerAppRequest;
  private _finished: boolean = false;

  constructor(options: WrakerAppResponseConstructorOptions) {
    this.app = options.req.app;
    this.req = options.req;
    this._sendFn = options.sendFn;
    this._sendErrorFn = options.sendErrorFn;

    if (this.req.headers.has("X-Request-ID")) {
      this.headers.set("X-Request-ID", this.req.headers.get("X-Request-ID"));
    }
  }

  public get statusCode(): number {
    return this._status;
  }

  public set statusCode(value: number) {
    this._status = value;
  }

  public status(value: number): WrakerAppResponse {
    this._status = value;
    return this;
  }

  public get finished(): boolean {
    return this._finished;
  }

  private _end(): void {
    this._finished = true;
  }

  public send(body: EventData): void {
    this._sendFn({
      headers: this.headers.serialize(),
      status: this.statusCode,
      body: body,
    });

    this._end();
  }

  public json(body: EventData): void {
    try {
      const json = JSON.stringify(body);
      this.headers.set("Content-Type", "application/json");
      this.send(json);
    } catch (error) {
      this._sendErrorFn({
        headers: this.headers.serialize(),
        error: "Body is not a valid JSON object",
        status: 500,
      });
    }

    this._end();
  }

  public end(): void {
    this.send(null);
  }
}
