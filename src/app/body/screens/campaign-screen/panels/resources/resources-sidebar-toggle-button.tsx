import { PanelLeftIcon } from "lucide-react";
import { createMemoryStore } from "~/store/memory-store";
import IconButton, { type IconButtonProps } from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Resource Sidebar Toggle Button
//------------------------------------------------------------------------------

export type ResourcesSidebarToggleButtonProps = Partial<IconButtonProps>;

export default function ResourcesSidebarToggleButton(
  props: ResourcesSidebarToggleButtonProps,
) {
  const setCollapsed = useResourcesSidebarSetCollapsed();

  return (
    <IconButton
      Icon={PanelLeftIcon}
      onClick={() => setCollapsed((prev) => !prev)}
      size="xs"
      variant="ghost"
      {...props}
    />
  );
}

//------------------------------------------------------------------------------
// Use Collapsed
//------------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export const {
  useSetValue: useResourcesSidebarSetCollapsed,
  useValue: useResourcesSidebarCollapsed,
} = createMemoryStore("resources_sidebar.collapsed", false);
