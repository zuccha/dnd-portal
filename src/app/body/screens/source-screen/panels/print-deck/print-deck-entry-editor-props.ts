import type { LocalizedResourceUnion } from "~/models/resources/resource-union";

//------------------------------------------------------------------------------
// Keys Of Union
//------------------------------------------------------------------------------

type KeysOfUnion<T> = T extends T ? keyof T : never;

//------------------------------------------------------------------------------
// Value Of Union Key
//------------------------------------------------------------------------------

type ValueOfUnionKey<T, K extends PropertyKey> = T extends T
  ? K extends keyof T
    ? T[K]
    : never
  : never;

//------------------------------------------------------------------------------
// Print Deck Entry Editor Props
//------------------------------------------------------------------------------

export type PrintDeckEntryEditorProps<L extends LocalizedResourceUnion> = {
  localizedResource: L;
  onLocalizedResourceUpdate: <K extends KeysOfUnion<L>>(
    key: K,
    value: ValueOfUnionKey<L, K>,
  ) => void;
};
