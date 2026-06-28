import Button, { type ButtonProps } from "~/ui/button";
import Icon, { type IconProps } from "~/ui/icon";

//------------------------------------------------------------------------------
// Section Button
//------------------------------------------------------------------------------

export type SectionButtonProps = {
  Icon: IconProps["Icon"];
  active?: boolean;
  indent?: number;
  label: string;
  onClick: ButtonProps["onClick"];
};

export default function SectionButton({
  Icon: icon,
  active,
  indent = 0,
  label,
  onClick,
}: SectionButtonProps) {
  return (
    <Button
      _hover={{ bgColor: "bg.muted", color: "fg" }}
      _icon={{ boxSize: 3 }}
      bgColor={active ? "bg.emphasized" : "transparent"}
      color={active ? "fg" : "fg.muted"}
      gap={0}
      height="auto"
      justifyContent="flex-start"
      m={0}
      onClick={onClick}
      pl={3 + indent}
      pr={3}
      py={1}
      size="sm"
      variant="ghost"
      w="full"
    >
      <Icon Icon={icon} boxSize={3} mr={1} />
      {label}
    </Button>
  );
}
