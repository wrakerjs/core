import { Method, type EventPath, type WrakerRequest } from "../common";
import { WrakerAppRequest } from "./WrakerAppRequest";
import type { WrakerAppResponse } from "./WrakerAppResponse";
import { WrakerRouter } from "./WrakerRouter";

/**
 * Next handler
 *
 * @param err - An optional error object.
 * @returns void
 */
export type WrakerAppNext = (err?: any) => void;

export const METHOD_ALL = "all";

export type LayerMethod = Method | typeof METHOD_ALL;

export type LayerEventPath = EventPath;

/**
 * Layer
 */
export type Layer = {
  /**
   * Match all paths
   */
  all: boolean;

  /**
   * Layer path
   */
  path: LayerEventPath;

  /**
   * Layer method
   */
  method: LayerMethod;

  /**
   * Layer handler
   */
  handler: EventHandler;
};

export type EventHandler = EventHandlerFn | WrakerRouter;

/**
 * Event handler function
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next handler.
 */
export type EventHandlerFn = (
  /**
   * The request object.
   */
  req: WrakerAppRequest,

  /**
   * The response object.
   */
  res: WrakerAppResponse,

  /**
   * The next handler.
   */
  next: WrakerAppNext
) => void;

/**
 * Remove the prefix from the path
 *
 * @param path - The path to remove the prefix from.
 * @param prefix - The prefix to remove.
 * @returns The path without the prefix.
 *
 * @example
 * subpath("/api/v1/users", "/not-api"); // "/api/v1/users"
 * subpath("/api/v1/users", "/api/v1"); // "/users"
 * subpath("/api/v1/users", "/api/v1/"); // "/users"
 * subpath("/api/v1/users", "/api/v1/users"); // "/"
 */
export function subpath(path: EventPath, prefix: EventPath): EventPath {
  if (prefix === path) return "/";
  if (!new RegExp(`^${prefix}(?:/|$)`).test(path)) return path;

  return path.slice(prefix.length) as EventPath;
}

/**
 * Join two paths
 *
 * @param path - The first path.
 * @param suffix - The second path.
 * @returns The joined path.
 *
 * @example
 * joinpath("/api", "/v1"); // "/api/v1"
 * joinpath("/api/", "/v1"); // "/api/v1"
 * joinpath("/api", "v1"); // "/apiv1"
 * joinpath("/api/", "v1"); // "/api/v1"
 */
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

/**
 * Get all layers that match the request
 *
 * @param request - The request object.
 * @param router - The router object.
 * @returns All layers that match the request.
 */
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
