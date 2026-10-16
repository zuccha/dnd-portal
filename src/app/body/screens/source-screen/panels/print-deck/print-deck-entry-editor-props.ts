import type { LocalizedResourceUnion } from "~/models/resources/resource-union";

//------------------------------------------------------------------------------
// Print Deck Entry Editor Props
//------------------------------------------------------------------------------

export type PrintDeckEntryEditorProps<L extends LocalizedResourceUnion> = {
  localizedResource: L;
  onLocalizedResourceUpdate: (resource: L) => void;
};
