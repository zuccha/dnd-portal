import { SlidersHorizontalIcon } from "lucide-react";
import IconButton, { type IconButtonProps } from "~/ui/icon-button";
import { useRightPanelSetCollapsed } from "../../right-panel-state";

//------------------------------------------------------------------------------
// Resource Sidebar Toggle Button
//------------------------------------------------------------------------------

export type ResourcesSidebarToggleButtonProps = Partial<IconButtonProps>;

export default function ResourcesSidebarToggleButton(
  props: ResourcesSidebarToggleButtonProps,
) {
  const setCollapsed = useRightPanelSetCollapsed();

  return (
    <IconButton
      Icon={SlidersHorizontalIcon}
      bgColor="bg"
      display={{ base: "none", md: "inline-flex" }}
      left={0}
      onClick={() => setCollapsed((prev) => !prev)}
      position="absolute"
      size="xs"
      top={5}
      transform="translateX(-50%)"
      variant="outline"
      zIndex="docked"
      {...props}
    />
  );
}
