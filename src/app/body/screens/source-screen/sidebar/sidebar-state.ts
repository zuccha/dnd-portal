import { z } from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Sidebar Collapsed State
//------------------------------------------------------------------------------

export const {
  useSetValue: useSidebarSetCollapsed,
  useValue: useSidebarCollapsed,
} = createLocalStore("sidebar.collapsed", false, z.boolean().parse);
