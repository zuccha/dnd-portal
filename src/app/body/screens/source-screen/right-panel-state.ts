import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import { getResponsiveSidebarDefault } from "./responsive-sidebar-default";

//------------------------------------------------------------------------------
// Right Panel Collapsed State
//------------------------------------------------------------------------------

export const {
  useSetValue: useRightPanelSetCollapsed,
  useValue: useRightPanelCollapsed,
} = createLocalStore(
  "source_screen.right_panel_collapsed",
  getResponsiveSidebarDefault(),
  z.boolean().parse,
);
