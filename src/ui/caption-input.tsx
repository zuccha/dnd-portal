import { Span, type StackProps, VStack } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Caption
//------------------------------------------------------------------------------

export type CaptionProps = StackProps & {
  caption: string;
};

export default function CaptionInput({
  caption,
  children,
  ...rest
}: CaptionProps) {
  return (
    <VStack align="flex-start" gap={1} position="relative" {...rest}>
      <Span
        bgColor="bg"
        fontSize="xx-small"
        left={1}
        position="absolute"
        px={1.5}
        top="0"
        transform="translateY(-50%)"
        zIndex={1}
      >
        {caption}
      </Span>
      {children}
    </VStack>
  );
}
