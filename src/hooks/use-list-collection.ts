import { createListCollection } from "@chakra-ui/react";
import { useMemo } from "react";

//------------------------------------------------------------------------------
// Use List Collection
//------------------------------------------------------------------------------

export default function useListCollection<T>(items: T[]) {
  return useMemo(() => createListCollection({ items }), [items]);
}
