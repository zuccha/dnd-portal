import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Textarea
//------------------------------------------------------------------------------

export type TextareaProps = ChakraTextareaProps & {
  onValueChange: (value: string) => void;
};

export default function Textarea({ onValueChange, ...rest }: TextareaProps) {
  return (
    <ChakraTextarea onChange={(e) => onValueChange(e.target.value)} {...rest} />
  );
}
