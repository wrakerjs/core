import type { Exact } from "../lib";
import type { WrakerAppBase } from "./WrakerAppBase";

export type WrakerAppPluginHook<Extension = {}, Options = {}> = (
  app: WrakerAppBase & Extension,
  options?: Options
) => boolean | void;

export type WrakerAppPluginFactory<Extension, Options> = (
  options?: Exact<Options>
) => WrakerAppPlugin<Extension, Options>;

export interface WrakerAppPlugin<Extension = {}, Options = {}> {
  name: string;
  version?: string;
  description?: string;

  /**
   * Initializes the plugin.
   */
  init: WrakerAppPluginHook<Extension, Options>;

  /**
   * Destroys the plugin.
   */
  destroy?: WrakerAppPluginHook<Extension, Options>;
}
