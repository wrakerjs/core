import type { UnionToIntersection } from "../lib";
import { WrakerApp, type WrakerAppOptions } from "./WrakerApp";
import type {
  WrakerAppPlugin,
  WrakerAppPluginFactory,
} from "./WrakerAppPlugin";

type ExtractExtension<Extensions> = Extensions extends WrakerAppPlugin<
  infer Extensions,
  any
>
  ? Extensions
  : never;

type ExtendedWrakerApp<T extends WrakerAppPlugin<any, any>[] = []> =
  WrakerApp &
    (T extends [] ? {} : UnionToIntersection<ExtractExtension<T[number]>>);

export function defineWrakerApp<T extends WrakerAppPlugin<any, any>[] = []>(
  options?: Partial<WrakerAppOptions>
): ExtendedWrakerApp<T> {
  return new WrakerApp(options) as ExtendedWrakerApp<T>;
}

export function defineWrakerAppPlugin<Extension = {}, Options = {}>(
  parameters: Omit<WrakerAppPlugin<Extension, Options>, "options">
): WrakerAppPluginFactory<Extension, Options> {
  return function (options) {
    return {
      ...parameters,
      options,
    };
  };
}
