import type { WrakerRequest, WrakerResponse } from "../common";
import type { Exact, ExtractKeysByType, ExtractTypeByKey } from "../lib";
import type { Wraker } from "./Wraker";

export type WrakerPluginHook<
  Extension = {},
  Options = {},
  Args extends any[] = [],
> = (
  wraker: Wraker & Extension,
  options?: Options,
  ...args: Args
) => boolean | void;

export type WrakerPluginFactory<Extension, Options> = (
  options?: Exact<Options>,
) => WrakerPlugin<Extension, Options>;

export interface WrakerPlugin<Extension = {}, Options = {}> {
  name: string;
  version?: string;
  description?: string;
  options?: Options;

  /**
   * Initializes the plugin.
   */
  init: WrakerPluginHook<Extension, Options, []>;

  /**
   * Destroys the plugin.
   */
  destroy?: WrakerPluginHook<Extension, Options, []>;

  /**
   * Called before a message is sent to the worker.
   */
  onBeforeMessageSent?: WrakerPluginHook<Extension, Options, [WrakerRequest]>;

  /**
   * Called after a message is sent to the worker.
   */
  onAfterMessageSent?: WrakerPluginHook<Extension, Options, [WrakerRequest]>;

  /**
   * Called before a message received from the worker is handled.
   * Return false to prevent default response handling (X-Request-ID correlation).
   */
  onBeforeMessageReceived?: WrakerPluginHook<
    Extension,
    Options,
    [MessageEvent<Partial<WrakerResponse>>]
  >;

  /**
   * Called after a message received from the worker has been handled.
   */
  onAfterMessageReceived?: WrakerPluginHook<
    Extension,
    Options,
    [MessageEvent<Partial<WrakerResponse>>]
  >;

  /**
   * Called when an error occurs.
   */
  onError?: WrakerPluginHook<Extension, Options, [unknown]>;
}

export type WrakerPluginHookKey = ExtractKeysByType<
  WrakerPlugin,
  WrakerPluginHook<any, any, any>
>;

export type WrakerPluginHookArgs<
  K extends ExtractKeysByType<WrakerPlugin, WrakerPluginHook<any, any, any>>,
> =
  ExtractTypeByKey<WrakerPlugin, K, WrakerPluginHook<any, any, any>> extends
    | WrakerPluginHook<any, any, infer Args>
    | undefined
    ? Args
    : never;
