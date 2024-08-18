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

export type EventPath = string;

/**
 * A request body
 *
 * @link [allowed types](https://developer.mozilla.org/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types)
 */
export type EventData = any;

/**
 * A request headers
 *
 * @link [allowed types](https://developer.mozilla.org/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types)
 */
export type EventHeaders = Record<string, string>;

export interface WrakerRequest<T = EventData> {
  path: EventPath;
  method: Method;
  headers: EventHeaders;
  body: T;
}

export interface WrakerBaseResponse {
  status: number;
  headers: EventHeaders;
}

export type WrakerSuccessResponse<T = EventData> = WrakerBaseResponse & {
  body: T;
};

export type WrakerErrorResponse<T = Error | EventData> = WrakerBaseResponse & {
  error: T;
};

export type WrakerResponse<T = any> = WrakerBaseResponse &
  Partial<WrakerSuccessResponse<T> & WrakerErrorResponse<T>>;
