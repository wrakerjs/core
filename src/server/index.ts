import type { WrakerApp } from "./WrakerApp";

export * from "./Handler";
export * from "./WrakerApp";
export * from "./WrakerAppRequest";
export * from "./WrakerAppResponse";
export * from "./WrakerRouter";

declare module "." {
  interface WrakerRouterEventMap {
    "wraker-router:mount": CustomEvent<{
      app: WrakerApp;
    }>;
    "wraker-router:mounted": CustomEvent<{
      handler: WrakerRouter;
    }>;
  }

  interface WrakerRouter extends EventTarget {
    addEventListener<K extends keyof WrakerRouterEventMap>(
      type: K,
      listener: (this: WrakerRouter, ev: WrakerRouterEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener<K extends keyof WrakerRouterEventMap>(
      type: K,
      listener: (this: WrakerRouter, ev: WrakerRouterEventMap[K]) => void,
      options?: boolean | EventListenerOptions
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  }
}
