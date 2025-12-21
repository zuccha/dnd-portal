//------------------------------------------------------------------------------
// Path
//------------------------------------------------------------------------------

export type Path<T> =
  T extends Record<PropertyKey, unknown> ?
    { [K in keyof T]-?: [K] | [K, ...Path<T[K]>] }[keyof T]
  : never;

//------------------------------------------------------------------------------
// Path Value
//------------------------------------------------------------------------------

export type PathValue<T, P extends readonly unknown[]> =
  P extends readonly [infer K, ...infer R] ?
    K extends keyof T ?
      R extends readonly [] ?
        T[K]
      : PathValue<T[K], R>
    : never
  : T;
