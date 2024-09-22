import { Method, type EventPath, type WrakerRequest } from "../common";
import { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerAppResponse } from "./WrakerAppResponse";
import { WrakerRouter } from "./WrakerRouter";

export type WrakerAppNext = (err?: any) => void;

export const METHOD_ALL = "all";
export type LayerMethod = Method | typeof METHOD_ALL;

export type LayerEventPath = EventPath;

export type Layer = {
  all: boolean;
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

export function subpath(path: EventPath, prefix: EventPath): EventPath {
  if (prefix === path) return "/";
  if (!new RegExp(`^${prefix}(?:/|$)`).test(path)) return path;

  return path.slice(prefix.length) as EventPath;
}

export function joinpath(path: EventPath, suffix: string): EventPath {
  const correctedSuffix: EventPath = suffix.startsWith("/")
    ? (suffix as EventPath)
    : `/${suffix}`;

  if (path === "/") return correctedSuffix;
  if (suffix === "/") return path;

  if (path.endsWith("/"))
    return `${path.slice(0, -1)}${correctedSuffix}` as EventPath;
  return `${path}${correctedSuffix}` as EventPath;
}

export function getMatchingLayers(
  request: WrakerRequest,
  router: WrakerRouter
): Layer[] {
  const requestPath = request.path;
  const method = request.method;

  const layers: Layer[] = [];

  for (const layer of router.stack) {
    if (
      layer.method !== METHOD_ALL &&
      layer.method.toLowerCase() !== method.toLowerCase()
    )
      continue;

    if (layer.all) {
      layers.push(layer);
      continue;
    }

    if (layer.handler instanceof WrakerRouter) {
      if (!requestPath.startsWith(layer.path)) continue;

      const newRequest = {
        ...request,
        path: subpath(requestPath, layer.path),
      };

      const subLayers = getMatchingLayers(newRequest, layer.handler);
      if (subLayers.length > 0) layers.push(layer);
      continue;
    }

    if (layer.path === requestPath) {
      layers.push(layer);
      continue;
    }
  }

  return layers;
}

// export type ParamEventHandler = (
//   req: AppRequest,
//   res: AppResponse,
//   next: NextHandler,
//   param: string | number
// ) => void;

// export function match(requestPath: EventPath, layer: Layer): boolean {
//   if (layer.path === PATH_ALL) return true;
//   if (layer.path === requestPath) return true;

//   if (layer.handler instanceof WrakerRouter) {
//     return match(requestPath, layer);
//   }

//   return matchString(requestPath, layer.path);
// }

// export function matchString(
//   requestPath: EventPath,
//   layerPath: EventPath
// ): boolean {
//   if (requestPath === layerPath) return true;
//   if (layerPath.endsWith("*")) {
//     const prefix = layerPath.slice(0, -1);
//     return requestPath.startsWith(prefix);
//   }

//   return false;
// }
