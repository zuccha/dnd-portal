import { PanelRightIcon } from "lucide-react";
import { z } from "zod";
import { createLocalStore } from "~/store/local-store";
import IconButton, { type IconButtonProps } from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Resource Sidebar Toggle Button
//------------------------------------------------------------------------------

export type ResourcesSidebarToggleButtonProps = Partial<IconButtonProps>;

export default function ResourcesSidebarToggleButton({
  Icon = PanelRightIcon,
  ...props
}: ResourcesSidebarToggleButtonProps) {
  const setCollapsed = useResourcesSidebarSetCollapsed();

  return (
    <IconButton
      Icon={Icon}
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
} = createLocalStore("resources_sidebar.collapsed", false, z.boolean().parse);
