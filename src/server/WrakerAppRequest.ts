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

export interface WrakerAppRequestConstructorOptions extends WrakerRequest {
  sendFn: (args: WrakerSuccessResponse) => void;
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

export class WrakerAppRequest {
  public readonly method: Method;
  public readonly path: EventPath;
  public readonly headers: WrakerHeaders;
  public body: EventData;
  public readonly res: WrakerAppResponse;
  public readonly app: WrakerRouter;

  constructor(app: WrakerRouter, options: WrakerAppRequestConstructorOptions) {
    this.app = app;

    this.method = options.method;
    this.path = options.path;
    this.body = options.body;
    this.headers = new WrakerHeaders(options.headers);

    this.res = new WrakerAppResponse({
      req: this,
      sendFn: options.sendFn,
      sendErrorFn: options.sendErrorFn,
    });
  }
}

