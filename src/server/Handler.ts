import { Method, type EventPath } from "../common";
import type { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerAppResponse } from "./WrakerAppResponse";
import { WrakerRouter } from "./WrakerRouter";

export type WrakerAppNext = (err?: any) => void;

export const METHOD_ALL = "all";
export type LayerMethod = Method | typeof METHOD_ALL;

export const PATH_ALL = "*";
export type LayerEventPath = EventPath | typeof PATH_ALL;

export type Layer = {
  path: LayerEventPath;
  method: LayerMethod;
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
