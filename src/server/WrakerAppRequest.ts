import Cookies from "js-cookie";

import {
  EventData,
  EventPath,
  Method,
  WrakerHeaders,
  WrakerRequest,
} from "../common";
import { WrakerAppResponse } from "./WrakerAppResponse";
import type { WrakerRouter } from "./WrakerRouter";

export interface WrakerAppRequestConstructorOptions extends WrakerRequest {}

export class WrakerAppRequest {
  public readonly app: WrakerRouter;
  public readonly baseUrl: string;
  public body: EventData;
  public readonly cookies: Record<string, any>;
  // public readonly fresh: boolean;
  public readonly headers: WrakerHeaders;
  public readonly hostname: string;
  // public readonly ip: string;
  // public readonly ips: string[];
  public readonly method: Method;
  public readonly originalUrl: string;
  // public readonly params: Record<string, string>;
  public readonly path: EventPath;
  // public readonly protocol: string;
  // public readonly query: Record<string, string>;
  public readonly res: WrakerAppResponse;
  // public readonly route: WrakerLayer;
  // public readonly secure: boolean;
  // public readonly signedCookies: Record<string, string>;
  // public readonly stale: boolean;
  // public readonly subdomains: string[];
  // public readonly xhr: boolean;

  constructor(app: WrakerRouter, options: WrakerAppRequestConstructorOptions) {
    this.app = app;
    this.baseUrl = app.path;
    this.body = options.body;
    this.cookies = Cookies;
    this.headers = new WrakerHeaders(options.headers);
    this.hostname = location.hostname;
    this.method = options.method.toLowerCase() as Method;
    this.originalUrl = options.path;
    this.path = options.path;
    this.res = new WrakerAppResponse(this);
  }

  // public accepts(types: string | string[]): string | false {}
  // public acceptsCharsets(charsets: string | string[]): string | false {}
  // public acceptsEncodings(encodings: string | string[]): string | false {}
  // public acceptsLanguages(langs: string | string[]): string | false {}

  public get(field: string): string | undefined {
    return this.headers.get(field) as string | undefined;
  }

  // public is(type: string | string[]): string | false {}
  // public range(size: number, options?: any): any {}
}
