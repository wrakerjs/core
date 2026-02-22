import type { WrakerRequest } from "../common";
import type { Exact, ExtractKeysByType, ExtractTypeByKey } from "../lib";
import type { WrakerApp } from "./WrakerApp";
import type { WrakerRouter } from "./WrakerRouter";

export type WrakerAppPluginHook<
  Extension = {},
  Options = {},
  Args extends any[] = [],
> = (
  app: WrakerApp & Extension,
  options?: Options,
  ...args: Args
) => boolean | void;

export type WrakerAppPluginFactory<Extension, Options> = (
  options?: Exact<Options>,
) => WrakerAppPlugin<Extension, Options>;

export interface WrakerAppPlugin<Extension = {}, Options = {}> {
  name: string;
  version?: string;
  description?: string;
  options?: Options;

  /**
   * Initializes the plugin.
   */
  init: WrakerAppPluginHook<Extension, Options, []>;

  /**
   * Destroys the plugin.
   */
  destroy?: WrakerAppPluginHook<Extension, Options, []>;

  /**
   * Called when the app starts listening.
   */
  onListen?: WrakerAppPluginHook<Extension, Options, []>;

  /**
   * Called before a message is handled.
   */
  onBeforeMessageHandled?: WrakerAppPluginHook<
    Extension,
    Options,
    [MessageEvent<Partial<WrakerRequest>>]
  >;

  /**
   * Called after a message has been handled.
   */
  onAfterMessageHandled?: WrakerAppPluginHook<
    Extension,
    Options,
    [MessageEvent<Partial<WrakerRequest>>]
  >;

  /**
   * Called when an error occurs during request processing.
   */
  onError?: WrakerAppPluginHook<Extension, Options, [unknown]>;

  /**
   * Called when a sub-router or sub-app is mounted.
   */
  onMount?: WrakerAppPluginHook<Extension, Options, [WrakerRouter]>;
}

export type WrakerAppPluginHookKey = ExtractKeysByType<
  WrakerAppPlugin,
  WrakerAppPluginHook<any, any, any>
>;

export type WrakerAppPluginHookArgs<
  K extends ExtractKeysByType<
    WrakerAppPlugin,
    WrakerAppPluginHook<any, any, any>
  >,
> =
  ExtractTypeByKey<
    WrakerAppPlugin,
    K,
    WrakerAppPluginHook<any, any, any>
  > extends WrakerAppPluginHook<any, any, infer Args> | undefined
    ? Args
    : never;
