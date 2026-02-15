import { createContext, useContext } from "react";

//------------------------------------------------------------------------------
// Bleed Context
//------------------------------------------------------------------------------

export const BleedContext = createContext({ showGuides: false, x: 0, y: 0 });

//------------------------------------------------------------------------------
// Use Bleed
//------------------------------------------------------------------------------

export function useBleed() {
  return useContext(BleedContext);
}
