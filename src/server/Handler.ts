import { Method, type EventPath } from "../common";
import type { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerAppResponse } from "./WrakerAppResponse";
import { WrakerRouter } from "./WrakerRouter";

export type WrakerAppNext = (err?: any) => void;

export type StructuredEventHandler = {
  path: EventPath;
  method: Method;
  handler: EventHandler;
};

export type EventHandler = EventHandlerFn | WrakerRouter;

export type EventHandlerFn = (
  req: WrakerAppRequest,
  res: WrakerAppResponse,
  next: WrakerAppNext
) => void;

// export type ParamEventHandler = (
//   req: AppRequest,
//   res: AppResponse,
//   next: NextHandler,
//   param: string | number
// ) => void;
