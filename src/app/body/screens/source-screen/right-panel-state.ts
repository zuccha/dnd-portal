import { z } from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Right Panel Collapsed State
//------------------------------------------------------------------------------

export const {
  useSetValue: useRightPanelSetCollapsed,
  useValue: useRightPanelCollapsed,
} = createLocalStore(
  "source_screen.right_panel_collapsed",
  false,
  z.boolean().parse,
);
