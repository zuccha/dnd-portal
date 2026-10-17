import { HStack, Span } from "@chakra-ui/react";
import Button from "~/ui/button";
import Icon from "~/ui/icon";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Sidebar Navigation Button
//------------------------------------------------------------------------------

type SidebarNavigationButtonProps = {
  active: boolean;
  activeStyle?: "background" | "text";
  Icon?: LucideIcon;
  label: string;
  labelFontVariant?: "small-caps";
  onClick: () => void;
  trailing?: ReactNode;
};

export default function SidebarNavigationButton({
  active,
  activeStyle = "background",
  Icon: icon,
  label,
  labelFontVariant,
  onClick,
  trailing,
}: SidebarNavigationButtonProps) {
  return (
    <Button
      _hover={{ bgColor: "bg.muted", color: "fg" }}
      bgColor={active && activeStyle === "background" ? "bg.emphasized" : "transparent"}
      color={active ? "fg" : "fg.muted"}
      fontWeight={active && activeStyle === "text" ? "bold" : undefined}
      justifyContent="space-between"
      onClick={onClick}
      size="sm"
      variant="ghost"
      w="full"
    >
      <HStack gap={2}>
        {icon && <Icon Icon={icon} boxSize={4} />}
        <Span fontVariant={labelFontVariant}>{label}</Span>
      </HStack>
      {trailing && <HStack gap={1}>{trailing}</HStack>}
    </Button>
  );
}
