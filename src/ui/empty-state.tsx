import {
  EmptyState as ChakraEmptyState,
  type EmptyStateRootProps as ChakraEmptyStateRootProps,
  VStack,
} from "@chakra-ui/react";
import { type LucideIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Empty State
//------------------------------------------------------------------------------

export type EmptyStateProps = ChakraEmptyStateRootProps & {
  Icon: LucideIcon;
  subtitle: string;
  title: string;
};

export default function EmptyState({
  Icon,
  subtitle,
  title,
  ...rest
}: EmptyStateProps) {
  return (
    <ChakraEmptyState.Root {...rest}>
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
