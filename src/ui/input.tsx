import {
  Input as ChakraInput,
  InputGroup,
  type InputProps as ChakraInputProps,
} from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import IconButton from "./icon-button";

//------------------------------------------------------------------------------
// Input
//------------------------------------------------------------------------------

export type InputProps = Omit<ChakraInputProps, "onChange" | "value"> & {
  onValueChange: (value: string) => void;
  value: string;
};

export default function Input({ onValueChange, value, ...rest }: InputProps) {
  return (
    <InputGroup
      endElement={
        value.length > 0 && (
          <IconButton
            Icon={XIcon}
            me={-2}
            onClick={() => onValueChange("")}
            rounded="full"
            size="xs"
            variant="ghost"
          />
        )
      }
    >
      <ChakraInput
        {...rest}
        onChange={(e) => onValueChange(e.target.value)}
        value={value}
      />
    </InputGroup>
  );
}
