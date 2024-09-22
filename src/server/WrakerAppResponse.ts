import Cookies from "js-cookie";

import {
  EventData,
  WrakerErrorResponse,
  WrakerHeaders,
  WrakerSuccessResponse,
} from "../common";
import { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerRouter } from "./WrakerRouter";

/**
 * Represents the response object for the Wraker application.
 */
export interface WrakerAppLocals {
  [key: string]: any;
}

export interface WrakerAppResponseOptions {}

export interface WrakerAppResponseConstructorOptions
  extends WrakerAppResponseOptions {
  /**
   * The function to send the response.
   *
   * @param args - The response data.
   */
  sendFn: (args: WrakerSuccessResponse) => void;

  /**
   * The function to send an error response.
   *
   * @param args - The error response data.
   */
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

/**
 * Response Already Sent Exception.
 */
export class ResponseAlreadySentException extends Error {}

/**
 * Represents the response object for the Wraker application.
 */
export class WrakerAppResponse implements WrakerAppResponseOptions {
  public readonly app: WrakerRouter;
  public readonly locals: WrakerAppLocals = {};
  public readonly req: WrakerAppRequest;

  private static NEVER_STATUS: -1;
  private _headersSent: boolean = false;
  private _status: number = WrakerAppResponse.NEVER_STATUS;
  private readonly headers: WrakerHeaders = new WrakerHeaders();

  /**
   * Creates a new WrakerAppResponse instance.
   *
   * @param req - The WrakerAppRequest instance.
   */
  constructor(req: WrakerAppRequest) {
    this.app = req.app;
    this.req = req;

    if (this.req.get("X-Request-ID")) {
      this.headers.set("X-Request-ID", this.req.get("X-Request-ID"));
    }
  }

  /**
   * @internal
   * Sends the response data.
   */
  private __internalSend(data: any) {
    globalThis.postMessage(data);
    this._headersSent = true;
  }

  /**
   * Indicates if the headers were sent.
   */
  public get headersSent(): boolean {
    return this._headersSent;
  }

  /**
   * Gets the status code of the response.
   */
  public get statusCode(): number {
    return this._status;
  }

  /**
   * Sets the status code of the response.
   *
   * @param value - The status code.
   */
  public set statusCode(value: number) {
    this._status = value;
  }

  /**
   * Appends the specified value to the response header.
   *
   * @param field - The header field.
   * @param value - The value to append.
   * @returns The response object.
   */
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

  /**
   * Sets the specified cookie.
   *
   * @param name - The cookie name.
   * @param value - The cookie value.
   * @param options - The cookie options.
   * @returns The response object.
   */
  public cookie(
    name: string,
    value: string,
    options?: Cookies.CookieAttributes
  ): WrakerAppResponse {
    Cookies.set(name, value, options);

    return this;
  }

  /**
   * Clears the specified cookie.
   *
   * @param name - The cookie name.
   * @param options - The cookie options.
   */
  public clearCookie(name: string, options?: Cookies.CookieAttributes): void {
    Cookies.remove(name, options);
  }

  // public download(
  //   path: string,
  //   filename?: string,
  //   options?: any,
  //   fn?: any
  // ): void {}

  /**
   * Ends the response.
   *
   * @param data - The response data.
   * @param encoding - The encoding of the response data.
   */
  public end(data?: any, encoding?: string): void {
    this.append("Content-Type", encoding);
    this.send(data);
  }

  // public format(obj: any): void {}

  /**
   * Gets the value of the specified header field.
   *
   * @param field - The header field.
   * @returns The value of the specified header field.
   */
  public get(field: string): string | undefined {
    return this.headers.get(field);
  }

  /**
   * Sends the specified JSON data.
   *
   * @param body - The JSON data to send.
   */
  public json(body?: EventData): void {
    if (!body) {
      this.end();
      return;
    }

    const json = JSON.stringify(body);
    this.headers.set("Content-Type", "application/json");
    this.send(json);
  }

  // public jsonp(body: any): void {}

  /**
   * Sets the specified link headers.
   *
   * @param links - The links to set.
   * @returns The response object.
   */
  public links(links: { [key: string]: string }): WrakerAppResponse {
    const link = Object.keys(links)
      .map((rel) => `<${links[rel]}>; rel="${rel}"`)
      .join(", ");

    return this.append("Link", link);
  }

  /**
   * Redirects to the specified URL.
   *
   * @param status - The status code.
   * @param url - The URL to redirect to.
   */
  public location(url: "back" | string): WrakerAppResponse {
    if (url === "back") {
      return this.append("Location", this.req.get("Referer") || "/");
    }

    return this.append("Location", url);
  }

  /**
   * Redirects to the specified URL.
   *
   * @param status - The status code.
   * @param url - The URL to redirect to.
   */
  public redirect(status: number, url: string): void;
  public redirect(url: string): void;
  public redirect(param1: any, url?: string): void {
    if (typeof param1 === "number") {
      this.status(param1);
    } else {
      this.status(302);
    }

    this.location(url || param1);
    this.end();
  }

  // public render(view: string, locals?: any, callback?: any): void {}

  /**
   * Sends the specified response data.
   *
   * @param body - The response data.
   */
  public send(body?: EventData): void {
    if (this.headersSent)
      throw new ResponseAlreadySentException("Reponse was already sent.");

    if (this.statusCode === WrakerAppResponse.NEVER_STATUS)
      this.statusCode = 200;

    this.__internalSend({
      headers: this.headers.serialize(),
      status: this.statusCode,
      body: body,
    });
  }

  /**
   * Sends the specified error response.
   *
   * @param error - The error response data.
   */
  public sendError(error?: EventData): void {
    if (this.headersSent)
      throw new ResponseAlreadySentException("Reponse was already sent.");

    if (this.statusCode === WrakerAppResponse.NEVER_STATUS)
      this.statusCode = 500;

    this.__internalSend({
      headers: this.headers.serialize(),
      status: this.statusCode,
      error,
    });
  }

  // public sendFile(path: string, options?: any, fn?: any): void {}

  /**
   * Sets the specified header field to the specified value.
   *
   * @param field - The header field.
   * @param value - The value to set.
   * @returns The response object.
   */
  public set(field: string, value: string): WrakerAppResponse {
    this.headers.set(field, value);
    return this;
  }

  /**
   * Sets the status code of the response.
   *
   * @param value - The status code.
   * @returns The response object
   */
  public status(value: number): WrakerAppResponse {
    this._status = value;
    return this;
  }

  // public type(type: string): void {}
  // public vary(field: string): void {}
}
