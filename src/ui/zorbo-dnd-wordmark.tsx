import { Span, type SpanProps } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// ZorboDnD Wordmark
//------------------------------------------------------------------------------

export default function ZorboDnDWordmark(props: SpanProps) {
  return (
    <Span fontFamily="Mitr" whiteSpace="nowrap" {...props}>
      <Span fontWeight="600">Zorbo</Span>
      <Span color="fg.error" fontWeight="500">
        DnD
      </Span>
    </Span>
  );
}
