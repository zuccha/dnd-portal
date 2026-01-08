import {
  Tag as ChakraTag,
  type TagRootProps as ChakraTagRootProps,
} from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Tag
//------------------------------------------------------------------------------

export type TagProps = ChakraTagRootProps & {
  label: string;
  onClose: () => void;
};

export default function Tag({ label, onClose, ...rest }: TagProps) {
  return (
    <ChakraTag.Root {...rest}>
      <ChakraTag.Label>{label}</ChakraTag.Label>
      <ChakraTag.EndElement>
        <ChakraTag.CloseTrigger onClick={onClose} />
      </ChakraTag.EndElement>
    </ChakraTag.Root>
  );
}
