import Cookies from "js-cookie";

import {
  EventData,
  EventPath,
  Method,
  WrakerErrorResponse,
  WrakerHeaders,
  WrakerRequest,
  WrakerSuccessResponse,
} from "../common";
import { WrakerAppResponse } from "./WrakerAppResponse";
import type { WrakerRouter } from "./WrakerRouter";

export interface WrakerAppRequestConstructorOptions extends WrakerRequest {}

export class WrakerAppRequest {
  public readonly method: Method;
  public readonly path: EventPath;
  public readonly headers: WrakerHeaders;
  public readonly cookies: Record<string, any>;
  public body: EventData;
  public readonly res: WrakerAppResponse;
  public readonly app: WrakerRouter;

  constructor(app: WrakerRouter, options: WrakerAppRequestConstructorOptions) {
    this.app = app;

    this.method = options.method;
    this.path = options.path;
    this.body = options.body;
    this.headers = new WrakerHeaders(options.headers);
    this.cookies = Cookies;

    this.res = new WrakerAppResponse(this);
  }
}

