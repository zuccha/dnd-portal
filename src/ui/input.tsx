import {
  Input as ChakraInput,
  InputGroup,
  type InputGroupProps,
  type InputProps as ChakraInputProps,
} from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import IconButton from "./icon-button";

//------------------------------------------------------------------------------
// Input
//------------------------------------------------------------------------------

export type InputProps = Omit<ChakraInputProps, "onChange" | "value"> & {
  groupProps?: Omit<InputGroupProps, "children">;
  onValueChange?: (value: string) => void;
  value?: string;
};

export default function Input({
  groupProps,
  onValueChange,
  value,
  ...rest
}: InputProps) {
  return (
    <InputGroup
      endElement={
        value &&
        value.length > 0 && (
          <IconButton
            Icon={XIcon}
            me={-2}
            onClick={() => onValueChange?.("")}
            rounded="full"
            size="xs"
            variant="ghost"
          />
        )
      }
      {...groupProps}
    >
      <ChakraInput
        {...rest}
        onChange={(e) => onValueChange?.(e.target.value)}
        value={value}
      />
    </InputGroup>
  );
}
