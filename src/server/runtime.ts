import type { UnionToIntersection } from "../lib";
import { WrakerAppBase, type WrakerAppOptions } from "./WrakerAppBase";
import type {
  WrakerAppPlugin,
  WrakerAppPluginFactory,
  WrakerAppPluginHook,
} from "./WrakerAppPlugin";

type ExtractExtension<Extensions> = Extensions extends WrakerAppPlugin<
  infer Extensions,
  any
>
  ? Extensions
  : never;

type ExtendedWrakerApp<T extends WrakerAppPlugin<any, any>[] = []> =
  WrakerAppBase &
    (T extends [] ? {} : UnionToIntersection<ExtractExtension<T[number]>>);

export function defineWrakerApp<T extends WrakerAppPlugin<any, any>[] = []>(
  options?: Partial<WrakerAppOptions>
): ExtendedWrakerApp<T> {
  return new WrakerAppBase(options) as ExtendedWrakerApp<T>;
}

export function defineWrakerAppPlugin<Extension = {}, Options = {}>(
  parameters: Omit<WrakerAppPlugin<Extension, Options>, "init" | "destroy"> & {
    init: WrakerAppPluginHook<Extension, Options>;
    destroy?: WrakerAppPluginHook<Extension, Options>;
  }
): WrakerAppPluginFactory<Extension, Options> {
  return function (options) {
    return {
      ...parameters,
      init: (app) => parameters.init(app, options),
      destroy: (app) => parameters.destroy?.(app, options),
    };
  };
}
