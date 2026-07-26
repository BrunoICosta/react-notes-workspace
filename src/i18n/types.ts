/**
 * Shape of a translated namespace: same keys as the source (pt-BR) namespace,
 * with any string as value. Keeps every language in sync at compile time.
 */
export type Translation<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : Translation<T[K]>;
};
