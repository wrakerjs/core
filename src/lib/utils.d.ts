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

export type ExtractKeysByType<I, T> = {
  [K in keyof I]-?: I[K] extends T | undefined ? K : never;
}[keyof I];

export type ExtractTypeByKey<I, K extends ExtractKeysByType<I, T>, T> = I[K];
