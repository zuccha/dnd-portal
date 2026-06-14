import { Span, type SpanProps } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Section Heading
//------------------------------------------------------------------------------

export type SectionHeadingProps = SpanProps;

export default function SectionHeading(props: SectionHeadingProps) {
  return (
    <Span
      fontSize="sm"
      fontVariant="small-caps"
      fontWeight="medium"
      {...props}
    />
  );
}
