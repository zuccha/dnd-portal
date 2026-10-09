import { HStack, Span } from "@chakra-ui/react";
import Button from "~/ui/button";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Sidebar Navigation Button
//------------------------------------------------------------------------------

type SidebarNavigationButtonProps = {
  active: boolean;
  activeStyle?: "background" | "text";
  label: string;
  onClick: () => void;
  trailing?: ReactNode;
};

export default function SidebarNavigationButton({
  active,
  activeStyle = "background",
  label,
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
      <Span>{label}</Span>
      {trailing && <HStack gap={1}>{trailing}</HStack>}
    </Button>
  );
}
