export type Exact<T> = T & {
  [K in keyof T]: T[K];
};

export type Complete<T> = {
  [K in keyof T]-?: T[K];
};

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
