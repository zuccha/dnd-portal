import {
  EmptyState as ChakraEmptyState,
  type EmptyStateRootProps as ChakraEmptyStateRootProps,
  VStack,
} from "@chakra-ui/react";
import { type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

//------------------------------------------------------------------------------
// Empty State
//------------------------------------------------------------------------------

export type EmptyStateProps = ChakraEmptyStateRootProps & {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  subtitle: string;
  title: string;
};

export default function EmptyState({ Icon, subtitle, title }: EmptyStateProps) {
  return (
    <ChakraEmptyState.Root>
      <ChakraEmptyState.Content>
        <ChakraEmptyState.Indicator>
          <Icon />
        </ChakraEmptyState.Indicator>
        <VStack textAlign="center">
          <ChakraEmptyState.Title>{title}</ChakraEmptyState.Title>
          <ChakraEmptyState.Description>
            {subtitle}
          </ChakraEmptyState.Description>
        </VStack>
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}
