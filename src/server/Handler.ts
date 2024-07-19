import { Method } from "../common";
import { WrakerRouter } from "./WrakerRouter";

export type NextHandler = (err?: any) => void;
export type AppRequest = {
  method: string;
  path: string;
  body?: any;
  headers?: Record<string, string>;
};
// export type AppRequest = {
//   app: WrakerApp;
//   baseUrl: string;
//   body: any;
//   cookies: Record<string, string>;
//   // fresh: boolean;
//   // hostname: string;
//   // ip: string;
//   // ips: string[];
//   method: string;
//   originalUrl: string;
//   url: string; // almost duplicate of originalUrl
//   params: Record<string, string>;
//   path: string;
//   // protocol: string;
//   query: Record<string, string>;
//   res: AppResponse;
//   route: any;
//   // secure: boolean;
//   // signedCookies: Record<string, string>;
//   // stale: boolean;
//   // subdomains: string[];
//   // xhr: boolean;

//   // accepts: (types: string | string[]) => string | false;
//   // acceptsCharsets: (charsets: string | string[]) => string | false;
//   // acceptsEncodings: (encodings: string | string[]) => string | false;
//   // acceptsLanguages: (langs: string | string[]) => string | false;
//   get: (field: string) => string;
//   is: (type: string | string[]) => string | false;
//   // range: (size: number, options?: any) => any;
// };

export type AppResponse = {
  body: any;
  status: number;
  headers: Record<string, string>;

  send: (body: any) => void;
  json: (body: any) => void;
};

// export type AppResponse = {
//   app: WrakerApp;
//   locals: Record<any, any>;
//   append: (field: string, value?: string) => void;
//   // attachment: (filename?: string) => void;
//   cookie: (name: string, value: string, options?: any) => void;
//   clearCookie: (name: string, options?: any) => void;
//   // download: (path: string, filename?: string, fn?: any) => void;
//   end: (data: any, encoding?: string) => void;
//   // format: (obj: any) => void;
//   get: (field: string) => string;
//   json: (body: any) => void;
//   jsonp: (body: any) => void;
//   // links: (links: any) => void;
//   // location: (url: string) => void;
//   redirect: (url: string, status?: number) => void;
//   // render: (view: string, options?: any, callback?: any) => void;
//   send: (body: any) => void;
//   // sendFile: (path: string, options?: any, fn?: any) => void;
//   sendStatus: (statusCode: number) => void;
//   set: (field: string, value: string) => AppResponse;
//   status: (code: number) => AppResponse;
//   type: (type: string) => AppResponse;
// };

export type StructuredEventHandler = {
  path: string;
  method: Method;
  handler: EventHandler;
};

export type EventHandler = EventHandlerFn | WrakerRouter;

export type EventHandlerFn = (
  req: AppRequest,
  res: AppResponse,
  next: NextHandler
) => void;

export type ParamEventHandler = (
  req: AppRequest,
  res: AppResponse,
  next: NextHandler,
  param: string | number
) => void;

export type WrakerAppPath = string;

export interface Routable {
  process(request: AppRequest): void;
}
