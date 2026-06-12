import { PanelRightIcon } from "lucide-react";
import IconButton, { type IconButtonProps } from "~/ui/icon-button";
import { useRightPanelSetCollapsed } from "../../right-panel-state";

//------------------------------------------------------------------------------
// Resource Sidebar Toggle Button
//------------------------------------------------------------------------------

export type ResourcesSidebarToggleButtonProps = Partial<IconButtonProps>;

export default function ResourcesSidebarToggleButton({
  Icon = PanelRightIcon,
  ...props
}: ResourcesSidebarToggleButtonProps) {
  const setCollapsed = useRightPanelSetCollapsed();

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
