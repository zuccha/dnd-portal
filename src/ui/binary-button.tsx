import { Box, HStack, type StackProps } from "@chakra-ui/react";
import { type LucideIcon } from "lucide-react";
import IconButton from "./icon-button";

//------------------------------------------------------------------------------
// Binary Button
//------------------------------------------------------------------------------

export type BinaryButtonProps<
  O1 extends string,
  O2 extends string
> = StackProps & {
  onValueChange: (value: O1 | O2) => void;
  options: [{ Icon: LucideIcon; value: O1 }, { Icon: LucideIcon; value: O2 }];
  value: O1 | O2;
};

export default function BinaryButton<O1 extends string, O2 extends string>({
  onValueChange,
  options,
  value,
  ...rest
}: BinaryButtonProps<O1, O2>) {
  return (
    <HStack
      bgColor="bg.emphasized"
      position="relative"
      rounded="full"
      {...rest}
    >
      <Box
        bgColor="bg"
        h={8}
        left={options[0].value === value ? "0.125em" : "2.125em"}
        position="absolute"
        rounded="full"
        transition="left 0.1s ease"
        w={8}
      />
      <IconButton
        Icon={options[0].Icon}
        mr={-1.5}
        onClick={() => onValueChange(options[0].value)}
        size="sm"
        variant="plain"
      />
      <IconButton
        Icon={options[1].Icon}
        ml={-1.5}
        onClick={() => onValueChange(options[1].value)}
        size="sm"
        variant="plain"
      />
    </HStack>
  );
}
