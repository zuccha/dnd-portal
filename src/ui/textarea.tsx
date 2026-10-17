import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";
import type { Ref } from "react";

//------------------------------------------------------------------------------
// Textarea
//------------------------------------------------------------------------------

export type TextareaProps = ChakraTextareaProps & {
  onValueChange: (value: string) => void;
  ref?: Ref<HTMLTextAreaElement>;
};

export default function Textarea({ onValueChange, ref, ...rest }: TextareaProps) {
  return <ChakraTextarea onChange={(e) => onValueChange(e.target.value)} ref={ref} {...rest} />;
}
