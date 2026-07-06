import { HStack, Span, type StackProps, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Section
//------------------------------------------------------------------------------

export type SectionProps = StackProps & {
  action?: ReactNode;
  title: string;
};

export default function Section({
  action,
  children,
  title,
  ...rest
}: SectionProps) {
  return (
    <VStack pb={children ? 2 : 0} px={6} w="full" {...rest}>
      <HStack justify="space-between" minH={8} w="full">
        <Span fontSize="sm" fontVariant="small-caps" fontWeight="medium">
          {title}
        </Span>

        {action}
      </HStack>

      {children}
    </VStack>
  );
}
