type LowercaseMethod =
  | "all"
  | "checkout"
  | "copy"
  | "delete"
  | "get"
  | "head"
  | "lock"
  | "merge"
  | "mkactivity"
  | "mkcol"
  | "move"
  | "m-search"
  | "notify"
  | "options"
  | "patch"
  | "post"
  | "purge"
  | "put"
  | "report"
  | "search"
  | "subscribe"
  | "trace"
  | "unlock"
  | "unsubscribe";

export type Method = LowercaseMethod | Uppercase<LowercaseMethod>;

export interface EventOptions {
  method: Method;
  path: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}
