import Cookies from "js-cookie";

import {
  EventData,
  WrakerErrorResponse,
  WrakerHeaders,
  WrakerSuccessResponse,
} from "../common";
import { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerRouter } from "./WrakerRouter";

export interface WrakerAppLocals {
  [key: string]: any;
}

export interface WrakerAppResponseOptions {}

export interface WrakerAppResponseConstructorOptions
  extends WrakerAppResponseOptions {
  sendFn: (args: WrakerSuccessResponse) => void;
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

export class ResponseAlreadySentException extends Error {}

export class WrakerAppResponse implements WrakerAppResponseOptions {
  public readonly app: WrakerRouter;
  public readonly locals: WrakerAppLocals = {};
  public readonly req: WrakerAppRequest;

  private static NEVER_STATUS: -1;
  private _finished: boolean = false;
  private _headersSent: boolean = false;
  private _status: number = WrakerAppResponse.NEVER_STATUS;
  private readonly headers: WrakerHeaders = new WrakerHeaders();

  constructor(req: WrakerAppRequest) {
    this.app = req.app;
    this.req = req;

    if (this.req.headers.has("X-Request-ID")) {
      this.headers.set("X-Request-ID", this.req.headers.get("X-Request-ID"));
    }
  }

  private __internalSend(data: any) {
    globalThis.postMessage(data);
    this._headersSent = true;
  }

  private _end(): void {
    this._finished = true;
  }

  public get headersSent(): boolean {
    return this._headersSent;
  }

  public get statusCode(): number {
    return this._status;
  }

  public set statusCode(value: number) {
    this._status = value;
  }

  public get finished(): boolean {
    return this._finished;
  }

  public append(field: string, value?: string | string[]): WrakerAppResponse {
    if (!value) {
      this.headers.set(field, undefined);
      return this;
    }

    if (typeof value === "string") {
      this.headers.set(field, value);
    } else {
      this.headers.set(field, value.join("; "));
    }

    return this;
  }

  // public attachment(filename?: string): void {}

  public cookie(
    name: string,
    value: string,
    options?: Cookies.CookieAttributes
  ): WrakerAppResponse {
    Cookies.set(name, value, options);

    return this;
  }

  public clearCookie(name: string, options?: Cookies.CookieAttributes): void {
    Cookies.remove(name, options);
  }

  // public download(
  //   path: string,
  //   filename?: string,
  //   options?: any,
  //   fn?: any
  // ): void {}

  public end(data?: any, encoding?: string): void {
    this.append("Content-Type", encoding);
    this.send(data);
  }

  // public format(obj: any): void {}

  public get(field: string): string | undefined {
    return this.headers.get(field);
  }

  public json(body?: EventData): void {
    if (!body) {
      this.end();
      return;
    }

    const json = JSON.stringify(body);
    this.headers.set("Content-Type", "application/json");
    this.send(json);

    this._end();
  }

  // public jsonp(body: any): void {}

  public links(links: { [key: string]: string }): WrakerAppResponse {
    const link = Object.keys(links)
      .map((rel) => `<${links[rel]}>; rel="${rel}"`)
      .join(", ");

    return this.append("Link", link);
  }

  public location(url: "back" | string): WrakerAppResponse {
    if (url === "back") {
      return this.append("Location", this.req.headers.get("Referer") || "/");
    }

    return this.append("Location", url);
  }

  public redirect(status: number, url: string): void;
  public redirect(url: string): void;
  public redirect(param1: any, url?: string): void {
    if (typeof param1 === "number") {
      this.status(param1);
    }

    this.location(url || param1);
    this.end();
  }

  // public render(view: string, locals?: any, callback?: any): void {}

  public send(body?: EventData): void {
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

  public sendError(error?: EventData): void {
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

  // public sendFile(path: string, options?: any, fn?: any): void {}

  public set(field: string, value: string): WrakerAppResponse {
    this.headers.set(field, value);
    return this;
  }

  public status(value: number): WrakerAppResponse {
    this._status = value;
    return this;
  }

  // public type(type: string): void {}
  // public vary(field: string): void {}
}
