import {
  EventData,
  WrakerErrorResponse,
  WrakerHeaders,
  WrakerSuccessResponse,
} from "../common";
import { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerRouter } from "./WrakerRouter";

export interface WrakerAppResponseOptions {
  req: WrakerAppRequest;
}

export interface WrakerAppResponseConstructorOptions
  extends WrakerAppResponseOptions {
  sendFn: (args: WrakerSuccessResponse) => void;
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

export class ResponseAlreadySentException extends Error {}

export class WrakerAppResponse implements WrakerAppResponseOptions {
  private static NEVER_STATUS: -1;

  public readonly app: WrakerRouter;
  private _status: number = WrakerAppResponse.NEVER_STATUS;
  public readonly headers: WrakerHeaders = new WrakerHeaders();
  public body: EventData;
  public readonly req: WrakerAppRequest;

  private _finished: boolean = false;

  constructor(req: WrakerAppRequest) {
    this.app = req.app;
    this.req = req;

    if (this.req.headers.has("X-Request-ID")) {
      this.headers.set("X-Request-ID", this.req.headers.get("X-Request-ID"));
    }
  }

  private __internalSend(data: any) {
    globalThis.postMessage(data);
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
    if (this.finished)
      throw new ResponseAlreadySentException("Reponse was already sent.");

    if (this.statusCode === WrakerAppResponse.NEVER_STATUS)
      this.statusCode = 200;

    this.__internalSend({
      headers: this.headers.serialize(),
      status: this.statusCode,
      body: body,
    });

    this._end();
  }

  public sendError(error: EventData): void;
  public sendError(error: EventData): void {
    if (this.finished)
      throw new ResponseAlreadySentException("Reponse was already sent.");

    if (this.statusCode === WrakerAppResponse.NEVER_STATUS)
      this.statusCode = 500;

    this.__internalSend({
      headers: this.headers.serialize(),
      status: this.statusCode,
      error,
    });

    this._end();
  }

  public json(body: EventData): void {
    const json = JSON.stringify(body);
    this.headers.set("Content-Type", "application/json");
    this.send(json);

    this._end();
  }

  public end(): void {
    this.send(undefined);
  }
}

