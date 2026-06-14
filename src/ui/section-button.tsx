import Button, { type ButtonProps } from "~/ui/button";
import Icon, { type IconProps } from "~/ui/icon";

//------------------------------------------------------------------------------
// Section Button
//------------------------------------------------------------------------------

export type SectionButtonProps = {
  Icon: IconProps["Icon"];
  active?: boolean;
  label: string;
  onClick: ButtonProps["onClick"];
};

export default function SectionButton({
  Icon: icon,
  active,
  label,
  onClick,
}: SectionButtonProps) {
  return (
    <Button
      _hover={{ bgColor: "bg.muted", color: "fg" }}
      bgColor={active ? "bg.emphasized" : "transparent"}
      color={active ? "fg" : "fg.muted"}
      gap={0}
      justifyContent="flex-start"
      m={0}
      onClick={onClick}
      size="sm"
      variant="ghost"
      w="full"
    >
      <Icon Icon={icon} fill={active ? "fg" : undefined} mr={1} size="xs" />
      {label}
    </Button>
  );
}
