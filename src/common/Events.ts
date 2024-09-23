/**
 * Lowercase request method
 */
export type LowercaseMethod =
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

/**
 * Request method
 */
export type Method = LowercaseMethod | Uppercase<LowercaseMethod>;

/**
 * Request path
 */
export type EventPath = `/${string}`;

/**
 * Request body
 *
 * @see {@link https://developer.mozilla.org/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types|allowed types}
 */
export type EventData = any;

/**
 * Request headers
 *
 * @see {@link https://developer.mozilla.org/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#error_types|allowed types}
 */
export type EventHeaders = Record<string, string>;

/**
 * Common request interface
 */
export interface WrakerRequest<T = EventData> {
  /**
   * Request path
   */
  path: EventPath;

  /**
   * Request method
   */
  method: Method;

  /**
   * Request headers
   */
  headers: EventHeaders;

  /**
   * Request body
   */
  body: T;
}

/**
 * Response base
 */
export interface WrakerBaseResponse {
  /**
   * Response status code
   */
  status: number;

  /**
   * Response headers
   */
  headers: EventHeaders;
}

/**
 * Success response interface
 */
export type WrakerSuccessResponse<T = EventData> = WrakerBaseResponse & {
  body: T;
};

/**
 * Error response interface
 */
export type WrakerErrorResponse<T = Error | EventData> = WrakerBaseResponse & {
  error: T;
};

/**
 * Common response interface
 */
export type WrakerResponse<T = any> = WrakerBaseResponse &
  Partial<WrakerSuccessResponse<T> & WrakerErrorResponse<T>>;
