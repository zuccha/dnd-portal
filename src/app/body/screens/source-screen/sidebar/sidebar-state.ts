import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import { getResponsiveSidebarDefault } from "../responsive-sidebar-default";

//------------------------------------------------------------------------------
// Sidebar Collapsed State
//------------------------------------------------------------------------------

export const {
  useSetValue: useSidebarSetCollapsed,
  useValue: useSidebarCollapsed,
} = createLocalStore(
  "sidebar.collapsed",
  getResponsiveSidebarDefault(),
  z.boolean().parse,
);
