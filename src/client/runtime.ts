import type { UnionToIntersection } from "../lib";
import { Wraker, type WrakerOptions } from "./Wraker";
import type { WrakerPlugin, WrakerPluginFactory } from "./WrakerPlugin";

type ExtractExtension<Extensions> =
  Extensions extends WrakerPlugin<infer Extensions, any> ? Extensions : never;

type ExtendedWraker<T extends WrakerPlugin<any, any>[]> = Wraker &
  UnionToIntersection<ExtractExtension<T[number]>>;

export function defineWraker<T extends WrakerPlugin<any, any>[] = []>(
  scriptURL: string | URL,
  options?: Omit<Partial<WrakerOptions>, "plugins"> &
    WorkerOptions & {
      plugins?: T;
    },
) {
  return new Wraker(scriptURL, options) as ExtendedWraker<T>;
}

export function defineWrakerPlugin<Extension = {}, Options = {}>(
  parameters: Omit<WrakerPlugin<Extension, Options>, "options">,
): WrakerPluginFactory<Extension, Options> {
  return function (options) {
    return {
      ...parameters,
      options,
    };
  };
}
